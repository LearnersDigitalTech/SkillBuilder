const generate = (generator, count = 50) => {
    return Array.from({ length: count }, () => generator());
};

import {
    generateRationalNumbers,
    generateLinearEquationsGrade8,
    generateQuadrilateralsGrade8,
    generatePracticalGeometryGrade8,
    generateDataHandling,
    generateSquaresCubes,
    generateCubesRoots,
    generateComparingQuantities,
    generateAlgebraExpressions,
    generateAlgebraIdentities,
    generateVisualizingSolidShapes,
    generateMensurationGrade8,
    generateExponentsGrade8,
    generateDirectInverseVariation,
    generateFactorisation,
    generateGraphs,
    generatePlayingWithNumbers,
    generateCommercialMath,
    generatePercentage,
    generateSimpleInterestGrade8,
    generateWordProblemsLinearEq,
    generateQuadrilateralPropertiesAdvanced,
    generateDataInterpretationAdvanced,
    generateMensuration3D,
    generateGraphInterpretation
} from './grade8Generators.mjs';

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
    generatePercentage as generatePercentageG7,
    generateProfitLoss,
    generateSimpleInterest,
    generateCommercialMath as generateCommercialMathG7,
    generateGrade7Algebra,
    generateAlgebraWordProblemTable,
    generateLinesAndAngles,
    generateTrianglesProperties,
    generateSolidShapesProperties,
    generateDataHandling as generateDataHandlingG7,
    generateBarGraph
} from '../Grade7/grade7Generators.mjs';

import {
    generateNaturalWholeNumbers,
    generateIntegers as generateIntegersG10,
    generateFractions as generateFractionsG10,
    generateDecimals as generateDecimalsG10,
    generateLCM as generateLCMG10,
    generateHCF,
    generateRatioProportion,
    generateBODMAS as generateBODMASG10
} from '../Grade10/grade10Generators.mjs';

import {
    generateFactorTree,
} from '../Grade5/grade5Generators.mjs';

// const Grade8Questions = {
//     q1: generate(generateNaturalWholeNumbers),            // Grade 7 Q1
//     q2: generate(generateIntegersG10),                    // Grade 7 Q2
//     q3: generate(generateFractionsG10),                   // Grade 7 Q3
//     q4: generate(generateDecimalsG10),
//     q5: generate(generateFactorTree),                   // Grade 7 Q4
//     q6: generate(generateLCMG10),                         // Grade 7 Q5
//     q7: generate(generateHCF),                            // Grade 7 Q6
//     q8: generate(generateRatioProportion),                // Grade 7 Q7
//     q9: generate(generateBODMAS),                         // Grade 7 Q8
//     // q10: generate(generatePerimeterAndArea),               // Grade 7 Q9 - DISABLED: Layout issues
//     // q10: generate(generateCommercialMathG7),               // Grade 7 Q10
//     // q11: generate(generateRationalNumbers),                 // Ch 1
//     q10: generate(generateLinearEquationsGrade8),           // Ch 2
//     q11: generate(generateQuadrilateralsGrade8),            // Ch 3
//     // q12: generate(generatePracticalGeometryGrade8),         // Ch 4
//     // q15: generate(generateDataHandling),                    // Ch 5
//     q12: generate(generateSquaresCubes),                    // Ch 6
//     q13: generate(generateCubesRoots),                      // Ch 7
//     q14: generate(generateComparingQuantities),             // Ch 8
//     q15: generate(generateAlgebraExpressions),              // Ch 9
//     q16: generate(generateAlgebraIdentities),              // Ch 9 extension
//     // q21: generate(generateVisualizingSolidShapes),         // Ch 10
//     q17: generate(generateMensurationGrade8),              // Ch 11
//     // q20: generate(generateExponentsGrade8),                // Ch 12
//     q18: generate(generateDirectInverseVariation),         // Ch 13
//     // q25: generate(generateFactorisation),                  // Ch 14
//     q19: generate(generateGraphs),                         // Ch 15
//     // q27: generate(generatePlayingWithNumbers),             // Ch 16
//     // q28: generate(generateCommercialMath),                 // Used in Ch 8
//     // q29: generate(generatePercentage),                     // Used in Ch 8
//     // q30: generate(generateSimpleInterestGrade8),           // Used in Ch 8
//     // q31: generate(generateWordProblemsLinearEq),           // Ch 2 extension
//     // q32: generate(generateQuadrilateralPropertiesAdvanced),
//     q20: generate(generateDataInterpretationAdvanced),
//     // q34: generate(generateMensuration3D),
//     // q35: generate(generateGraphInterpretation),
//     // q36: generate(() => generateExponentLaws([0, 1])),     // Grade 7 Q11
//     // q37: generate(() => generateExponentLaws([2, 3])),     // Grade 7 Q12
//     q21: generate(generateGrade7Algebra),                  // Grade 7 Q13
//     // q39: generate(generateAlgebraWordProblemTable),        // Grade 7 Q14
//     q22: generate(generateLinesAndAngles),                 // Grade 7 Q15
//     q23: generate(generateTrianglesProperties),            // Grade 7 Q16
//     // q24: generate(generateSolidShapesProperties),          // Grade 7 Q17 - DISABLED: Layout issues
//     // q43: generate(generatePercentageG7),                   // Grade 7 Q18
//     q24: generate(generateDataHandlingG7),                 // Grade 7 Q19
//     q25: generate(generateBarGraph),                       // Grade 7 Q20
// };
const Grade8Questions = {

    // 1. Number System & Arithmetic (Revision + Extension)
    q1: generate(generateNaturalWholeNumbers),
    q2: generate(generateIntegersG10),
    q3: generate(generateFractionsG10),
    q4: generate(generateDecimalsG10),
    q5: generate(generateFactorTree),
    q6: generate(generateLCMG10),
    q7: generate(generateHCF),
    q8: generate(generateRatioProportion),
    q9: generate(generateBODMAS),

    // 2. Algebra Foundations
    q10: generate(generateGrade7Algebra),
    q11: generate(generateAlgebraExpressions),
    q12: generate(generateAlgebraIdentities),

    // 3. Linear Equations
    q13: generate(generateLinearEquationsGrade8),

    // 4. Powers, Squares & Cubes
    q14: generate(generateSquaresCubes),
    q15: generate(generateCubesRoots),

    // 5. Comparing Quantities
    q16: generate(generateComparingQuantities),

    // 6. Geometry
    q17: generate(generateLinesAndAngles),
    q18: generate(generateTrianglesProperties),
    q19: generate(generateQuadrilateralsGrade8),

    // 7. Mensuration
    q20: generate(generateMensurationGrade8),

    // 8. Direct & Inverse Variation
    q21: generate(generateDirectInverseVariation),

    // 9. Data Handling & Graphs
    q22: generate(generateDataHandlingG7),
    q23: generate(generateBarGraph),
    q24: generate(generateGraphs),
    q25: generate(generateDataInterpretationAdvanced),
};


export const Grade8GeneratorMap = {
    // Grade 10 Imports
    "Number Sense / Natural & Whole": generateNaturalWholeNumbers,
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers,

    "Integers / Mixed Operations": generateIntegersG10,
    "Fundamental Operations On Integers": generateIntegersG10,

    "Fractions / Mixed Operations": generateFractionsG10,
    "Fractions": generateFractionsG10,

    "Decimals / Mixed Operations": generateDecimalsG10,
    "Fundamental operations on decimals": generateDecimalsG10,

    "Number Sense / LCM": generateLCMG10,
    "Least Common Multiple": generateLCMG10,

    "Number Sense / HCF": generateHCF,
    "Highest Common Factor": generateHCF,

    "Ratio and Proportion / Basics": generateRatioProportion,
    "Ratio and Proportion": generateRatioProportion,

    "BODMAS / Complex": generateBODMASG10,

    // Grade 7 Imports
    "Geometry / Perimeter & Area": generatePerimeterAndArea,
    "Perimeter and Area": generatePerimeterAndArea,

    "Lines and Angles": generateLinesAndAngles,

    "Triangles": generateTrianglesProperties,
    "Triangles and Properties": generateTrianglesProperties,

    "Solid Shapes / Basics": generateSolidShapesProperties,
    "Visualizing Solid Shapes": generateSolidShapesProperties,

    "Data Handling / Basics": generateDataHandlingG7,
    "Data Handling": generateDataHandlingG7,

    "Data Handling / Bar Graph": generateBarGraph,
    "Data Handling / Graphs": generateBarGraph,

    "BODMAS": generateBODMAS, // Grade 7 version used in q8
    "Algebra": generateGrade7Algebra, // Grade 7 Algebra used in q21

    // Grade 8 Local
    "Rational Numbers / Properties": generateRationalNumbers,
    "Rational Numbers": generateRationalNumbers,

    "Linear Equations / Equations": generateLinearEquationsGrade8,
    "Linear Equations": generateLinearEquationsGrade8,

    "Linear Equations / Word Problems": generateWordProblemsLinearEq,

    "Quadrilaterals / Angles": generateQuadrilateralsGrade8,
    "Understanding Quadrilaterals": generateQuadrilateralsGrade8,

    "Quadrilaterals / Properties": generateQuadrilateralPropertiesAdvanced,

    "Practical Geometry / Properties": generatePracticalGeometryGrade8,
    "Practical Geometry": generatePracticalGeometryGrade8,

    "Data Handling / Statistics": generateDataHandling,

    "Data Handling / Pie Charts": generateDataInterpretationAdvanced,

    "Squares and Square Roots": generateSquaresCubes,
    "Squares & Cubes": generateSquaresCubes,

    "Cubes and Cube Roots": generateCubesRoots,

    "Comparing Quantities / Mixed": generateComparingQuantities,
    "Comparing Quantities": generateComparingQuantities,

    "Comparing Quantities / Percentage": generatePercentage,
    "Comparing Quantities / Commercial": generateCommercialMath,
    "Comparing Quantities / Interest": generateSimpleInterestGrade8,

    "Algebra / Expressions": generateAlgebraExpressions,
    "Algebraic Expressions": generateAlgebraExpressions,

    "Algebra / Identities": generateAlgebraIdentities,
    "Algebraic Identities": generateAlgebraIdentities,

    "Factorisation": generateFactorisation,

    "Visualising Solid Shapes / Euler": generateVisualizingSolidShapes,
    "Visualising Solid Shapes": generateVisualizingSolidShapes, // Grade 8 version

    "Mensuration / 2D Area": generateMensurationGrade8,
    "Mensuration": generateMensurationGrade8,

    "Mensuration / 3D Volume & SA": generateMensuration3D,

    "Exponents & Powers": generateExponentsGrade8,

    "Direct and Inverse Proportions": generateDirectInverseVariation,
    "Direct & Inverse Proportion": generateDirectInverseVariation,

    "Introduction to Graphs / Points": generateGraphs,
    "Introduction to Graphs": generateGraphs,

    "Introduction to Graphs / Linear": generateGraphInterpretation,
    "Playing with Numbers": generatePlayingWithNumbers
};

export default Grade8Questions;

