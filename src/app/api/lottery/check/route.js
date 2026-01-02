
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, phoneNumber, userType } = body;

        if (!userType || (!email && !phoneNumber)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await db.connect();

        const query = `
            SELECT ticket_code 
            FROM lottery_entries 
            WHERE user_type = $1 
            AND (email = $2 OR phone_number = $3)
            LIMIT 1
        `;

        const result = await client.query(query, [userType, email, phoneNumber]);
        client.release();

        if (result.rows.length > 0) {
            return NextResponse.json({
                exists: true,
                ticketCode: result.rows[0].ticket_code
            });
        }

        return NextResponse.json({ exists: false });

    } catch (error) {
        console.error('Lottery Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
