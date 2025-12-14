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
} from './grade1Generators.js';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade1Questions = {
    q1: generate(generateCountForward),
    q2: generate(generateCountBackward),
    q3: generate(generateBeforeAfter),
    q4: generate(generateBetweenNumber),
    q5: generate(generateCountingObjects),
    q6: generate(() => generateSkipCounting(2)),
    q7: generate(() => generateSkipCounting(5)),
    q8: generate(() => generateSkipCounting(10)),
    q9: generate(generatePlaceValue),
    q10: generate(() => generateComparison('smallest')),
    q11: generate(() => generateComparison('greatest')),
    q12: generate(generateEvenOdd),
    q13: generate(generateAdditionObjects),
    q14: generate(generateAdditionWordProblems),
    q15: generate(generateSubtractionObjects),
    q16: generate(generateSubtractionWordProblems),
    q17: generate(generateIdentifyShapes),
    q18: generate(generateSpatial),
    q19: generate(generateWeightComparison),
    q20: generate(generateCapacityComparison),
    q21: generate(generateTimeBasics),
    q22: generate(generateMoneyCounting),
    q23: generate(generateDaysOfWeek),
    q24: generate(generatePatterns),
    q25: generate(generateSequencePattern)
};


export const Grade1GeneratorMap = {
    // Number Sense
    "Number Sense / Counting Objects": generateCountingObjects,
    "Number Sense / Place Value": generatePlaceValue,
    "Number Sense / Even & Odd": generateEvenOdd,
    "Number Sense / Before & After": generateBeforeAfter,
    "Number Sense / Between": generateBetweenNumber,
    "Number Sense / Counting Forwards": generateCountForward, // Added for helper override
    "Number Sense / Counting Backwards": generateCountBackward, // Added for helper override
    "Number Sense / Skip Counting": generateSkipCounting, // Added for helper override
    "Number Sense / Comparison": generateComparison,

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

export default Grade1Questions;
