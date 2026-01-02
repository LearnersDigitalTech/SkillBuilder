
import db from '../src/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
    try {
        console.log("Updating tutor_bookings schema...");
        const client = await db.connect();

        await client.query(`
            ALTER TABLE tutor_bookings
            ADD COLUMN IF NOT EXISTS student_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS grade VARCHAR(50),
            ADD COLUMN IF NOT EXISTS details JSONB;
        `);

        console.log("✅ Schema updated successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to update schema:", e);
        process.exit(1);
    }
}

run();
