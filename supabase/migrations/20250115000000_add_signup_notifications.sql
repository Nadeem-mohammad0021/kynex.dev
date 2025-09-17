-- Add signup notification system
-- This migration sets up a webhook to notify when users sign up

-- First, let's create a simple function to handle signup notifications
-- This will be triggered when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  notification_url TEXT;
  response_code INTEGER;
  site_url TEXT;
BEGIN
  -- Get site URL from environment or use default
  site_url := COALESCE(
    current_setting('app.settings.site_url', true),
    'https://kynex.dev'
  );
  
  notification_url := site_url || '/api/notifications/signup';
  
  -- Log the signup attempt
  RAISE LOG 'New user signup detected: % (%), calling notification URL: %', 
    NEW.email, NEW.id, notification_url;
  
  -- Use pg_net to make HTTP request (if available)
  -- Note: This requires the pg_net extension to be enabled in Supabase
  BEGIN
    SELECT status INTO response_code
    FROM net.http_post(
      url := notification_url,
      headers := '{"Content-Type": "application/json", "User-Agent": "Supabase-Function"}'::jsonb,
      body := jsonb_build_object(
        'userId', NEW.id,
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        'provider', NEW.raw_app_meta_data->>'provider',
        'signupTime', NOW()::timestamptz,
        'metadata', jsonb_build_object(
          'source', 'database-trigger',
          'timestamp', NOW()::timestamptz
        )
      )
    );
    
    RAISE LOG 'Notification sent successfully, response code: %', response_code;
    
  EXCEPTION WHEN OTHERS THEN
    -- Don't fail the user signup if notification fails
    RAISE LOG 'Failed to send signup notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table for new signups
-- Note: This trigger will fire for every new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO service_role;

-- Add a comment for documentation
COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Sends email notification when a new user signs up via Supabase Auth';

-- Optional: Create a table to log notification attempts (for debugging)
CREATE TABLE IF NOT EXISTS public.signup_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  notification_sent BOOLEAN DEFAULT FALSE,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the notifications table
ALTER TABLE public.signup_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (only service role can access)
CREATE POLICY "Service role can manage signup notifications" ON public.signup_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_signup_notifications_user_id ON public.signup_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_notifications_created_at ON public.signup_notifications(created_at DESC);

-- Create an improved version that logs to our table
CREATE OR REPLACE FUNCTION public.handle_new_user_signup_with_logging()
RETURNS TRIGGER AS $$
DECLARE
  notification_url TEXT;
  response_code INTEGER;
  site_url TEXT;
  notification_error TEXT;
BEGIN
  -- Get site URL from environment or use default
  site_url := COALESCE(
    current_setting('app.settings.site_url', true),
    'https://kynex.dev'
  );
  
  notification_url := site_url || '/api/notifications/signup';
  
  -- Log the signup attempt
  RAISE LOG 'New user signup detected: % (%), calling notification URL: %', 
    NEW.email, NEW.id, notification_url;
  
  -- Use pg_net to make HTTP request (if available)
  BEGIN
    SELECT status INTO response_code
    FROM net.http_post(
      url := notification_url,
      headers := '{"Content-Type": "application/json", "User-Agent": "Supabase-Function"}'::jsonb,
      body := jsonb_build_object(
        'userId', NEW.id,
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        'provider', NEW.raw_app_meta_data->>'provider',
        'signupTime', NOW()::timestamptz,
        'metadata', jsonb_build_object(
          'source', 'database-trigger',
          'timestamp', NOW()::timestamptz
        )
      )
    );
    
    -- Log successful notification
    INSERT INTO public.signup_notifications (user_id, email, notification_sent, response_code)
    VALUES (NEW.id, NEW.email, true, response_code);
    
    RAISE LOG 'Notification sent successfully, response code: %', response_code;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log failed notification
    notification_error := SQLERRM;
    
    INSERT INTO public.signup_notifications (user_id, email, notification_sent, error_message)
    VALUES (NEW.id, NEW.email, false, notification_error);
    
    RAISE LOG 'Failed to send signup notification: %', notification_error;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the logging version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup_with_logging();

-- Success message
SELECT 'Signup notification system installed successfully! 🎉' as status;
