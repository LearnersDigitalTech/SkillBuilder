import {
    generateQ1,
    generateQ2,
    generateQ3,
    generateQ4,
    generateQ5,
    generateQ6,
    generateQ7,
    generateQ8,
    generateQ9,
    generateQ10,
    generateQ11,
    generateQ12,
    generateQ13,
    generateQ14,
    generateQ15,
    generateQ16,
    generateQ17,
    generateQ18
} from './gradeSATGenerators.mjs';

const generate = (generator, count = 50) => {
    return Array.from({ length: count }, () => generator());
};

const SATQuestions = {
    q1: generate(generateQ1),
    q2: generate(generateQ2),
    q3: generate(generateQ3),
    q4: generate(generateQ4),
    q5: generate(generateQ5),
    q6: generate(generateQ6),
    q7: generate(generateQ7),
    q8: generate(generateQ8),
    q9: generate(generateQ9),
    q10: generate(generateQ10),
    q11: generate(generateQ11),
    q12: generate(generateQ12),
    q13: generate(generateQ13),
    q14: generate(generateQ14),
    q15: generate(generateQ15),
    q16: generate(generateQ16),
    q17: generate(generateQ17),
    q18: generate(generateQ18)
};

export const GradeSATGeneratorMap = {
    "Linear functions": generateQ1,
    "Linear graphs": generateQ2,
    "Graph Interpretation": generateQ3,
    "Inequalities": generateQ4,
    "Linear Interpretation": generateQ5,
    "Systems of Equations": generateQ6,
    "Quadratic Functions": generateQ7,
    "Nonlinear Functions": generateQ8,
    "Quadratic Solutions": generateQ9,
    "Rational Expressions": generateQ10,
    "Exponential Functions": generateQ11,
    "Nonlinear Systems": generateQ12,
    "Data Analysis": generateQ13,
    "Percentages": generateQ14,
    "Geometry (Volume)": generateQ15,
    "Similar Triangles": generateQ16,
    "Geometry (Rectangle)": generateQ17,
    "Geometry (Circles)": generateQ18
};

export default SATQuestions;
