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

import {
    generateAreaShape,
    generatePerimeterShape,
    generateFVETable
} from '../Grade4/grade4Generators.mjs';

const Grade6Questions = {
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegersG10),
    q3: generate(generateFractionsG10),
    q4: generate(generateDecimalsG10),
    q5: generate(generateFactorTree),
    q6: generate(generateLCMG10),
    q7: generate(generateHCF),
    // q7: generate(generateRatioProportion),
    q8: generate(generateBODMAS),
    // q9: generate(generatePerimeter),
    q9: generate(generateIntegerUnderstanding),
    // q11: generate(generateIntegerOps),
    // q10: generate(generateWholeNumberProperties),
    q10: generate(generateWholeNumberPattern),
    // q14: generate(generateFractionOps),
    q11: generate(generateDecimalConversion),
    q12: generate(generateRatio),
    // q17: generate(generateProportion),
    q13: generate(generateAlgebraExpression),
    q14: generate(generateSimpleEquation),
    q15: generate(generatePolygonSides),
    q16: generate(generateTriangleType),
    q17: generate(generateAreaShape),
    q18: generate(generatePerimeterShape),
    // q20: generate(generateDataInterpretation),
    q19: generate(generatePrimeComposite),
    // q19 mapped to generateTriangleType - wait, user code in Step 681 mapped q19 to generateTriangleType
    q20: generate(generateTriangleType),
    q21: generate(generateFVETable),
    q22: generate(generateAlphabetSymmetry),
    q23: generate(generateNumberPlay),
    q24: generate(generateNumberPattern),
    q25: generate(generateAddSubMultipleSelect),
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


export const Grade6GeneratorMap = {
    // Grade 10 Imports
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers,
    "Fundamental Operations On Integers": generateIntegersG10,
    "Fractions": generateFractionsG10,
    "Fundamental operations on decimals": generateDecimalsG10,
    "Least Common Multiple": generateLCMG10,
    "Highest Common Factor": generateHCF,
    "Ratio and Proportion": generateRatioProportion,
    "BODMAS": generateBODMAS,
    "Perimeter of Plane Figures": generatePerimeter,

    // Grade 6 Local
    "Integers / Understanding": generateIntegerUnderstanding,
    "Integers / Add": generateIntegerOps,
    "Integers / Subtract": generateIntegerOps,
    "Integers / Multiply": generateIntegerOps,
    "Integers / Divide": generateIntegerOps,
    "Whole Numbers / Properties": generateWholeNumberProperties,
    "Whole Numbers / Patterns": generateWholeNumberPattern,
    "Fractions / Add": generateFractionOps,
    "Fractions / Subtract": generateFractionOps,
    "Fractions / Multiply": generateFractionOps,
    "Fractions / Divide": generateFractionOps,
    "Decimals / Conversion": generateDecimalConversion,
    "Ratio / Simplify": generateRatio,
    "Proportion / Missing Term": generateProportion,
    "Algebra / Expressions": generateAlgebraExpression,
    "Algebra / Equations": generateSimpleEquation,
    "Geometry / Polygons": generatePolygonSides,
    "Geometry / Triangles": generateTriangleType,
    "Mensuration / Area": generateAreaRect,
    "Mensuration / Perimeter": generatePerimeterRect,
    "Data Handling / Mean": generateDataInterpretation,
    "Data Handling / Median": generateDataInterpretation,
    "Data Handling / Mode": generateDataInterpretation,
    "Number Theory / Prime": generatePrimeComposite,
    "Number Theory / Factor Tree": generateFactorTree,
    "Symmetry / Alphabet": generateAlphabetSymmetry,
    "Number Sense / Number Play": generateNumberPlay,
    "Number Sense / Number Pattern": generateNumberPattern,
    "Arithmetic / AddSub Multiple": generateAddSubMultipleSelect
};

export default Grade6Questions;

