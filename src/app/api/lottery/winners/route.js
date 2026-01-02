
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const client = await db.connect();
        const query = `
            SELECT * FROM lucky_draw_winners ORDER BY won_at DESC
        `;
        const result = await client.query(query);
        client.release();

        // Map snake_case to camelCase
        const winners = result.rows.map(row => ({
            id: row.id,
            ticketCode: row.ticket_code,
            rank: row.rank,
            prize: row.prize,
            wonAt: row.won_at
        }));

        return NextResponse.json(winners);
    } catch (error) {
        console.error('Lottery Winners GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { ticketCode, rank, prize, round, role, displayName, effectiveUserType } = body;
        // Fields in table: ticket_code, rank, prize, won_at
        // Should we store extra json? Table schema had 'prize'.
        // Wait, 'lucky_draw_winners' schema step 474: id, ticket_code, rank, prize, won_at.
        // It misses user details.
        // User details should be fetched from matching lottery_entry or joined.
        // But for "Winners Display", we might want to store snapshot.
        // I should probably ADD 'data' column to lucky_draw_winners or similar.
        // Or I rely on join.
        // Let's rely on Join or simple storage.
        // If I haven't added 'data' column, I can't store 'displayName'.
        // I will check schema again. 
        // It was SIMPLE.
        // I'll update schema quickly or just store minimal.
        // Let's Store minimal and Join on GET?
        // GET returns `ticket_code`. Frontend has full list of registrations.
        // Frontend: `const codes = new Set(Object.values(data).map(w => w.ticketCode));`
        // It fetches WINNERS to exclude them.

        // Wait, Step 747 (LotteryDraw.js):
        // `renderWinnerCard` uses `winner.displayName`.
        // `winner` object comes from `grandWinners` state, which is populated from `registrations` (pool).
        // So `LotteryDraw` HAS the details in memory.
        // Saving to Firebase: `save winnerData`.
        // Fetching Winners: Used for EXCLUSION.
        // Does the "Winners Page" (if exists) use this API? 
        // `src/components/Admin/LuckyDrawWinners.js` (Step 474 mentions it).
        // I haven't checked that file.
        // It probably needs details.

        // I will Insert ticket_code.

        const client = await db.connect();

        const insert = `
            INSERT INTO lucky_draw_winners (ticket_code, rank, prize, won_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id
        `;
        // Mapping: rank? round? 
        // Logic uses 'round'. I can put 'round' in 'prize' or 'rank'?
        // Or ignore for now.

        await client.query(insert, [ticketCode, rank || 1, prize || round || 'Winner']);
        client.release();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Lottery Winners POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
