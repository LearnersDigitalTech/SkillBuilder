
import db from '../src/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
    try {
        console.log("Updating Security schema...");
        const client = await db.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS security_sessions (
                session_id VARCHAR(100) PRIMARY KEY,
                user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
                child_id VARCHAR(100),
                child_name VARCHAR(255),
                test_type VARCHAR(50),
                test_id VARCHAR(100),
                start_time TIMESTAMP WITH TIME ZONE,
                end_time TIMESTAMP WITH TIME ZONE,
                browser_info JSONB,
                violations JSONB DEFAULT '[]'::jsonb,
                auto_submitted BOOLEAN DEFAULT FALSE,
                total_violations INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Security schema updated successfully.");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to update security schema:", e);
        process.exit(1);
    }
}

run();
