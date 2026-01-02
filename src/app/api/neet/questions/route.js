
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    if (!subject) return NextResponse.json({ questions: [] });

    try {
        const client = await db.connect();
        const query = `
            SELECT * FROM neet_questions 
            WHERE subject = $1 
            ORDER BY created_at DESC
        `;
        const result = await client.query(query, [subject]);
        client.release();

        const questions = result.rows.map(row => ({
            id: row.id,
            subject: row.subject,
            question: row.question_text, // Map back to typical frontend expectation
            questionText: row.question_text,
            options: row.options,
            correctAnswer: row.correct_answer,
            explanation: row.explanation,
            level: row.difficulty,
            imageUrl: row.image_url,
            uploadedBy: row.created_by,
            createdAt: row.created_at
        }));

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('NEET API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { subject, questions, teacherUid } = body;

        if (!subject || !questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const client = await db.connect();

        // Batch insert?
        // simple loop for now
        for (const q of questions) {
            const query = `
                INSERT INTO neet_questions 
                (subject, question_text, options, correct_answer, explanation, difficulty, image_url, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            const values = [
                subject,
                q.question || q.questionText || '',
                JSON.stringify(q.options || []),
                q.correctAnswer || q.answer,
                q.explanation || '',
                q.level || q.difficulty || 'medium',
                q.imageUrl || q.image || '',
                teacherUid
            ];
            await client.query(query, values);
        }

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('NEET Save Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clear') === 'true';

    try {
        const client = await db.connect();

        if (clearAll && subject) {
            await client.query('DELETE FROM neet_questions WHERE subject = $1', [subject]);
        } else if (id) {
            await client.query('DELETE FROM neet_questions WHERE id = $1', [id]);
        }

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('NEET Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
