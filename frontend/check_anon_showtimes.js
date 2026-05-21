import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bbikrjcinvlopaceglvf.supabase.co',
  'sb_publishable_pGM4fcZyEgBhT8Mg7o6P9w_J9HDnVeP'
);

async function check() {
  const { data: st, error: stErr } = await supabase.from('showtimes').select('id').limit(5);
  console.log("Anon showtimes:", st, stErr);
}
check();
