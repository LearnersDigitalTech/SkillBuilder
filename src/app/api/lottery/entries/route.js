
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const client = await db.connect();
        const query = `
            SELECT 
                id, 
                ticket_code as "ticketCode", 
                user_uid as "uid",
                user_type as "userType", 
                name, 
                email, 
                phone_number as "phoneNumber", 
                data, 
                created_at as "timestamp"
            FROM lottery_entries 
            ORDER BY created_at DESC
        `;
        const result = await client.query(query);
        client.release();

        // Process rows to match frontend expectations if needed
        // Frontend expects 'timestamp' as ms or ISO. PG returns Date object.
        // JSON response converts Date to ISO string.

        // Frontend expects `data` to be merged or accessible?
        // Frontend uses: row.ticketCode, row.userType, row.phoneNumber...
        // and row.children (which is in data).

        const entries = result.rows.map(row => ({
            ...row,
            ...row.data, // Check if data columns overwrite table columns? Not usually.
            data: undefined, // remove raw data field from spread if wanted, or keep
        }));

        return NextResponse.json(entries);

    } catch (error) {
        console.error('Lottery Entries GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const client = await db.connect();
        await client.query('BEGIN');

        // Delete from lottery_entries
        // Also need to delete from users/students? 
        // User asked: "This will remove the user from all systems."
        // We should delete from users where uid matches (if exists).

        // Get UID first
        const getUid = 'SELECT user_uid FROM lottery_entries WHERE id = $1';
        const res = await client.query(getUid, [id]);

        if (res.rows.length > 0) {
            const uid = res.rows[0].user_uid;

            // Delete entry
            await client.query('DELETE FROM lottery_entries WHERE id = $1', [id]);

            if (uid) {
                // Delete students
                await client.query('DELETE FROM students WHERE parent_uid = $1', [uid]);
                // Delete user
                await client.query('DELETE FROM users WHERE uid = $1', [uid]);
                // Delete teacher?
                await client.query('DELETE FROM teachers WHERE uid = $1', [uid]);
            }
        }

        await client.query('COMMIT');
        client.release();
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete Entry Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
