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
    generatePictureGraph
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
    q23: generate(generatePatterns),
    q24: generate(generateDaysOfWeek),
    q25: generate(generatePictureGraph)
};

export default Grade1Questions;