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
    generatePerimeterAndArea,
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
    q9: generate(generatePolynomialOperations),
    q10: generate(generatePolynomialFactorization),
    q11: generate(generatePolynomialZeroes),

    // Linear Equations in Two Variables
    q12: generate(generateLinearEquationSolutions),
    q13: generate(generateLinearEquationSolving),

    // Coordinate Geometry
    q14: generate(generateCartesianPoint),
    // q12: generate(generateCoordinateBasics),
    // q14: generate(generateCoordinateFormulas),

    // Geometry: Lines, Angles, Triangles, Quadrilaterals
    // q14: generate(generateBODMAS),               // You can repurpose or remove if not needed
    q15: generate(generateAlgebraicAdditionSubtraction), // Optional basic algebra
    q16: generate(generateAlgebraicMultiplication),       // Optional
    q17: generate(generateAlgebraicDivision),             // Optional

    q18: generate(generatePerimeterAndArea),
    // q19: generate(generatePerimeter),
    q19: generate(generateArea),                 // Triangles & parallelograms
    q20: generate(generateMensurationArea),      // Heron’s Formula cases
    q21: generate(generateMensurationVolume),    // Cube, cuboid, cylinder

    // Statistics & Probability
    q22: generate(generateStatistics),
    q23: generate(generateProbability),

    // Constructions (if you add generators later)
    // q24: generate(generateConstructionBasics), // keep placeholder if needed
};


export default Grade9Questions;
