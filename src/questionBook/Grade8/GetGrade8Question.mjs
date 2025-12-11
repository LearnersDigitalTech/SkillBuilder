import {
    generateRationalNumbers,
    generateExponentsGrade8,
    generateSquaresCubes,
    generateAlgebraExpressions,
    generateFactorisation,
    generateLinearEquationsGrade8,
    generateMensuration,
    generateGraphs,
    generateProportion,
    generateComparingQuantities
} from './grade8Generators.mjs';

import {
    generateNaturalWholeNumbers,
    generateIntegers as generateIntegersG10,
    generateFractions as generateFractionsG10,
    generateDecimals as generateDecimalsG10,
    generateLCM as generateLCMG10,
    generateHCF,
    generateRatioProportion as generateProportionG10,
    generateBODMAS,
    generatePerimeter
} from '../Grade10/grade10Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade8Questions = {
    q1: generate(generateRationalNumbers),
    q2: generate(generateExponentsGrade8),
    q3: generate(generateSquaresCubes),
    q4: generate(generateAlgebraExpressions),
    q5: generate(generateFactorisation),
    q6: generate(generateLinearEquationsGrade8),
    q7: generate(generateMensuration),
    q8: generate(generateGraphs),
    q9: generate(generateProportion),
    q10: generate(generateComparingQuantities),
    // Fill remaining slots to reach q30
    q11: generate(generateRationalNumbers),
    q12: generate(generateExponentsGrade8),
    q13: generate(generateSquaresCubes),
    q14: generate(generateAlgebraExpressions),
    q15: generate(generateFactorisation),
    q16: generate(generateLinearEquationsGrade8),
    q17: generate(generateMensuration),
    q18: generate(generateGraphs),
    q19: generate(generateProportion),
    q20: generate(generateComparingQuantities),
    q21: generate(generateRationalNumbers),
    q22: generate(generateExponentsGrade8),
    q23: generate(generateSquaresCubes),
    q24: generate(generateAlgebraExpressions),
    q25: generate(generateFactorisation),
    q26: generate(generateLinearEquationsGrade8),
    q27: generate(generateMensuration),
    q28: generate(generateGraphs),
    q29: generate(generateProportion),
    q30: generate(generateComparingQuantities),

    // Grade 10 Logic Additions
    q31: generate(generateNaturalWholeNumbers),
    q32: generate(generateIntegersG10),
    q33: generate(generateFractionsG10),
    q34: generate(generateDecimalsG10),
    q35: generate(generateLCMG10),
    q36: generate(generateHCF),
    q37: generate(generateProportionG10),
    q38: generate(generateBODMAS),
    q39: generate(generatePerimeter)
};

export default Grade8Questions;
