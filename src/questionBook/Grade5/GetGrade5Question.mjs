import {
    generatePlaceValueLarge,
    generateExpandedForm,
    generateCompareLarge,
    generateAdditionLarge,
    generateSubtractionLarge,
    generateMultiplicationLarge,
    generateDivisionLarge,
    generateEstimationOps,
    generateEquivalentFractions,
    generateSimplifyFractions,
    generateAddUnlikeFractions,
    generateMixedImproper,
    generateDecimalPlaceValue,
    generateDecimalOps,
    generateUnitConversion,
    generateTimeElapsed,
    generateAngleTypes,
    generateAreaPerimeterShapes,
    generatePieChart,
    generateFactors,
    generateLCM,
    generateHCF
} from './grade5Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade5Questions = {
    q1: generate(generatePlaceValueLarge),
    q2: generate(generateCompareLarge),
    q3: generate(generateExpandedForm),
    q4: generate(generateAdditionLarge),
    q5: generate(generateSubtractionLarge),
    q6: generate(generateMultiplicationLarge),
    q7: generate(generateDivisionLarge),
    q8: generate(generateEstimationOps),
    q9: generate(generateEquivalentFractions),
    q10: generate(generateSimplifyFractions),
    q11: generate(generateAddUnlikeFractions),
    q12: generate(generateMixedImproper),
    q13: generate(generateDecimalPlaceValue),
    q14: generate(generateDecimalOps),
    q15: generate(generateUnitConversion),
    q16: generate(generateTimeElapsed),
    q17: generate(generateAngleTypes),
    q18: generate(generateAreaPerimeterShapes),
    q19: generate(generatePieChart),
    q20: generate(generateFactors),
    q21: generate(generateLCM),
    q22: generate(generateHCF),
    // Fill remaining slots to reach q30 if needed, reusing generators
    // q22: generate(generatePlaceValueLarge),
    // q23: generate(generateAdditionLarge),
    // q24: generate(generateMultiplicationLarge),
    // q25: generate(generateEquivalentFractions),
    // q26: generate(generateDecimalOps),
    // q27: generate(generateUnitConversion),
    // q28: generate(generateAreaPerimeterShapes),
    // q29: generate(generateFactors),
    // q30: generate(generateHCF)
};

export default Grade5Questions;
