import {
    generatePlaceValue5Digit,
    generateAddition4Digit,
    generateSubtraction4Digit,
    generateMultiplication,
    generateDivision,
    generateEstimation,
    generateFractionTypes,
    generateFractionOperations,
    generateAngles,
    generateTriangles,
    generateAreaPerimeter,
    generateTimeConversion2to5,
    generateTimeConversion5to10,
    generateBarGraph,
    generateSimpleGrade4Pattern
} from './grade4Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade4Questions = {
    q1: generate(generatePlaceValue5Digit),
    q2: generate(generatePlaceValue5Digit),
    q3: generate(generateAddition4Digit),
    q4: generate(generateAddition4Digit),
    q5: generate(generateSubtraction4Digit),
    q6: generate(generateSubtraction4Digit),
    q7: generate(generateMultiplication),
    q8: generate(generateMultiplication),
    q9: generate(generateDivision),
    q10: generate(generateDivision),
    q11: generate(generateEstimation),
    q12: generate(generateEstimation),
    q13: generate(generateFractionTypes),
    q14: generate(generateFractionTypes),
    q15: generate(generateFractionOperations),
    q16: generate(generateAngles),
    // q17: generate(generateAngles),
    // q18: generate(generateTriangles),
    q17: generate(generateTriangles),
    q18: generate(generateAreaPerimeter),
    q19: generate(generateAreaPerimeter),
    q20: generate(generateTimeConversion2to5),
    q21: generate(generateTimeConversion5to10),
    q22: generate(generateBarGraph),
    q23: generate(generateSimpleGrade4Pattern),
    q24: generate(generateSimpleGrade4Pattern),
    // Fill remaining slots
    // q15: generate(generatePlaceValue5Digit),
    // q16: generate(generateAddition4Digit),
    // q17: generate(generateSubtraction4Digit),
    // q18: generate(generateMultiplication),
    // q19: generate(generateDivision),
    // q20: generate(generateEstimation),
    // q21: generate(generateFractionTypes),
    // q22: generate(generateFractionOperations),
    // q23: generate(generateAngles),
    // q24: generate(generateTriangles),
    // q25: generate(generateAreaPerimeter),
    // q26: generate(generateTimeConversion),
    // q27: generate(generateBarGraph),
    // q28: generate(generateSimpleGrade4Pattern),
    // q29: generate(generatePlaceValue5Digit),
    // q30: generate(generateAddition4Digit)
};

export default Grade4Questions;
