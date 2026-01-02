
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Add GET handler
export async function GET(request) {
    try {
        const client = await db.connect();
        // Fetch specific sessions or all?
        // Admin dashboard wants all.
        // Limit to, say, 100 or 500 recent?

        const query = `
            SELECT 
                session_id as id,
                user_uid as "userId",
                child_id as "childId",
                child_name as "childName",
                test_type as "testType",
                test_id as "testId",
                start_time as "startTime",
                end_time as "endTime",
                browser_info as "browserInfo",
                violations,
                auto_submitted as "autoSubmitted",
                total_violations as "totalViolations"
            FROM security_sessions
            ORDER BY start_time DESC
            LIMIT 500
        `;

        const result = await client.query(query);
        client.release();

        return NextResponse.json({ sessions: result.rows });
    } catch (error) {
        console.error('Security API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;

        const client = await db.connect();

        if (action === 'start') {
            const { sessionId, userId, childId, childName, testType, testId, startTime, browserInfo } = body;

            // Check if user exists? If guest, userId might be problematic if not in 'users' table.
            // Assuming migrated system requires auth.
            // If userId is missing or not in table, this might fail unless we relaxed constraints or user is guaranteed to be there.

            const query = `
                INSERT INTO security_sessions 
                (session_id, user_uid, child_id, child_name, test_type, test_id, start_time, browser_info)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            await client.query(query, [
                sessionId, userId, childId || null, childName || 'Unknown', testType, testId, startTime, JSON.stringify(browserInfo)
            ]);

        } else if (action === 'log') {
            const { sessionId, violation } = body;
            // Append violation to JSONB array. 
            // jsonb_set can be used, or just append via concatenation if it's an array.
            // violations = violations || '[]'::jsonb || new_element
            const query = `
                UPDATE security_sessions 
                SET violations = violations || $1::jsonb,
                    total_violations = total_violations + 1
                WHERE session_id = $2
            `;
            await client.query(query, [JSON.stringify([violation]), sessionId]);

        } else if (action === 'end') {
            const { sessionId, autoSubmitted } = body;
            const query = `
                UPDATE security_sessions 
                SET end_time = NOW(),
                    auto_submitted = $1
                WHERE session_id = $2
            `;
            await client.query(query, [autoSubmitted, sessionId]);
        }

        client.release();
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Security API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
