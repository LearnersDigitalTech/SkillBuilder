import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolving paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Generators
import { Grade1GeneratorMap } from '../src/questionBook/Grade1/GetGrade1Question.js';
import { Grade2GeneratorMap } from '../src/questionBook/Grade2/GetGrade2Question.mjs';
import { Grade3GeneratorMap } from '../src/questionBook/Grade3/GetGrade3Question.mjs';
import { Grade4GeneratorMap } from '../src/questionBook/Grade4/GetGrade4Question.mjs';
import { Grade5GeneratorMap } from '../src/questionBook/Grade5/GetGrade5Question.mjs';
import { Grade6GeneratorMap } from '../src/questionBook/Grade6/GetGrade6Question.mjs';
import { Grade7GeneratorMap } from '../src/questionBook/Grade7/GetGrade7Question.mjs';
import { Grade8GeneratorMap } from '../src/questionBook/Grade8/GetGrade8Question.mjs';
import { Grade9GeneratorMap } from '../src/questionBook/Grade9/GetGrade9Question.mjs';
import { Grade10GeneratorMap } from '../src/questionBook/Grade10/GetGrade10Question.mjs';

const maps = {
    1: Grade1GeneratorMap,
    2: Grade2GeneratorMap,
    3: Grade3GeneratorMap,
    4: Grade4GeneratorMap,
    5: Grade5GeneratorMap,
    6: Grade6GeneratorMap,
    7: Grade7GeneratorMap,
    8: Grade8GeneratorMap,
    9: Grade9GeneratorMap,
    10: Grade10GeneratorMap
};

const puzzles = [];
console.log("Generating puzzles...");

const QUESTIONS_PER_GRADE = 60;

for (let i = 0; i < QUESTIONS_PER_GRADE; i++) {

    // Iterate all grades
    for (let grade = 1; grade <= 10; grade++) {
        const map = maps[grade];
        if (!map) continue;

        const topics = Object.keys(map);
        if (topics.length === 0) continue;

        // Pick a topic cyclically to ensure coverage
        const topicIndex = i % topics.length;
        const topic = topics[topicIndex];
        const generator = map[topic];

        try {
            const questionData = generator();

            // Determine Type
            let type = 'MCQ';
            if (questionData.type) {
                type = questionData.type;
            } else if (!questionData.options || questionData.options.length === 0) {
                type = 'TEXT';
            }

            // Construct Puzzle Object
            const puzzle = {
                // date: dateStr, // No longer needed for Random Bank
                grades: [grade],
                type: type,
                question: questionData.question,
                imageUrl: questionData.image || questionData.imageUrl || '',

                // MCQ specific
                options: questionData.options || ['', '', '', ''],

                // General correct answer
                correctAnswer: questionData.answer != null ? questionData.answer.toString() : '',

                // Matching pairs (if applicable in future)
                pairs: questionData.pairs || [],

                // Table Input specific
                rows: questionData.rows || [],
                headers: questionData.headers || [],
                variant: questionData.variant || '',
            };

            // Fix empty question for TableInput
            if (!puzzle.question && puzzle.rows.length > 0) {
                if (puzzle.rows.length === 1 && puzzle.rows[0].text) {
                    puzzle.question = puzzle.rows[0].text;
                } else {
                    puzzle.question = "Solve the following problems:";
                }
            }

            // Cleanup empty fields
            if (!puzzle.imageUrl) delete puzzle.imageUrl;
            if (type === 'TEXT') delete puzzle.options;


            if (puzzle.pairs && puzzle.pairs.length === 0) delete puzzle.pairs;

            puzzles.push(puzzle);

        } catch (e) {
            console.error(`Error generating Grade ${grade} Index ${i} (${topic}):`, e.message);
        }
    }
}

// Write to file
const outputPath = path.join(__dirname, '../generated_puzzles.json');
fs.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2));
console.log(`Generated ${puzzles.length} puzzles at ${outputPath}`);
