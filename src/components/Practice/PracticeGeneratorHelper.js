import {
    generateCountForward,
    generateCountBackward,
    generateCountingObjects,
    generateSkipCounting,
    generatePlaceValue,
    generateComparison,
    generateEvenOdd,
    generateAdditionObjects,
    generateAdditionWordProblems,
    generateSubtractionObjects,
    generateSubtractionWordProblems,
    generateIdentifyShapes,
    generateSpatial,
    generateWeightComparison,
    generateCapacityComparison,
    generateTimeBasics,
    generateDaysOfWeek,
    generateMoneyCounting,
    generatePatterns,
    generateBeforeAfter,
    generateBetweenNumber,
    generateSequencePattern,
    generateTally,
    generatePictureGraph,
    generateLengthComparison
} from '../../questionBook/Grade1/grade1Generators.js';

// Map topics or unique IDs to generators
const generatorMap = {
    // Number Sense
    "Number Sense / Counting Objects": generateCountingObjects,
    "Number Sense / Place Value": generatePlaceValue,
    "Number Sense / Even & Odd": generateEvenOdd,
    "Number Sense / Before & After": generateBeforeAfter,
    "Number Sense / Between": generateBetweenNumber,

    // Addition
    "Addition / Basics": generateAdditionObjects,
    "Addition / Word Problems": generateAdditionWordProblems,

    // Subtraction
    "Subtraction / Basics": generateSubtractionObjects,
    "Subtraction / Word Problems": generateSubtractionWordProblems,

    // Geometry
    "Geometry / Shapes": generateIdentifyShapes,
    "Geometry / Spatial": generateSpatial,

    // Measurement
    "Measurement / Length": generateLengthComparison,
    "Measurement / Weight": generateWeightComparison,
    "Measurement / Capacity": generateCapacityComparison,

    // Time
    "Time / Basics": generateTimeBasics,
    "Time / Days of Week": generateDaysOfWeek,

    // Money
    "Money / Basics": generateMoneyCounting,

    // Patterns
    "Patterns / Basics": generatePatterns,
    "Patterns / Sequences": generateSequencePattern,

    // Data Handling
    "Data Handling / Tally": generateTally,
    "Data Handling / Picture Graph": generatePictureGraph
};

export const regenerateQuestion = (currentQuestion) => {
    if (!currentQuestion) return null;

    // 1. Direct topic match
    let generator = generatorMap[currentQuestion.topic];

    // 2. Resolve ambiguities where multiple generators share a topic

    // "Number Sense / Counting" -> Found in Forward and Backward
    if (currentQuestion.topic === "Number Sense / Counting") {
        if (currentQuestion.question.toLowerCase().includes("backwards")) {
            return generateCountBackward();
        }
        return generateCountForward();
    }

    // "Number Sense / Skip Counting" -> Needs step inference
    if (currentQuestion.topic === "Number Sense / Skip Counting") {
        if (currentQuestion.question.includes("2s")) return generateSkipCounting(2);
        if (currentQuestion.question.includes("5s")) return generateSkipCounting(5);
        if (currentQuestion.question.includes("10s")) return generateSkipCounting(10);
        // Default
        return generateSkipCounting(2);
    }

    // "Number Sense / Comparison" -> Greatest vs Smallest
    if (currentQuestion.topic === "Number Sense / Comparison") {
        if (currentQuestion.question.toLowerCase().includes("smallest")) {
            return generateComparison('smallest');
        }
        return generateComparison('greatest');
    }

    if (generator) {
        return generator();
    }

    // Checking if I missed any:
    // "Ordering / Before" etc were in old map but seem to be covered by "Number Sense / Before & After" in actual generators.

    return null;
};
