import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bbikrjcinvlopaceglvf.supabase.co',
  'sb_publishable_pGM4fcZyEgBhT8Mg7o6P9w_J9HDnVeP'
);

async function check() {
  const { data, error } = await supabase.from('seating_chart').select('id, showtime_id').limit(5);
  console.log("Anon Seating chart samples:", data, error);
}
check();
