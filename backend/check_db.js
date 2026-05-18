import supabase from "./src/config/supabase.js";

async function checkColumns() {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    if (error) {
        console.error("Lỗi:", error);
    } else if (data && data.length > 0) {
        console.log("Các cột hiện có trong bảng events:", Object.keys(data[0]));
    } else {
        console.log("Không có dữ liệu trong bảng events để kiểm tra.");
    }
    process.exit();
}

checkColumns();
