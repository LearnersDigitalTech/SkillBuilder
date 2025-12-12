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
    generateBODMAS,
} from '../Grade7/grade7Generators.mjs';

import {
    generateNaturalWholeNumbers,
    generateIntegers as generateIntegersG10,
    generateFractions as generateFractionsG10,
    generateDecimals as generateDecimalsG10,
    generateLCM as generateLCMG10,
    generateHCF,
    generateRatioProportion,
    generateSquareRoots,
    generateCubeRoots,
    generateExponents,
    generateAlgebraicAdditionSubtraction,
    generateAlgebraicMultiplication,
    generateAlgebraicDivision,
    generateLinearEquationOneVar,
    generateSimultaneousEquations,
    generateQuadraticEquation,
    generatePerimeter,
    generateArea,
    generateCartesianPoint,
    generateCoordinateGeometry,
    generateSectionFormula,
    generateTrigonometry,
    generateTrigRatios,
    generatePythagoras,
    generateClocks,
    generateProbability as generateProbabilityG10,
    generateDiceProbability,
    generateAgeProblem,
    generateNumberSquareProblem
} from '../Grade10/grade10Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade9Questions = {
    // Number Systems
    q1: generate(generateNaturalWholeNumbers),   // Real numbers basics
    q2: generate(generateIntegersG10),           // Integers & number line
    q3: generate(generateFractionsG10),          // Rational numbers
    q4: generate(generateDecimalsG10),
    q5: generate(generateLCMG10),
    q6: generate(generateHCF),      // Decimal expansions
    q7: generate(generateRatioProportion),

    // Polynomials
    q8: generate(generatePolynomialBasics),
    q8: generate(generatePolynomialOperations),
    q9: generate(generatePolynomialFactorization),
    q10: generate(generatePolynomialZeroes),

    // Linear Equations in Two Variables
    q11: generate(generateLinearEquationSolutions),
    q12: generate(generateLinearEquationSolving),

    // Coordinate Geometry
    q13: generate(generateCartesianPoint),
    // q12: generate(generateCoordinateBasics),
    q14: generate(generateCoordinateFormulas),

    // Geometry: Lines, Angles, Triangles, Quadrilaterals
    q15: generate(generateBODMAS),               // You can repurpose or remove if not needed
    q16: generate(generateAlgebraicAdditionSubtraction), // Optional basic algebra
    q17: generate(generateAlgebraicMultiplication),       // Optional
    q18: generate(generateAlgebraicDivision),             // Optional

    q19: generate(generatePerimeter),
    q20: generate(generateArea),                 // Triangles & parallelograms
    q21: generate(generateMensurationArea),      // Heron’s Formula cases
    q22: generate(generateMensurationVolume),    // Cube, cuboid, cylinder

    // Statistics & Probability
    q23: generate(generateStatistics),
    q24: generate(generateProbability),

    // Constructions (if you add generators later)
    // q24: generate(generateConstructionBasics), // keep placeholder if needed
};


export default Grade9Questions;
