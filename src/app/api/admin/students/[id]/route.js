import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
    const { id } = await params; // This is the PostgreSQL internal ID

    if (!id) {
        return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Delete Reports first (if foreign key cascade isn't set, which we assume safety)
        await client.query('DELETE FROM reports WHERE student_id = $1', [id]);

        // 2. Delete Student
        const res = await client.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

        if (res.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true, deleted: res.rows[0] });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
