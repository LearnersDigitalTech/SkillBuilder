
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/lib/db.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runSchema() {
    console.log("Applying additional schema...");
    try {
        const sqlPath = path.join(__dirname, 'init_additional_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const client = await db.connect();
        await client.query(sql);
        client.release();

        console.log("✅ Schema applied successfully.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to apply schema:", e);
        process.exit(1);
    }
}

runSchema();
