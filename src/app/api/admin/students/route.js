import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const gradeFilter = searchParams.get('grade');

        // Base query
        let query = `
            SELECT 
                s.id as internal_id,
                s.child_id,
                s.name as student_name,
                s.grade,
                s.school_name,
                s.created_at as student_created_at,
                u.uid as parent_uid,
                u.email as parent_email,
                u.phone_number as parent_phone,

                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', r.id,
                            'report_type', r.report_type,
                            'data', r.data,
                            'created_at', r.created_at
                        ) ORDER BY r.created_at DESC
                    ) FILTER (WHERE r.id IS NOT NULL), 
                    '[]'
                ) as reports
            FROM students s
            LEFT JOIN users u ON s.parent_uid = u.uid
            LEFT JOIN reports r ON s.id = r.student_id
        `;

        const values = [];

        if (gradeFilter) {
            query += ` WHERE s.grade = $1 `;
            values.push(gradeFilter);
        }

        query += ` GROUP BY s.id, u.uid, u.email, u.phone_number`;

        const result = await db.query(query, values);

        const students = result.rows.map(row => ({
            id: row.internal_id, // Useful for deletion
            childId: row.child_id,
            name: row.student_name,
            grade: row.grade,
            schoolName: row.school_name,
            createdAt: row.student_created_at,
            parent: {
                uid: row.parent_uid,
                email: row.parent_email,
                phone: row.parent_phone,
                name: row.parent_email ? row.parent_email.split('@')[0] : 'N/A'
            },
            reports: row.reports,
            // Compatibility fields for Admin Service
            uid: row.parent_uid,
            email: row.parent_email,
            phoneNumber: row.parent_phone
        }));

        return NextResponse.json({ students });

    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
