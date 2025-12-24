import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../generated_puzzles.json');
const rawData = fs.readFileSync(jsonPath);
const puzzles = JSON.parse(rawData);

const gradeCounts = {};

puzzles.forEach(p => {
    if (p.grades && Array.isArray(p.grades)) {
        p.grades.forEach(g => {
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        });
    }
});

console.log("Puzzle Counts per Grade:");
Object.keys(gradeCounts).sort((a, b) => a - b).forEach(g => {
    console.log(`Grade ${g}: ${gradeCounts[g]}`);
});
console.log(`Total Puzzles: ${puzzles.length}`);
