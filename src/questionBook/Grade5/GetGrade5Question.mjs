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
    generateHCF,
    generateFactorTree,
    generateSymmetry,
    generateNumberPattern,
    generatePicturePattern
} from './grade5Generators.mjs';

import {
    generateAngles,
    generateAreaShape,
    generatePerimeterShape
} from '../Grade4/grade4Generators.mjs';


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
    // q12: generate(generateMixedImproper),
    q12: generate(generateDecimalPlaceValue),
    q13: generate(generateDecimalOps),
    q14: generate(generateUnitConversion),
    q15: generate(generateTimeElapsed),
    q16: generate(generateAngles),
    // q16: generate(generateAngleTypes),
    // 
    q17: generate(generateAreaShape),
    q18: generate(generatePerimeterShape),
    q19: generate(generatePieChart),
    q20: generate(generateFactors),
    q21: generate(generateLCM),
    q22: generate(generateFactorTree),
    q23: generate(generateSymmetry),
    q24: generate(generateNumberPattern),
    q25: generate(generatePicturePattern),
    // q25: generate(generateEquivalentFractions),
    // q24: generate(generateMultiplicationLarge),
    // q25: generate(generateEquivalentFractions),
    // q26: generate(generateDecimalOps),
    // q27: generate(generateUnitConversion),
    // q28: generate(generateAreaPerimeterShapes),
    // q29: generate(generateFactors),
    // q30: generate(generateHCF)
};


export const Grade5GeneratorMap = {
    "Number Sense / Place Value": generatePlaceValueLarge,
    "Number Sense / Expanded Form": generateExpandedForm,
    "Number Sense / Comparison": generateCompareLarge,
    "Operations / Addition": generateAdditionLarge,
    "Operations / Subtraction": generateSubtractionLarge,
    "Operations / Multiplication": generateMultiplicationLarge,
    "Operations / Division": generateDivisionLarge,
    "Operations / Estimation": generateEstimationOps,
    "Fractions / Equivalent": generateEquivalentFractions,
    "Fractions / Simplify": generateSimplifyFractions,
    "Fractions / Mixed Addition": generateAddUnlikeFractions,
    "Fractions / Conversion": generateMixedImproper,
    "Decimals / Place Value": generateDecimalPlaceValue,
    "Decimals / Operations": generateDecimalOps,
    "Measurement / Length": generateUnitConversion,
    "Measurement / Weight": generateUnitConversion,
    "Measurement / Capacity": generateUnitConversion,
    "Measurement / Time": generateTimeElapsed,
    "Geometry / Angles": generateAngleTypes,
    "Geometry / Area": generateAreaShape,
    "Geometry / Perimeter": generatePerimeterShape,
    "Data Handling / Pie Chart": generatePieChart,
    "Number Theory / Factors": generateFactors,
    "Number Theory / LCM": generateLCM,
    "Number Theory / HCF": generateHCF,
    "Number Theory / Factor Tree": generateFactorTree,
    "Geometry / Symmetry": generateSymmetry,
    "Patterns / Number Patterns": generateNumberPattern,
    "Patterns / Picture Patterns": generatePicturePattern
};

export default Grade5Questions;

