
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userType = searchParams.get('type');
        const grade = searchParams.get('grade');
        const ticketPrefix = searchParams.get('prefix');

        const client = await db.connect();

        let count = 0;

        if (userType === 'student' && grade) {
            // Count students in grade
            // Store grade in 'data' jsonb or extract?
            // Schema: ticket_code, user_type... data.
            // But we can also look at ticket_code prefix if consistent?
            // Logic in client: prefix + offset + count + 1.
            // Client checks: reg.userType === 'student' && reg.studentGrade === grade.
            // We need to query JSONB 'data->>studentGrade'.

            const query = `
                SELECT COUNT(*) 
                FROM lottery_entries 
                WHERE user_type = 'student' 
                AND data->>'studentGrade' = $1
            `;
            const res = await client.query(query, [grade]);
            count = parseInt(res.rows[0].count);

        } else if (ticketPrefix) {
            // Count by ticket prefix (P, G, T)
            const query = `
                SELECT COUNT(*) 
                FROM lottery_entries 
                WHERE ticket_code LIKE $1 || '%'
            `;
            const res = await client.query(query, [ticketPrefix]);
            count = parseInt(res.rows[0].count);
        } else if (userType) {
            const query = `
                SELECT COUNT(*) 
                FROM lottery_entries 
                WHERE user_type = $1
            `;
            const res = await client.query(query, [userType]);
            count = parseInt(res.rows[0].count);
        }

        client.release();
        return NextResponse.json({ count });

    } catch (error) {
        console.error('Lottery Count Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
