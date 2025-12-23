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
    // =========================
    // Chapter 1: Integers & Number System
    // =========================
    q1: generate(generateNaturalWholeNumbers),     // Natural & whole numbers
    q2: generate(generateIntegersG10),             // Integers & number line
    q3: generate(generateFractionsG10),            // Fractions
    q4: generate(generateDecimalsG10),             // Decimals

    // =========================
    // Chapter 2: Factors & Multiples
    // =========================
    q5: generate(generateLCMG10),                  // LCM
    q6: generate(generateHCF),                     // HCF

    // =========================
    // Chapter 3: Ratio, Proportion & BODMAS
    // =========================
    q7: generate(generateRatioProportion),         // Ratio & proportion
    q8: generate(generateBODMAS),                  // Order of operations

    // =========================
    // Chapter 4: Exponents
    // =========================
    q9: generate(() => generateExponentLaws([0])), // Product law
    q10: generate(() => generateExponentLaws([1])),// Quotient law
    q11: generate(() => generateExponentLaws([2])),// Power of power
    q12: generate(() => generateExponentLaws([4])),// Power of product
    q13: generate(() => generateExponentLaws([5])),// Power of quotient
    q14: generate(() => generateExponentLaws([3])),// Zero exponent
    q15: generate(() => generateExponentLaws([6])),// Negative exponent

    // =========================
    // Chapter 5: Algebraic Expressions
    // =========================
    q16: generate(generateGrade7Algebra),           // Simple algebraic expressions
    q17: generate(generateAlgebraWordProblemTable), // Word problems

    // =========================
    // Chapter 6: Geometry
    // =========================
    q18: generate(generateLinesAndAngles),          // Lines & angles
    q19: generate(generateTrianglesProperties),     // Properties of triangles
    q20: generate(generateSolidShapesProperties),   // 3D shapes & nets

    // =========================
    // Chapter 7: Mensuration
    // =========================
    q21: generate(generatePerimeterAndArea),        // Perimeter & area

    // =========================
    // Chapter 8: Comparing Quantities
    // =========================
    q22: generate(generatePercentage),              // Percentage
    q23: generate(generateCommercialMath),          // Profit, loss, SI

    // =========================
    // Chapter 9: Data Handling
    // =========================
    q24: generate(generateDataHandling),            // Mean, median, mode
    q25: generate(generateBarGraph),                 // Bar graphs

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


export const Grade7GeneratorMap = {
    // Grade 10 Imports - with actual topic strings from generators
    "Number Sense / Natural & Whole": generateNaturalWholeNumbers,
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers, // Actual topic from generator
    "Integers / Mixed Operations": generateIntegersG10,
    "Fundamental Operations On Integers": generateIntegersG10, // Actual topic from generator
    "Fractions / Mixed Operations": generateFractionsG10,
    "Fractions": generateFractionsG10, // Actual topic from generator
    "Decimals / Mixed Operations": generateDecimalsG10,
    "Fundamental operations on decimals": generateDecimalsG10, // Actual topic from generator
    "Number Sense / LCM": generateLCMG10,
    "Least Common Multiple": generateLCMG10, // Actual topic from generator
    "Number Sense / HCF": generateHCF,
    "Highest Common Factor": generateHCF, // Actual topic from generator
    "Ratio and Proportion": generateRatioProportion,
    "BODMAS / Complex": generateBODMASG10,
    "Geometry / Perimeter": generatePerimeter,

    // Grade 7 Local
    "Integers / Add": generateIntegerOps,
    "Integers / Subtract": generateIntegerOps,
    "Integers / Multiply": generateIntegerOps,
    "Integers / Divide": generateIntegerOps,
    "Rational Numbers / Operations": generateRationalOps,
    "Exponents / Product Law": () => generateExponentLaws([0]),
    "Exponents / Quotient Law": () => generateExponentLaws([1]),
    "Exponents / Power of Power": () => generateExponentLaws([2]),
    "Exponents / Power of a Power Law": () => generateExponentLaws([2]), // Actual topic from generator
    "Exponents / Zero Exponent": () => generateExponentLaws([3]),
    "Exponents / Zero Exponent Law": () => generateExponentLaws([3]), // Actual topic from generator
    "Exponents / Power of Product": () => generateExponentLaws([4]),
    "Exponents / Power of a Product Law": () => generateExponentLaws([4]), // Actual topic from generator
    "Exponents / Power of Quotient": () => generateExponentLaws([5]),
    "Exponents / Power of a Quotient Law": () => generateExponentLaws([5]), // Actual topic from generator
    "Exponents / Negative Exponent": () => generateExponentLaws([6]),
    "Exponents / Negative Exponent Law": () => generateExponentLaws([6]), // Actual topic from generator
    "Exponents / Standard Form": generateStandardForm,
    "BODMAS / Simple": generateBODMAS, // Local one
    "BODMAS": generateBODMAS, // Alternate key for regeneration
    "Mensuration / Perimeter & Area": generatePerimeterAndArea,
    "Perimeter and Area": generatePerimeterAndArea, // Alternate key for regeneration
    "Commercial Math / Basics": generateCommercialMath,
    "Commercial Math": generateCommercialMath, // Alternate key for regeneration
    "Commercial Math / Percentage": generatePercentage,
    "Commercial Math / Profit & Loss": generateProfitLoss,
    "Commercial Math / Simple Interest": generateSimpleInterest,
    "Algebra / Basics": generateAlgebraTerms,
    "Algebra / Linear Equations": generateLinearEquation,
    "Algebra / Word Problems": generateAlgebraWordProblem,
    "Algebra / Mixed Problems": generateGrade7Algebra,
    "Algebra": generateGrade7Algebra, // Alternate key for regeneration
    "Algebra / Word Problems Table": generateAlgebraWordProblemTable,
    "Geometry / Lines and Angles": generateLinesAndAngles,
    "Lines and Angles": generateLinesAndAngles, // Alternate key for regeneration
    "Geometry / Triangles": generateTrianglesProperties,
    "Triangles and Properties": generateTrianglesProperties, // Alternate key for regeneration
    "Geometry / Solid Shapes": generateSolidShapesProperties,
    "Visualizing Solid Shapes": generateSolidShapesProperties, // Alternate key for regeneration
    "Data Handling / Basics": generateDataHandling,
    "Data Handling": generateDataHandling, // Alternate key for regeneration
    "Data Handling / Bar Graph": generateBarGraph,
    "Data Handling / Graphs": generateBarGraph // Alternate key for regeneration
};

export default Grade7Questions;

