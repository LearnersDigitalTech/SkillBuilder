
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
        return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
    }

    try {
        const client = await db.connect();
        const query = `
            SELECT * FROM tutor_bookings 
            WHERE user_uid = $1
            ORDER BY created_at DESC
        `;
        const result = await client.query(query, [uid]);
        client.release();

        const bookings = result.rows.map(row => ({
            id: row.booking_id,
            internalId: row.id,
            tutorName: row.tutor_name,
            subject: row.subject,
            preferredDate: row.booking_date,
            status: row.status,
            studentName: row.student_name,
            grade: row.grade,
            preferredTimeSlot: row.details?.timeSlot,
            mode: row.details?.mode,
            phone: row.details?.phone,
            createdAt: row.created_at
        }));

        return NextResponse.json({ bookings });

    } catch (error) {
        console.error('Tutor Bookings API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            uid,
            studentName,
            grade,
            preferredDate,
            preferredTimeSlot,
            mode,
            phone,
            subject,
            tutorName
        } = body;

        if (!uid || !preferredDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await db.connect();
        const bookingId = uuidv4();

        const details = {
            timeSlot: preferredTimeSlot,
            mode: mode,
            phone: phone
        };

        const query = `
            INSERT INTO tutor_bookings 
            (booking_id, user_uid, student_name, grade, booking_date, details, subject, tutor_name, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
            RETURNING booking_id
        `;

        await client.query(query, [
            bookingId,
            uid,
            studentName,
            grade,
            preferredDate,
            JSON.stringify(details),
            subject || 'General',
            tutorName || 'Any'
        ]);

        client.release();
        return NextResponse.json({ success: true, bookingId });

    } catch (error) {
        console.error('Create Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
