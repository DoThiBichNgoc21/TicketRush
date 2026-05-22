import db from "./src/config/supabase.js";

async function run() {
    try {
        const result = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'support_articles';
        `);
        console.log("Columns:", result.rows);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}
run();
