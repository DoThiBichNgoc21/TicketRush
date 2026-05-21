import supabase from "./src/config/supabase.js";

async function check() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
     console.log("Could not fetch via RPC. Falling back to direct query if possible, or just raw query.");
     // we can't easily query pg_policies using supabase-js without direct SQL access, 
     // but we can test auth access.
  }
}
check();
