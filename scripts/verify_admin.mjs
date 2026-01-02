
// Node 18+ has native fetch
const BASE_URL = 'http://localhost:3000/api/admin/students';

async function runTest() {
    console.log("🚀 Starting Admin API Verification...");

    // 1. Fetch Students
    console.log(`\n1. Fetching Students from ${BASE_URL}...`);
    const res = await fetch(BASE_URL);
    console.log("GET Status:", res.status);

    if (!res.ok) {
        console.error("Failed to fetch students", await res.text());
        return;
    }

    const data = await res.json();
    console.log(`Fetched ${data.students?.length} students.`);

    // Check if we have our test student "Test Student"
    const testStudent = data.students?.find(s => s.name === "Test Student");

    if (testStudent) {
        console.log("✅ Found Test Student:", testStudent.id, testStudent.name);

        // 2. Delete Student
        console.log(`\n2. Deleting Test Student (ID: ${testStudent.id})...`);
        const delRes = await fetch(`${BASE_URL}/${testStudent.id}`, {
            method: 'DELETE'
        });
        console.log("DELETE Status:", delRes.status);

        if (delRes.ok) {
            console.log("✅ Student successfully deleted.");
        } else {
            console.error("Failed to delete student", await delRes.text());
        }
    } else {
        console.warn("⚠️ Test Student 'Test Student' not found. Did verify_migration.mjs run successfully/insert data?");
        if (data.students?.length > 0) {
            console.log("First available student:", JSON.stringify(data.students[0], null, 2));
            // Don't delete random student
        }
    }
}

// Check if server is running
fetch('http://localhost:3000/api/admin/students')
    .then(() => runTest())
    .catch(() => console.error("❌ Server not running. Run 'npm run dev' first."));
