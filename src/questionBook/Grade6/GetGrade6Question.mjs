import {
    generateIntegerUnderstanding,
    generateIntegerOps,
    generateWholeNumberProperties,
    generateWholeNumberPattern,
    generateFractionOps,
    generateDecimalConversion,
    generateRatio,
    generateProportion,
    generateAlgebraExpression,
    generateSimpleEquation,
    generatePolygonSides,
    generateTriangleType,
    generateAreaRect,
    generatePerimeterRect,
    generateDataInterpretation,
    generatePrimeComposite,
    generateLCM
} from './grade6Generators.mjs';

import {
    generateNaturalWholeNumbers,
    generateIntegers as generateIntegersG10,
    generateFractions as generateFractionsG10,
    generateDecimals as generateDecimalsG10,
    generateLCM as generateLCMG10,
    generateHCF,
    generateRatioProportion,
    generateBODMAS,
    generatePerimeter
} from '../Grade10/grade10Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade6Questions = {
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegersG10),
    q3: generate(generateFractionsG10),
    q4: generate(generateDecimalsG10),
    q5: generate(generateLCMG10),
    q6: generate(generateHCF),
    q7: generate(generateRatioProportion),
    q8: generate(generateBODMAS),
    // q9: generate(generatePerimeter),
    q9: generate(generateIntegerUnderstanding),
    // q11: generate(generateIntegerOps),
    q10: generate(generateWholeNumberProperties),
    q11: generate(generateWholeNumberPattern),
    // q14: generate(generateFractionOps),
    q12: generate(generateDecimalConversion),
    q13: generate(generateRatio),
    // q17: generate(generateProportion),
    q14: generate(generateAlgebraExpression),
    q15: generate(generateSimpleEquation),
    q16: generate(generatePolygonSides),
    q17: generate(generateTriangleType),
    q18: generate(generateAreaRect),
    q19: generate(generatePerimeterRect),
    q20: generate(generateDataInterpretation),
    q21: generate(generatePrimeComposite),
    // q26: generate(generateLCM),
    // Fill remaining slots to reach q30
    // q27: generate(generateIntegerOps),
    // q28: generate(generateFractionOps),
    // q29: generate(generateAlgebraExpression),
    // q30: generate(generateSimpleEquation),
    // q31: generate(generateAreaRect),
    // q32: generate(generatePerimeterRect),
    // q33: generate(generateDataInterpretation),
    // q34: generate(generatePrimeComposite),
    // q35: generate(generateLCM),
    // q36: generate(generateRatio),
    // q37: generate(generateProportion),
    q22: generate(generateTriangleType),
};

export default Grade6Questions;
