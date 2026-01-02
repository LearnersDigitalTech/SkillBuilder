import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params; // Parent UID

    const client = await pool.connect();
    try {
        const query = `
        SELECT 
            id,
            child_id,
            name,
            grade,
            school_name
        FROM students
        WHERE parent_uid = $1
    `;
        const result = await client.query(query, [id]);

        const children = {};
        result.rows.forEach(row => {
            children[row.child_id] = {
                name: row.name,
                grade: row.grade,
                schoolName: row.school_name,
                school: row.school_name // Legacy
            };
        });

        return NextResponse.json({ children });

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
    const { name, grade, schoolName, childId } = body;

    if (!name || !grade) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // Use provided childId or generate one
        const finalChildId = childId || `child_${Date.now()}`;

        const query = `
            INSERT INTO students (parent_uid, child_id, name, grade, school_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [id, finalChildId, name, grade, schoolName || null];
        const result = await client.query(query, values);

        return NextResponse.json({ child: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request, { params }) {
    const { id } = await params; // Parent UID
    const body = await request.json();
    const { childId, name, grade, schoolName } = body;

    if (!childId) {
        return NextResponse.json({ error: 'Child ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const query = `
            UPDATE students
            SET name = COALESCE($1, name),
                grade = COALESCE($2, grade),
                school_name = COALESCE($3, school_name)
            WHERE parent_uid = $4 AND child_id = $5
            RETURNING *
        `;
        const values = [name, grade, schoolName, id, childId];
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ child: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
