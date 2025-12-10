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
    q1: generate(generateIntegerUnderstanding),
    q2: generate(generateIntegerOps),
    q3: generate(generateWholeNumberProperties),
    q4: generate(generateWholeNumberPattern),
    q5: generate(generateFractionOps),
    q6: generate(generateDecimalConversion),
    q7: generate(generateRatio),
    q8: generate(generateProportion),
    q9: generate(generateAlgebraExpression),
    q10: generate(generateSimpleEquation),
    q11: generate(generatePolygonSides),
    q12: generate(generateTriangleType),
    q13: generate(generateAreaRect),
    q14: generate(generatePerimeterRect),
    q15: generate(generateDataInterpretation),
    q16: generate(generatePrimeComposite),
    q17: generate(generateLCM),
    // Fill remaining slots to reach q30
    q18: generate(generateIntegerOps),
    q19: generate(generateFractionOps),
    q20: generate(generateAlgebraExpression),
    q21: generate(generateSimpleEquation),
    q22: generate(generateAreaRect),
    q23: generate(generatePerimeterRect),
    q24: generate(generateDataInterpretation),
    q25: generate(generatePrimeComposite),
    q26: generate(generateLCM),
    q27: generate(generateRatio),
    q28: generate(generateProportion),
    q29: generate(generatePolygonSides),
    q30: generate(generateTriangleType),

    // Grade 10 Logic Additions
    q31: generate(generateNaturalWholeNumbers),
    q32: generate(generateIntegersG10),
    q33: generate(generateFractionsG10),
    q34: generate(generateDecimalsG10),
    q35: generate(generateLCMG10),
    q36: generate(generateHCF),
    q37: generate(generateRatioProportion),
    q38: generate(generateBODMAS),
    q39: generate(generatePerimeter)
};

export default Grade6Questions;
