import supabase from "./src/config/supabase.js";

async function checkSeatsSchema() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'seats' });
    // Nếu không có RPC get_table_info, ta thử cách khác
    const { data: cols, error: err2 } = await supabase.from('seats').select('*').limit(0);
    
    if (err2) {
        console.error("Lỗi:", err2);
    } else {
        console.log("Cấu trúc bảng seats (các cột):");
        // Ta có thể xem cấu trúc qua header nếu cần, nhưng ở đây chỉ cần biết có những cột nào
        const { data: sample } = await supabase.from('seats').select('*').limit(1);
        if (sample && sample.length > 0) {
            console.log(Object.keys(sample[0]));
        } else {
            // Thử lấy danh sách cột từ một câu query metadata nếu có thể, 
            // hoặc đơn giản là ta cứ giả định và test.
            console.log("Bảng trống, không lấy được tên cột qua sample.");
        }
    }
    process.exit();
}

checkSeatsSchema();
