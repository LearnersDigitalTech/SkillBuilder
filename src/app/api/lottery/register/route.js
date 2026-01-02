
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            uid, ticketCode, userType, name, email, phoneNumber,
            data, children
        } = body;

        // body.data contains the lottery specific fields (schoolName, profession, etc)
        // body.children matches the structure for creating students.

        if (!ticketCode || !userType || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // 1. Insert into lottery_entries
            const insertLottery = `
                INSERT INTO lottery_entries 
                (ticket_code, user_uid, user_type, name, email, phone_number, data)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (ticket_code) DO NOTHING
            `;
            await client.query(insertLottery, [
                ticketCode, uid, userType, name, email, phoneNumber, JSON.stringify(data)
            ]);

            // 2. Insert/Update users table
            // userType map to role
            // teacher -> teacher
            // student -> student
            // parent -> parent
            // Guest -> parent? or guest? 'users' table handles 'parent' | 'teacher' | 'admin' | 'student'.
            // guest role?
            let role = userType.toLowerCase();
            if (role === 'guest') role = 'parent'; // Treat guest as parent for schema simplicity? Or add guest role.

            const upsertUser = `
                INSERT INTO users (uid, email, phone_number, role, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (uid) DO UPDATE 
                SET email = EXCLUDED.email, 
                    phone_number = EXCLUDED.phone_number,
                    role = EXCLUDED.role
            `;
            await client.query(upsertUser, [uid, email, phoneNumber, role]);

            // 3. Insert Students (if any)
            if (children && Object.keys(children).length > 0) {
                for (const childKey of Object.keys(children)) {
                    const child = children[childKey];
                    // child: { name, grade, school... }
                    // Insert into students
                    // generate child_id from key or unique
                    const childId = childKey;

                    const insertStudent = `
                        INSERT INTO students 
                        (parent_uid, child_id, name, grade, school_name)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (parent_uid, child_id) DO UPDATE
                        SET name = EXCLUDED.name,
                            grade = EXCLUDED.grade,
                            school_name = EXCLUDED.school_name
                    `;
                    await client.query(insertStudent, [
                        uid, childId, child.name, child.grade, child.school || child.schoolName
                    ]);
                }
            }

            // 4. If Teacher, insert to teachers table? 
            // Currently schema has 'teachers' table?
            // Let's check init_db.sql.
            // CREATE TABLE teachers (uid VARCHAR(255) PRIMARY KEY REFERENCES users(uid)...)
            if (userType === 'teacher') {
                const insertTeacher = `
                    INSERT INTO teachers (uid, name, email, phone_number, school_name)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (uid) DO UPDATE
                    SET school_name = EXCLUDED.school_name
                `;
                await client.query(insertTeacher, [
                    uid, name, email, phoneNumber, data.schoolName
                ]);
            }

            await client.query('COMMIT');
            client.release();
            return NextResponse.json({ success: true });

        } catch (err) {
            await client.query('ROLLBACK');
            client.release();
            throw err;
        }

    } catch (error) {
        console.error('Lottery Register Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
