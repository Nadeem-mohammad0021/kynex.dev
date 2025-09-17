import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // Get user data from the webhook payload
    const userId = record.id
    const email = record.email
    const name = record.user_metadata?.full_name || record.user_metadata?.name || null
    const provider = record.app_metadata?.provider || 'unknown'
    
    console.log('New user signup detected:', {
      userId,
      email,
      name,
      provider,
      timestamp: new Date().toISOString()
    })

    // Get the site URL from environment or use default
    const siteUrl = Deno.env.get('SITE_URL') || 'https://kynex.dev'
    const notificationUrl = `${siteUrl}/api/notifications/signup`

    // Send notification to our Next.js API
    const notificationResponse = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-EdgeFunction'
      },
      body: JSON.stringify({
        userId,
        email,
        name,
        provider,
        signupTime: new Date().toISOString(),
        metadata: {
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for'),
          source: 'supabase-auth-webhook'
        }
      })
    })

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text()
      console.error('Failed to send notification:', {
        status: notificationResponse.status,
        error: errorText
      })
      
      // Don't fail the signup process, just log the error
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Notification failed but signup completed',
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 so auth doesn't fail
        }
      )
    }

    const notificationResult = await notificationResponse.json()
    console.log('✅ Signup notification sent successfully:', notificationResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User signup processed and notification sent',
        userId,
        email,
        notificationId: notificationResult.emailId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing signup notification:', error)
    
    // Don't fail the signup process, just log the error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process signup notification',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Still return 200 so auth doesn't fail
      }
    )
  }
})
