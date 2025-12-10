import {
    generateIntegerOps,
    generateRationalOps,
    generateExponentLaws,
    generateStandardForm,
    generateBODMAS,
    generateAlgebraTerms,
    generateLinearEquation,
    generateAlgebraWordProblem,
    generatePercentage,
    generateProfitLoss,
    generateSimpleInterest
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
    q1: generate(generateIntegerOps),
    q2: generate(generateRationalOps),
    q3: generate(generateExponentLaws),
    q4: generate(generateStandardForm),
    q5: generate(generateBODMAS),
    q6: generate(generateAlgebraTerms),
    q7: generate(generateLinearEquation),
    q8: generate(generateAlgebraWordProblem),
    q9: generate(generatePercentage),
    q10: generate(generateProfitLoss),
    q11: generate(generateSimpleInterest),
    // Fill remaining slots to reach q30
    q12: generate(generateIntegerOps),
    q13: generate(generateRationalOps),
    q14: generate(generateExponentLaws),
    q15: generate(generateStandardForm),
    q16: generate(generateBODMAS),
    q17: generate(generateAlgebraTerms),
    q18: generate(generateLinearEquation),
    q19: generate(generateAlgebraWordProblem),
    q20: generate(generatePercentage),
    q21: generate(generateProfitLoss),
    q22: generate(generateSimpleInterest),
    q23: generate(generateIntegerOps),
    q24: generate(generateRationalOps),
    q25: generate(generateExponentLaws),
    q26: generate(generateStandardForm),
    q27: generate(generateBODMAS),
    q28: generate(generateAlgebraTerms),
    q29: generate(generateLinearEquation),
    q30: generate(generateAlgebraWordProblem),

    // Grade 10 Logic Additions
    q31: generate(generateNaturalWholeNumbers),
    q32: generate(generateIntegersG10),
    q33: generate(generateFractionsG10),
    q34: generate(generateDecimalsG10),
    q35: generate(generateLCMG10),
    q36: generate(generateHCF),
    q37: generate(generateRatioProportion),
    q38: generate(generateBODMASG10),
    q39: generate(generatePerimeter)
};

export default Grade7Questions;
