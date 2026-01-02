
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log("Environment loaded. DB URL:", process.env.DATABASE_URL ? "Found" : "Missing");

// Import db.js using relative path
import db from '../src/lib/db.js';

async function testDB() {
    console.log("Testing db.js direct import...");
    try {
        const client = await db.connect();
        console.log("Connected!");
        const res = await client.query('SELECT 1 as val');
        console.log("Query Result:", res.rows[0]);
        client.release();
        console.log("Connection released. Success!");
        process.exit(0);
    } catch (e) {
        console.error("DB Test Failed:", e);
        process.exit(1);
    }
}

testDB();
