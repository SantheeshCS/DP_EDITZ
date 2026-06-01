require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('Testing Supabase Client connectivity...');
console.log('Supabase URL:', process.env.SUPABASE_URL);

supabase.storage.listBuckets().then(({ data, error }) => {
  if (error) {
    console.error('Supabase listBuckets error:', error.message, error);
  } else {
    console.log('Supabase Connection Success! Found buckets:', data);
  }
}).catch(err => {
  console.error('Supabase SDK network catch error:', err.message);
});
