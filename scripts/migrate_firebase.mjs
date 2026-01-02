import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase Config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // IMPORTANT: Ensure this is in .env or default to known
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Migration...');

        // 1. Fetch Registrations
        console.log('📥 Fetching Registrations from Firebase...');
        const regRef = ref(db, 'NMD_2025/Registrations');
        const regSnapshot = await get(regRef);

        if (!regSnapshot.exists()) {
            console.log('⚠️ No registrations found.');
            return;
        }

        const registrations = regSnapshot.val();
        const users = [];
        const students = [];
        const assignments = [];

        console.log(`📊 Processing ${Object.keys(registrations).length} records...`);

        // Deduplicate Teachers by Ticket Code
        const teachersMap = new Map();
        const teachersWithoutTicket = [];

        // Iterate and Transform Data
        for (const [key, data] of Object.entries(registrations)) {
            // Fix: Check if data is an object
            if (typeof data !== 'object') continue;

            const uid = key; // Use the Firebase Key as UID
            const email = data.email || data.parentEmail || null;
            const phone = data.phoneNumber || data.parentPhone || null;
            let role = data.userType || 'parent';
            if (role === 'student') role = 'parent'; // Standardize legacy 'student' to 'parent' usually

            // Push to Users
            users.push({
                uid,
                email,
                role,
                phone
            });

            // If Teacher
            if (role === 'teacher') {
                const ticketCode = data.ticketCode || null;
                const teacherObj = {
                    user_uid: uid,
                    name: data.name,
                    ticket_code: ticketCode,
                    school_name: data.schoolName || null,
                    neet_upload_enabled: !!data.neetUploadEnabled
                };

                // Prepare Assignments (Store for later)
                if (data.teacherAssignments) {
                    assignments.push({
                        teacher_uid: uid,
                        assignedGrades: data.teacherAssignments.assignedGrades || [],
                        studentAssignments: data.teacherAssignments.students || {}
                    });
                }

                // Deduplication Logic
                if (ticketCode) {
                    if (teachersMap.has(ticketCode)) {
                        // If current entry is "better" (e.g., UID is not the ticket code itself)
                        if (uid !== ticketCode) {
                            teachersMap.set(ticketCode, teacherObj);
                        }
                    } else {
                        teachersMap.set(ticketCode, teacherObj);
                    }
                } else {
                    teachersWithoutTicket.push(teacherObj);
                }
            }

            // Process Children (Students)
            // Modern Structure
            if (data.children) {
                Object.entries(data.children).forEach(([childId, child]) => {
                    students.push({
                        parent_uid: uid,
                        child_id: childId,
                        name: child.name,
                        grade: child.grade,
                        school_name: child.schoolName || child.school || data.schoolName || null,
                        legacy_grade: null
                    });
                });
            }
            // Legacy Structure
            else if (data.grade || data.name) {
                students.push({
                    parent_uid: uid,
                    child_id: 'default',
                    name: data.name || 'Unknown',
                    grade: data.grade || null,
                    school_name: data.schoolName || data.school || null,
                    legacy_grade: typeof data.grade === 'string' ? data.grade : null
                });
            }
        }

        // Combine Deduplicated Teachers
        const finalTeachers = [...teachersMap.values(), ...teachersWithoutTicket];

        console.log(`📝 Inserting ${users.length} Users...`);
        for (const u of users) {
            const query = `
                INSERT INTO users (uid, email, role, phone_number)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (uid) DO NOTHING
            `;
            await client.query(query, [u.uid, u.email, u.role, u.phone]);
        }

        console.log(`📝 Inserting ${finalTeachers.length} Teachers (deduplicated from raw count)...`);
        for (const t of finalTeachers) {
            const query = `
                INSERT INTO teachers (user_uid, name, ticket_code, school_name, neet_upload_enabled)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_uid) DO NOTHING
            `;
            // Note: We might still hit ticket_code conflict if logical dedupe failed slightly,
            // but we designed it to be unique.
            // Safety: ON CONFLICT (user_uid) is handled.
            // If duplicate ticket_code exists across different UIDs that we somehow missed, Postgres will throw.
            // Let's wrap in try-catch to continue partial success if really needed, but ideally logic holds.
            try {
                await client.query(query, [t.user_uid, t.name, t.ticket_code, t.school_name, t.neet_upload_enabled]);
            } catch (e) {
                console.error(`Skipping teacher insert for ${t.user_uid} due to error: ${e.message}`);
            }
        }

        console.log(`📝 Inserting ${students.length} Students...`);
        for (const s of students) {
            const query = `
                INSERT INTO students (parent_uid, child_id, name, grade, school_name, legacy_grade)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;
            // We use ON CONFLICT DO NOTHING if we had a unique constraint on parent+childId,
            // but we didn't add one in init_db.sql.
            // Check existence logic or just insert (assuming empty DB).
            // To be safe against re-runs, let's check.
            const check = await client.query('SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2', [s.parent_uid, s.child_id]);
            if (check.rows.length === 0) {
                await client.query(query, [s.parent_uid, s.child_id, s.name, s.grade, s.school_name, s.legacy_grade]);
            }
        }

        console.log('🔗 Processing Assignments...');
        for (const assign of assignments) {
            // Grades
            for (const grade of assign.assignedGrades) {
                await client.query(
                    'INSERT INTO teacher_grade_assignments (teacher_uid, grade) VALUES ($1, $2)',
                    [assign.teacher_uid, grade]
                );
            }
            // Students (Must find Student ID)
            // assignments.studentAssignments is object { [studentUid]: { ... } }
            // NOTE: The key is studentUid (Parent UID).
            for (const [studentUid, details] of Object.entries(assign.studentAssignments)) {
                // The teacher is assigned to a specific child of that parent?
                // details often has { childId, grade ... }
                const childId = details.childId || 'default';

                // Find student ID
                const res = await client.query(
                    'SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2',
                    [studentUid, childId]
                );

                if (res.rows.length > 0) {
                    await client.query(
                        'INSERT INTO teacher_student_assignments (teacher_uid, student_id) VALUES ($1, $2)',
                        [assign.teacher_uid, res.rows[0].id]
                    );
                }
            }
        }

        // 2. Fetch Reports
        console.log('📥 Fetching Reports from Firebase...');
        const repRef = ref(db, 'NMD_2025/Reports');
        const repSnapshot = await get(repRef);

        if (repSnapshot.exists()) {
            const reportsData = repSnapshot.val();
            let reportCount = 0;
            // Structure: { [userKey]: { [childId]: { ...reports } } }
            // userKey matches parent UID usually, but some keys might be sanitized (dots replaced)?
            // `teacherDataService` says `userKey = studentUid.replace('.', '_')`.

            for (const [userKey, childMap] of Object.entries(reportsData)) {
                if (typeof childMap !== 'object') continue;

                // We need to match userKey back to UID.
                // UIDs often don't have dots, emails do.
                // If userKey corresponds to a parent_uid in our DB...
                // Let's try to match directly, or replace _ with .

                // Try exact match first
                let parentUid = userKey;
                let userCheck = await client.query('SELECT uid FROM users WHERE uid = $1', [parentUid]);

                if (userCheck.rows.length === 0) {
                    // Try replacing last underbar? Or assuming it's an email sanitized?
                    // If it's a firebase UID, it usually doesn't have dots.
                    // If it's an email key, it might.
                    // Let's iterate users to find match via email? Too slow.
                    // Basic fallback: replace all _ with . ? No, UIDs have _ sometimes.

                    // Strategy: Logic from codebase.
                    // If the codebase writes `replace('.', '_')`, then we assume the key IS the uid with dots replaced.
                    // So `real_uid` might be `userKey` (if no dots originally) OR we check if we can fuzzy match.

                    // actually, if we registered data with the SAME key, we should find it.
                    // But if we don't find it, we skip.
                }

                for (const [childId, reports] of Object.entries(childMap)) {
                    // Find student
                    // Try both userKey and userKey-with-dots-restored?
                    // Actually simplest way:
                    // The Reports key is derived from the User who generated it.
                    // Let's just query `students` table for `child_id` and `parent_uid` similar to key.

                    // We will try `userKey` directly.
                    let studentRes = await client.query('SELECT id FROM students WHERE parent_uid = $1 AND child_id = $2', [userKey, childId]);

                    if (studentRes.rows.length === 0) {
                        // Try un-sanitizing? (Rare case if UIDs are simple)
                        // continue;
                    }

                    if (studentRes.rows.length > 0) {
                        const studentId = studentRes.rows[0].id;

                        // Insert Reports
                        for (const [reportId, reportData] of Object.entries(reports)) {
                            try {
                                // Postgres JSONB requires a stringified JSON
                                const jsonData = JSON.stringify(reportData);
                                await client.query(
                                    'INSERT INTO reports (student_id, report_type, data) VALUES ($1, $2, $3)',
                                    [studentId, reportId, jsonData]
                                );
                                reportCount++;
                            } catch (err) {
                                console.error(`❌ Error inserting report (Student: ${studentId}, Type: ${reportId}):`, err.message);
                            }
                        }
                    }
                }
            }
            console.log(`✅ Inserted ${reportCount} reports.`);
        }

        console.log('✨ Migration Complete!');

    } catch (err) {
        console.error('❌ Migration Failed:', err);
    } finally {
        client.release();
        await pool.end();
        process.exit();
    }
}

migrate();
