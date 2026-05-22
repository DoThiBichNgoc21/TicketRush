import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkAndAlter() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'support_articles';
        `);
        console.log("Columns:", result.rows.map(r => r.column_name));

        if (!result.rows.find(r => r.column_name === 'type')) {
            console.log("Adding type column...");
            await pool.query(`ALTER TABLE support_articles ADD COLUMN type VARCHAR(255) DEFAULT 'article';`);
            console.log("Column added.");
            // Also add contact info columns if missing
            const cols = result.rows.map(r => r.column_name);
            if (!cols.includes('hotline')) await pool.query(`ALTER TABLE support_articles ADD COLUMN hotline VARCHAR(255);`);
            if (!cols.includes('support_email')) await pool.query(`ALTER TABLE support_articles ADD COLUMN support_email VARCHAR(255);`);
            if (!cols.includes('office_address')) await pool.query(`ALTER TABLE support_articles ADD COLUMN office_address TEXT;`);
            if (!cols.includes('facebook_page')) await pool.query(`ALTER TABLE support_articles ADD COLUMN facebook_page VARCHAR(255);`);
            if (!cols.includes('instagram_page')) await pool.query(`ALTER TABLE support_articles ADD COLUMN instagram_page VARCHAR(255);`);
            if (!cols.includes('zalo_oa_id')) await pool.query(`ALTER TABLE support_articles ADD COLUMN zalo_oa_id VARCHAR(255);`);
            console.log("All columns ensured.");

            // Note: need to refresh Supabase schema cache
            // we can do this by executing a query via supabase or it will auto refresh
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkAndAlter();
