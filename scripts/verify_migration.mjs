
// Node 18+ has native fetch
const BASE_URL = 'http://localhost:3000';

async function runTest() {
    console.log("🚀 Starting Migration Verification...");

    // 1. Create Parent
    const parentUid = `test_parent_${Date.now()}`;
    console.log(`\n1. Creating Parent (UID: ${parentUid})...`);
    const userRes = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid: parentUid,
            email: `${parentUid}@example.com`,
            role: 'parent',
            phone_number: '1234567890'
        })
    });
    console.log("Create Parent Status:", userRes.status);
    if (!userRes.ok) {
        console.error("Failed to create parent", await userRes.text());
        return;
    }

    // 2. Create Child
    const childId = `child_${Date.now()}`;
    console.log(`\n2. Creating Child (ID: ${childId})...`);
    const childRes = await fetch(`${BASE_URL}/api/users/${parentUid}/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            childId: childId,
            name: "Test Student",
            grade: "Grade 5",
            schoolName: "Test School"
        })
    });
    console.log("Create Child Status:", childRes.status);
    const childData = await childRes.json();
    console.log("Child Data:", childData);
    if (!childRes.ok) return;

    // 3. Create Report
    console.log(`\n3. Creating Report...`);
    const reportRes = await fetch(`${BASE_URL}/api/students/${parentUid}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            childId: childId,
            reportType: 'ASSESSMENT',
            data: { score: 100, summary: { correct: 10, total: 10 } },
            timestamp: new Date().toISOString()
        })
    });
    console.log("Create Report Status:", reportRes.status);
    const reportResult = await reportRes.json();
    console.log("Report Result:", reportResult);
    if (!reportRes.ok) return;

    // 4. Fetch Report
    console.log(`\n4. Fetching Reports...`);
    const fetchRes = await fetch(`${BASE_URL}/api/students/${parentUid}/reports?childId=${childId}`);
    console.log("Fetch Report Status:", fetchRes.status);
    const fetchData = await fetchRes.json();
    console.log("Fetched Reports:", JSON.stringify(fetchData, null, 2));

    if (fetchData.reports && Object.keys(fetchData.reports).length > 0) {
        console.log("\n✅ VERIFICATION SUCCESSFUL: Data round-tested via API.");
    } else {
        console.error("\n❌ VERIFICATION FAILED: Report not found.");
    }
}

// Check if server is running
fetch(BASE_URL).then(() => {
    runTest();
}).catch(() => {
    console.error("❌ Stats: Server not running on localhost:3000. Please run 'npm run dev' first.");
});
