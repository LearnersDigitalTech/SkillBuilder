import {
    generateIntegerOps,
    generateRationalOps,
    generateExponentLaws,
    generateStandardForm,
    generateBODMAS,
    generatePerimeterAndArea,
    generateAlgebraTerms,
    generateLinearEquation,
    generateAlgebraWordProblem,
    generatePercentage,
    generateProfitLoss,
    generateSimpleInterest,
    generateCommercialMath,
    generateGrade7Algebra,
    generateAlgebraWordProblemTable,
    generateLinesAndAngles,
    generateTrianglesProperties,
    generateSolidShapesProperties,
    generateDataHandling,
    generateBarGraph
} from './grade7Generators.mjs';

import {
    generateNaturalWholeNumbers,
    generateIntegers as generateIntegersG10,
    generateFractions as generateFractionsG10,
    generateDecimals as generateDecimalsG10,
    generateLCM as generateLCMG10,
    generateHCF,
    generateRatioProportion,
    generateBODMAS as generateBODMASG10,
    generatePerimeter
} from '../Grade10/grade10Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade7Questions = {
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegersG10),
    q3: generate(generateFractionsG10),
    q4: generate(generateDecimalsG10),
    q5: generate(generateLCMG10),
    q6: generate(generateHCF),
    q7: generate(generateRatioProportion),
    q8: generate(generateBODMAS),
    q9: generate(generatePerimeterAndArea),
    q10: generate(generateCommercialMath),
    q11: generate(() => generateExponentLaws([0])), // Product Law
    q12: generate(() => generateExponentLaws([1])), // Quotient Law
    q13: generate(() => generateExponentLaws([2])), // Power of Power
    q14: generate(() => generateExponentLaws([4])), // Power of Product
    q15: generate(() => generateExponentLaws([5])), // Power of Quotient
    q16: generate(() => generateExponentLaws([3])), // Zero Exponent
    q17: generate(() => generateExponentLaws([6])), // Negative Exponent
    q18: generate(generateGrade7Algebra),
    q19: generate(generateAlgebraWordProblemTable),
    q20: generate(generateLinesAndAngles),
    q21: generate(generateTrianglesProperties),
    q22: generate(generateSolidShapesProperties),
    q23: generate(generatePercentage),
    q24: generate(generateDataHandling),
    q25: generate(generateBarGraph),
    // Fill remaining slots to reach q30
    // q21: generate(generateIntegerOps),
    // q22: generate(generateRationalOps),
    // q23: generate(generateExponentLaws),
    // q24: generate(generateStandardForm),
    // q25: generate(generateBODMAS),
    // q26: generate(generateAlgebraTerms),
    // q27: generate(generateLinearEquation),
    // q28: generate(generateAlgebraWordProblem),
    // q29: generate(generatePercentage),
    // q30: generate(generateProfitLoss),
    // q31: generate(generateSimpleInterest),
    // q32: generate(generateIntegerOps),
    // q33: generate(generateRationalOps),
    // q34: generate(generateExponentLaws),
    // q35: generate(generateStandardForm),
    // q36: generate(generateBODMAS),
    // q37: generate(generateAlgebraTerms),
    // q38: generate(generateLinearEquation),
    // q39: generate(generateAlgebraWordProblem),

};

export default Grade7Questions;
