import {
    generateAddition2digit,
    generateAddition3digit,
    generateSubtraction2digit,
    generateSubtraction3digit,
    generateMultiplication7and8and9and12,
    generateMultiplication13to19,
    generateDivision1stlevel,
    generateDivision2ndlevel,
    generateMissingNumber,
    generateMixedOperations,
    generateFractions,
    generateCompareFractions,
    generateShapes,
    generateSymmetry,
    generateLengthConversion,
    generateWeightConversion,
    generateCapacityConversion,
    generateTimeReading,
    generateIdentifyMoney,
    generateMoneyOperations,
    generateTally,
    generateNumberPattern
} from './grade3Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade3Questions = {
    q1: generate(generateAddition2digit),
    q2: generate(generateAddition3digit),
    q3: generate(generateSubtraction2digit),
    q4: generate(generateSubtraction3digit),
    q5: generate(generateMultiplication7and8and9and12),
    q6: generate(generateMultiplication13to19),
    q7: generate(generateDivision1stlevel),
    q8: generate(generateDivision2ndlevel),
    q9: generate(generateMissingNumber),
    q10: generate(generateMissingNumber),
    q11: generate(generateMixedOperations),
    q12: generate(generateMixedOperations),
    q13: generate(generateFractions),
    q14: generate(generateFractions),
    q15: generate(generateCompareFractions),
    q16: generate(generateShapes),
    q17: generate(generateSymmetry),
    q18: generate(generateLengthConversion),
    q19: generate(generateWeightConversion),
    q20: generate(generateCapacityConversion),
    q21: generate(generateTimeReading),
    q22: generate(generateIdentifyMoney),
    q23: generate(generateMoneyOperations),
    q24: generate(generateTally),
    q25: generate(generateNumberPattern),
    // Fill remaining slots with mixed topics if needed or reuse existing
    // q19: generate(generateAddition),
    // q20: generate(generateSubtraction),
    // q21: generate(generateMultiplication),
    // q22: generate(generateDivision),
    // q23: generate(generateMissingNumber),
    // q24: generate(generateMixedOperations),
    // q25: generate(generateFractions),
    // q26: generate(generateCompareFractions),
    // q27: generate(generateShapes),
    // q28: generate(generateSymmetry),
    // q29: generate(generateLengthConversion),
    // q30: generate(generateWeightConversion)
};

export default Grade3Questions;