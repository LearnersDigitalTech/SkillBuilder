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
    generateQuadrilateralsGrade8
} from '../Grade8/grade8Generators.mjs'
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
    generateExponentsNegative,
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


import {
    generateFactorTree,
} from '../Grade5/grade5Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

// const Grade9Questions = {
//     // Number Systems
//     q1: generate(generateNaturalWholeNumbers),   // Real numbers basics
//     q2: generate(generateIntegersG10),           // Integers & number line
//     q3: generate(generateFractionsG10),          // Rational numbers
//     q4: generate(generateDecimalsG10),
//     q5: generate(generateFactorTree),
//     q6: generate(generateLCMG10),
//     q7: generate(generateHCF),      // Decimal expansions
//     q8: generate(generateRatioProportion),

//     // Polynomials
//     q9: generate(generatePolynomialBasics),
//     q10: generate(generatePolynomialOperations), // Updated for formatting fix
//     q11: generate(generatePolynomialFactorization),
//     q12: generate(generatePolynomialZeroes),

//     // Linear Equations in Two Variables
//     q13: generate(generateQuadrilateralsGrade8),
//     q14: generate(generateLinearEquationSolutions),
//     q15: generate(generateLinearEquationSolving),

//     // Coordinate Geometry
//     q16: generate(generateCartesianPoint),
//     // q12: generate(generateCoordinateBasics),
//     // q14: generate(generateCoordinateFormulas),

//     // Geometry: Lines, Angles, Triangles, Quadrilaterals
//     // q14: generate(generateBODMAS),               // You can repurpose or remove if not needed
//     q17: generate(generateAlgebraicAdditionSubtraction), // Optional basic algebra
//     q18: generate(generateAlgebraicMultiplication),       // Optional
//     q19: generate(generateAlgebraicDivision),             // Optional

//     q20: generate(generatePerimeterAndArea),
//     // q19: generate(generatePerimeter),
//     q21: generate(generateArea),                 // Triangles & parallelograms
//     q22: generate(generateMensurationArea),      // Heron’s Formula cases
//     q23: generate(generateMensurationVolume),    // Cube, cuboid, cylinder

//     // Statistics & Probability
//     q24: generate(generateStatistics),
//     q25: generate(generateProbability),

//     // Constructions (if you add generators later)
//     //q24: generate(generateConstructionBasics), // keep placeholder if needed
// };

const Grade9Questions = {

    // 1. Number Systems
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegersG10),
    q3: generate(generateFractionsG10),
    q4: generate(generateDecimalsG10),
    q5: generate(generateFactorTree),
    q6: generate(generateLCMG10),
    q7: generate(generateHCF),
    q8: generate(generateRatioProportion),

    // 2. Algebra Basics
    q9: generate(generateAlgebraicAdditionSubtraction),
    q10: generate(generateAlgebraicMultiplication),
    q11: generate(generateAlgebraicDivision),

    // 3. Polynomials
    q12: generate(generatePolynomialBasics),
    q13: generate(generatePolynomialOperations),
    q14: generate(generatePolynomialFactorization),
    q15: generate(generatePolynomialZeroes),

    // 4. Linear Equations in Two Variables
    q16: generate(generateLinearEquationSolutions),
    q17: generate(generateLinearEquationSolving),

    // 5. Coordinate Geometry
    q18: generate(generateCartesianPoint),

    // 6. Geometry
    q19: generate(generateQuadrilateralsGrade8),
    q20: generate(generatePerimeterAndArea),
    q21: generate(generateArea),

    // 7. Mensuration
    q22: generate(generateMensurationArea),
    q23: generate(generateMensurationVolume),

    // 8. Statistics & Probability
    q24: generate(generateStatistics),
    q25: generate(generateProbability),
};


export const Grade9GeneratorMap = {
    // Grade 10 Imports - with actual topic strings from generators
    "Number System / Natural & Whole": generateNaturalWholeNumbers,
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers, // Actual topic
    "Number System / Integers": generateIntegersG10,
    "Fundamental Operations On Integers": generateIntegersG10, // Actual topic
    "Number System / Rational": generateFractionsG10,
    "Fractions": generateFractionsG10, // Actual topic
    "Number System / Decimals": generateDecimalsG10,
    "Fundamental operations on decimals": generateDecimalsG10, // Actual topic
    "Number System / LCM": generateLCMG10,
    "Least Common Multiple": generateLCMG10, // Actual topic
    "Number System / HCF": generateHCF,
    "Highest Common Factor": generateHCF, // Actual topic
    "Arithmetic / Ratio & Proportion": generateRatioProportion,
    "Ratio and Proportion": generateRatioProportion, // Actual topic
    "Algebra / Addition & Subtraction": generateAlgebraicAdditionSubtraction,
    "Algebra / Multiplication": generateAlgebraicMultiplication,
    "Algebra / Division": generateAlgebraicDivision,
    "Mensuration / Area (Advanced)": generateArea,
    "Coordinate Geometry / Points": generateCartesianPoint,

    // Grade 7 Imports
    "Mensuration / Perimeter & Area (Basic)": generatePerimeterAndArea,
    "Perimeter and Area": generatePerimeterAndArea, // Actual topic

    // Grade 9 Local & Specifics
    "Number System / Real Numbers": generateRealNumbers,
    "Polynomials / Basics": generatePolynomialBasics,
    "Polynomials / Operations": generatePolynomialOperations,
    "Polynomials / Factorization": generatePolynomialFactorization,
    "Polynomials / Zeroes": generatePolynomialZeroes,
    "Linear Equations / Solutions": generateLinearEquationSolutions,
    "Linear Equations / Solving": generateLinearEquationSolving,
    "Coordinate Geometry / Basics": generateCoordinateBasics, // Actual topic from generator
    "Coordinate Geometry / Formulas": generateCoordinateFormulas,
    "Mensuration / Triangle Area": generateMensurationArea,
    "Mensuration / Area": generateMensurationArea, // Actual topic from generator  
    "Area of Plane Figures": generateArea, // Fix Q19 Retry
    "Mensuration / Volume & SA": generateMensurationVolume,
    "Statistics / Mean": generateStatistics,
    "Statistics": generateStatistics, // Actual topic from generator
    "Probability / Simple": generateProbability,
    "Probability": generateProbability, // Actual topic from generator
    "Locating a point in a Cartesian Plane": generateCartesianPoint, // Fix Q14 Retry
    "Algebraic Addition": generateAlgebraicAdditionSubtraction, // Fix Q15 Retry
    "Algebraic Multiplication": generateAlgebraicMultiplication, // Fix Q16 Retry
    "Algebraic Division": generateAlgebraicDivision // Fix Q17 Retry
};

export default Grade9Questions;

