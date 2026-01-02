
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { uid, childId, name } = body;

        // name is optional if we just want to update other fields, but here it's main use case
        if (!uid || !childId || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await db.connect();

        // Update name
        const query = `
            UPDATE students 
            SET name = $1
            WHERE parent_uid = $2 AND child_id = $3
            RETURNING id
        `;

        const result = await client.query(query, [name, uid, childId]);

        // If no row updated, it might be that the student doesn't exist yet (if checking just Registrations)?
        // But students table should be populated.
        // If logic relies on updating "Registrations" which then updates students...
        // But we are moving to Postgres.
        // If row count is 0, return 404.

        if (result.rowCount === 0) {
            // Should we insert? "Registrations" implies user profile.
            // If the child was added via UI but not yet in DB?
            // Usually valid childId implies existence.
            client.release();
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        client.release();
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update Student Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
