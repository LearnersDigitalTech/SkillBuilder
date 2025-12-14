import {
    generateNaturalWholeNumbers,
    generateIntegers,
    generateFractions,
    generateDecimals,
    generateLCM,
    generateHCF,
    generateRatioProportion,
    generateSquareRoots,
    generateCubeRoots,
    generateExponentsNegative,
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
    generateProbability,
    generateDiceProbability,
    generateAgeProblem,
    generateNumberSquareProblem
} from './grade10Generators.mjs';

const generate = (generator, count = 10) => {
    // Generator wrapper
    return Array.from({ length: count }, () => generator());
};

const Grade10Questions = {
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegers),
    q3: generate(generateFractions),
    q4: generate(generateDecimals),
    q5: generate(generateLCM),
    q6: generate(generateHCF),
    q7: generate(generateRatioProportion),
    q8: generate(generateSquareRoots),
    q9: generate(generateCubeRoots),
    q10: generate(generateExponentsNegative),
    q11: generate(generateBODMAS),
    q12: generate(generateAlgebraicAdditionSubtraction),
    q13: generate(generateAlgebraicMultiplication),
    q14: generate(generateAlgebraicDivision),
    q15: generate(generateLinearEquationOneVar),
    q16: generate(generateSimultaneousEquations),
    q17: generate(generateQuadraticEquation),
    q18: generate(generatePerimeter),
    q19: generate(generateArea),
    q20: generate(generateCartesianPoint),
    q21: generate(generateCoordinateGeometry),
    q22: generate(generateSectionFormula),
    q23: generate(generateTrigonometry),
    q24: generate(generateTrigRatios),
    q25: generate(generatePythagoras),
    q26: generate(generateClocks),
    q27: generate(generateProbability),
    q28: generate(generateDiceProbability),
    q29: generate(generateAgeProblem),
    q30: generate(generateNumberSquareProblem)
};


export const Grade10GeneratorMap = {
    "Number Sense / Natural & Whole": generateNaturalWholeNumbers,
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers,

    "Number Sense / Integers": generateIntegers,
    "Fundamental Operations On Integers": generateIntegers,

    "Number Sense / Fractions": generateFractions,
    "Fractions": generateFractions,

    "Number Sense / Decimals": generateDecimals,
    "Fundamental operations on decimals": generateDecimals,

    "Number Sense / LCM": generateLCM,
    "Least Common Multiple": generateLCM,

    "Number Sense / HCF": generateHCF,
    "Highest Common Factor": generateHCF,

    "Arithmetic / Ratio & Proportion": generateRatioProportion,
    "Ratio and Proportion": generateRatioProportion,

    "Arithmetic / Clocks": generateClocks,
    // "Clocks": generateClocks, // topic string not verified but adding safe mapping if needed later

    "Number Sense / Square Roots": generateSquareRoots,
    "Square and Square Roots": generateSquareRoots,

    "Number Sense / Cube Roots": generateCubeRoots,
    "Cube and Cube Roots": generateCubeRoots,

    "Number Sense / Exponents": generateExponentsNegative,
    "Laws of Exponents": generateExponentsNegative,

    "Arithmetic / BODMAS": generateBODMAS,
    "BODMAS": generateBODMAS,

    "Algebra / Addition & Subtraction": generateAlgebraicAdditionSubtraction,
    "Algebraic Addition": generateAlgebraicAdditionSubtraction,

    "Algebra / Multiplication": generateAlgebraicMultiplication,
    "Algebraic Multiplication": generateAlgebraicMultiplication,

    "Algebra / Division": generateAlgebraicDivision,
    "Algebraic Division": generateAlgebraicDivision,

    "Algebra / Linear Equations": generateLinearEquationOneVar,
    "Linear Equations in one Variable": generateLinearEquationOneVar,

    "Algebra / Simultaneous Equations": generateSimultaneousEquations,
    "Simultaneous Equations": generateSimultaneousEquations,

    "Algebra / Quadratic Equations": generateQuadraticEquation,
    "Quadratic Equations": generateQuadraticEquation,

    "Algebra / Word Problems (Age)": generateAgeProblem,
    "Algebra / Word Problems (Quadratic)": generateNumberSquareProblem,

    "Mensuration / Perimeter": generatePerimeter,
    // "Perimeter": generatePerimeter, // topic in generator check?

    "Mensuration / Area": generateArea,
    // "Area": generateArea,

    "Coordinate Geometry / Quadrants": generateCartesianPoint,
    "Coordinate Geometry / Distance Formula": generateCoordinateGeometry,
    "Coordinate Geometry / Section Formula": generateSectionFormula,

    "Trigonometry / Ratios": generateTrigonometry,
    "Trigonometry / Standard Angles": generateTrigRatios,

    "Geometry / Pythagoras Theorem": generatePythagoras,
    "Probability / True/False": generateProbability,
    "Probability / Dice": generateDiceProbability
};

export default Grade10Questions;

