const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupSchema() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL is not defined in .env.local');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        const sqlPath = path.join(__dirname, 'init_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Running schema initialization...');
        await pool.query(sql);
        console.log('✅ Schema initialized successfully!');
    } catch (err) {
        console.error('❌ Error initializing schema:', err);
    } finally {
        await pool.end();
    }
}

setupSchema();
