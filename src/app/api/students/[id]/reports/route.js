import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    // params.id is 'student_uid' (which is parent_uid in our DB, but we usually need child_id too).
    // Wait, the params might be tricky.
    // The route is /api/students/[id]/reports
    // If [id] is the Parent UID (which 'studentUid' usually is in this app), 
    // we also need 'childId' to distinguish siblings.
    // The query param will handle childId.

    const { id } = await params; // Parent UID
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (!childId) {
        return NextResponse.json({ error: 'Child ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // 1. Get Student Internal ID
        const studentQuery = `
        SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2
      `;
        const studentRes = await client.query(studentQuery, [id, childId]);

        if (studentRes.rows.length === 0) {
            return NextResponse.json({ reports: null });
        }

        const internalStudentId = studentRes.rows[0].id;

        // 2. Fetch Reports
        const reportsQuery = `
            SELECT id, report_type, data, created_at FROM reports WHERE student_id = $1
        `;
        const reportsRes = await client.query(reportsQuery, [internalStudentId]);

        const reports = {};
        reportsRes.rows.forEach(row => {
            // Wrap data with metadata if needed, or just return data merged with timestamp
            // The client expects the report value to be an object
            // row.data is the JSONB content.
            // We'll use the ID as the key (converted to string)
            reports[row.id.toString()] = {
                ...row.data,
                timestamp: row.created_at || new Date().toISOString(),
                reportType: row.report_type
            };
        });

        return NextResponse.json({ reports });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(request, { params }) {
    const { id } = await params; // Parent UID
    const body = await request.json();
    const { childId, reportType, data, timestamp } = body;

    if (!childId || !data) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // 1. Get Student Internal ID
        const studentQuery = `
            SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2
        `;
        const studentRes = await client.query(studentQuery, [id, childId]);

        if (studentRes.rows.length === 0) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const internalStudentId = studentRes.rows[0].id; // Actually we might need to handle 'default' logic if needed, but strict check is safer

        // 2. Insert Report
        const insertQuery = `
            INSERT INTO reports (student_id, report_type, data, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        // Ensure data is JSON stringified if it's an object, or let PG handle it if using jsonb
        // With pg client, objects are stringified automatically for JSON types? Usually yes.
        // But my schema said data JSONB.

        await client.query(insertQuery, [
            internalStudentId,
            reportType || 'ASSESSMENT',
            JSON.stringify(data),
            timestamp || new Date().toISOString()
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
