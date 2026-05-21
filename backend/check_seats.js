import supabase from "./src/config/supabase.js";

async function check() {
  const { data: showtimes } = await supabase.from('showtimes').select('id, event_id');
  const { data: events } = await supabase.from('events').select('id, layout_json');
  const { data: seats } = await supabase.from('seating_chart').select('showtime_id');
  
  const showtimesWithSeats = new Set(seats.map(s => s.showtime_id));
  
  console.log("Showtimes with NO seats but Event HAS layout_json:");
  for (const st of showtimes) {
    if (!showtimesWithSeats.has(st.id)) {
      const ev = events.find(e => e.id === st.event_id);
      if (ev && ev.layout_json && typeof ev.layout_json === 'string' && ev.layout_json.length > 5) {
         console.log(`Showtime ID: ${st.id}, Event ID: ${st.event_id}`);
      } else if (ev && Array.isArray(ev.layout_json) && ev.layout_json.length > 0) {
         console.log(`Showtime ID: ${st.id}, Event ID: ${st.event_id}`);
      }
    }
  }
}
check();
