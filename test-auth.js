// Test script to check Supabase authentication and database connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '❌ Missing');
  process.exit(1);
}

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('workflows')
      .select('workflow_id')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      
      // Check if it's a table not found error
      if (error.code === 'PGRST106' || error.message.includes('not found')) {
        console.log('💡 The "workflows" table does not exist. You need to run the KYNEX schema in your Supabase SQL Editor.');
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('Found workflows:', data?.length || 0);
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Testing authentication...');
    
    // Check if there's a current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
    } else if (session) {
      console.log('✅ User is authenticated');
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
    } else {
      console.log('ℹ️  No active session (user not signed in)');
    }
    
  } catch (err) {
    console.error('❌ Auth test failed:', err.message);
  }
}

console.log('🚀 Starting tests...');
await testConnection();
await testAuth();

console.log('\n📋 Summary:');
console.log('1. Make sure you run the KYNEX schema in your Supabase SQL Editor');
console.log('2. Make sure you are signed in to the application');
console.log('3. Check that your Supabase project URL and keys are correct');
