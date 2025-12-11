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
    generateLCM,
    generateFactorTree,
    generateAlphabetSymmetry,
    generateNumberPlay,
    generateNumberPattern,
    generateAddSubMultipleSelect
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
    // q7: generate(generateRatioProportion),
    q7: generate(generateBODMAS),
    // q9: generate(generatePerimeter),
    q8: generate(generateIntegerUnderstanding),
    // q11: generate(generateIntegerOps),
    // q10: generate(generateWholeNumberProperties),
    q9: generate(generateWholeNumberPattern),
    // q14: generate(generateFractionOps),
    q10: generate(generateDecimalConversion),
    q11: generate(generateRatio),
    // q17: generate(generateProportion),
    q12: generate(generateAlgebraExpression),
    q13: generate(generateSimpleEquation),
    q14: generate(generatePolygonSides),
    q15: generate(generateTriangleType),
    q16: generate(generateAreaRect),
    q17: generate(generatePerimeterRect),
    // q20: generate(generateDataInterpretation),
    q18: generate(generatePrimeComposite),
    // q19 mapped to generateTriangleType - wait, user code in Step 681 mapped q19 to generateTriangleType
    q19: generate(generateTriangleType),
    q20: generate(generateFactorTree),
    q21: generate(generateAlphabetSymmetry),
    q22: generate(generateNumberPlay),
    q23: generate(generateNumberPattern),
    q24: generate(generateAddSubMultipleSelect),
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
    // q22: generate(generateTriangleType),
};

export default Grade6Questions;
