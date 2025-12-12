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
    generateSquareRoots,
    generateCubeRoots,
    generateExponents,
    generateBODMAS,
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
    q4: generate(generateDecimalsG10),           // Decimal expansions

    // Polynomials
    q5: generate(generatePolynomialBasics),
    q6: generate(generatePolynomialOperations),
    q7: generate(generatePolynomialFactorization),
    q8: generate(generatePolynomialZeroes),

    // Linear Equations in Two Variables
    q9: generate(generateLinearEquationSolutions),
    q10: generate(generateLinearEquationSolving),

    // Coordinate Geometry
    q11: generate(generateCartesianPoint),
    // q12: generate(generateCoordinateBasics),
    q12: generate(generateCoordinateFormulas),

    // Geometry: Lines, Angles, Triangles, Quadrilaterals
    q13: generate(generateBODMAS),               // You can repurpose or remove if not needed
    q14: generate(generateAlgebraicAdditionSubtraction), // Optional basic algebra
    q15: generate(generateAlgebraicMultiplication),       // Optional
    q16: generate(generateAlgebraicDivision),             // Optional

    q17: generate(generatePerimeter),
    q18: generate(generateArea),                 // Triangles & parallelograms
    q19: generate(generateMensurationArea),      // Heron’s Formula cases
    q20: generate(generateMensurationVolume),    // Cube, cuboid, cylinder

    // Statistics & Probability
    q21: generate(generateStatistics),
    q22: generate(generateProbability),

    // Constructions (if you add generators later)
    // q24: generate(generateConstructionBasics), // keep placeholder if needed
};


export default Grade9Questions;
