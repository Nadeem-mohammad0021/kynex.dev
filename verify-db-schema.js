// Quick script to verify the current database schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyWorkflowsTable() {
  console.log('Checking workflows table structure...');
  
  // Try to get table structure
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error querying workflows table:', error);
    return;
  }
  
  console.log('Workflows table query successful');
  console.log('Sample data structure:', data);
  
  // Try to describe the table structure using PostgreSQL system tables
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { table_name: 'workflows' })
    .select();
    
  if (columnsError) {
    console.log('Could not get column info via RPC:', columnsError);
  } else {
    console.log('Table columns:', columns);
  }
}

verifyWorkflowsTable().catch(console.error);
