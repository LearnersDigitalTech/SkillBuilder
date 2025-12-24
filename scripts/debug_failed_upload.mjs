import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../generated_puzzles.json');
const rawData = fs.readFileSync(jsonPath);
const puzzles = JSON.parse(rawData);

const invalidPuzzles = [];
const counters = {
    missingQuestion: 0,
    missingType: 0,
    missingGrades: 0
};

puzzles.forEach((item, index) => {
    let reason = [];
    if (!item.question) {
        reason.push("Missing Question");
        counters.missingQuestion++;
    }
    if (!item.type) {
        reason.push("Missing Type");
        counters.missingType++;
    }
    if (!item.grades) {
        reason.push("Missing Grades");
        counters.missingGrades++;
    }

    if (reason.length > 0) {
        invalidPuzzles.push({
            index: index,
            grade: item.grades ? item.grades[0] : 'Unknown',
            reason: reason.join(", "),
            data: item
        });
    }
});

console.log(`Found ${invalidPuzzles.length} invalid puzzles.`);
console.log("Breakdown:", counters);

if (invalidPuzzles.length > 0) {
    console.log("\nFirst 5 invalid items:");
    console.log(JSON.stringify(invalidPuzzles.slice(0, 5), null, 2));

    // Group invalid by grade to see if it's specific grades
    const byGrade = {};
    invalidPuzzles.forEach(p => {
        byGrade[p.grade] = (byGrade[p.grade] || 0) + 1;
    });
    console.log("\nInvalid counts by grade:", byGrade);
}
