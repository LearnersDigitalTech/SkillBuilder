
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = await params; // Teacher UID
    const { searchParams } = new URL(request.url);
    const gradeFilter = searchParams.get('grade');

    try {
        const client = await db.connect();

        let query = `
            SELECT 
                s.id as internal_id,
                s.child_id,
                s.name,
                s.grade,
                s.school_name,
                s.parent_uid as uid, -- Using parent UID as grouping key akin to old logic
                u.email,
                u.phone_number,
                tsa.assigned_at as individual_assigned_at,
                tga.assigned_at as grade_assigned_at
            FROM students s
            LEFT JOIN users u ON s.parent_uid = u.uid
            LEFT JOIN teacher_student_assignments tsa ON s.id = tsa.student_id AND tsa.teacher_uid = $1
            LEFT JOIN teacher_grade_assignments tga ON s.grade = tga.grade AND tga.teacher_uid = $1
            WHERE 
                (tsa.id IS NOT NULL OR tga.id IS NOT NULL)
        `;

        const values = [id];

        if (gradeFilter) {
            query += ` AND s.grade = $2`;
            values.push(gradeFilter);
        }

        query += ` ORDER BY s.name ASC`;

        const result = await client.query(query, values);
        client.release();

        const students = result.rows.map(row => ({
            uid: row.uid, // Parent UID (lookup key)
            childId: row.child_id,
            name: row.name,
            grade: row.grade,
            email: row.email,
            phoneNumber: row.phone_number,
            assignedAt: row.individual_assigned_at || row.grade_assigned_at || new Date().toISOString(),
            // Compatibility fields
            databaseKey: row.uid,
            id: row.internal_id
        }));

        return NextResponse.json({ students });

    } catch (error) {
        console.error('Teacher Students API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
