import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await db.connect();
        const res = await client.query('SELECT NOW()');
        client.release();

        return NextResponse.json({
            status: 'ok',
            dbTime: res.rows[0].now,
            hasDBUrl: !!process.env.DATABASE_URL
        });
    } catch (e) {
        return NextResponse.json({
            status: 'error',
            error: e.message,
            stack: e.stack,
            type: 'Helper DB usage'
        }, { status: 500 });
    }
}
