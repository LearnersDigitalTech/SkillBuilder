import {
    generateCounting,
    generatePlaceValue,
    generateValue,
    generateExpandedForm,
    generateComparison,
    generateAscendingDescending,
    generateNumberNames,
    generateSkipCounting,
    generateEvenOdd,
    generateAddNoCarry,
    generateAddWithCarry,
    generateAddWordProblems,
    generateSubNoBorrow,
    generateSubWithBorrow,
    generateSubWordProblems,
    generateRepeatedAddition,
    generateTables,
    generateIdentifyMoney,
    generateAddMoney,
    generateSubMoney,
    generateLength,
    generateWeight,
    generateCapacity,
    generateTime,
    generateIdentifyShapes,
    generatePatterns,
    generateTally,
    generatePictograph,
    generateSequences,
    generateMissingNumbers
} from './grade2Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade2Questions = {
    q1: generate(generateCounting),
    q2: generate(generatePlaceValue),
    q3: generate(generateValue),
    q4: generate(generateExpandedForm),
    // q5: generate(generateComparison),
    q5: generate(generateAscendingDescending),
    q6: generate(generateNumberNames),
    q7: generate(() => generateSkipCounting(2)),
    q8: generate(() => generateSkipCounting(5)),
    q9: generate(() => generateSkipCounting(10)),
    q10: generate(generateEvenOdd),
    q11: generate(generateAddNoCarry),
    q12: generate(generateAddWithCarry),
    q13: generate(generateAddWordProblems),
    q14: generate(generateSubNoBorrow),
    q15: generate(generateSubWithBorrow),
    q16: generate(generateSubWordProblems),
    q17: generate(generateRepeatedAddition),
    q18: generate(generateTables),
    q19: generate(generateTables),
    q20: generate(generateIdentifyMoney),
    q21: generate(generateAddMoney),
    q22: generate(generateSubMoney),
    // q22: generate(generateLength),
    q23: generate(generateWeight),
    q24: generate(generateCapacity),
    q25: generate(generateTime),
    q26: generate(generateIdentifyShapes),
    q27: generate(generatePatterns),
    q28: generate(generateTally),
    // q28: generate(generatePictograph),
    q29: generate(generateSequences),
    q30: generate(generateMissingNumbers)
};


export const Grade2GeneratorMap = {
    // Number Sense
    "Number Sense / Counting": generateCounting,
    "Number Sense / Place Value": generatePlaceValue,
    "Number Sense / Value": generateValue,
    "Number Sense / Expanded Form": generateExpandedForm,
    "Number Sense / Comparison": generateComparison,
    "Number Sense / Ordering": generateAscendingDescending,
    "Number Sense / Number Names": generateNumberNames,
    "Number Sense / Skip Counting": generateSkipCounting,
    "Number Sense / Even & Odd": generateEvenOdd,

    // Addition
    "Addition / Without Carry": generateAddNoCarry,
    "Addition / With Carry": generateAddWithCarry,
    "Addition / Word Problems": generateAddWordProblems,

    // Subtraction
    "Subtraction / Without Borrow": generateSubNoBorrow,
    "Subtraction / With Borrow": generateSubWithBorrow,
    "Subtraction / Word Problems": generateSubWordProblems,

    // Multiplication
    "Multiplication / Repeated Addition": generateRepeatedAddition,
    "Multiplication / Tables": generateTables,

    // Money
    "Money / Basics": generateIdentifyMoney,
    "Money / Addition": generateAddMoney,
    "Money / Subtraction": generateSubMoney,

    // Measurement
    "Measurement / Length": generateLength,
    "Measurement / Weight": generateWeight,
    "Measurement / Capacity": generateCapacity,
    "Measurement / Time": generateTime,

    // Geometry
    "Geometry / Shapes": generateIdentifyShapes,
    "Geometry / Patterns": generatePatterns,

    // Data Handling
    "Data Handling / Tally": generateTally,
    "Data Handling / Pictograph": generatePictograph,

    // Logical
    "Logical / Sequences": generateSequences,
    "Logical / Missing Numbers": generateMissingNumbers
};

export default Grade2Questions;
