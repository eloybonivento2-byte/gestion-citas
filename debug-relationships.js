const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan Variables de entorno');
}

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRelationship() {
  try {
    console.log('Fetching from appointments...');
    const { data, error } = await supabase.from('appointments').select('*').limit(1);
    console.log('Test table access result:', error ? 'Error: ' + error.message : 'Success');
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('Response error:', JSON.stringify(error, null, 2));
    
  } catch (err) {
    console.log('Exception:', err.message);
    console.log('Stack:', err.stack);
  }
}

debugRelationship();