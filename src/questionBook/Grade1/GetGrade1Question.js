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
    generateLengthComparison,
    generateWeightComparison,
    generateCapacityComparison,
    generateTimeBasics,
    generateDaysOfWeek,
    generateMoneyCounting,
    generatePatterns,
    generateTally,
    generatePictureGraph
} from './grade1Generators.js';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade1Questions = {
    q1: generate(generateCountForward),
    q2: generate(generateCountBackward),
    q3: generate(generateCountingObjects),
    q4: generate(() => generateSkipCounting(2)),
    q5: generate(() => generateSkipCounting(5)),
    q6: generate(() => generateSkipCounting(10)),
    q7: generate(generatePlaceValue),
    q8: generate(() => generateComparison('greatest')),
    q9: generate(generateEvenOdd),
    q10: generate(generateAdditionObjects),
    q11: generate(generateAdditionObjects),
    q12: generate(generateAdditionWordProblems),
    q13: generate(generateSubtractionObjects),
    q14: generate(generateSubtractionObjects),
    q15: generate(generateSubtractionWordProblems),
    q16: generate(generateIdentifyShapes),
    q17: generate(generateIdentifyShapes),
    q18: generate(generateSpatial),
    q19: generate(generateSpatial),
    q20: generate(generateLengthComparison),
    q21: generate(generateWeightComparison),
    q22: generate(generateCapacityComparison),
    q23: generate(generateTimeBasics),
    q24: generate(generateDaysOfWeek),
    q25: generate(generateMoneyCounting),
    q26: generate(generateMoneyCounting),
    q27: generate(generatePatterns),
    q28: generate(generatePatterns),
    q29: generate(generateTally),
    q30: generate(generatePictureGraph)
};

export default Grade1Questions;