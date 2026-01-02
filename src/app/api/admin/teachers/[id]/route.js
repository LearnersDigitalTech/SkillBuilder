
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const client = await db.connect();

        // 1. Get Teacher Basic Info
        const teacherRes = await client.query(`
            SELECT t.*, u.email, u.phone_number, u.created_at
            FROM teachers t
            JOIN users u ON t.user_uid = u.uid
            WHERE t.user_uid = $1
        `, [id]);

        if (teacherRes.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }
        const teacher = teacherRes.rows[0];

        // 2. Get Assignments
        const gradesRes = await client.query(`
            SELECT grade FROM teacher_grade_assignments WHERE teacher_uid = $1
        `, [id]);

        const studentsRes = await client.query(`
            SELECT s.*, tsa.assigned_at 
            FROM teacher_student_assignments tsa 
            JOIN students s ON tsa.student_id = s.id
            WHERE tsa.teacher_uid = $1
        `, [id]);

        client.release();

        const studentsMap = {};
        studentsRes.rows.forEach(s => {
            studentsMap[s.parent_uid] = { // Using parent UID as key for compatibility
                childId: s.child_id,
                grade: s.grade,
                name: s.name,
                assignedAt: s.assigned_at
            };
        });

        const details = {
            uid: teacher.user_uid,
            name: teacher.name,
            email: teacher.email,
            ticketCode: teacher.ticket_code,
            phoneNumber: teacher.phone_number,
            schoolName: teacher.school_name,
            createdAt: teacher.created_at,
            neetUploadEnabled: teacher.neet_upload_enabled,
            assignments: {
                assignedGrades: gradesRes.rows.map(g => g.grade),
                students: studentsMap,
                lastUpdated: new Date().toISOString() // Placeholder
            }
        };

        return NextResponse.json({ teacher: details });

    } catch (error) {
        console.error('Teacher Details API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { neetUploadEnabled } = body;

        if (neetUploadEnabled !== undefined) {
            const client = await db.connect();
            await client.query(`
                UPDATE teachers SET neet_upload_enabled = $1 WHERE user_uid = $2
             `, [neetUploadEnabled, id]);
            client.release();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Teacher API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
