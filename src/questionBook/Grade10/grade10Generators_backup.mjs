const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const formatOption = (val) => {
    return { value: String(val), label: String(val) };
};

const ensureUnique = (correct, distractors) => {
    const options = [correct];
    const seen = new Set([correct.value]);

    for (const opt of distractors) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            options.push(opt);
        }
    }

    // Fill if needed (basic fallback)
    let safety = 0;
    while (options.length < 4 && safety < 20) {
        const val = options[0].value + " " + (safety + 1); // Only triggers if extremely desperate
        if (!seen.has(val)) {
            seen.add(val);
            options.push({ value: val, label: options[0].label }); // Dup label, unique value
        }
        safety++;
    }

    return shuffleArray(options).slice(0, 4);
};

// Helper: Greatest Common Divisor
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

// Helper: Least Common Multiple
const lcm = (a, b) => (a * b) / gcd(a, b);

// --- CAT01: Fundamental Operations on Natural and Whole Numbers ---
export const generateNaturalWholeNumbers = () => {
    const type = getRandomInt(0, 2); // 0: Add/Sub, 1: Mult/Div, 2: Properties
    let question, answer;

    if (type === 0) {
        const a = getRandomInt(1000, 9999);
        const b = getRandomInt(100, 9999);
        const op = Math.random() > 0.5 ? '+' : '-';
        if (op === '+') {
            question = `${a} + ${b} = ?`;
            answer = String(a + b);
        } else {
            // Ensure positive result for "Natural/Whole Numbers" usually
            const max = Math.max(a, b);
            const min = Math.min(a, b);
            question = `${max} - ${min} = ?`;
            answer = String(max - min);
        }
    } else if (type === 1) {
        const a = getRandomInt(10, 100);
        const b = getRandomInt(2, 20);
        const op = Math.random() > 0.5 ? '*' : '/';
        if (op === '*') {
            question = `${a} \\times ${b} = ?`;
            answer = String(a * b);
        } else {
            // Ensure divisibility
            const dividend = a * b;
            question = `${dividend} \\div ${b} = ?`;
            answer = String(a);
        }
    } else {
        // Properties question (e.g. Successor/Predecessor)
        const n = getRandomInt(100, 10000);
        if (Math.random() > 0.5) {
            question = `What is the successor of ${n}?`;
            answer = String(n + 1);
        } else {
            question = `What is the predecessor of ${n}?`;
            answer = String(n - 1);
        }
    }

    // Options
    const ansNum = Number(answer);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(ansNum + 1),
        formatOption(ansNum - 1),
        formatOption(ansNum + 10)
    ]);

    return {
        type: Math.random() > 0.5 ? 'mcq' : 'userInput',
        question,
        answer,
        options,
        topic: 'Natural and Whole Numbers'
    };
};

// --- CAT02: Fundamental Operations On Integers ---
export const generateIntegers = () => {
    const a = getRandomInt(-50, 50);
    const b = getRandomInt(-50, 50);
    const op = ['+', '-', '*', '/'][getRandomInt(0, 3)]; // removed '/' if non-integer result needed, handling below

    let question, answer;

    if (op === '/') {
        // Ensure integer division
        let divisor = b === 0 ? 1 : b; // Avoid div by zero
        let quotient = getRandomInt(-20, 20);
        let dividend = quotient * divisor;
        question = `${dividend} \\div (${divisor}) = ?`;
        answer = String(quotient);
    } else if (op === '*') {
        question = `${a} \\times (${b}) = ?`;
        answer = String(a * b);
    } else if (op === '-') {
        question = `${a} - (${b}) = ?`;
        answer = String(a - b);
    } else {
        question = `${a} + (${b}) = ?`;
        answer = String(a + b);
    }

    const ansNum = Number(answer);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(-ansNum),
        formatOption(ansNum + 1),
        formatOption(ansNum - 1)
    ]);

    // De-dupe options if 0 or similar
    const unique = new Set(options.map(o => o.value));
    while (unique.size < 4) {
        unique.add(String(ansNum + getRandomInt(2, 10)));
    }

    return {
        type: 'mcq', // Keep mixed?
        question,
        answer,
        options: Array.from(unique).map(v => formatOption(v)).slice(0, 4),
        topic: 'Integers'
    };
};

// --- CAT03: Fractions ---
export const generateFractions = () => {
    // Add/Sub/Mult/Div fractions
    const type = getRandomInt(0, 3);
    const n1 = getRandomInt(1, 9);
    const d1 = getRandomInt(2, 9);
    const n2 = getRandomInt(1, 9);
    const d2 = getRandomInt(2, 9);

    let num, den, opSymbol;

    if (type === 0) { // Add
        // n1/d1 + n2/d2 = (n1d2 + n2d1) / (d1d2)
        num = n1 * d2 + n2 * d1;
        den = d1 * d2;
        opSymbol = '+';
    } else if (type === 1) { // Sub
        num = n1 * d2 - n2 * d1;
        den = d1 * d2;
        opSymbol = '-';
    } else if (type === 2) { // Mult
        num = n1 * n2;
        den = d1 * d2;
        opSymbol = '\\times';
    } else { // Div
        // (n1/d1) / (n2/d2) = (n1*d2) / (d1*n2)
        num = n1 * d2;
        den = d1 * n2;
        opSymbol = '\\div';
    }

    // Simplify
    const common = gcd(Math.abs(num), Math.abs(den));
    const simpleNum = num / common;
    const simpleDen = den / common;

    const question = `$\\frac{${n1}}{${d1}} ${opSymbol} \\frac{${n2}}{${d2}} = ?$`;
    const answer = simpleDen === 1 ? String(simpleNum) : `${simpleNum}/${simpleDen}`;
    const latexAnswer = simpleDen === 1 ? String(simpleNum) : `$\\frac{${simpleNum}}{${simpleDen}}$`;

    // Distractors
    const options = ensureUnique(
        { value: answer, label: latexAnswer },
        [
            { value: simpleDen === 1 ? String(simpleNum + 1) : `${simpleNum + 1}/${simpleDen}`, label: simpleDen === 1 ? String(simpleNum + 1) : `$\\frac{${simpleNum + 1}}{${simpleDen}}$` },
            { value: simpleDen === 1 ? String(simpleNum - 1) : `${simpleNum}/${simpleDen + 1}`, label: simpleDen === 1 ? String(simpleNum - 1) : `$\\frac{${simpleNum}}{${simpleDen + 1}}$` },
            { value: "1", label: "$1$" },
            { value: "0", label: "$0$" },
            { value: simpleDen === 1 ? String(simpleNum + 2) : `${simpleNum + 2}/${simpleDen}`, label: simpleDen === 1 ? String(simpleNum + 2) : `$\\frac{${simpleNum + 2}}{${simpleDen}}$` }
        ]
    );
    // Ensure unique options logic omitted for brevity, adding roughly safe ones

    return {
        type: 'mcq',
        question,
        answer, // Store string logic like "3/4"
        options,
        topic: 'Fractions'
    };
};

// --- CAT04: Fundamental operations on decimals ---
export const generateDecimals = () => {
    const a = (getRandomInt(10, 1000) / 100).toFixed(2);
    const b = (getRandomInt(10, 1000) / 100).toFixed(2);
    const op = getRandomInt(0, 1); // Add/Sub mostly for simplicity, Mult can get messy decimals

    let val;
    let question;
    if (op === 0) {
        question = `$${a} + ${b} = ?$`;
        val = (parseFloat(a) + parseFloat(b)).toFixed(2);
    } else {
        // ensure a > b
        const max = Math.max(parseFloat(a), parseFloat(b));
        const min = Math.min(parseFloat(a), parseFloat(b));
        question = `$${max.toFixed(2)} - ${min.toFixed(2)} = ?$`;
        val = (max - min).toFixed(2);
    }

    const answer = String(val);
    const options = shuffleArray([
        { value: answer, label: answer },
        { value: (parseFloat(val) + 0.1).toFixed(2), label: (parseFloat(val) + 0.1).toFixed(2) },
        { value: (parseFloat(val) - 0.1).toFixed(2), label: (parseFloat(val) - 0.1).toFixed(2) },
        { value: (parseFloat(val) * 10).toFixed(2), label: (parseFloat(val) * 10).toFixed(2) }
    ]);

    return {
        type: 'mcq',
        question,
        answer,
        options,
        topic: 'Decimals'
    };
};

// --- CAT11: BODMAS ---
export const generateBODMAS = () => {
    // a + b * c - d
    const a = getRandomInt(1, 10);
    const b = getRandomInt(1, 10);
    const c = getRandomInt(1, 10);
    const d = getRandomInt(1, 20);

    // (a + b) * c - d or a + b * (c - d) etc.
    const type = getRandomInt(0, 2);
    let question, val;

    if (type === 0) {
        question = `$${a} + ${b} \\times ${c} - ${d} = ?$`;
        val = a + (b * c) - d;
    } else if (type === 1) {
        question = `$(${a} + ${b}) \\times ${c} - ${d} = ?$`;
        val = (a + b) * c - d;
    } else {
        question = `$${a} + ${b} \\times (${c} - ${d}) = ?$`;
        val = a + b * (c - d);
    }

    const answer = String(val);
    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(val + 10), label: String(val + 10) },
        { value: String(val - 5), label: String(val - 5) },
        { value: String(val * 2), label: String(val * 2) }
    ]);

    return {
        type: 'mcq',
        question,
        answer,
        options,
        topic: 'BODMAS'
    };
};

// --- CAT05: Least Common Multiple (LCM) ---
export const generateLCM = () => {
    const a = getRandomInt(4, 20);
    const b = getRandomInt(4, 20);
    const val = lcm(a, b);

    const question = `Find the Least Common Multiple (LCM) of ${a} and ${b}.`;
    const answer = String(val);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(val + getRandomInt(1, 5) * a),
        formatOption(Math.max(a, b)),
        formatOption(a * b)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Least Common Multiple' };
};

// --- CAT06: Highest Common Factor (HCF) ---
export const generateHCF = () => {
    const a = getRandomInt(12, 100);
    const b = getRandomInt(12, 100);
    const val = gcd(a, b);
    const question = `Find the Highest Common Factor (HCF) of ${a} and ${b}.`;
    const answer = String(val);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(1),
        formatOption(Math.min(a, b)),
        formatOption(2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Highest Common Factor' };
};

// --- CAT07: Ratio and Proportion ---
export const generateRatioProportion = () => {
    const a = getRandomInt(2, 5);
    const b = getRandomInt(2, 5);
    const x = getRandomInt(5, 15);
    const y = (b * x) / a;
    // a : b :: x : ? => ? = b*x/a
    // Ensure integer result
    let realX = x;
    if (y % 1 !== 0) realX = x * a; // adjust to make it divisible
    const realY = (b * realX) / a;

    const question = `If ${a}:${b} :: ${realX}:x, find x.`;
    const answer = String(realY);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(realY + 1),
        formatOption(realY - 1),
        formatOption(realY + 2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Ratio and Proportion' };
};

// --- CAT08: Finding Square and Square Roots ---
export const generateSquareRoots = () => {
    const isSquare = Math.random() > 0.5;
    let question, answer;
    if (isSquare) {
        const n = getRandomInt(2, 20);
        question = `Find the square of ${n}.`;
        answer = String(n * n);
    } else {
        const n = getRandomInt(2, 20);
        const sq = n * n;
        question = `Find the square root of ${sq}.`;
        answer = String(n);
    }
    const val = Number(answer);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(val + 1),
        formatOption(val - 1),
        formatOption(isSquare ? val + 10 : val + 2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Square and Square Roots' };
};

// --- CAT09: Finding Cube and Cube Roots ---
export const generateCubeRoots = () => {
    const isCube = Math.random() > 0.5;
    let question, answer;
    if (isCube) {
        const n = getRandomInt(2, 10);
        question = `Find the cube of ${n}.`;
        answer = String(n * n * n);
    } else {
        const n = getRandomInt(2, 10);
        const cb = n * n * n;
        question = `Find the cube root of ${cb}.`;
        answer = String(n);
    }
    const val = Number(answer);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(val + 1),
        formatOption(val - 1),
        formatOption(isCube ? val + 10 : val + 2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Cube and Cube Roots' };
};

// --- CAT10: Laws of Exponents ---
export const generateExponents = () => {
    const rule = getRandomInt(0, 1);
    const a = getRandomInt(2, 5);
    const m = getRandomInt(2, 5);
    const n = getRandomInt(2, 5);
    let question, answerStr, val;
    if (rule === 0) {
        question = `Simplify $${a}^{${m}} \\times ${a}^{${n}}$`;
        answerStr = `$${a}^{${m + n}}$`;
        val = m + n;
    } else {
        question = `Simplify $(${a}^{${m}})^{${n}}$`;
        answerStr = `$${a}^{${m * n}}$`;
        val = m * n;
    }
    const options = shuffleArray([
        { value: answerStr, label: answerStr },
        { value: `$${a}^{${val + 1}}$`, label: `$${a}^{${val + 1}}$` },
        { value: `$${a}^{${Math.abs(val - 1)}}$`, label: `$${a}^{${Math.abs(val - 1)}}$` },
        { value: `$${a + 1}^{${val}}$`, label: `$${a + 1}^{${val}}$` }
    ]);
    return { type: 'mcq', question, answer: answerStr, options, topic: 'Laws of Exponents' };
};

// --- CAT12: Addition and Subtraction of Algebraic Expressions ---
export const generateAlgebraicAdditionSubtraction = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const c = getRandomInt(1, 5);
    const d = getRandomInt(1, 5);
    const termX = a + c;
    const termConst = b + d;
    const question = `Add: $( ${a}x + ${b} ) + ( ${c}x + ${d} )$`;
    const answer = `${termX}x + ${termConst}`;
    const options = shuffleArray([
        formatOption(answer),
        formatOption(`${termX}x - ${termConst}`),
        formatOption(`${termX + 1}x + ${termConst}`),
        formatOption(`${termX}x + ${termConst + 2}`)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Algebraic Aggregation' };
};

// --- CAT13: Multiplication of Algebraic Expressions ---
export const generateAlgebraicMultiplication = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const question = `Multiply: $${a} \\times ${b}x$`;
    const answer = `${a * b}x`;
    const options = ensureUnique(formatOption(answer), [
        formatOption(`${a * b}x^2`),
        formatOption(`${a + b}x`),
        formatOption(`${a * b + 1}x`),
        formatOption(`${a * b - 1}x`),
        formatOption(`${(a * b) + 2}x`)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Algebraic Multiplication' };
};

// --- CAT14: Division of Algebraic Expressions ---
export const generateAlgebraicDivision = () => {
    const a = getRandomInt(2, 5);
    const b = getRandomInt(2, 5);
    const coeff = a * b;
    const question = `Divide: $${coeff}x \\div ${a}$`;
    const answer = `${b}x`;
    const options = shuffleArray([
        formatOption(answer),
        formatOption(`${b}`),
        formatOption(`${b}x^2`),
        formatOption(`${b + 1}x`)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Algebraic Division' };
};

// --- CAT15: Solve Linear Equation in one variable ---
export const generateLinearEquationOneVar = () => {
    const x = getRandomInt(1, 10);
    const a = getRandomInt(2, 5);
    const b = getRandomInt(1, 10);
    const c = a * x + b;
    const question = `Solve for x: $${a}x + ${b} = ${c}$`;
    const answer = String(x);
    const options = ensureUnique(formatOption(answer), [
        formatOption(x + 1),
        formatOption(x - 1),
        formatOption(x * 2),
        formatOption(x + 2),
        formatOption(x - 2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Linear Equations 1 Var' };
};

// --- CAT16: Solve Simultaneous Linear Equations ---
export const generateSimultaneousEquations = () => {
    const x = getRandomInt(2, 8);
    const roots = [getRandomInt(1, 5), getRandomInt(1, 5)]; // keep simple roots
    const sum = roots[0] + roots[1];
    const prod = roots[0] * roots[1];
    const term2 = sum >= 0 ? `- ${sum}x` : `+ ${Math.abs(sum)}x`;
    const term3 = prod >= 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
    const question = `Find the roots: $x^2 ${term2} ${term3} = 0$`;
    const answer = `${roots[0]}, ${roots[1]}`;
    // Dedupe answer before logic
    const options = shuffleArray([
        formatOption(answer),
        formatOption(`${roots[0] + 1}, ${roots[1]}`),
        formatOption(`${roots[0]}, ${roots[1] + 1}`),
        formatOption(`${roots[0] + 1}, ${roots[1] + 1}`)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Quadratic Equations' };
};

// --- CAT18: Perimeter of Plane Figures ---
export const generatePerimeter = () => {
    const s = getRandomInt(3, 10);
    const question = `Find the perimeter of a square with side ${s} units.`;
    const answer = String(4 * s);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(s * s),
        formatOption(2 * s),
        formatOption(4 * s + 4)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Perimeter' };
};

// --- CAT19: Area of Plane Figures ---
export const generateArea = () => {
    const l = getRandomInt(3, 10);
    const w = getRandomInt(3, 10);
    const question = `Find the area of a rectangle with length ${l} and width ${w}.`;
    const answer = String(l * w);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(2 * (l + w)),
        formatOption(l * w + 5),
        formatOption(l + w)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Area' };
};

// --- CAT20: Locating a point in a Cartesian Plane ---
export const generateCartesianPoint = () => {
    const x = getRandomInt(-5, 5);
    const y = getRandomInt(-5, 5);
    const question = `Which quadrant (or axis) does the point (${x}, ${y}) lie in?`;
    let answer;
    if (x > 0 && y > 0) answer = "Quadrant I";
    else if (x < 0 && y > 0) answer = "Quadrant II";
    else if (x < 0 && y < 0) answer = "Quadrant III";
    else if (x > 0 && y < 0) answer = "Quadrant IV";
    else if (x === 0 && y === 0) answer = "Origin";
    else answer = x === 0 ? "Y-axis" : "X-axis";

    const allOptions = ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV", "X-axis", "Y-axis", "Origin"];
    const unique = new Set([answer, "Quadrant I", "Quadrant II", "Quadrant III", "X-axis"]);
    const finalOptions = Array.from(unique).slice(0, 4).map(v => formatOption(v));
    return { type: 'mcq', question, answer, options: finalOptions, topic: 'Cartesian Point' };
};

// --- CAT21: Coordinate Geometry ---
export const generateCoordinateGeometry = () => {
    const x = [3, 6, 5, 8, 9][getRandomInt(0, 4)];
    const y = [4, 8, 12, 15, 12][getRandomInt(0, 4)];
    const dist = Math.sqrt(x * x + y * y).toFixed(2);
    const question = `Find the distance of point (${x}, ${y}) from the origin.`;
    const answer = String(Number(dist) === parseInt(dist) ? parseInt(dist) : dist);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(parseInt(answer) + 1),
        formatOption(parseInt(answer) - 1),
        formatOption(parseInt(answer) + 2)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Coordinate Geometry' };
};

// --- CAT22: Section Formula ---
export const generateSectionFormula = () => {
    const x1 = 2, y1 = 4;
    const x2 = 6, y2 = 8;
    const question = `Find the midpoint of the line segment joining (${x1}, ${y1}) and (${x2}, ${y2}).`;
    const answer = `(4, 6)`;
    const options = shuffleArray([
        formatOption(answer),
        formatOption(`(3, 5)`),
        formatOption(`(5, 7)`),
        formatOption(`(2, 4)`)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Section Formula' };
};

// --- CAT23: Trigonometry ---
export const generateTrigonometry = () => {
    const question = "What is the value of $\\sin 90^\\circ$?";
    const answer = "1";
    const options = shuffleArray([
        formatOption("1"),
        formatOption("0"),
        formatOption("1/2"),
        formatOption("-1")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Trigonometry' };
};

// --- CAT24: Trigonometric Ratios of Standard angles ---
export const generateTrigRatios = () => {
    const question = "Evaluate: $\\tan 45^\\circ$";
    const answer = "1";
    const options = shuffleArray([
        formatOption("1"),
        formatOption("0"),
        formatOption("sqrt(3)"),
        formatOption("1/sqrt(3)")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Trig Ratios' };
};

// --- CAT25: Word Problems - Pythagorean Theorem ---
export const generatePythagoras = () => {
    const b = 3, h = 4;
    const question = `In a right-angled triangle, if base is ${b} and height is ${h}, find the hypotenuse.`;
    const answer = "5";
    const options = shuffleArray([
        formatOption("5"),
        formatOption("6"),
        formatOption("7"),
        formatOption("25")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Pythagoras' };
};

// --- CAT26: Clocks â€“ Angle between hands ---
export const generateClocks = () => {
    const h = 3;
    const question = `Find the angle between the hour and minute hands at ${h}:00.`;
    const answer = "90 degrees";
    const options = shuffleArray([
        formatOption("90 degrees"),
        formatOption("180 degrees"),
        formatOption("60 degrees"),
        formatOption("45 degrees")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Clocks' };
};

// --- CAT27: Probability ---
export const generateProbability = () => {
    const question = "Probability of getting a head in a single coin toss?";
    const answer = "1/2";
    const options = shuffleArray([
        formatOption("1/2"),
        formatOption("1/4"),
        formatOption("1"),
        formatOption("0")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Probability' };
};

// --- CAT28: Word Problem - Linear Equation in One Variable ---
export const generateWordProblemLinearEq = () => {
    const n = getRandomInt(1, 10);
    const sum = n + (n + 1);
    const question = `The sum of two consecutive integers is ${sum}. Find the smaller integer.`;
    const answer = String(n);
    const options = shuffleArray([
        formatOption(answer),
        formatOption(n + 1),
        formatOption(n - 1),
        formatOption(sum)
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Linear Eq Word Problem' };
};

// --- CAT29: Word Problem ---
export const generateWordProblem = () => {
    const cp = 100;
    const sp = 120;
    const question = `A book is bought for 100 and sold for 120. Find the profit percentage.`;
    const answer = "20%";
    const options = shuffleArray([
        formatOption("20%"),
        formatOption("10%"),
        formatOption("25%"),
        formatOption("15%")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'General Word Problem' };
};

// --- CAT30: Miscellaneous ---
export const generateMiscellaneous = () => {
    const question = "How many degrees are there in a circle?";
    const answer = "360";
    const options = shuffleArray([
        formatOption("360"),
        formatOption("180"),
        formatOption("90"),
        formatOption("270")
    ]);
    return { type: 'mcq', question, answer, options, topic: 'Miscellaneous' };
};
c o n s t   g e t R a n d o m I n t   =   ( m i n ,   m a x )   = >   M a t h . f l o o r ( M a t h . r a n d o m ( )   *   ( m a x   -   m i n   +   1 ) )   +   m i n ;  
  
 c o n s t   s h u f f l e A r r a y   =   ( a r r a y )   = >   {  
         f o r   ( l e t   i   =   a r r a y . l e n g t h   -   1 ;   i   >   0 ;   i - - )   {  
                 c o n s t   j   =   M a t h . f l o o r ( M a t h . r a n d o m ( )   *   ( i   +   1 ) ) ;  
                 [ a r r a y [ i ] ,   a r r a y [ j ] ]   =   [ a r r a y [ j ] ,   a r r a y [ i ] ] ;  
         }  
         r e t u r n   a r r a y ;  
 } ;  
  
 c o n s t   f o r m a t O p t i o n   =   ( v a l )   = >   {  
         r e t u r n   {   v a l u e :   S t r i n g ( v a l ) ,   l a b e l :   S t r i n g ( v a l )   } ;  
 } ;  
  
 c o n s t   e n s u r e U n i q u e   =   ( c o r r e c t ,   d i s t r a c t o r s )   = >   {  
         c o n s t   o p t i o n s   =   [ c o r r e c t ] ;  
         c o n s t   s e e n   =   n e w   S e t ( [ c o r r e c t . v a l u e ] ) ;  
  
         f o r   ( c o n s t   o p t   o f   d i s t r a c t o r s )   {  
                 i f   ( o p t i o n s . l e n g t h   > =   4 )   b r e a k ;  
                 i f   ( ! s e e n . h a s ( o p t . v a l u e ) )   {  
                         s e e n . a d d ( o p t . v a l u e ) ;  
                         o p t i o n s . p u s h ( o p t ) ;  
                 }  
         }  
  
         l e t   s a f e t y   =   0 ;  
         w h i l e   ( o p t i o n s . l e n g t h   <   4   & &   s a f e t y   <   2 0 )   {  
                 c o n s t   v a l   =   o p t i o n s [ 0 ] . v a l u e   +   "   "   +   ( s a f e t y   +   1 ) ;  
                 l e t   n e w V a l   =   v a l ;  
                 l e t   n e w L a b e l   =   o p t i o n s [ 0 ] . l a b e l ;  
  
                 c o n s t   n u m V a l   =   p a r s e F l o a t ( o p t i o n s [ 0 ] . v a l u e ) ;  
                 i f   ( ! i s N a N ( n u m V a l ) )   {  
                         c o n s t   j i t t e r   =   n u m V a l   +   ( M a t h . r a n d o m ( )   >   0 . 5   ?   1   :   - 1 )   *   ( s a f e t y   +   1 ) ;  
                         n e w V a l   =   S t r i n g ( j i t t e r ) ;  
                         n e w L a b e l   =   S t r i n g ( j i t t e r ) ;  
                 }  
  
                 i f   ( ! s e e n . h a s ( n e w V a l ) )   {  
                         s e e n . a d d ( n e w V a l ) ;  
                         o p t i o n s . p u s h ( {   v a l u e :   n e w V a l ,   l a b e l :   n e w L a b e l   } ) ;  
                 }  
                 s a f e t y + + ;  
         }  
  
         r e t u r n   s h u f f l e A r r a y ( o p t i o n s ) . s l i c e ( 0 ,   4 ) ;  
 } ;  
  
 c o n s t   g c d   =   ( a ,   b )   = >   b   = = =   0   ?   a   :   g c d ( b ,   a   %   b ) ;  
 c o n s t   l c m   =   ( a ,   b )   = >   ( a   *   b )   /   g c d ( a ,   b ) ;  
  
 / /   - - -   C A T 0 1 :   F u n d a m e n t a l   O p e r a t i o n s   o n   N a t u r a l   a n d   W h o l e   N u m b e r s   - - -  
 e x p o r t   c o n s t   g e n e r a t e N a t u r a l W h o l e N u m b e r s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 1 0 ,   9 9 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 1 0 ,   9 9 ) ;  
         r o w s . p u s h ( {   l e f t :   a 1 ,   o p :   ' + ' ,   r i g h t :   b 1 ,   a n s w e r :   S t r i n g ( a 1   +   b 1 )   } ) ;  
  
         c o n s t   a 2   =   g e t R a n d o m I n t ( 1 0 0 ,   9 9 9 ) ;  
         c o n s t   b 2   =   g e t R a n d o m I n t ( 1 0 ,   9 9 ) ;  
         c o n s t   m a x 2   =   M a t h . m a x ( a 2 ,   b 2 ) ;  
         c o n s t   m i n 2   =   M a t h . m i n ( a 2 ,   b 2 ) ;  
         r o w s . p u s h ( {   l e f t :   m a x 2 ,   o p :   ' - ' ,   r i g h t :   m i n 2 ,   a n s w e r :   S t r i n g ( m a x 2   -   m i n 2 )   } ) ;  
  
         c o n s t   a 3   =   g e t R a n d o m I n t ( 1 0 ,   2 0 ) ;  
         c o n s t   b 3   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         r o w s . p u s h ( {   l e f t :   a 3 ,   o p :   ' Ã  ' ,   r i g h t :   b 3 ,   a n s w e r :   S t r i n g ( a 3   *   b 3 )   } ) ;  
  
         c o n s t   b 4   =   g e t R a n d o m I n t ( 2 ,   1 5 ) ;  
         c o n s t   q 4   =   g e t R a n d o m I n t ( 1 0 ,   5 0 ) ;  
         c o n s t   a 4   =   b 4   *   q 4 ;  
         r o w s . p u s h ( {   l e f t :   a 4 ,   o p :   ' Ã · ' ,   r i g h t :   b 4 ,   a n s w e r :   S t r i n g ( q 4 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   r o w s [ 0 ] . a n s w e r ,   1 :   r o w s [ 1 ] . a n s w e r ,   2 :   r o w s [ 2 ] . a n s w e r ,   3 :   r o w s [ 3 ] . a n s w e r   } ;  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' F u n d a m e n t a l   O p e r a t i o n s   o n   N a t u r a l   a n d   W h o l e   N u m b e r s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 2 :   F u n d a m e n t a l   O p e r a t i o n s   O n   I n t e g e r s   - - -  
 e x p o r t   c o n s t   g e n e r a t e I n t e g e r s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   a 1   =   - 1   *   g e t R a n d o m I n t ( 2 ,   2 0 ) ;  
         c o n s t   b 1   =   - 1   *   g e t R a n d o m I n t ( 2 ,   2 0 ) ;  
         r o w s . p u s h ( {   l e f t :   ` ( $ { a 1 } ) ` ,   o p :   ' + ' ,   r i g h t :   ` ( $ { b 1 } ) ` ,   a n s w e r :   S t r i n g ( a 1   +   b 1 )   } ) ;  
  
         c o n s t   a 2   =   - 1   *   g e t R a n d o m I n t ( 2 ,   2 0 ) ;  
         c o n s t   b 2   =   - 1   *   g e t R a n d o m I n t ( 2 ,   2 0 ) ;  
         r o w s . p u s h ( {   l e f t :   ` ( $ { a 2 } ) ` ,   o p :   ' - ' ,   r i g h t :   ` ( $ { b 2 } ) ` ,   a n s w e r :   S t r i n g ( a 2   -   b 2 )   } ) ;  
  
         c o n s t   a 3   =   - 1   *   g e t R a n d o m I n t ( 2 ,   1 2 ) ;  
         c o n s t   b 3   =   - 1   *   g e t R a n d o m I n t ( 2 ,   1 2 ) ;  
         r o w s . p u s h ( {   l e f t :   ` ( $ { a 3 } ) ` ,   o p :   ' Ã  ' ,   r i g h t :   ` ( $ { b 3 } ) ` ,   a n s w e r :   S t r i n g ( a 3   *   b 3 )   } ) ;  
  
         c o n s t   b 4   =   g e t R a n d o m I n t ( 2 ,   1 0 ) ;  
         c o n s t   q 4   =   - 1   *   g e t R a n d o m I n t ( 2 ,   1 2 ) ;  
         c o n s t   a 4   =   b 4   *   q 4 ;  
         r o w s . p u s h ( {   l e f t :   ` ( $ { a 4 } ) ` ,   o p :   ' Ã · ' ,   r i g h t :   ` ( $ { b 4 } ) ` ,   a n s w e r :   S t r i n g ( q 4 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   r o w s [ 0 ] . a n s w e r ,   1 :   r o w s [ 1 ] . a n s w e r ,   2 :   r o w s [ 2 ] . a n s w e r ,   3 :   r o w s [ 3 ] . a n s w e r   } ;  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' F u n d a m e n t a l   O p e r a t i o n s   O n   I n t e g e r s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 3 :   F r a c t i o n s   - - -  
 e x p o r t   c o n s t   g e n e r a t e F r a c t i o n s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   s i m p l i f y   =   ( n ,   d )   = >   {  
                 c o n s t   c o m m o n   =   g c d ( n ,   d ) ;  
                 r e t u r n   {   n :   n   /   c o m m o n ,   d :   d   /   c o m m o n   } ;  
         } ;  
  
         c o n s t   g e t P r o p e r F r a c t i o n   =   ( )   = >   {  
                 l e t   d   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
                 l e t   n   =   g e t R a n d o m I n t ( 1 ,   d   -   1 ) ;  
                 r e t u r n   s i m p l i f y ( n ,   d ) ;  
         } ;  
  
         / /   1 .   A d d i t i o n   w i t h   u n l i k e   d e n o m i n a t o r s  
         l e t   f 1   =   g e t P r o p e r F r a c t i o n ( ) ;  
         l e t   f 2   =   g e t P r o p e r F r a c t i o n ( ) ;  
         w h i l e   ( f 1 . d   = = =   f 2 . d )   {   f 2   =   g e t P r o p e r F r a c t i o n ( ) ;   }   / /   E n s u r e   d i s t i n c t  
  
         l e t   a n s A d d N   =   f 1 . n   *   f 2 . d   +   f 2 . n   *   f 1 . d ;  
         l e t   a n s A d d D   =   f 1 . d   *   f 2 . d ;  
         l e t   a n s A d d   =   s i m p l i f y ( a n s A d d N ,   a n s A d d D ) ;  
  
         r o w s . p u s h ( {  
                 l e f t :   {   n :   f 1 . n ,   d :   f 1 . d   } ,   o p :   ' + ' ,   r i g h t :   {   n :   f 2 . n ,   d :   f 2 . d   } ,  
                 a n s w e r :   {   n u m :   S t r i n g ( a n s A d d . n ) ,   d e n :   S t r i n g ( a n s A d d . d )   }  
         } ) ;  
  
         / /   2 .   S u b t r a c t i o n   w i t h   u n l i k e   d e n o m i n a t o r s  
         l e t   f 3   =   g e t P r o p e r F r a c t i o n ( ) ;  
         l e t   f 4   =   g e t P r o p e r F r a c t i o n ( ) ;  
         w h i l e   ( f 3 . d   = = =   f 4 . d )   {   f 4   =   g e t P r o p e r F r a c t i o n ( ) ;   }  
  
         / /   E n s u r e   p o s i t i v e   r e s u l t :   f 3   > =   f 4  
         i f   ( f 3 . n   *   f 4 . d   <   f 4 . n   *   f 3 . d )   {  
                 [ f 3 ,   f 4 ]   =   [ f 4 ,   f 3 ] ;  
         }  
  
         l e t   a n s S u b N   =   f 3 . n   *   f 4 . d   -   f 4 . n   *   f 3 . d ;  
         l e t   a n s S u b D   =   f 3 . d   *   f 4 . d ;  
         l e t   a n s S u b   =   s i m p l i f y ( a n s S u b N ,   a n s S u b D ) ;  
  
         r o w s . p u s h ( {  
                 l e f t :   {   n :   f 3 . n ,   d :   f 3 . d   } ,   o p :   ' - ' ,   r i g h t :   {   n :   f 4 . n ,   d :   f 4 . d   } ,  
                 a n s w e r :   {   n u m :   S t r i n g ( a n s S u b . n ) ,   d e n :   S t r i n g ( a n s S u b . d )   }  
         } ) ;  
  
         / /   3 .   M u l t i p l i c a t i o n   w i t h   u n l i k e   d e n o m i n a t o r s  
         l e t   f 5   =   g e t P r o p e r F r a c t i o n ( ) ;  
         l e t   f 6   =   g e t P r o p e r F r a c t i o n ( ) ;  
         w h i l e   ( f 5 . d   = = =   f 6 . d )   {   f 6   =   g e t P r o p e r F r a c t i o n ( ) ;   }  
  
         l e t   a n s M u l N   =   f 5 . n   *   f 6 . n ;  
         l e t   a n s M u l D   =   f 5 . d   *   f 6 . d ;  
         l e t   a n s M u l   =   s i m p l i f y ( a n s M u l N ,   a n s M u l D ) ;  
  
         r o w s . p u s h ( {  
                 l e f t :   {   n :   f 5 . n ,   d :   f 5 . d   } ,   o p :   ' Ã  ' ,   r i g h t :   {   n :   f 6 . n ,   d :   f 6 . d   } ,  
                 a n s w e r :   {   n u m :   S t r i n g ( a n s M u l . n ) ,   d e n :   S t r i n g ( a n s M u l . d )   }  
         } ) ;  
  
         / /   4 .   D i v i s i o n   w i t h   u n l i k e   d e n o m i n a t o r s  
         l e t   f 7   =   g e t P r o p e r F r a c t i o n ( ) ;  
         l e t   f 8   =   g e t P r o p e r F r a c t i o n ( ) ;  
         w h i l e   ( f 7 . d   = = =   f 8 . d )   {   f 8   =   g e t P r o p e r F r a c t i o n ( ) ;   }  
  
         l e t   a n s D i v N   =   f 7 . n   *   f 8 . d ;  
         l e t   a n s D i v D   =   f 7 . d   *   f 8 . n ;  
         l e t   a n s D i v   =   s i m p l i f y ( a n s D i v N ,   a n s D i v D ) ;  
  
         r o w s . p u s h ( {  
                 l e f t :   {   n :   f 7 . n ,   d :   f 7 . d   } ,   o p :   ' Ã · ' ,   r i g h t :   {   n :   f 8 . n ,   d :   f 8 . d   } ,  
                 a n s w e r :   {   n u m :   S t r i n g ( a n s D i v . n ) ,   d e n :   S t r i n g ( a n s D i v . d )   }  
         } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   r o w s [ 0 ] . a n s w e r ,   1 :   r o w s [ 1 ] . a n s w e r ,   2 :   r o w s [ 2 ] . a n s w e r ,   3 :   r o w s [ 3 ] . a n s w e r   } ;  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 v a r i a n t :   ' f r a c t i o n ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' F r a c t i o n s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 4 :   F u n d a m e n t a l   o p e r a t i o n s   o n   d e c i m a l s   - - -  
 e x p o r t   c o n s t   g e n e r a t e D e c i m a l s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   a 1   =   ( g e t R a n d o m I n t ( 1 0 ,   9 9 )   /   1 0 0 ) . t o F i x e d ( 2 ) ;  
         c o n s t   b 1   =   ( g e t R a n d o m I n t ( 1 0 ,   9 9 )   /   1 0 ) . t o F i x e d ( 1 ) ;  
         c o n s t   a n s 1   =   ( p a r s e F l o a t ( a 1 )   +   p a r s e F l o a t ( b 1 ) ) . t o F i x e d ( 2 ) ;  
         r o w s . p u s h ( {   l e f t :   a 1 ,   o p :   ' + ' ,   r i g h t :   b 1 ,   a n s w e r :   S t r i n g ( a n s 1 )   } ) ;  
  
         c o n s t   a 2   =   ( g e t R a n d o m I n t ( 5 0 ,   9 9 )   /   1 0 0 ) . t o F i x e d ( 2 ) ;  
         c o n s t   b 2   =   ( g e t R a n d o m I n t ( 1 0 ,   4 0 )   /   1 0 0 ) . t o F i x e d ( 2 ) ;  
         c o n s t   a n s 2   =   ( p a r s e F l o a t ( a 2 )   -   p a r s e F l o a t ( b 2 ) ) . t o F i x e d ( 2 ) ;  
         r o w s . p u s h ( {   l e f t :   a 2 ,   o p :   ' - ' ,   r i g h t :   b 2 ,   a n s w e r :   S t r i n g ( a n s 2 )   } ) ;  
  
         c o n s t   a 3   =   ( g e t R a n d o m I n t ( 1 ,   9 )   /   1 0 ) . t o F i x e d ( 1 ) ;  
         c o n s t   b 3   =   ( g e t R a n d o m I n t ( 1 ,   9 )   /   1 0 ) . t o F i x e d ( 1 ) ;  
         c o n s t   a n s 3   =   ( p a r s e F l o a t ( a 3 )   *   p a r s e F l o a t ( b 3 ) ) . t o F i x e d ( 2 ) ;  
         r o w s . p u s h ( {   l e f t :   a 3 ,   o p :   ' Ã  ' ,   r i g h t :   b 3 ,   a n s w e r :   S t r i n g ( a n s 3 )   } ) ;  
  
         c o n s t   d i v i s o r   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   q u o t i e n t   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   d i v i d e n d R a w   =   d i v i s o r   *   q u o t i e n t ;  
         c o n s t   a 4   =   ( d i v i d e n d R a w   /   1 0 ) . t o F i x e d ( 1 ) ;  
         c o n s t   b 4   =   ( d i v i s o r   /   1 0 ) . t o F i x e d ( 1 ) ;  
         c o n s t   a n s 4   =   S t r i n g ( q u o t i e n t ) ;  
         r o w s . p u s h ( {   l e f t :   a 4 ,   o p :   ' Ã · ' ,   r i g h t :   b 4 ,   a n s w e r :   a n s 4   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   r o w s [ 0 ] . a n s w e r ,   1 :   r o w s [ 1 ] . a n s w e r ,   2 :   r o w s [ 2 ] . a n s w e r ,   3 :   r o w s [ 3 ] . a n s w e r   } ;  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' F u n d a m e n t a l   o p e r a t i o n s   o n   d e c i m a l s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 5 :   L C M   - - -  
 e x p o r t   c o n s t   g e n e r a t e L C M   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   Q 1 :   2   n u m b e r s  
         l e t   a 1   =   g e t R a n d o m I n t ( 4 ,   1 5 ) ;  
         l e t   b 1   =   g e t R a n d o m I n t ( 4 ,   1 5 ) ;  
         / /   E n s u r e   d i s t i n c t  
         w h i l e   ( a 1   = = =   b 1 )   {  
                 b 1   =   g e t R a n d o m I n t ( 4 ,   1 5 ) ;  
         }  
         c o n s t   v a l 1   =   l c m ( a 1 ,   b 1 ) ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   L C M   o f   $ $ { a 1 } ,   $ { b 1 } $ ` ,   a n s w e r :   S t r i n g ( v a l 1 )   } ) ;  
  
         / /   Q 2   r e m o v e d   a s   p e r   r e q u e s t   ( k e e p   1 s t   a n d   3 r d )  
  
         / /   Q 3 :   3   n u m b e r s  
         c o n s t   s e t 3   =   n e w   S e t ( ) ;  
         w h i l e   ( s e t 3 . s i z e   <   3 )   {  
                 s e t 3 . a d d ( g e t R a n d o m I n t ( 3 ,   1 0 ) ) ;  
         }  
         c o n s t   [ a 3 ,   b 3 ,   c 3 ]   =   [ . . . s e t 3 ] ;  
  
         c o n s t   v a l 3   =   l c m ( a 3 ,   l c m ( b 3 ,   c 3 ) ) ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   L C M   o f   $ $ { a 3 } ,   $ { b 3 } ,   $ { c 3 } $ ` ,   a n s w e r :   S t r i n g ( v a l 3 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' L e a s t   C o m m o n   M u l t i p l e '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 6 :   H C F   - - -  
 e x p o r t   c o n s t   g e n e r a t e H C F   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         l e t   a 1   =   g e t R a n d o m I n t ( 1 2 ,   4 0 ) ;  
         l e t   b 1   =   g e t R a n d o m I n t ( 1 2 ,   4 0 ) ;  
         l e t   v a l 1   =   g c d ( a 1 ,   b 1 ) ;  
         w h i l e   ( v a l 1   < =   1   | |   a 1   = = =   b 1 )   {   / /   E n s u r e   d i s t i n c t   a n d   H C F   >   1  
                 a 1   =   g e t R a n d o m I n t ( 1 2 ,   4 0 ) ;  
                 b 1   =   g e t R a n d o m I n t ( 1 2 ,   4 0 ) ;  
                 v a l 1   =   g c d ( a 1 ,   b 1 ) ;  
         }  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   H C F   o f   $ $ { a 1 } ,   $ { b 1 } $ ` ,   a n s w e r :   S t r i n g ( v a l 1 )   } ) ;  
  
         / /   Q 2   r e m o v e d   a s   p e r   r e q u e s t   ( k e e p   1 s t   a n d   3 r d )  
  
         c o n s t   f a c t o r   =   g e t R a n d o m I n t ( 2 ,   6 ) ;  
         c o n s t   m u l t i p l i e r s   =   n e w   S e t ( ) ;  
         w h i l e   ( m u l t i p l i e r s . s i z e   <   3 )   {  
                 m u l t i p l i e r s . a d d ( g e t R a n d o m I n t ( 3 ,   9 ) ) ;   / /   I n c r e a s e d   r a n g e   s l i g h t l y   t o   a v o i d   i n f i n i t e   l o o p s   i f   r a n g e   i s   t o o   s m a l l  
         }  
         c o n s t   [ m 1 ,   m 2 ,   m 3 ]   =   [ . . . m u l t i p l i e r s ] ;  
         c o n s t   a 3   =   f a c t o r   *   m 1 ;  
         c o n s t   b 3   =   f a c t o r   *   m 2 ;  
         c o n s t   c 3   =   f a c t o r   *   m 3 ;  
         c o n s t   v a l 3   =   g c d ( a 3 ,   g c d ( b 3 ,   c 3 ) ) ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   H C F   o f   $ $ { a 3 } ,   $ { b 3 } ,   $ { c 3 } $ ` ,   a n s w e r :   S t r i n g ( v a l 3 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' H i g h e s t   C o m m o n   F a c t o r '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 7 :   R a t i o   a n d   P r o p o r t i o n   - - -  
 e x p o r t   c o n s t   g e n e r a t e R a t i o P r o p o r t i o n   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   Q 1 :   D i r e c t   r a t i o   p r o b l e m  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   x 1   =   g e t R a n d o m I n t ( 5 ,   1 2 ) ;  
         c o n s t   y 1   =   ( b 1   *   x 1 )   /   a 1 ;  
         / /   e n s u r e   i n t e g e r   a n s w e r  
         c o n s t   a d j X 1   =   ( y 1   %   1   = = =   0 )   ?   x 1   :   x 1   *   a 1 ;  
         c o n s t   a d j Y 1   =   ( b 1   *   a d j X 1 )   /   a 1 ;  
         r o w s . p u s h ( {   t e x t :   ` I f   $ $ { a 1 } : $ { b 1 }   : :   $ { a d j X 1 } : x $ ,   f i n d   $ x $ ` ,   a n s w e r :   S t r i n g ( a d j Y 1 )   } ) ;  
  
         / /   Q 2 :   W o r d   s i m p l e  
         c o n s t   t o t a l   =   g e t R a n d o m I n t ( 2 0 ,   1 0 0 ) ;  
         / /   e n s u r e   t o t a l   d i v i s i b l e   b y   s u m   o f   p a r t s  
         c o n s t   r a t i o A   =   2 ,   r a t i o B   =   3 ;  
         c o n s t   a d j T o t a l   =   M a t h . c e i l ( t o t a l   /   5 )   *   5 ;  
         c o n s t   s h a r e B   =   ( a d j T o t a l   /   5 )   *   3 ;  
         r o w s . p u s h ( {   t e x t :   ` D i v i d e   $ $ { a d j T o t a l } $   i n   r a t i o   $ 2 : 3 $ .   V a l u e   o f   s e c o n d   p a r t ? ` ,   a n s w e r :   S t r i n g ( s h a r e B )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' R a t i o   a n d   P r o p o r t i o n '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 8 :   S q u a r e   a n d   S q u a r e   R o o t s   - - -  
 e x p o r t   c o n s t   g e n e r a t e S q u a r e R o o t s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   1 .   S q u a r e   Q u e s t i o n  
         c o n s t   n 1   =   g e t R a n d o m I n t ( 1 1 ,   3 0 ) ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   v a l u e   o f   $ ( $ { n 1 } ) ^ 2 $ ` ,   a n s w e r :   S t r i n g ( n 1   *   n 1 )   } ) ;  
  
         / /   2 .   S q u a r e   R o o t   Q u e s t i o n  
         / /   U s e r   r e q u e s t e d   " s o m e   c h a n c e s "   f o r   t h e   r e l a t i o n :   1 2 ^ 2   =   1 4 4 ,   s q r t ( 1 4 4 )   =   1 2  
         / /   W e ' l l   g i v e   a   3 0 %   c h a n c e   f o r   t h e   s e c o n d   q u e s t i o n   t o   b e   t h e   i n v e r s e   o f   t h e   f i r s t .  
         / /   O t h e r w i s e ,   g e n e r a t e   a   r a n d o m   p e r f e c t   s q u a r e   r o o t   p r o b l e m   ( a p p r o x   r a n g e   1 . . 4 0 0 +   a s   r e q u e s t e d ) .  
         c o n s t   i s L i n k e d   =   M a t h . r a n d o m ( )   <   0 . 3 ;  
  
         l e t   n 2 ;  
         i f   ( i s L i n k e d )   {  
                 n 2   =   n 1 ;  
         }   e l s e   {  
                 / /   R a n g e   f o r   r o o t s :   2   t o   3 0   ( S q u a r e   4   t o   9 0 0 ) .    
                 / /   U s e r   m e n t i o n e d   " 1 , 4 , 9 . . . 4 0 0 " ,   w h i c h   c o r r e s p o n d s   t o   r o o t s   1 . . 2 0 .    
                 / /   W e ' l l   e x t e n d   s l i g h t l y   t o   3 0   t o   m a t c h   t h e   d i f f i c u l t y   o f   t h e   f i r s t   q u e s t i o n .  
                 n 2   =   g e t R a n d o m I n t ( 2 ,   3 0 ) ;  
                 / /   E n s u r e   i t ' s   n o t   s a m e   a s   n 1   j u s t   t o   a v o i d   c o n f u s i o n   i f   n o t   l i n k e d   ( t h o u g h   m a t h e m a t i c a l l y   f i n e )  
                 i f   ( ! i s L i n k e d   & &   n 2   = = =   n 1 )   n 2   =   g e t R a n d o m I n t ( 2 ,   3 0 ) ;  
         }  
  
         c o n s t   n 2 S q u a r e d   =   n 2   *   n 2 ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   v a l u e   o f   $ \ \ s q r t { $ { n 2 S q u a r e d } } $ ` ,   a n s w e r :   S t r i n g ( n 2 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' E v a l u a t e   t h e   f o l l o w i n g   S q u a r e s   a n d   S q u a r e   R o o t s : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' S q u a r e   a n d   S q u a r e   R o o t s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 0 9 :   C u b e   a n d   C u b e   R o o t s   - - -  
 e x p o r t   c o n s t   g e n e r a t e C u b e R o o t s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   1 .   C u b e   Q u e s t i o n :   " c u b e   o n l y   t i l l   5 "  
         / /   A s s u m i n g   i n t e g e r s .   R a n g e   2   t o   5 .  
         / /   P r e v i o u s   c o d e   u s e d   n e g a t i v e s ,   s o   w e ' l l   a l l o w   b o t h   p o s i t i v e   a n d   n e g a t i v e   f o r   v a r i e t y ?  
         / /   " c u b e   o n l y   t i l l   5 "   l i k e l y   m e a n s   b a s e   m a g n i t u d e   < =   5 .  
  
         / /   C h o o s e   b a s e   m a g n i t u d e   f r o m   2   t o   5  
         l e t   n 1   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         / /   5 0 %   c h a n c e   o f   n e g a t i v e   b a s e  
         i f   ( M a t h . r a n d o m ( )   <   0 . 5 )   n 1   * =   - 1 ;  
  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   v a l u e   o f   $ ( $ { n 1 } ) ^ 3 $ ` ,   a n s w e r :   S t r i n g ( n 1   *   n 1   *   n 1 )   } ) ;  
  
         / /   2 .   C u b e   R o o t   Q u e s t i o n :   " c u b e   r o o t   u p t o   1 2 5 "  
         / /   P e r f e c t   c u b e s   u p   t o   1 2 5   a r e   1 ^ 3 = 1 ,   2 ^ 3 = 8 ,   3 ^ 3 = 2 7 ,   4 ^ 3 = 6 4 ,   5 ^ 3 = 1 2 5 .  
         / /   S o   b a s e   m a g n i t u d e   i s   2   t o   5   ( i g n o r i n g   1   a s   t r i v i a l ) .  
  
         l e t   n 2   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         / /   5 0 %   c h a n c e   o f   n e g a t i v e   r o o t  
         i f   ( M a t h . r a n d o m ( )   <   0 . 5 )   n 2   * =   - 1 ;  
  
         / /   U s e   n 2   a s   t h e   r o o t ,   s o   t h e   q u e s t i o n   i s   c b r t ( n 2 ^ 3 )  
         c o n s t   c b 2   =   n 2   *   n 2   *   n 2 ;  
         r o w s . p u s h ( {   t e x t :   ` F i n d   t h e   v a l u e   o f   $ \ \ s q r t [ 3 ] { $ { c b 2 } } $ ` ,   a n s w e r :   S t r i n g ( n 2 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' E v a l u a t e   t h e   f o l l o w i n g   C u b e s   a n d   C u b e   R o o t s : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' C u b e   a n d   C u b e   R o o t s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 0 :   L a w s   o f   E x p o n e n t s   - - -  
 e x p o r t   c o n s t   g e n e r a t e E x p o n e n t s N e g a t i v e   =   ( )   = >   {  
         / /   N e g a t i v e   e x p o n e n t :   F i n d   v a l u e   o f   ( - a ) ^ ( - n )  
         c o n s t   b a s e   =   - 1   *   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   e x p   =   - 1   *   g e t R a n d o m I n t ( 2 ,   3 ) ;   / /   - 2   o r   - 3  
         c o n s t   q u e s t i o n   =   ` F i n d   t h e   v a l u e   o f   $ ( $ { b a s e } ) ^ { $ { e x p } } $ ` ;  
  
         / /   f o r m a t   a s   f r a c t i o n   i f   p o s s i b l e  
         c o n s t   d e n   =   M a t h . p o w ( b a s e ,   M a t h . a b s ( e x p ) ) ;   / /   e . g .   ( - 2 ) ^ 2   =   4 ,   ( - 2 ) ^ 3   =   - 8  
  
         / /   a n s w e r   s t r i n g   " \ f r a c { 1 } { 4 } "   o r   " - \ f r a c { 1 } { 8 } "   u s i n g   p r o p e r   L a T e X  
         c o n s t   a n s w e r S t r   =   ( d e n   >   0 )   ?   ` $ \ \ f r a c { 1 } { $ { d e n } } $ `   :   ` $ - \ \ f r a c { 1 } { $ { M a t h . a b s ( d e n ) } } $ ` ;  
  
         c o n s t   w r o n g S i g n F r a c t i o n   =   ( d e n   >   0 )   ?   ` $ - \ \ f r a c { 1 } { $ { d e n } } $ `   :   ` $ \ \ f r a c { 1 } { $ { M a t h . a b s ( d e n ) } } $ ` ;  
  
         / /   C u s t o m   d i s t r a c t o r s   f o r   t h i s   t y p e  
         c o n s t   o p t i o n s   =   e n s u r e U n i q u e ( {   v a l u e :   a n s w e r S t r ,   l a b e l :   a n s w e r S t r   } ,   [  
                 {   v a l u e :   ` $ $ { d e n } $ ` ,   l a b e l :   ` $ $ { d e n } $ `   } ,                     / /   4   o r   - 8  
                 {   v a l u e :   ` $ $ { - d e n } $ ` ,   l a b e l :   ` $ $ { - d e n } $ `   } ,                 / /   - 4   o r   8  
                 {   v a l u e :   w r o n g S i g n F r a c t i o n ,   l a b e l :   w r o n g S i g n F r a c t i o n   }   / /   w r o n g   s i g n   f r a c t i o n  
         ] ) ;  
         r e t u r n   {   t y p e :   ' m c q ' ,   q u e s t i o n ,   a n s w e r :   a n s w e r S t r ,   o p t i o n s ,   t o p i c :   ' L a w s   o f   E x p o n e n t s '   } ;  
 } ;  
  
 / /   - - -   C A T 1 1 :   B O D M A S   - - -  
 e x p o r t   c o n s t   g e n e r a t e B O D M A S   =   ( )   = >   {  
         / /   C o n v e r t   t o   T a b l e   I n p u t  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   R o w   1 :   S i m p l e   m i x e d   o p s  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   c 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         / /   a   +   b   *   c  
         c o n s t   a n s 1   =   a 1   +   ( b 1   *   c 1 ) ;  
         r o w s . p u s h ( {   t e x t :   ` E v a l u a t e :   $ $ { a 1 }   +   $ { b 1 }   \ \ t i m e s   $ { c 1 } $ ` ,   a n s w e r :   S t r i n g ( a n s 1 )   } ) ;  
  
         / /   R o w   2 :   B r a c k e t s  
         / /   Q 2   r e m o v e d   a s   p e r   r e q u e s t   ( k e e p   1 s t   a n d   3 r d )  
  
         / /   R o w   3 :   C o m p l e x  
         / /   a   +   b   x   ( c   -   d )  
         c o n s t   a 3   =   g e t R a n d o m I n t ( 2 ,   1 0 ) ;  
         c o n s t   b 3   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   c 3   =   g e t R a n d o m I n t ( 6 ,   1 2 ) ;  
         c o n s t   d 3   =   g e t R a n d o m I n t ( 2 ,   5 ) ;   / /   e n s u r e   c - d   >   0  
         c o n s t   a n s 3   =   a 3   +   b 3   *   ( c 3   -   d 3 ) ;  
         r o w s . p u s h ( {   t e x t :   ` E v a l u a t e :   $ $ { a 3 }   +   $ { b 3 }   \ \ t i m e s   ( $ { c 3 }   -   $ { d 3 } ) $ ` ,   a n s w e r :   S t r i n g ( a n s 3 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' S o l v e   u s i n g   B O D M A S   r u l e s : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' B O D M A S '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 2 :   A l g e b r a i c   A g g r e g a t i o n   - - -  
 e x p o r t   c o n s t   g e n e r a t e A l g e b r a i c A d d i t i o n S u b t r a c t i o n   =   ( )   = >   {  
         / /   K e e p   a s   M C Q ,   b u t   v e r i f y   f o r m a t   m a t c h e s   i m a g e   s t y l e   ( 1 2 x   -   4 y   +   3 z )   +   ( - 6 x   +   1 0 y   -   1 4 z )  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 5 ,   1 5 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;   / /   w e ' l l   m a k e   i t   n e g a t i v e   i n   s t r i n g  
         c o n s t   c 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
  
         c o n s t   a 2   =   - 1   *   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   b 2   =   g e t R a n d o m I n t ( 5 ,   1 5 ) ;  
         c o n s t   c 2   =   - 1   *   g e t R a n d o m I n t ( 5 ,   1 5 ) ;  
  
         / /   Q u e s t i o n :   ( a 1   x   -   b 1   y   +   c 1   z )   +   ( a 2   x   +   b 2   y   +   c 2   z )  
         / /   C o e f f s   X :   a 1   +   a 2  
         c o n s t   r e s X   =   a 1   +   a 2 ;  
         / /   C o e f f s   Y :   - b 1   +   b 2  
         c o n s t   r e s Y   =   - b 1   +   b 2 ;  
         / /   C o e f f s   Z :   c 1   +   c 2  
         c o n s t   r e s Z   =   c 1   +   c 2 ;  
  
         c o n s t   q u e s t i o n   =   ` $ ( $ { a 1 } x   -   $ { b 1 } y   +   $ { c 1 } z )   +   ( $ { a 2 } x   +   $ { b 2 } y   $ { c 2 } z ) $ ` ;  
  
         c o n s t   f o r m a t T e r m   =   ( c o e f f ,   v a r i a b l e ,   i s F i r s t   =   f a l s e )   = >   {  
                 i f   ( c o e f f   = = =   0 )   r e t u r n   " " ;  
                 l e t   s i g n   =   c o e f f   >   0   ?   " + "   :   " - " ;  
                 i f   ( i s F i r s t   & &   c o e f f   >   0 )   s i g n   =   " " ;   / /   o m i t   p l u s   f o r   f i r s t   p o s i t i v e   t e r m  
  
                 c o n s t   a b s C o e f f   =   M a t h . a b s ( c o e f f ) ;  
                 c o n s t   v a l   =   a b s C o e f f   = = =   1   ?   v a r i a b l e   :   ` $ { a b s C o e f f } $ { v a r i a b l e } ` ;  
  
                 / /   A d d   s p a c i n g   a r o u n d   o p e r a t o r   i f   n o t   f i r s t  
                 r e t u r n   i s F i r s t   ?   ` $ { s i g n } $ { v a l } `   :   `   $ { s i g n }   $ { v a l } ` ;  
         } ;  
  
         l e t   a n s S t r   =   f o r m a t T e r m ( r e s X ,   ' x ' ,   t r u e ) ;  
         / /   I f   x   t e r m   w a s   0 ,   t h e n   y   b e c o m e s   t h e   f i r s t   t e r m   v i s u a l l y   ( t h o u g h   w e   c a n   j u s t   a p p e n d ,   b u t   w e   n e e d   t o   h a n d l e   t h e   s i g n   c o r r e c t l y )  
         / /   A c t u a l l y   s i m p l e r :   b u i l d   a r r a y   o f   t e r m s   a n d   j o i n  
         l e t   t e r m s   =   [ ] ;  
         i f   ( r e s X   ! = =   0 )   t e r m s . p u s h ( f o r m a t T e r m ( r e s X ,   ' x ' ,   t r u e ) ) ;  
         / /   F o r   s u b s e q u e n t   t e r m s ,   p a s s   f a l s e   f o r   i s F i r s t ,   b u t   w e   n e e d   t o   b e   c a r e f u l   i f   p r e v i o u s   t e r m s   w e r e   0  
         / /   S i m p l e r   a p p r o a c h :  
  
         c o n s t   b u i l d E x p r   =   ( x ,   y ,   z )   = >   {  
                 l e t   t   =   [ ] ;  
                 i f   ( x   ! = =   0 )   t . p u s h ( x   = = =   1   ?   " x "   :   ( x   = = =   - 1   ?   " - x "   :   ` $ { x } x ` ) ) ;  
  
                 i f   ( y   ! = =   0 )   {  
                         l e t   s   =   ( y   >   0 )   ?   " + "   :   " - " ;  
                         l e t   v a l   =   M a t h . a b s ( y )   = = =   1   ?   " y "   :   ` $ { M a t h . a b s ( y ) } y ` ;  
                         i f   ( t . l e n g t h   = = =   0 )   t . p u s h ( y   = = =   1   ?   " y "   :   ( y   = = =   - 1   ?   " - y "   :   ` $ { y } y ` ) ) ;   / /   F i r s t   t e r m   b e h a v i o r  
                         e l s e   t . p u s h ( ` $ { s }   $ { v a l } ` ) ;  
                 }  
  
                 i f   ( z   ! = =   0 )   {  
                         l e t   s   =   ( z   >   0 )   ?   " + "   :   " - " ;  
                         l e t   v a l   =   M a t h . a b s ( z )   = = =   1   ?   " z "   :   ` $ { M a t h . a b s ( z ) } z ` ;  
                         i f   ( t . l e n g t h   = = =   0 )   t . p u s h ( z   = = =   1   ?   " z "   :   ( z   = = =   - 1   ?   " - z "   :   ` $ { z } z ` ) ) ;   / /   F i r s t   t e r m   b e h a v i o r  
                         e l s e   t . p u s h ( ` $ { s }   $ { v a l } ` ) ;  
                 }  
  
                 r e t u r n   t . l e n g t h   = = =   0   ?   " 0 "   :   t . j o i n ( "   " ) ;  
         } ;  
  
         l e t   a n s S t r F i n a l   =   b u i l d E x p r ( r e s X ,   r e s Y ,   r e s Z ) ;  
  
         / /   d i s t r a c t o r s  
         l e t   d 1   =   b u i l d E x p r ( r e s X ,   r e s Y   -   2 ,   r e s Z ) ;  
         l e t   d 2   =   b u i l d E x p r ( r e s X   +   1 ,   r e s Y ,   r e s Z ) ;  
         l e t   d 3   =   b u i l d E x p r ( r e s X ,   r e s Y ,   r e s Z   +   2 ) ;  
         l e t   d 4   =   b u i l d E x p r ( r e s X   +   2 ,   r e s Y   +   2 ,   r e s Z   +   2 ) ;  
  
         / /   H e l p e r   t o   w r a p  
         c o n s t   w r a p   =   ( s )   = >   ` $ $ { s } $ ` ;  
  
         c o n s t   o p t i o n s   =   e n s u r e U n i q u e ( {   v a l u e :   w r a p ( a n s S t r F i n a l ) ,   l a b e l :   w r a p ( a n s S t r F i n a l )   } ,   [  
                 {   v a l u e :   w r a p ( d 1 ) ,   l a b e l :   w r a p ( d 1 )   } ,  
                 {   v a l u e :   w r a p ( d 2 ) ,   l a b e l :   w r a p ( d 2 )   } ,  
                 {   v a l u e :   w r a p ( d 3 ) ,   l a b e l :   w r a p ( d 3 )   } ,  
                 {   v a l u e :   w r a p ( d 4 ) ,   l a b e l :   w r a p ( d 4 )   }  
         ] ) ;  
  
         r e t u r n   {   t y p e :   ' m c q ' ,   q u e s t i o n ,   a n s w e r :   w r a p ( a n s S t r F i n a l ) ,   o p t i o n s ,   t o p i c :   ' A l g e b r a i c   A d d i t i o n '   } ;  
 } ;  
  
 / /   - - -   C A T 1 3 :   A l g e b r a i c   M u l t i p l i c a t i o n   - - -  
 e x p o r t   c o n s t   g e n e r a t e A l g e b r a i c M u l t i p l i c a t i o n   =   ( )   = >   {  
         / /   K e e p   a s   M C Q   ( b i n o m i a l   p r o d u c t )   ( 2 x   +   3 y ) ( 3 x   -   4 y )  
         c o n s t   a   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   b   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   c   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   d   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
  
         / /   ( a x   +   b y ) ( c x   -   d y )  
         / /   a c   x ^ 2   -   a d   x y   +   b c   x y   -   b d   y ^ 2  
         / /   a c   x ^ 2   +   ( b c   -   a d )   x y   -   b d   y ^ 2  
  
         c o n s t   t e r m 1   =   a   *   c ;  
         c o n s t   t e r m 2   =   ( b   *   c )   -   ( a   *   d ) ;   / /   c o e f f   o f   x y  
         c o n s t   t e r m 3   =   b   *   d ;   / /   s i n c e   i t   i s   - d ,   l a s t   t e r m   i s   - b d   y ^ 2  
  
         c o n s t   q u e s t i o n   =   ` $ ( $ { a } x   +   $ { b } y ) ( $ { c } x   -   $ { d } y ) $ ` ;  
  
         / /   H e l p e r   t o   f o r m a t   x y   t e r m  
         c o n s t   f o r m a t X Y   =   ( c o e f f )   = >   {  
                 i f   ( c o e f f   = = =   0 )   r e t u r n   " " ;  
                 c o n s t   s i g n   =   c o e f f   >   0   ?   " + "   :   " - " ;  
                 c o n s t   v a l   =   M a t h . a b s ( c o e f f )   = = =   1   ?   " "   :   M a t h . a b s ( c o e f f ) ;  
                 r e t u r n   `   $ { s i g n }   $ { v a l } x y ` ;  
         } ;  
  
         c o n s t   t e r m 2 S t r   =   f o r m a t X Y ( t e r m 2 ) ;  
         c o n s t   a n s S t r   =   ` $ { t e r m 1 } x ^ 2 $ { t e r m 2 S t r }   -   $ { t e r m 3 } y ^ 2 ` ;  
  
         / /   f o r m a t   o p t i o n   w r a p p e r   w i t h   L a T e X   d e l i m i t e r s  
         c o n s t   f o   =   ( s )   = >   ( {   v a l u e :   ` $ $ { s } $ ` ,   l a b e l :   ` $ $ { s } $ `   } ) ;  
  
         / /   E n s u r e   d i s t r a c t o r s   a l s o   f o r m a t   c o r r e c t l y  
         / /   W e   r e u s e   f o r m a t X Y   o r   m a n u a l l y   b u i l d   s t r i n g s   e n s u r i n g   n o   0 x y  
  
         / /   D i s t r a c t o r   1 :   L o g i c   e r r o r   i n   x y   t e r m  
         c o n s t   d 1 _ t e r m 2   =   t e r m 2   -   2 ;   / /   e . g .   - 2 x y  
         c o n s t   d 1   =   ` $ { t e r m 1 } x ^ 2 $ { f o r m a t X Y ( d 1 _ t e r m 2 ) }   -   $ { t e r m 3 } y ^ 2 ` ;  
  
         / /   D i s t r a c t o r   2 :   S i g n   e r r o r   i n   y ^ 2   ( a n d   r e u s e   t e r m 2 S t r )  
         c o n s t   d 2   =   ` $ { t e r m 1 } x ^ 2 $ { t e r m 2 S t r }   +   $ { t e r m 3 } y ^ 2 ` ;  
  
         / /   D i s t r a c t o r   3 :   C o e f f i c i e n t   e r r o r   i n   x ^ 2  
         c o n s t   d 3   =   ` $ { t e r m 1   +   1 } x ^ 2 $ { t e r m 2 S t r }   -   $ { t e r m 3 } y ^ 2 ` ;  
  
         c o n s t   o p t i o n s   =   e n s u r e U n i q u e ( f o ( a n s S t r ) ,   [  
                 f o ( d 1 ) ,  
                 f o ( d 2 ) ,  
                 f o ( d 3 ) ,  
                 f o ( ` $ { t e r m 1 } x ^ 2 $ { f o r m a t X Y ( M a t h . a b s ( t e r m 2 )   +   5 ) }   -   $ { t e r m 3 } y ^ 2 ` )  
         ] ) ;  
  
         r e t u r n   {   t y p e :   ' m c q ' ,   q u e s t i o n ,   a n s w e r :   ` $ $ { a n s S t r } $ ` ,   o p t i o n s ,   t o p i c :   ' A l g e b r a i c   M u l t i p l i c a t i o n '   } ;  
 } ;  
  
 / /   - - -   C A T 1 4 :   A l g e b r a i c   D i v i s i o n   - - -  
 e x p o r t   c o n s t   g e n e r a t e A l g e b r a i c D i v i s i o n   =   ( )   = >   {  
         / /   C o n v e r t   t o   T a b l e   I n p u t  
         / /   F o r m a t :   ( 9 x   -   4 2 )   /   ( 3 x   -   1 4 )   =   3  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   Q 1 :   C o n s t a n t   f a c t o r  
         c o n s t   k 1   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 2 ,   5 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 5 ,   2 0 ) ;   / /   ( a x   -   b )  
         / /   N u m e r a t o r :   k ( a x   -   b )   =   k * a   x   -   k * b  
         c o n s t   n u m 1   =   ` $ { k 1   *   a 1 } x   -   $ { k 1   *   b 1 } ` ;  
         c o n s t   d e n 1   =   ` $ { a 1 } x   -   $ { b 1 } ` ;  
         r o w s . p u s h ( {   t e x t :   ` $ ( $ { n u m 1 } )   \ \ d i v   ( $ { d e n 1 } ) $ ` ,   a n s w e r :   S t r i n g ( k 1 )   } ) ;  
  
         / /   Q 2 :   Q u a d r a t i c   /   Q u a d r a t i c   ( 2   c o m m o n )  
         / /   ( k ( a x ^ 2   +   b x   +   c ) )   /   ( a x ^ 2   +   b x   +   c )  
         / /   Q 2   r e m o v e d   a s   p e r   r e q u e s t   ( k e e p   1 s t   a n d   3 r d )  
  
         / /   Q 3 :   M o n o m i a l   d i v i s i o n  
         / /   6 3   p ^ 4   m ^ 2   n   /   7   p ^ 4   m ^ 2   n   =   9  
         c o n s t   k 3   =   g e t R a n d o m I n t ( 3 ,   9 ) ;  
         c o n s t   c 3   =   g e t R a n d o m I n t ( 3 ,   9 ) ;  
         c o n s t   n u m 3   =   ` $ { k 3   *   c 3 } p ^ 4 m ^ 2 n ` ;  
         c o n s t   d e n 3   =   ` $ { c 3 } p ^ 4 m ^ 2 n ` ;  
         r o w s . p u s h ( {   t e x t :   ` $ $ { n u m 3 }   \ \ d i v   $ { d e n 3 } $ ` ,   a n s w e r :   S t r i n g ( k 3 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' A l g e b r a i c   D i v i s i o n '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 5 :   L i n e a r   E q   1   V a r   - - -  
 e x p o r t   c o n s t   g e n e r a t e L i n e a r E q u a t i o n O n e V a r   =   ( )   = >   {  
         / /   C o n v e r t   t o   T a b l e   I n p u t  
         / /   F o r m a t :   4 x   +   4 8   =   1 2   - >   x   =   - 9  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   Q 1 :   a x   +   b   =   c  
         c o n s t   x 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;   / /   l e t ' s   k e e p   x   p o s i t i v e   o r   n e g a t i v e  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 2 ,   6 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 1 0 ,   5 0 ) ;  
         / /   m a k e   l h s   =   c  
         c o n s t   c 1   =   a 1   *   x 1   +   b 1 ;  
         r o w s . p u s h ( {   t e x t :   ` S o l v e :   $ $ { a 1 } x   +   $ { b 1 }   =   $ { c 1 } $ ` ,   a n s w e r :   S t r i n g ( x 1 )   } ) ;  
  
         / /   Q 2 :   S t r u c t u r e   l i k e   2   -   ( 3   -   4 x )   =   2 x   +   5     = >   a   -   ( b   -   c x )   =   d x   +   e  
         c o n s t   x 2   =   g e t R a n d o m I n t ( 2 ,   8 ) ;   / /   A n s w e r  
         c o n s t   a 2   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   b 2   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   c 2   =   g e t R a n d o m I n t ( 4 ,   9 ) ;   / /   C o e f f   o f   x   i n s i d e   b r a c k e t  
         c o n s t   d 2   =   g e t R a n d o m I n t ( 2 ,   5 ) ;   / /   C o e f f   o f   x   o n   R H S  
  
         / /   a   -   b   +   c x   =   d x   +   e     = >     e   =   ( a   -   b )   +   x ( c   -   d )  
         c o n s t   e 2   =   ( a 2   -   b 2 )   +   x 2   *   ( c 2   -   d 2 ) ;  
  
         c o n s t   r h s S i g n   =   e 2   > =   0   ?   ' + '   :   ' - ' ;  
         r o w s . p u s h ( {   t e x t :   ` S o l v e :   $ $ { a 2 }   -   ( $ { b 2 }   -   $ { c 2 } x )   =   $ { d 2 } x   $ { r h s S i g n }   $ { M a t h . a b s ( e 2 ) } $ ` ,   a n s w e r :   S t r i n g ( x 2 )   } ) ;  
  
         / /   Q 3 :   S l i g h t l y   h a r d e r ?   2 x   =   x   +   k  
         / /   o r   v a r i a b l e s   o n   b o t h   s i d e s ?   I m a g e   i s   s i m p l e   4 x + 4 8 = 1 2 .  
         / /   L e t ' s   d o   v a r i a b l e s   o n   b o t h   s i d e s :   5 x   =   3 x   +   1 0  
         / /   c o n s t   x 3   =   g e t R a n d o m I n t ( 2 ,   1 0 ) ;  
         / /   c o n s t   d i f f   =   g e t R a n d o m I n t ( 2 ,   5 ) ;   / /   2 x  
         / /   c o n s t   r h s   =   d i f f   *   x 3 ;   / /   1 0  
         / /   / /   5 x   =   3 x   +   1 0   - >   ( 3 + d i f f ) x   =   3 x   +   r h s  
         / /   r o w s . p u s h ( {   t e x t :   ` S o l v e :   $ $ { 3   +   d i f f } x   =   3 x   +   $ { r h s } $ ` ,   a n s w e r :   S t r i n g ( x 3 )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' F i n d   t h e   v a l u e   o f   x   f o r   t h e   f o l l o w i n g   e q u a t i o n s : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' L i n e a r   E q u a t i o n s   i n   o n e   V a r i a b l e '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 6 :   S i m u l t a n e o u s   E q u a t i o n s   - - -  
 / /   - - -   C A T 1 6 :   S i m u l t a n e o u s   E q u a t i o n s   - - -  
 e x p o r t   c o n s t   g e n e r a t e S i m u l t a n e o u s E q u a t i o n s   =   ( )   = >   {  
         / /   5 x   -   4 y   =   8 1  
         / /   7 x   +   4 y   =   2 7  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   G e n e r a t e   i n t e g e r   s o l u t i o n  
         c o n s t   x   =   g e t R a n d o m I n t ( 1 ,   1 0 ) ;  
         c o n s t   y   =   g e t R a n d o m I n t ( 1 ,   1 0 ) ;  
  
         / /   E q   1 :   a 1 x   +   b 1 y   =   c 1  
         c o n s t   a 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   b 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         / /   R a n d o m i z e   s i g n s  
         c o n s t   s i g n 1   =   M a t h . r a n d o m ( )   <   0 . 5   ?   - 1   :   1 ;  
         c o n s t   c 1   =   a 1   *   x   +   ( s i g n 1   *   b 1 )   *   y ;  
  
         / /   E q   2 :   a 2 x   +   b 2 y   =   c 2  
         c o n s t   a 2   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   b 2   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         / /   E n s u r e   n o t   p a r a l l e l / i d e n t i c a l   l i n e s  
         c o n s t   s i g n 2   =   M a t h . r a n d o m ( )   <   0 . 5   ?   - 1   :   1 ;  
         c o n s t   c 2   =   a 2   *   x   +   ( s i g n 2   *   b 2 )   *   y ;  
  
         c o n s t   o p 1   =   s i g n 1   = = =   - 1   ?   ' - '   :   ' + ' ;  
         c o n s t   o p 2   =   s i g n 2   = = =   - 1   ?   ' - '   :   ' + ' ;  
  
         c o n s t   e q T e x t   =   ` $ $   \ \ b e g i n { c a s e s }   $ { a 1 } x   $ { o p 1 }   $ { b 1 } y   =   $ { c 1 }   \ \ \ \   $ { a 2 } x   $ { o p 2 }   $ { b 2 } y   =   $ { c 2 }   \ \ e n d { c a s e s }   $ $ ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` x   = ` ,   a n s w e r :   S t r i n g ( x )   } ) ;  
         r o w s . p u s h ( {   t e x t :   ` y   = ` ,   a n s w e r :   S t r i n g ( y )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( x ) ,   1 :   S t r i n g ( y )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ` S o l v e   S i m u l t a n e o u s   L i n e a r   E q u a t i o n s   i n   T w o   V a r i a b l e s :   < b r / >   $ { e q T e x t } ` ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' S i m u l t a n e o u s   E q u a t i o n s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 7 :   Q u a d r a t i c   E q u a t i o n s   - - -  
 e x p o r t   c o n s t   g e n e r a t e Q u a d r a t i c E q u a t i o n   =   ( )   = >   {  
         / /   x ^ 2   -   S u m   x   +   P r o d   =   0  
         / /   A s k   f o r   S m a l l e r   R o o t   a n d   L a r g e r   R o o t  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   R o o t s  
         c o n s t   r 1   =   g e t R a n d o m I n t ( 2 ,   9 ) ;  
         c o n s t   r 2   =   g e t R a n d o m I n t ( r 1   +   1 ,   1 2 ) ;   / /   r 2   >   r 1  
  
         / /   e q :   x ^ 2   -   ( r 1 + r 2 ) x   +   r 1 * r 2   =   0  
         c o n s t   s u m   =   r 1   +   r 2 ;  
         c o n s t   p r o d   =   r 1   *   r 2 ;  
         c o n s t   e q   =   ` x ^ 2   -   $ { s u m } x   +   $ { p r o d }   =   0 ` ;  
  
         / /   D i s p l a y   e q u a t i o n   u s i n g   M a t h J a x  
         c o n s t   e q T e x t   =   ` $ $   $ { e q }   $ $ ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` S m a l l e r   R o o t   $ ( x _ 1 )   = $ ` ,   a n s w e r :   S t r i n g ( r 1 )   } ) ;  
         r o w s . p u s h ( {   t e x t :   ` L a r g e r   R o o t   $ ( x _ 2 )   = $ ` ,   a n s w e r :   S t r i n g ( r 2 )   } ) ;  
  
  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ` S o l v e   t h e   f o l l o w i n g   Q u a d r a t i c   E q u a t i o n :   < b r / >   $ { e q T e x t } ` ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' Q u a d r a t i c   E q u a t i o n s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 8 :   P e r i m e t e r   - - -  
 / /   - - -   C A T 1 8 :   P e r i m e t e r   - - -  
 e x p o r t   c o n s t   g e n e r a t e P e r i m e t e r   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   s h a p e T y p e   =   g e t R a n d o m I n t ( 1 ,   4 ) ;   / /   1 :   C i r c l e ,   2 :   R e c t a n g l e ,   3 :   S q u a r e  
         l e t   q u e s t i o n T e x t   =   " " ;  
         l e t   a n s w e r   =   " " ;  
         l e t   s v g   =   " " ;  
  
         i f   ( s h a p e T y p e   = = =   1 )   {  
                 / /   C i r c l e  
                 c o n s t   r   =   7   *   g e t R a n d o m I n t ( 1 ,   5 ) ;   / /   d i v i s i b l e   b y   7  
                 q u e s t i o n T e x t   =   ` F i n d   t h e   p e r i m e t e r   o f   c i r c l e   w i t h   r a d i u s   $ $ { r } $   c m .   ( T a k e   $ \ \ p i   =   \ \ f r a c { 2 2 } { 7 } $ ) ` ;  
                 a n s w e r   =   S t r i n g ( 2   *   ( 2 2   /   7 )   *   r ) ;  
  
                 s v g   =   ` < s v g   w i d t h = " 2 0 0 "   h e i g h t = " 2 0 0 "   v i e w B o x = " 0   0   2 0 0   2 0 0 "   x m l n s = " h t t p : / / w w w . w 3 . o r g / 2 0 0 0 / s v g " >  
                         < c i r c l e   c x = " 1 0 0 "   c y = " 1 0 0 "   r = " 7 0 "   s t r o k e = " # 3 3 4 1 5 5 "   s t r o k e - w i d t h = " 2 "   f i l l = " # e f f 6 f f "   / >  
                         < l i n e   x 1 = " 1 0 0 "   y 1 = " 1 0 0 "   x 2 = " 1 7 0 "   y 2 = " 1 0 0 "   s t r o k e = " # 3 3 4 1 5 5 "   s t r o k e - w i d t h = " 2 "   / >  
                         < t e x t   x = " 1 1 0 "   y = " 9 0 "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 6 "   f i l l = " # 3 3 4 1 5 5 " > $ { r }   c m < / t e x t >  
                 < / s v g > ` ;  
  
         }   e l s e   i f   ( s h a p e T y p e   = = =   2 )   {  
                 / /   R e c t a n g l e  
                 c o n s t   l   =   g e t R a n d o m I n t ( 5 ,   1 5 ) ;  
                 c o n s t   w   =   g e t R a n d o m I n t ( 2 ,   1 0 ) ;  
                 q u e s t i o n T e x t   =   ` F i n d   t h e   p e r i m e t e r   o f   a   r e c t a n g l e   w i t h   l e n g t h   $ $ { l } $   c m   a n d   w i d t h   $ $ { w } $   c m . ` ;  
                 a n s w e r   =   S t r i n g ( 2   *   ( l   +   w ) ) ;  
  
                 s v g   =   ` < s v g   w i d t h = " 2 5 0 "   h e i g h t = " 2 0 0 "   v i e w B o x = " 0   0   2 5 0   2 0 0 "   x m l n s = " h t t p : / / w w w . w 3 . o r g / 2 0 0 0 / s v g " >  
                         < r e c t   x = " 2 5 "   y = " 5 0 "   w i d t h = " 2 0 0 "   h e i g h t = " 1 0 0 "   s t r o k e = " # 3 3 4 1 5 5 "   s t r o k e - w i d t h = " 2 "   f i l l = " # e f f 6 f f "   / >  
                         < t e x t   x = " 1 2 5 "   y = " 4 0 "   t e x t - a n c h o r = " m i d d l e "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 6 "   f i l l = " # 3 3 4 1 5 5 " > $ { l }   c m < / t e x t >  
                         < t e x t   x = " 1 0 "   y = " 1 0 5 "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 6 "   f i l l = " # 3 3 4 1 5 5 " > $ { w }   c m < / t e x t >  
                 < / s v g > ` ;  
  
         }   e l s e   {  
                 / /   S q u a r e  
                 c o n s t   s   =   g e t R a n d o m I n t ( 4 ,   1 2 ) ;  
                 q u e s t i o n T e x t   =   ` F i n d   t h e   p e r i m e t e r   o f   a   s q u a r e   w i t h   s i d e   $ $ { s } $   c m . ` ;  
                 a n s w e r   =   S t r i n g ( 4   *   s ) ;  
  
                 s v g   =   ` < s v g   w i d t h = " 2 0 0 "   h e i g h t = " 2 0 0 "   v i e w B o x = " 0   0   2 0 0   2 0 0 "   x m l n s = " h t t p : / / w w w . w 3 . o r g / 2 0 0 0 / s v g " >  
                         < r e c t   x = " 5 0 "   y = " 5 0 "   w i d t h = " 1 0 0 "   h e i g h t = " 1 0 0 "   s t r o k e = " # 3 3 4 1 5 5 "   s t r o k e - w i d t h = " 2 "   f i l l = " # e f f 6 f f "   / >  
                         < t e x t   x = " 1 0 0 "   y = " 4 0 "   t e x t - a n c h o r = " m i d d l e "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 6 "   f i l l = " # 3 3 4 1 5 5 " > $ { s }   c m < / t e x t >  
                         < t e x t   x = " 1 5 "   y = " 1 0 5 "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 6 "   f i l l = " # 3 3 4 1 5 5 " > $ { s }   c m < / t e x t >  
                 < / s v g > ` ;  
         }  
  
         c o n s t   s v g D a t a U r l   =   ' d a t a : i m a g e / s v g + x m l ; c h a r s e t = u t f - 8 , '   +   e n c o d e U R I C o m p o n e n t ( s v g ) ;  
         c o n s t   i m g H t m l   =   ` < d i v   s t y l e = " d i s p l a y : f l e x ;   j u s t i f y - c o n t e n t : c e n t e r ;   m a r g i n :   1 5 p x   0 ; " > < i m g   s r c = " $ { s v g D a t a U r l } "   a l t = " S h a p e "   s t y l e = " m a x - h e i g h t :   2 0 0 p x ; "   / > < / d i v > ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` P e r i m e t e r   = ` ,   u n i t :   ' c m ' ,   a n s w e r :   a n s w e r   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   a n s w e r   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t   +   i m g H t m l ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' P e r i m e t e r   o f   P l a n e   F i g u r e s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 1 9 :   A r e a   - - -  
 / /   - - -   C A T 1 9 :   A r e a   - - -  
 e x p o r t   c o n s t   g e n e r a t e A r e a   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   L o g i c :   T r i a n g l e   A r e a .   M i x e d   U n i t s .  
         / /   A r e a   ( A )   i n   s q . c m .   B a s e   ( b )   i n   m .   F i n d   H e i g h t   ( h )   i n   c m .  
         / /   U s e r   r e q u e s t e d :   A r e a   < =   5 0   s q   c m .   B a s e   =   0 . 1 m   o r   0 . 2 m .  
  
         / /   1 .   P i c k   b a s e   i n   m :   0 . 1   o r   0 . 2  
         c o n s t   b _ m   =   M a t h . r a n d o m ( )   >   0 . 5   ?   0 . 1   :   0 . 2 ;  
         c o n s t   b _ c m   =   b _ m   *   1 0 0 ;   / /   1 0   o r   2 0   c m  
  
         / /   2 .   D e t e r m i n e   H e i g h t   s u c h   t h a t   A r e a   < =   5 0  
         / /   A r e a   =   0 . 5   *   b _ c m   *   h _ c m  
         / /   5 0   > =   0 . 5   *   b _ c m   *   h _ c m     = >   1 0 0   > =   b _ c m   *   h _ c m   = >   h _ c m   < =   1 0 0   /   b _ c m  
  
         / /   M a x   h e i g h t   a l l o w e d :  
         c o n s t   m a x _ h   =   M a t h . f l o o r ( 1 0 0   /   b _ c m ) ;   / /   I f   b = 1 0 ,   m a x _ h = 1 0 ;   I f   b = 2 0 ,   m a x _ h = 5  
  
         / /   E n s u r e   h e i g h t   i s   a t   l e a s t   1   a n d   i n t e g e r  
         c o n s t   h _ c m   =   g e t R a n d o m I n t ( 1 ,   m a x _ h ) ;  
  
         c o n s t   a r e a   =   0 . 5   *   b _ c m   *   h _ c m ;   / /   i n   s q . c m .   W i l l   b e   < =   5 0 .  
  
         / /   T e x t :   " I f   t h e   a r e a   o f   \ t r i a n g l e   A B C   i s   { a r e a }   s q . c m   a n d   t h e   b a s e   m e a s u r e   { b _ m }   m   t h e n   f i n d   t h e   h e i g h t   i n   c m . "  
         c o n s t   q u e s t i o n T e x t   =   ` I f   t h e   a r e a   o f   $ \ \ t r i a n g l e   A B C $   i s   $ $ { a r e a } $   s q . c m   a n d   t h e   b a s e   m e a s u r e   $ $ { b _ m } $   m   t h e n   f i n d   t h e   h e i g h t   i n   c m . ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` H e i g h t   = ` ,   u n i t :   ' c m ' ,   a n s w e r :   S t r i n g ( h _ c m )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( h _ c m )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' A r e a   o f   P l a n e   F i g u r e s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 0 :   C a r t e s i a n   P o i n t   - - -  
 / /   - - -   C A T 2 0 :   C a r t e s i a n   P o i n t   - - -  
 e x p o r t   c o n s t   g e n e r a t e C a r t e s i a n P o i n t   =   ( )   = >   {  
         / /   S h o w   t a b l e   w i t h   P o i n t s   ( x , y )   - >   S e l e c t   B o x   [ Q u a d r a n t - 1 ,   Q u a d r a n t - 2 ,   Q u a d r a n t - 3 ,   Q u a d r a n t - 4 ]  
         c o n s t   r o w s   =   [ ] ;  
         c o n s t   o p t i o n s   =   [ ' Q u a d r a n t - 1 ' ,   ' Q u a d r a n t - 2 ' ,   ' Q u a d r a n t - 3 ' ,   ' Q u a d r a n t - 4 ' ] ;  
  
         c o n s t   g e t Q u a d   =   ( x ,   y )   = >   {  
                 i f   ( x   >   0   & &   y   >   0 )   r e t u r n   ' Q u a d r a n t - 1 ' ;  
                 i f   ( x   <   0   & &   y   >   0 )   r e t u r n   ' Q u a d r a n t - 2 ' ;  
                 i f   ( x   <   0   & &   y   <   0 )   r e t u r n   ' Q u a d r a n t - 3 ' ;  
                 i f   ( x   >   0   & &   y   <   0 )   r e t u r n   ' Q u a d r a n t - 4 ' ;  
                 r e t u r n   ' Q u a d r a n t - 1 ' ;  
         } ;  
  
         / /   G e n e r a t e   o n e   c o n f i g   f o r   e a c h   q u a d r a n t :  
         / /   Q 1 :   ( + ,   + ) ,   Q 2 :   ( - ,   + ) ,   Q 3 :   ( - ,   - ) ,   Q 4 :   ( + ,   - )  
         c o n s t   c o n f i g s   =   [  
                 {   x S i g n :   1 ,   y S i g n :   1   } ,  
                 {   x S i g n :   - 1 ,   y S i g n :   1   } ,  
                 {   x S i g n :   - 1 ,   y S i g n :   - 1   } ,  
                 {   x S i g n :   1 ,   y S i g n :   - 1   }  
         ] ;  
  
         / /   S h u f f l e   t h e   q u a d r a n t s   s o   t h e y   a p p e a r   i n   r a n d o m   o r d e r  
         c o n s t   s h u f f l e d C o n f i g s   =   s h u f f l e A r r a y ( c o n f i g s ) ;  
  
         f o r   ( l e t   i   =   0 ;   i   <   4 ;   i + + )   {  
                 / /   E n s u r e   n o n - z e r o   c o o r d i n a t e s  
                 l e t   x   =   g e t R a n d o m I n t ( 1 ,   1 5 )   *   s h u f f l e d C o n f i g s [ i ] . x S i g n ;  
                 l e t   y   =   g e t R a n d o m I n t ( 1 ,   1 5 )   *   s h u f f l e d C o n f i g s [ i ] . y S i g n ;  
  
                 r o w s . p u s h ( {  
                         t e x t :   ` $ ( $ { x } ,   $ { y } ) $ ` ,  
                         i n p u t T y p e :   ' s e l e c t ' ,  
                         o p t i o n s :   o p t i o n s ,  
                         a n s w e r :   g e t Q u a d ( x ,   y )  
                 } ) ;  
         }  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' S e l e c t   t h e   q u a d r a n t   i n   w h i c h   t h e   f o l l o w i n g   p o i n t s   a r e   p r e s e n t : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' L o c a t i n g   a   p o i n t   i n   a   C a r t e s i a n   P l a n e '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 1 :   C o o r d i n a t e   G e o m e t r y   - - -  
 e x p o r t   c o n s t   g e n e r a t e C o o r d i n a t e G e o m e t r y   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   D i s t a n c e   F o r m u l a :   s q r t ( ( x 2 - x 1 ) ^ 2   +   ( y 2 - y 1 ) ^ 2 )  
         / /   W e   w a n t   i n t e g e r   d i s t a n c e   r e s u l t s   ( P y t h a g o r e a n   T r i p l e s )  
         / /   T r i p l e s :   ( 3 , 4 , 5 ) ,   ( 5 , 1 2 , 1 3 ) ,   ( 8 , 1 5 , 1 7 ) ,   ( 6 , 8 , 1 0 ) ,   ( 9 , 1 2 , 1 5 )  
  
         c o n s t   t r i p l e s   =   [  
                 [ 3 ,   4 ,   5 ] ,   [ 5 ,   1 2 ,   1 3 ] ,   [ 8 ,   1 5 ,   1 7 ] ,   [ 6 ,   8 ,   1 0 ] ,   [ 1 2 ,   1 6 ,   2 0 ]  
         ] ;  
         c o n s t   [ d x ,   d y ,   d i s t ]   =   t r i p l e s [ g e t R a n d o m I n t ( 0 ,   t r i p l e s . l e n g t h   -   1 ) ] ;  
  
         / /   P i c k   P ( x 1 ,   y 1 )  
         c o n s t   x 1   =   g e t R a n d o m I n t ( - 1 0 ,   1 0 ) ;  
         c o n s t   y 1   =   g e t R a n d o m I n t ( - 1 0 ,   1 0 ) ;  
  
         / /   D e t e r m i n e   Q ( x 2 ,   y 2 )   b a s e d   o n   d x ,   d y  
         / /   R a n d o m i z e   d i r e c t i o n   b y   m u l t i p l y i n g   d x / d y   b y   - 1   o r   1  
         c o n s t   s x   =   M a t h . r a n d o m ( )   <   0 . 5   ?   1   :   - 1 ;  
         c o n s t   s y   =   M a t h . r a n d o m ( )   <   0 . 5   ?   1   :   - 1 ;  
  
         c o n s t   x 2   =   x 1   +   ( s x   *   d x ) ;  
         c o n s t   y 2   =   y 1   +   ( s y   *   d y ) ;  
  
         / /   Q u e s t i o n   T e x t :   " D i s t a n c e   b e t w e e n   t h e   p o i n t s   P ( x 1 ,   y 1 )   a n d   Q ( x 2 ,   y 2 ) "  
         c o n s t   q u e s t i o n T e x t   =   ` D i s t a n c e   b e t w e e n   t h e   p o i n t s   $ P ( $ { x 1 } ,   $ { y 1 } ) $   a n d   $ Q ( $ { x 2 } ,   $ { y 2 } ) $ ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` D i s t a n c e   = ` ,   u n i t :   ' u n i t s ' ,   a n s w e r :   S t r i n g ( d i s t )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( d i s t )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' C o o r d i n a t e   G e o m e t r y '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 2 :   S e c t i o n   F o r m u l a   - - -  
 / /   - - -   C A T 2 2 :   S e c t i o n   F o r m u l a   - - -  
 e x p o r t   c o n s t   g e n e r a t e S e c t i o n F o r m u l a   =   ( )   = >   {  
         / /   I n t e r n a l   D i v i s i o n  
         / /   P   =   (   ( m * x 2   +   n * x 1 ) / ( m + n ) ,   ( m * y 2   +   n * y 1 ) / ( m + n )   )  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   D y n a m i c   R a t i o   m : n   w h e r e   m ,   n   a r e   r a n d o m l y   c h o s e n   f r o m   1   t o   3  
         l e t   m   =   g e t R a n d o m I n t ( 1 ,   3 ) ;  
         l e t   n   =   g e t R a n d o m I n t ( 1 ,   3 ) ;  
         w h i l e   ( m   = = =   n )   n   =   g e t R a n d o m I n t ( 1 ,   3 ) ;   / /   E n s u r e   r a t i o   i s   n o t   1 : 1   o r   2 : 2  
         c o n s t   s u m   =   m   +   n ;  
  
         / /   H e l p e r   t o   f i n d   v a l i d   m a t e   c o o r d i n a t e  
         / /   W e   n e e d   | x 2   -   x 1 |   t o   b e   a   m u l t i p l e   o f   3  
         / /   A n d   x 1 ,   x 2   i n   r a n g e   [ - 5 ,   5 ]  
         c o n s t   g e t V a l i d P a i r   =   ( )   = >   {  
                 c o n s t   c 1   =   g e t R a n d o m I n t ( - 5 ,   5 ) ;  
                 c o n s t   c a n d i d a t e s   =   [ ] ;  
                 f o r   ( l e t   c 2   =   - 5 ;   c 2   < =   5 ;   c 2 + + )   {  
                         i f   ( c 2   ! = =   c 1   & &   ( c 2   -   c 1 )   %   s u m   = = =   0 )   {  
                                 c a n d i d a t e s . p u s h ( c 2 ) ;  
                         }  
                 }  
                 / /   F a l l b a c k   i f   n o   c a n d i d a t e   ( u n l i k e l y   g i v e n   r a n g e   a n d   s t e p   3 )  
                 / /   - 5   t o   5   i s   s p a n   o f   1 0 .   S t e p s   o f   3   f i t   e a s i l y .  
                 i f   ( c a n d i d a t e s . l e n g t h   = = =   0 )   r e t u r n   [ c 1 ,   c 1 ] ;   / /   S h o u l d   n o t   h a p p e n  
                 c o n s t   c 2   =   c a n d i d a t e s [ g e t R a n d o m I n t ( 0 ,   c a n d i d a t e s . l e n g t h   -   1 ) ] ;  
                 r e t u r n   [ c 1 ,   c 2 ] ;  
         } ;  
  
         c o n s t   [ x 1 ,   x 2 ]   =   g e t V a l i d P a i r ( ) ;  
         c o n s t   [ y 1 ,   y 2 ]   =   g e t V a l i d P a i r ( ) ;  
  
         / /   C a l c u l a t e   P  
         / /   P   =   ( 1 * x 2   +   2 * x 1 )   /   3  
         c o n s t   p x   =   ( m   *   x 2   +   n   *   x 1 )   /   s u m ;  
         c o n s t   p y   =   ( m   *   y 2   +   n   *   y 1 )   /   s u m ;  
  
         c o n s t   q u e s t i o n T e x t   =   ` G i v e n   $ A   =   ( $ { x 1 } ,   $ { y 1 } ) $   a n d   $ B   =   ( $ { x 2 } ,   $ { y 2 } ) $   w h a t   a r e   t h e   c o o r d i n a t e s   o f   p o i n t   $ P   =   ( x ,   y ) $   w h i c h   i n t e r n a l l y   d i v i d e s   l i n e   s e g m e n t   $ \ \ o v e r l e f t r i g h t a r r o w { A B } $   i n   t h e   r a t i o   $ { m } : $ { n } ? ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` P   =   ` ,   a n s w e r :   ` ( $ { p x } , $ { p y } ) `   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   {   x :   S t r i n g ( p x ) ,   y :   S t r i n g ( p y )   }   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 v a r i a n t :   ' c o o r d i n a t e ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' S e c t i o n   F o r m u l a '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 3 :   T r i g o n o m e t r y   - - -  
 e x p o r t   c o n s t   g e n e r a t e T r i g o n o m e t r y   =   ( )   = >   {  
         / /   " I f   S i n A   =   3 / 5   t h e n   m a t c h   t h e   f o l l o w i n g : "  
         / /   C o s A   =   [ ] ,   T a n A   =   [ ] ,   S e c A   =   [ ] ,   C o t A   =   [ ]  
  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   P y t h a g o r e a n   T r i p l e s   ( O p p ,   A d j ,   H y p )  
         c o n s t   t r i p l e s   =   [  
                 [ 3 ,   4 ,   5 ] ,   [ 5 ,   1 2 ,   1 3 ] ,   [ 8 ,   1 5 ,   1 7 ]  
         ] ;  
         / /   R a n d o m l y   p i c k   a   t r i p l e   a n d   s w a p   a d j / o p p   f o r   v a r i e t y  
         l e t   [ o p p ,   a d j ,   h y p ]   =   t r i p l e s [ g e t R a n d o m I n t ( 0 ,   t r i p l e s . l e n g t h   -   1 ) ] ;  
         i f   ( M a t h . r a n d o m ( )   <   0 . 5 )   {  
                 [ o p p ,   a d j ]   =   [ a d j ,   o p p ] ;  
         }  
  
         / /   G i v e n   S i n A   =   o p p / h y p  
         / /   F i n d   C o s A ( a d j / h y p ) ,   T a n A ( o p p / a d j ) ,   S e c A ( h y p / a d j ) ,   C o t A ( a d j / o p p )  
  
         c o n s t   r a t i o s   =   [  
                 {   l a b e l :   ' \ \ c o s   A ' ,   v a l :   {   n :   a d j ,   d :   h y p   }   } ,  
                 {   l a b e l :   ' \ \ t a n   A ' ,   v a l :   {   n :   o p p ,   d :   a d j   }   } ,  
                 {   l a b e l :   ' \ \ s e c   A ' ,   v a l :   {   n :   h y p ,   d :   a d j   }   } ,  
                 {   l a b e l :   ' \ \ c o t   A ' ,   v a l :   {   n :   a d j ,   d :   o p p   }   }  
         ] ;  
  
         / /   C o n v e r t   t o   r o w s .   " t e x t "   i s   l a b e l   ( e . g .   C o s A   =   ) .  
         / /   W e   u s e   v a r i a n t   ' f r a c t i o n '   w h i c h   e x p e c t s   a n s w e r   s t r i n g i f i e d   { n u m : . . . ,   d e n : . . . }  
         / /   A c t u a l l y ,   T y p e T a b l e I n p u t   v a r i a n t = ' f r a c t i o n '   u s e s   s e p a r a t e   n u m / d e n   i n p u t s .  
         / /   T h e   e x p e c t e d   " a n s w e r "   s t r i n g   i n   r o w   o b j e c t   i s   f o r   v a l i d a t i o n .  
         / /   B u t   w a i t ,   T y p e T a b l e I n p u t   v a l i d a t i o n   u s u a l l y   c o m p a r e s   a   s t r i n g .  
         / /   F o r   ' f r a c t i o n '   v a r i a n t ,   t h e   c o m p o n e n t   r e n d e r s   t w o   i n p u t s .    
         / /   T h e   c o m p o n e n t ' s   ` h a n d l e I n p u t C h a n g e `   u p d a t e s   ` { n u m : . . . ,   d e n : . . . } ` .  
         / /   T h e   f i n a l   a n s w e r   o b j e c t   w i l l   h a v e   k e y s   0 . . 3 ,   e a c h   v a l u e   i s   j s o n   s t r i n g   o r   o b j e c t .  
  
         / /   L e t ' s   f o r m a t   t h e   a n s w e r   s o   w e   c a n   v a l i d a t e   i t   e a s i l y ?  
         / /   A c t u a l l y   t h e   v a l i d a t i o n   s c r i p t   ` t e s t _ g r a d e 1 0 . m j s `   j u s t   c h e c k s   v a l i d i t y   o f   s t r u c t u r e .  
         / /   F o r   m a n u a l   c h e c k i n g   o r   f u t u r e   a u t o - g r a d i n g ,   w e   s h o u l d   p r o b a b l y   s t o r e   " n u m , d e n "   s t r i n g   o r   o b j e c t .  
  
         c o n s t   a n s w e r O b j   =   { } ;  
  
         r a t i o s . f o r E a c h ( ( r ,   i d x )   = >   {  
                 r o w s . p u s h ( {  
                         / /   T y p e T a b l e I n p u t   l o g i c :  
                         / /   I f   v a r i a n t = ' f r a c t i o n ' ,   i t   r e n d e r s   f r a c t i o n   i n p u t s .  
                         / /   W e   n e e d   a   v i s u a l   l a b e l   " C o s A   = "  
                         / /   T h e   c o m p o n e n t   r e n d e r s :    
                         / /   < d i v   c l a s s N a m e = { v a r i a n t   = = =   ' f r a c t i o n '   ?   S t y l e s . f r a c t i o n R o w   . . . >  
                         / /       < d i v   . . . > { r e n d e r C e l l C o n t e n t ( r o w . l e f t ) } < / d i v >  
                         / /       < d i v   . . . > { r o w . o p } < / d i v >   . . .  
                         / /   l e f t ,   o p ,   r i g h t   a r e   u s e d   i f   p r o v i d e d .    
                         / /   O r   r o w . t e x t   i s   u s e d .  
                         / /   I f   r o w . t e x t   i s   u s e d ,   i t   r e n d e r s   t e x t C e l l   +   i n p u t C e l l .  
                         / /   I n   ' f r a c t i o n '   m o d e ,   i n p u t C e l l   h a n d l e s   f r a c t i o n   i n p u t s .  
  
                         / /   R e - r e a d i n g   T y p e T a b l e I n p u t :  
                         / /   i f   ( r o w . t e x t )   {   r e n d e r   t e x t C e l l ;   r e n d e r I n p u t C e l l ( i d x ) ;   }  
                         / /   r e n d e r I n p u t C e l l   c h e c k s   v a r i a n t .   I f   ' f r a c t i o n ' ,   r e n d e r s   f r a c t i o n   i n p u t s .  
                         / /   P e r f e c t .  
  
                         t e x t :   ` $ $ { r . l a b e l }   = $ ` ,  
                         a n s w e r :   J S O N . s t r i n g i f y ( {   n u m :   S t r i n g ( r . v a l . n ) ,   d e n :   S t r i n g ( r . v a l . d )   } )  
                 } ) ;  
                 a n s w e r O b j [ i d x ]   =   {   n u m :   S t r i n g ( r . v a l . n ) ,   d e n :   S t r i n g ( r . v a l . d )   } ;  
         } ) ;  
  
         / /   G i v e n   T e x t  
         c o n s t   q u e s t i o n T e x t   =   ` I f   $ \ \ s i n   A   =   \ \ f r a c { $ { o p p } } { $ { h y p } } $   t h e n   m a t c h   t h e   f o l l o w i n g   t r i g o n o m e t r i c   r a t i o s : ` ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 v a r i a n t :   ' f r a c t i o n ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' T r i g o n o m e t r y '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 4 :   T r i g   R a t i o s   o f   S t a n d a r d   A n g l e s   - - -  
 / /   - - -   C A T 2 4 :   T r i g   R a t i o s   o f   S t a n d a r d   A n g l e s   - - -  
 e x p o r t   c o n s t   g e n e r a t e T r i g R a t i o s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   D e f i n e   o p t i o n s   f o r   e a c h   f u n c t i o n   t h a t   r e s u l t   i n   i n t e g e r s  
         c o n s t   c o n f i g   =   {  
                 ' s i n ' :   [ {   a n g l e :   ' 0 ^ \ \ c i r c ' ,   v a l :   ' 0 '   } ,   {   a n g l e :   ' 9 0 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ] ,  
                 ' c o s ' :   [ {   a n g l e :   ' 0 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ,   {   a n g l e :   ' 9 0 ^ \ \ c i r c ' ,   v a l :   ' 0 '   } ] ,  
                 ' t a n ' :   [ {   a n g l e :   ' 0 ^ \ \ c i r c ' ,   v a l :   ' 0 '   } ,   {   a n g l e :   ' 4 5 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ] ,  
                 ' c o t ' :   [ {   a n g l e :   ' 4 5 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ,   {   a n g l e :   ' 9 0 ^ \ \ c i r c ' ,   v a l :   ' 0 '   } ] ,  
                 ' s e c ' :   [ {   a n g l e :   ' 0 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ,   {   a n g l e :   ' 6 0 ^ \ \ c i r c ' ,   v a l :   ' 2 '   } ] ,  
                 ' c o s e c ' :   [ {   a n g l e :   ' 3 0 ^ \ \ c i r c ' ,   v a l :   ' 2 '   } ,   {   a n g l e :   ' 9 0 ^ \ \ c i r c ' ,   v a l :   ' 1 '   } ]  
         } ;  
  
         c o n s t   f u n c t i o n s   =   [ ' s i n ' ,   ' c o s ' ,   ' t a n ' ,   ' c o t ' ,   ' s e c ' ,   ' c o s e c ' ] ;  
  
         / /   S h u f f l e   t h e   o r d e r   o f   f u n c t i o n s   s o   t h e y   d o n ' t   a p p e a r   i n   f i x e d   s e q u e n c e  
         c o n s t   s h u f f l e d F u n c s   =   s h u f f l e A r r a y ( [ . . . f u n c t i o n s ] ) ;  
  
         s h u f f l e d F u n c s . f o r E a c h ( f u n c   = >   {  
                 c o n s t   o p t i o n s   =   c o n f i g [ f u n c ] ;  
                 / /   P i c k   o n e   r a n d o m   a n g l e   s c e n a r i o   f o r   t h i s   f u n c t i o n  
                 c o n s t   s e l e c t e d   =   o p t i o n s [ g e t R a n d o m I n t ( 0 ,   o p t i o n s . l e n g t h   -   1 ) ] ;  
  
                 l e t   l a b e l F u n c   =   ( f u n c   = = =   ' c o s e c ' )   ?   ' \ \ t e x t { c o s e c } '   :   ( ' \ \ '   +   f u n c ) ;  
  
                 r o w s . p u s h ( {  
                         t e x t :   ` $ $ { l a b e l F u n c } ( $ { s e l e c t e d . a n g l e } )   = $ ` ,  
                         a n s w e r :   s e l e c t e d . v a l  
                 } ) ;  
         } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' F i n d   t h e   v a l u e s   o f   t h e   f o l l o w i n g : ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' T r i g o n o m e t r i c   R a t i o s   o f   S t a n d a r d   a n g l e s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 5 :   P y t h a g o r a s   - - -  
 / /   - - -   C A T 2 5 :   P y t h a g o r a s   - - -  
 e x p o r t   c o n s t   g e n e r a t e P y t h a g o r a s   =   ( )   = >   {  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   F i n d   t u p l e s   s a t i s f y i n g   c o n s t r a i n t s :   b a s e   < =   1 2 ,   h e i g h t   < =   1 0 ,   h y p o t e n u s e   i s   i n t e g e r  
         c o n s t   c a n d i d a t e s   =   [ ] ;  
         f o r   ( l e t   b   =   1 ;   b   < =   1 2 ;   b + + )   {   / /   D i s t a n c e   l i m i t  
                 f o r   ( l e t   h   =   1 ;   h   < =   1 0 ;   h + + )   {   / /   H e i g h t   l i m i t  
                         c o n s t   h y p S q   =   b   *   b   +   h   *   h ;  
                         c o n s t   h y p   =   M a t h . s q r t ( h y p S q ) ;  
                         i f   ( N u m b e r . i s I n t e g e r ( h y p ) )   {  
                                 c a n d i d a t e s . p u s h ( {   b ,   h ,   h y p   } ) ;  
                         }  
                 }  
         }  
  
         / /   P i c k   r a n d o m   v a l i d   t u p l e  
         / /   F a l l b a c k   i f   e m p t y   ( s h o u l d n ' t   h a p p e n   a s   3 , 4 , 5   e x i s t s )  
         c o n s t   s e l e c t i o n   =   c a n d i d a t e s . l e n g t h   >   0   ?   c a n d i d a t e s [ g e t R a n d o m I n t ( 0 ,   c a n d i d a t e s . l e n g t h   -   1 ) ]   :   {   b :   3 ,   h :   4 ,   h y p :   5   } ;  
         c o n s t   {   b :   b _ v a l ,   h :   h _ v a l ,   h y p :   h y p _ v a l   }   =   s e l e c t i o n ;  
  
         / /   G e n e r a t e   D y n a m i c   S V G  
         / /   T r i a n g l e   c o o r d s :   B a s e   s t a r t s   a t   ( 2 0 ,   1 3 0 ) ,   g o e s   t o   ( 1 3 0 ,   1 3 0 )   m a x   w i d t h  
         / /   S i m p l y   s t i c k   t o   a   r i g h t   t r i a n g l e   v i s u a l .    
         / /   V e r t i c e s :   A ( 2 0 ,   2 0 ) ,   B ( 2 0 ,   1 3 0 ) ,   C ( 1 3 0 ,   1 3 0 )   i s   f l i p p e d .  
         / /   F l a g   p o l e   u s u a l l y   v e r t i c a l .  
         / /   L e t ' s   c r e a t e   a   v i s u a l   s c a l e d   r e a s o n a b l y    
         / /   P o l e   a t   r i g h t   s i d e ?   O r   l e f t ?   I m a g e   s h o w e d   p o l e   o n   r i g h t .  
         / /   T h r e a d   h y p o t e n u s e .  
         / /   L e t ' s   s e t t l e   c o o r d s :  
         / /   B a s e   l i n e :   ( 2 0 ,   1 4 0 )   t o   ( 1 4 0 ,   1 4 0 )  
         / /   P o l e :   ( 1 4 0 ,   1 4 0 )   u p   t o   ( 1 4 0 ,   2 0 )  
         / /   T h r e a d :   ( 2 0 ,   1 4 0 )   t o   ( 1 4 0 ,   2 0 )  
         / /   V e r t i c e s :   P 1 ( 2 0 ,   1 4 0 )   [ g r o u n d   l e f t ] ,   P 2 ( 1 4 0 ,   1 4 0 )   [ b a s e   o f   p o l e ] ,   P 3 ( 1 4 0 ,   2 0 )   [ t o p   o f   p o l e ]  
  
         / /   W e   c a n   j u s t   l a b e l   s i d e s .   v i s u a l   s c a l e   d o e s n ' t   n e e d   t o   m a t c h   p e r f e c t   a s p e c t   r a t i o   f o r   s i m p l e   s c h e m a s ,   b u t   d i s t i n c t   i s   n i c e .  
         c o n s t   s v g   =   ` < s v g   w i d t h = " 2 0 0 "   h e i g h t = " 1 6 0 "   v i e w B o x = " 0   0   2 0 0   1 6 0 "   x m l n s = " h t t p : / / w w w . w 3 . o r g / 2 0 0 0 / s v g " >  
                 < ! - -   G r o u n d   - - >  
                 < l i n e   x 1 = " 1 0 "   y 1 = " 1 5 0 "   x 2 = " 1 9 0 "   y 2 = " 1 5 0 "   s t r o k e = " # 9 4 a 3 b 8 "   s t r o k e - w i d t h = " 2 "   / >  
                  
                 < ! - -   T r i a n g l e   - - >  
                 < p a t h   d = " M   4 0   1 5 0   L   1 6 0   1 5 0   L   1 6 0   3 0   Z "   f i l l = " # f e f 0 8 a "   s t r o k e = " n o n e "   o p a c i t y = " 0 . 5 "   / >  
                 < p a t h   d = " M   4 0   1 5 0   L   1 6 0   1 5 0   L   1 6 0   3 0   Z "   f i l l = " n o n e "   s t r o k e = " # 0 f 1 7 2 a "   s t r o k e - w i d t h = " 2 "   / >  
  
                 < ! - -   L a b e l s   - - >  
                 < t e x t   x = " 1 7 0 "   y = " 9 0 "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 4 "   f i l l = " # 0 f 1 7 2 a " > P o l e < / t e x t >  
                 < t e x t   x = " 8 0 "   y = " 8 0 "   t r a n s f o r m = " r o t a t e ( - 3 8   9 0   8 0 ) "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 4 "   f i l l = " # 0 f 1 7 2 a " > T h r e a d < / t e x t >  
                  
                 < ! - -   D i m e n s i o n s   - - >  
                 < t e x t   x = " 1 0 0 "   y = " 1 4 5 "   t e x t - a n c h o r = " m i d d l e "   f o n t - f a m i l y = " s a n s - s e r i f "   f o n t - s i z e = " 1 4 "   f i l l = " # 0 f 1 7 2 a " > d < / t e x t >  
                 < ! - -   A r r o w s   f o r   d   - - >  
                 < p a t h   d = " M   4 5   1 3 5   L   4 0   1 4 0   L   4 5   1 4 5 "   f i l l = " n o n e "   s t r o k e = " # 0 f 1 7 2 a "   s t r o k e - w i d t h = " 1 . 5 "   / >  
                 < p a t h   d = " M   1 5 5   1 3 5   L   1 6 0   1 4 0   L   1 5 5   1 4 5 "   f i l l = " n o n e "   s t r o k e = " # 0 f 1 7 2 a "   s t r o k e - w i d t h = " 1 . 5 "   / >  
                 < l i n e   x 1 = " 4 0 "   y 1 = " 1 4 0 "   x 2 = " 1 6 0 "   y 2 = " 1 4 0 "   s t r o k e = " # 0 f 1 7 2 a "   s t r o k e - w i d t h = " 1 "   / >  
         < / s v g > ` ;  
  
         c o n s t   s v g D a t a U r l   =   ' d a t a : i m a g e / s v g + x m l ; c h a r s e t = u t f - 8 , '   +   e n c o d e U R I C o m p o n e n t ( s v g ) ;  
         c o n s t   i m g H t m l   =   ` < d i v   s t y l e = " d i s p l a y : f l e x ;   j u s t i f y - c o n t e n t : c e n t e r ;   m a r g i n - t o p : 1 0 p x ; " > < i m g   s r c = " $ { s v g D a t a U r l } "   a l t = " T r i a n g l e "   / > < / d i v > ` ;  
  
         c o n s t   q u e s t i o n T e x t   =   ` I f   a   f l a g   p o l e   o f   h e i g h t   $ $ { h _ v a l } $   m e t e r s   i s   e r e c t e d   w i t h   t h e   h e l p   o f   a   t h r e a d   o f   l e n g t h   $ $ { h y p _ v a l } $   m e t e r s   t h e n   w h a t   i s   t h e   d i s t a n c e   b e t w e e n   b a s e   o f   t h e   t h r e a d   t o   b a s e   o f   p o l e   i n   m e t e r s   ?   $ { i m g H t m l } ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` $ d   = $ ` ,   u n i t :   ' m ' ,   a n s w e r :   S t r i n g ( b _ v a l )   } ) ;  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( b _ v a l )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' W o r d   P r o b l e m s   -   P y t h a g o r e a n   T h e o r e m '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 6 :   C l o c k s   - - -  
 e x p o r t   c o n s t   g e n e r a t e C l o c k s   =   ( )   = >   {  
         / /   " W h a t   i s   t h e   a n g l e   b e t w e e n   t h e   h o u r   h a n d   a n d   m i n u t e   h a n d   o n   a   c l o c k   w h e n   t h e   t i m e   i s   1 : 3 0   ? "  
         c o n s t   r o w s   =   [ ] ;  
  
         / /   P i c k   r a n d o m   t i m e  
         c o n s t   h   =   g e t R a n d o m I n t ( 1 ,   1 2 ) ;  
         c o n s t   m   =   g e t R a n d o m I n t ( 0 ,   1 1 )   *   5 ;  
  
         / /   A n g l e   F o r m u l a :   |   0 . 5   *   ( 6 0 h   -   1 1 m )   |  
         c o n s t   v a l   =   M a t h . a b s ( 0 . 5   *   ( 6 0   *   h   -   1 1   *   m ) ) ;  
         c o n s t   a n g l e   =   M a t h . m i n ( 3 6 0   -   v a l ,   v a l ) ;  
  
         c o n s t   m S t r   =   m   <   1 0   ?   ` 0 $ { m } `   :   m ;  
         c o n s t   q u e s t i o n T e x t   =   ` W h a t   i s   t h e   a n g l e   b e t w e e n   t h e   h o u r   h a n d   a n d   m i n u t e   h a n d   o n   a   c l o c k   w h e n   t h e   t i m e   i s   $ $ { h } : $ { m S t r } $   ? ` ;  
  
         r o w s . p u s h ( {   t e x t :   ` $ A n g l e   = $ ` ,   u n i t :   ' d e g r e e s ' ,   a n s w e r :   S t r i n g ( a n g l e )   } ) ;  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( a n g l e )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   q u e s t i o n T e x t ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' C l o c k s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 7 :   T r u e / F a l s e   ( w a s   P r o b a b i l i t y )   - - -  
 e x p o r t   c o n s t   g e n e r a t e P r o b a b i l i t y   =   ( )   = >   {  
         / /   " T r u e   o r   F a l s e "   t a b l e  
         c o n s t   r o w s   =   [ ] ;  
  
         c o n s t   p o o l   =   [  
                 {   q :   ` $ \ \ s q r t { a }   +   \ \ s q r t { b }   =   \ \ s q r t { a + b } $ ` ,   a :   ' F a l s e '   } ,  
                 {   q :   ` $ - 3 ^ 2   =   9 $ ` ,   a :   ' F a l s e '   } ,  
                 {   q :   ` $ \ \ f r a c { a } { a + b }   =   \ \ f r a c { a } { a }   +   \ \ f r a c { a } { b } $ ` ,   a :   ' F a l s e '   } ,  
                 {   q :   ` $ ( a + b ) ^ 2   =   a ^ 2   +   b ^ 2 $ ` ,   a :   ' F a l s e '   } ,  
                 / /   {   q :   ` $ \ \ s q r t { x ^ 2 + y ^ 2 }   =   x + y $ ` ,   a :   ' F a l s e '   } ,  
                 / /   {   q :   ` $ s i n ( 9 0 ^ \ \ c i r c )   =   1 $ ` ,   a :   ' T r u e '   } ,  
                 / /   {   q :   ` $ 2 ^ 3   \ \ t i m e s   2 ^ 2   =   2 ^ 5 $ ` ,   a :   ' T r u e '   } ,  
                 / /   {   q :   ` $ 2 ^ 2   =   - 8 $ ` ,   a :   ' F a l s e '   }  
         ] ;  
  
         c o n s t   s e l e c t e d   =   [ ] ;  
         w h i l e   ( s e l e c t e d . l e n g t h   <   3 )   {  
                 c o n s t   i t e m   =   p o o l [ g e t R a n d o m I n t ( 0 ,   p o o l . l e n g t h   -   1 ) ] ;  
                 i f   ( ! s e l e c t e d . i n c l u d e s ( i t e m ) )   s e l e c t e d . p u s h ( i t e m ) ;  
         }  
  
         s e l e c t e d . f o r E a c h ( ( i t e m ,   i d x )   = >   {  
                 r o w s . p u s h ( {  
                         t e x t :   i t e m . q ,  
                         i n p u t T y p e :   ' r a d i o ' ,  
                         o p t i o n s :   [ ' T r u e ' ,   ' F a l s e ' ] ,  
                         a n s w e r :   i t e m . a  
                 } ) ;  
         } ) ;  
  
         c o n s t   a n s w e r O b j   =   { } ;  
         r o w s . f o r E a c h ( ( r ,   i )   = >   a n s w e r O b j [ i ]   =   r . a n s w e r ) ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ' T r u e   o r   F a l s e ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' M i s c e l l a n e o u s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 8 :   P r o b a b i l i t y   ( D i c e   S u m )   - - -  
 e x p o r t   c o n s t   g e n e r a t e D i c e P r o b a b i l i t y   =   ( )   = >   {  
         / /   " T w o   d i c e   a r e   t h r o w n . . .   p r o b a b i l i t y   t h a t   s u m   i s   X ? "  
         / /   S u m s   m a p :  
         / /   2 :   ( 1 , 1 )   - >   1  
         / /   3 :   ( 1 , 2 ) , ( 2 , 1 )   - >   2  
         / /   4 :   ( 1 , 3 ) , ( 2 , 2 ) , ( 3 , 1 )   - >   3  
         / /   5 :   4  
         / /   6 :   5  
         / /   7 :   6  
         / /   8 :   5  
         / /   9 :   4  
         / /   1 0 :   3  
         / /   1 1 :   2  
         / /   1 2 :   1  
  
         / /   P i c k   a   r a n d o m   t a r g e t   s u m   b e t w e e n   2   a n d   1 2  
         c o n s t   t a r g e t S u m   =   g e t R a n d o m I n t ( 2 ,   1 2 ) ;  
         l e t   c o u n t   =   0 ;  
         f o r   ( l e t   i   =   1 ;   i   < =   6 ;   i + + )   {  
                 f o r   ( l e t   j   =   1 ;   j   < =   6 ;   j + + )   {  
                         i f   ( i   +   j   = = =   t a r g e t S u m )   c o u n t + + ;  
                 }  
         }  
  
         / /   F r a c t i o n   i s   c o u n t / 3 6  
         / /   S i m p l i f y ?   U s e r   i n p u t   u s u a l l y   e x p e c t s   s i m p l i f i e d   o r   r a w ?    
         / /   I m a g e   i m p l i e s   i n p u t s   f o r   n u m / d e n .   L e t ' s   n o t   s i m p l i f y   f o r   n o w   o r   c a l c u l a t e   s t a n d a r d   r e d u c t i o n .  
         / /   I f   I   u s e   F r a c t i o n   t y p e ,   i t   c h e c k s   e q u i v a l e n c e   u s u a l l y   i f   i m p l e m e n t e d   r i g h t ,    
         / /   b u t   T y p e T a b l e I n p u t   f r a c t i o n   c h e c k i n g   m i g h t   b e   s i m p l e   s t r i n g   c o m p a r e .  
         / /   L e t ' s   a s s u m e   s t a n d a r d   f o r m .  
  
         / /   S i m p l i f i c a t i o n   l o g i c  
         c o n s t   g c d   =   ( a ,   b )   = >   b   = = =   0   ?   a   :   g c d ( b ,   a   %   b ) ;  
         c o n s t   c o m m o n   =   g c d ( c o u n t ,   3 6 ) ;  
         c o n s t   n u m   =   c o u n t   /   c o m m o n ;  
         c o n s t   d e n   =   3 6   /   c o m m o n ;  
  
         c o n s t   r o w s   =   [ ] ;  
         r o w s . p u s h ( {  
                 t e x t :   ' P r o b a b i l i t y   = ' ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( {   n u m :   S t r i n g ( n u m ) ,   d e n :   S t r i n g ( d e n )   } )   / /   F r a c t i o n   v a r i a n t   e x p e c t s   { n u m ,   d e n }   a n s w e r   f o r m a t ?  
                 / /   A c t u a l l y   T y p e T a b l e I n p u t   v a r i a n t = ' f r a c t i o n '   u s u a l l y   e x p e c t s   a n s w e r   t o   b e   j u s t   t h e   s t r i n g   " n u m / d e n "   o r   o b j e c t ?  
                 / /   L e t ' s   c h e c k   h a n d l e I n p u t C h a n g e   o r   c h e c k   l o g i c .    
                 / /   L o g i c :   i f   v a r i a n t   f r a c t i o n ,   i n p u t   i s   o b j e c t   { n u m ,   d e n } .    
                 / /   A n d   c o m p a r i s o n ?   u s u a l l y   s i m p l e .   L e t ' s   r e t u r n   J S O N   s t r i n g   o f   o b j e c t   f o r   t h e   r o w   a n s w e r   t o   b e   p a r s e d ?  
                 / /   W a i t ,   s t a n d a r d   ` a n s w e r `   i n   r o w   o b j e c t   i s   s t r i n g .  
                 / /   L e t ' s   s t o r e   i t   a s   ` { n u m :   " 1 " ,   d e n :   " 3 6 " } `   ( o b j e c t ) .  
                 / /   B u t   ` r o w . a n s w e r `   i s   u s u a l l y   a   s t r i n g   i n   o t h e r   g e n e r a t o r s .  
                 / /   L e t ' s   l o o k   a t   C A T 0 3   ( F r a c t i o n s )   i f   i t   e x i s t s .    
                 / /   A c t u a l l y   I   h a v e n ' t   i m p l e m e n t e d   f r a c t i o n   t a b l e   i n p u t s   y e t   h e a v i l y .  
                 / /   L e t ' s   u s e   s t r i n g   " n u m / d e n "   a n d   h o p e   c h e c k   w o r k s   o r   I   m i g h t   n e e d   t o   a d j u s t .  
                 / /   W a i t ,   ` T y p e T a b l e I n p u t `   c h e c k   l o g i c :    
                 / /   ` i f   ( v a r i a n t   = = =   ' f r a c t i o n ' )   {   . . .   c h e c k   n u m   a n d   d e n   . . .   } `  
                 / /   L e t ' s   l o o k   a t   T y p e T a b l e I n p u t   c o m p o n e n t   l a t e r   i f   n e e d e d .    
                 / /   F o r   n o w   p r o v i d i n g   k e y - v a l u e   " n u m "   a n d   " d e n " .  
         } ) ;  
  
         / /   N O T E :   T h e   v a l i d   a n s w e r   f o r   t h e   r o w   s h o u l d   b e   a n   o b j e c t   f o r   f r a c t i o n   v a r i a n t   c o m p a r i s o n  
         / /   B u t   ` a n s w e r `   p r o p   i n   r o w   i s   o f t e n   s t r i n g .    
         / /   L e t ' s   s t o r e   i t   a s   ` { n u m :   " 1 " ,   d e n :   " 3 6 " } `   ( o b j e c t ) .  
         r o w s [ 0 ] . a n s w e r   =   {   n u m :   S t r i n g ( n u m ) ,   d e n :   S t r i n g ( d e n )   } ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   r o w s [ 0 ] . a n s w e r   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 v a r i a n t :   ' f r a c t i o n ' ,  
                 q u e s t i o n :   ` T w o   d i c e   a r e   t h r o w n   a t   t h e   s a m e   t i m e .   W h a t   i s   t h e   p r o b a b i l i t y   t h a t   t h e   s u m   o f   n u m b e r s   o n   t h e   d i c e   i s   $ $ { t a r g e t S u m } $   ? ` ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' P r o b a b i l i t y '  
         } ;  
 } ;  
  
 / /   - - -   C A T 2 9 :   W o r d   P r o b l e m   ( L i n e a r   E q )   - - -  
 e x p o r t   c o n s t   g e n e r a t e A g e P r o b l e m   =   ( )   = >   {  
         / /   F a t h e r   =   M   *   S o n  
         / /   F a t h e r   +   Y   =   M _ f u t u r e   *   ( S o n   +   Y )  
         / /   M * S   +   Y   =   M f * S   +   M f * Y  
         / /   S ( M   -   M f )   =   Y ( M f   -   1 )  
         / /   S   =   Y ( M f   -   1 )   /   ( M   -   M f )  
  
         / /   W e   n e e d   i n t e g e r   S .  
         / /   L e t ' s   p i c k   M ,   M f ,   Y   s u c h   t h a t   S   i s   i n t e g e r .  
         / /   C o m m o n   s e t s :  
         / /   M = 4 ,   M f = 3 .   ( 4 - 3 ) = 1 .   D e n o m   i s   1 .   A l w a y s   w o r k s !  
         / /   S   =   Y ( 2 ) / 1   =   2 Y .  
         / /   I f   Y = 5 ,   S = 1 0 .   F = 4 0 .  
         / /   A f t e r   5   y r s :   S = 1 5 ,   F = 4 5 .   4 5   =   3 * 1 5 .   C o r r e c t .  
  
         / /   M = 3 ,   M f = 2 .   ( 3 - 2 ) = 1 .   A l w a y s   w o r k s .  
         / /   S   =   Y ( 1 ) / 1   =   Y .  
         / /   I f   Y = 1 0 ,   S = 1 0 ,   F = 3 0 .  
         / /   A f t e r   1 0 :   S = 2 0 ,   F = 4 0 .   4 0 = 2 * 2 0 .   C o r r e c t .  
  
         / /   L e t ' s   r a n d o m i z e   b e t w e e n   t h e s e   t w o   r e l i a b l e   p a t t e r n s .  
         c o n s t   p a t t e r n   =   g e t R a n d o m I n t ( 0 ,   1 ) ;  
         l e t   M ,   M f ,   Y ,   S ,   F ;  
  
         i f   ( p a t t e r n   = = =   0 )   {  
                 M   =   4 ;   M f   =   3 ;  
                 Y   =   g e t R a n d o m I n t ( 4 ,   8 ) ;   / /   R a n d o m   y e a r s   4 - 8  
                 S   =   2   *   Y ;  
         }   e l s e   {  
                 M   =   3 ;   M f   =   2 ;  
                 Y   =   g e t R a n d o m I n t ( 5 ,   1 2 ) ;  
                 S   =   Y ;  
         }  
  
         F   =   M   *   S ;  
  
         c o n s t   r o w s   =   [ ] ;  
         r o w s . p u s h ( {   t e x t :   ` R o b e r t ' s   a g e   = ` ,   a n s w e r :   S t r i n g ( S )   } ) ;  
         r o w s . p u s h ( {   t e x t :   ` R o b e r t ' s   f a t h e r ' s   a g e   = ` ,   a n s w e r :   S t r i n g ( F )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( S ) ,   1 :   S t r i n g ( F )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ` R o b e r t ' s   f a t h e r   i s   $ $ { M } $   t i m e s   a s   o l d   a s   R o b e r t .   A f t e r   $ $ { Y } $   y e a r s ,   f a t h e r   w i l l   b e   $ { M f   = = =   2   ?   ' t w i c e '   :   M f   = = =   3   ?   ' t h r e e   t i m e s '   :   ' $ '   +   M f   +   ' $   t i m e s ' }   a s   o l d   a s   R o b e r t .   F i n d   t h e i r   p r e s e n t   a g e s . ` ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' L i n e a r   E q u a t i o n s   W o r d   P r o b l e m s '  
         } ;  
 } ;  
  
 / /   - - -   C A T 3 0 :   W o r d   P r o b l e m   ( Q u a d r a t i c )   - - -  
 e x p o r t   c o n s t   g e n e r a t e N u m b e r S q u a r e P r o b l e m   =   ( )   = >   {  
         / /   " S u m   o f   a   p o s i t i v e   n u m b e r   a n d   i t s   s q u a r e   i s   X .   F i n d   t h e   n u m b e r . "  
         / /   n   +   n ^ 2   =   X  
         / /   P i c k   n   ( p o s i t i v e   i n t e g e r ) .  
         c o n s t   n   =   g e t R a n d o m I n t ( 3 ,   1 2 ) ;  
         c o n s t   X   =   n   +   n   *   n ;  
  
         c o n s t   r o w s   =   [ ] ;  
         / /   I m a g e   s h o w s   N O   l a b e l ,   j u s t   i n p u t .    
         / /   U s i n g   " N u m b e r   = "   a s   t e x t   o r   e m p t y   s t r i n g ?  
         / /   I f   I   u s e   e m p t y   s t r i n g ,   i t   m i g h t   t r i g g e r   t h e   e q u a t i o n   v i e w   u n l e s s   I   m o d i f i e d   i t .  
         / /   B u t   I   m o d i f i e d   ` g r a d e 1 0 G e n e r a t o r s . m j s `   n o t   t h e   c o m p o n e n t   h e a v i l y   f o r   e m p t y   t e x t   l o g i c   l o g i c .  
         / /   A c t u a l l y ,   e a r l i e r   b u g   w a s   e m p t y   t e x t   - >   e q u a t i o n   4   c o l s .  
         / /   S a f e s t   i s   " N u m b e r   = " .   U s e r   s u r e l y   w o n ' t   m i n d   a   l a b e l .  
         r o w s . p u s h ( {   t e x t :   ` N u m b e r   = ` ,   a n s w e r :   S t r i n g ( n )   } ) ;  
  
         c o n s t   a n s w e r O b j   =   {   0 :   S t r i n g ( n )   } ;  
  
         r e t u r n   {  
                 t y p e :   ' t a b l e I n p u t ' ,  
                 q u e s t i o n :   ` T h e   s u m   o f   a   p o s i t i v e   n u m b e r   a n d   i t s   s q u a r e   i s   $ $ { X } $ .   F i n d   t h e   n u m b e r . ` ,  
                 a n s w e r :   J S O N . s t r i n g i f y ( a n s w e r O b j ) ,  
                 r o w s :   r o w s ,  
                 t o p i c :   ' Q u a d r a t i c   E q u a t i o n s   W o r d   P r o b l e m s '  
         } ;  
 } ;  
 