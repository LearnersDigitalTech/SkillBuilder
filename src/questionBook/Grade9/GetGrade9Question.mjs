import {
    generateRealNumbers,
    generatePolynomialBasics,
    generatePolynomialOperations,
    generatePolynomialFactorization,
    generatePolynomialZeroes,
    generateLinearEquationSolutions,
    generateLinearEquationSolving,
    generateCoordinateBasics,
    generateCoordinateFormulas,
    generateMensurationArea,
    generateMensurationVolume,
    generateStatistics,
    generateProbability
} from './grade9Generators.mjs';

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

const Grade9Questions = {
    q1: generate(generateRealNumbers),
    q2: generate(generatePolynomialBasics),
    q3: generate(generatePolynomialOperations),
    q4: generate(generatePolynomialFactorization),
    q5: generate(generatePolynomialZeroes),
    q6: generate(generateLinearEquationSolutions),
    q7: generate(generateLinearEquationSolving),
    q8: generate(generateCoordinateBasics),
    q9: generate(generateCoordinateFormulas),
    q10: generate(generateMensurationArea),
    q11: generate(generateMensurationVolume),
    q12: generate(generateStatistics),
    q13: generate(generateProbability),
    // Fill remaining slots
    q14: generate(generateRealNumbers),
    q15: generate(generatePolynomialBasics),
    q16: generate(generatePolynomialOperations),
    q17: generate(generatePolynomialFactorization),
    q18: generate(generatePolynomialZeroes),
    q19: generate(generateLinearEquationSolutions),
    q20: generate(generateLinearEquationSolving),
    q21: generate(generateCoordinateBasics),
    q22: generate(generateCoordinateFormulas),
    q23: generate(generateMensurationArea),
    q24: generate(generateMensurationVolume),
    q25: generate(generateStatistics),
    q26: generate(generateProbability),
    q27: generate(generateRealNumbers),
    q28: generate(generatePolynomialBasics),
    q29: generate(generatePolynomialOperations),
    q30: generate(generatePolynomialFactorization),

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

export default Grade9Questions;
