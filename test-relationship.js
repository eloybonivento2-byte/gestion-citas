import { createClient } from "@supabase/supabase-js";
import { supabase } from './src/lib/supabase.js';

async function testRelationships() {
  try {
    console.log('Testing appointment relationship with profiles...');
    
    // Test the specific relationship used in the fetch method
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        dependencies (name, color),
        user:profiles!appointments_user_id_fkey (full_name, document_number),
        professional:profiles!appointments_professional_id_fkey (full_name)
      `)
      .limit(1);
      
    console.log('Relationship test result:', error ? 'Error: ' + error.message : 'Success');
    console.log('Data:', data);
    console.log('Error:', error);
    
    // Try a simpler query
    console.log('\n--- Testing simple query ---');
    const { data: simpleData, error: simpleError } = await supabase
      .from('appointments')
      .select(`*`)
      .limit(1);
      
    console.log('Simple query result:', simpleError ? 'Error: ' + simpleError.message : 'Success');
    console.log('Simple data:', simpleData);
    
  } catch (err) {
    console.log('Exception:', err.message);
    console.log('Stack:', err.stack);
  }
}

testRelationships();