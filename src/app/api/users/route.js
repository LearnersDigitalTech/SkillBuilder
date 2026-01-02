import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const uid = searchParams.get('uid');

        let query = 'SELECT * FROM users';
        let params = [];

        if (uid) {
            query += ' WHERE uid = $1';
            params = [uid];
        } else if (email) {
            query += ' WHERE email = $1';
            params = [email];
        }

        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            return NextResponse.json({ users: result.rows });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { uid, email, role, phone_number } = body;

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const query = `
        INSERT INTO users (uid, email, role, phone_number)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (uid) DO UPDATE
        SET email = EXCLUDED.email, 
            role = EXCLUDED.role, 
            phone_number = EXCLUDED.phone_number,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
            const values = [uid, email, role || 'parent', phone_number];
            const result = await client.query(query, values);

            return NextResponse.json({ user: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
