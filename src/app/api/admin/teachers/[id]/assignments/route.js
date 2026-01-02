
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    const { id } = await params; // Teacher UID
    try {
        const body = await request.json();
        const { action, grades, grade, students, studentUid } = body;

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            if (action === 'assign_grades') {
                // 1. Clear existing grades
                await client.query('DELETE FROM teacher_grade_assignments WHERE teacher_uid = $1', [id]);

                // 2. Insert new grades
                for (const g of grades) {
                    await client.query('INSERT INTO teacher_grade_assignments (teacher_uid, grade) VALUES ($1, $2)', [id, g]);
                }

                // 3. Cleanup individual student assignments if their grade is no longer assigned?
                // The service logic says: "Filter students: Keep only those whose grade is in the new assigned grades list"
                // But individual assignments might be separate overrides?
                // The service implies students are subsets of grades or need to be re-validated.
                // For SQL, if we assign a WHOLE grade, we might not need individual assignments for students in that grade.
                // But let's follow the service pattern: remove students whose grade is NOT in the new list.
                // Actually, if we assign "Grade 1", we implicitly get all Grade 1.
                // Individual assignments are usually for picking specific students.
                // Let's implement the cleanup for consistency with legacy logic.
                if (grades.length > 0) {
                    await client.query(`
                        DELETE FROM teacher_student_assignments 
                        WHERE teacher_uid = $1 
                        AND student_id IN (
                            SELECT id FROM students WHERE grade NOT IN (
                                SELECT unnest($2::text[])
                            )
                        )
                     `, [id, grades]);
                } else {
                    // If no grades, remove all? Or just don't clean?
                    // If grades empty, remove all logical checks?
                    // Service says: `newStudents` only keeps matching.
                    // So if grades=[], remove all students?
                    // Let's be safe and only cleanup if requested explicitly or if grades logic implies strictness.
                }

            } else if (action === 'assign_students') {
                // students is array of { uid, childId, grade }
                for (const s of students) {
                    // Find internal student ID
                    const res = await client.query(
                        'SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2',
                        [s.uid, s.childId]
                    );

                    if (res.rows.length > 0) {
                        const studentId = res.rows[0].id;
                        // Insert if not exists
                        await client.query(`
                            INSERT INTO teacher_student_assignments (teacher_uid, student_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [id, studentId]);
                    }
                }

            } else if (action === 'remove_grade') {
                await client.query('DELETE FROM teacher_grade_assignments WHERE teacher_uid = $1 AND grade = $2', [id, grade]);
                // Cleanup students of this grade
                await client.query(`
                    DELETE FROM teacher_student_assignments
                    WHERE teacher_uid = $1 AND student_id IN (
                        SELECT id FROM students WHERE grade = $2
                    )
                `, [id, grade]);

            } else if (action === 'remove_student') {
                // Need to look up student_id from studentUid (parent UID)??
                // Wait, removeStudentFromTeacher takes studentUid (parent UID).
                // But a parent might have multiple children?
                // The service key was `studentUid`. If key was `parent_child`, it would be unique.
                // If the key is just parent UID, it removes ALL children of that parent?
                // Service: `delete updatedStudents[studentUid];`
                // This implies 1 child per parent or legacy structure.
                // For PostgreSQL, we should try to remove by parent_uid link.

                await client.query(`
                    DELETE FROM teacher_student_assignments
                    WHERE teacher_uid = $1 AND student_id IN (
                        SELECT id FROM students WHERE parent_uid = $2
                    )
                `, [id, studentUid]);

            } else if (action === 'reset') {
                await client.query('DELETE FROM teacher_grade_assignments WHERE teacher_uid = $1', [id]);
                await client.query('DELETE FROM teacher_student_assignments WHERE teacher_uid = $1', [id]);
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Assignment API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
