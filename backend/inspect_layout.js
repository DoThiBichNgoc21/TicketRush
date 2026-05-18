import supabase from "./src/config/supabase.js";

async function checkLayout() {
    const { data, error } = await supabase.from('events').select('id, name, layout_json').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error("Lỗi:", error);
    } else {
        console.log("Dữ liệu layout các sự kiện gần đây:");
        data.forEach(event => {
            console.log(`ID: ${event.id}, Name: ${event.name}`);
            console.log("Layout:", JSON.stringify(event.layout_json, null, 2));
        });
    }
    process.exit();
}

checkLayout();
