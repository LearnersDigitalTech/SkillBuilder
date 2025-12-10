import analyzeResponses from './src/app/workload/GenerateReport.js';

const mockResponses = [
    {
        questionId: 'q1',
        timeTaken: 10,
        answer: 'A',
        userAnswer: 'A'
    },
    {
        questionId: 'q2',
        timeTaken: 15,
        answer: 'B',
        userAnswer: 'C'
    },
    {
        questionId: 'q3',
        timeTaken: 5, // Should be included even if wrong? Logic says yes, if attempted.
        // Wait, logic says:
        // if (attempted) { ... summary.totalTime += timeTaken }
        // My mock data needs 'userAnswer' to be considered attempted.
        answer: 'C',
        userAnswer: 'C'
    },
    {
        questionId: 'q4',
        timeTaken: 20,
        answer: 'D',
        userAnswer: '' // Not attempted
    }
];

// Let's check the logic in GenerateReport.js again.
// It iterates responses.
// calculates 'attempted' = givenAnswer !== ""
// if (attempted) { ... totalTime += ... }
// So q4 (timeTaken 20) should NOT be added if logic relies on 'attempted' block.
// Let's verify what I wrote:
/*
        if (attempted) {
            result.summary.attempted += 1;
            result.summary.correct += score;
            result.summary.wrong += (1 - score);
            // Accumulate timeTaken (ensure it's a number)
            if (typeof timeTaken === 'number') {
                result.summary.totalTime += timeTaken;
            }
        }
*/
// Yes, it is inside the 'if (attempted)' block.

const grade = 'Grade 5';
const result = analyzeResponses(mockResponses, grade);

console.log("Total Time:", result.summary.totalTime);

if (result.summary.totalTime === 30) {
    console.log("PASS: Total time is 30 (10 + 15 + 5)");
} else {
    console.log("FAIL: Expected 30, got " + result.summary.totalTime);
}
