
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await db.connect();

        // Fetch teachers with counts
        const query = `
            SELECT 
                t.*,
                u.email,
                u.phone_number,
                u.created_at,
                (SELECT COUNT(*) FROM teacher_grade_assignments tga WHERE tga.teacher_uid = t.user_uid) as grade_count,
                (SELECT COUNT(*) FROM teacher_student_assignments tsa WHERE tsa.teacher_uid = t.user_uid) as student_count,
                 -- Also count students covered by grade assignments? 
                 -- For now, just count direct assignments or grades assigned.
                 -- The frontend expects 'assignedGrades' array.
                ARRAY(SELECT grade FROM teacher_grade_assignments tga WHERE tga.teacher_uid = t.user_uid) as assigned_grades
            FROM teachers t
            JOIN users u ON t.user_uid = u.uid
            ORDER BY t.name ASC
        `;

        const result = await client.query(query);
        client.release();

        const teachers = result.rows.map(row => ({
            uid: row.user_uid,
            name: row.name,
            email: row.email,
            ticketCode: row.ticket_code || 'N/A',
            phoneNumber: row.phone_number || 'N/A',
            schoolName: row.school_name || 'N/A',
            assignedGradesCount: parseInt(row.grade_count), // or row.assigned_grades.length
            totalStudents: parseInt(row.student_count), // Approximate, excludes grade-based derived students
            assignedGrades: row.assigned_grades || [],
            createdAt: row.created_at
        }));

        return NextResponse.json({ teachers });

    } catch (error) {
        console.error('Admin Teachers API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
