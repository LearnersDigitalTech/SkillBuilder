import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const client = await pool.connect();
    try {
        const query = `
      SELECT 
        t.user_uid as uid,
        t.name,
        t.ticket_code,
        t.school_name,
        t.neet_upload_enabled,
        u.email,
        u.phone_number,
        u.created_at
      FROM teachers t
      JOIN users u ON t.user_uid = u.uid
      ORDER BY t.name ASC
    `;

        const result = await client.query(query);

        // Format to match expected frontend structure if needed
        const teachers = result.rows.map(row => ({
            uid: row.uid,
            name: row.name,
            email: row.email,
            ticketCode: row.ticket_code,
            phoneNumber: row.phone_number,
            schoolName: row.school_name,
            neetUploadEnabled: row.neet_upload_enabled,
            createdAt: row.created_at
        }));

        return NextResponse.json({ teachers });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
