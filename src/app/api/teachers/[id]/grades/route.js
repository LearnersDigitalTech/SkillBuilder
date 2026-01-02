
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = await params; // Teacher UID

    try {
        const client = await db.connect();

        // Fetch assigned grades for the teacher
        const query = `
            SELECT grade 
            FROM teacher_grade_assignments 
            WHERE teacher_uid = $1
            ORDER BY grade ASC
        `;
        const result = await client.query(query, [id]);
        client.release();

        const grades = result.rows.map(row => row.grade);

        return NextResponse.json({ grades });

    } catch (error) {
        console.error('Teacher Grades API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
