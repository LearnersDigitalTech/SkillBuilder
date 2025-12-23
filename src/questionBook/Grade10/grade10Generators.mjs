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
        if (options.length >= 4) break;
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            options.push(opt);
        }
    }

    let safety = 0;
    while (options.length < 4 && safety < 20) {
        const val = options[0].value + " " + (safety + 1);
        let newVal = val;
        let newLabel = options[0].label;

        const numVal = parseFloat(options[0].value);
        if (!isNaN(numVal)) {
            const jitter = numVal + (Math.random() > 0.5 ? 1 : -1) * (safety + 1);
            newVal = String(jitter);
            newLabel = String(jitter);
        }

        if (!seen.has(newVal)) {
            seen.add(newVal);
            options.push({ value: newVal, label: newLabel });
        }
        safety++;
    }

    return shuffleArray(options).slice(0, 4);
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const lcm = (a, b) => (a * b) / gcd(a, b);

// --- CAT01: Fundamental Operations on Natural and Whole Numbers ---
export const generateNaturalWholeNumbers = () => {
    const rows = [];
    const a1 = getRandomInt(10, 99);
    const b1 = getRandomInt(10, 99);
    rows.push({ left: a1, op: '+', right: b1, answer: String(a1 + b1) });

    const a2 = getRandomInt(100, 999);
    const b2 = getRandomInt(10, 99);
    const max2 = Math.max(a2, b2);
    const min2 = Math.min(a2, b2);
    rows.push({ left: max2, op: '-', right: min2, answer: String(max2 - min2) });

    const a3 = getRandomInt(10, 20);
    const b3 = getRandomInt(2, 9);
    rows.push({ left: a3, op: '×', right: b3, answer: String(a3 * b3) });

    const b4 = getRandomInt(2, 15);
    const q4 = getRandomInt(10, 50);
    const a4 = b4 * q4;
    rows.push({ left: a4, op: '÷', right: b4, answer: String(q4) });

    const answerObj = { 0: rows[0].answer, 1: rows[1].answer, 2: rows[2].answer, 3: rows[3].answer };
    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Fundamental Operations on Natural and Whole Numbers'
    };
};

// --- CAT02: Fundamental Operations On Integers ---
export const generateIntegers = () => {
    const rows = [];
    const a1 = -1 * getRandomInt(2, 20);
    const b1 = -1 * getRandomInt(2, 20);
    rows.push({ left: `(${a1})`, op: '+', right: `(${b1})`, answer: String(a1 + b1) });

    const a2 = -1 * getRandomInt(2, 20);
    const b2 = -1 * getRandomInt(2, 20);
    rows.push({ left: `(${a2})`, op: '-', right: `(${b2})`, answer: String(a2 - b2) });

    const a3 = -1 * getRandomInt(2, 12);
    const b3 = -1 * getRandomInt(2, 12);
    rows.push({ left: `(${a3})`, op: '×', right: `(${b3})`, answer: String(a3 * b3) });

    const b4 = getRandomInt(2, 10);
    const q4 = -1 * getRandomInt(2, 12);
    const a4 = b4 * q4;
    rows.push({ left: `(${a4})`, op: '÷', right: `(${b4})`, answer: String(q4) });

    const answerObj = { 0: rows[0].answer, 1: rows[1].answer, 2: rows[2].answer, 3: rows[3].answer };
    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Fundamental Operations On Integers'
    };
};

// --- CAT03: Fractions ---
export const generateFractions = () => {
    const rows = [];
    const simplify = (n, d) => {
        const common = gcd(n, d);
        return { n: n / common, d: d / common };
    };

    const getProperFraction = () => {
        let d = getRandomInt(2, 9);
        let n = getRandomInt(1, d - 1);
        return simplify(n, d);
    };

    // 1. Addition with unlike denominators
    let f1 = getProperFraction();
    let f2 = getProperFraction();
    while (f1.d === f2.d) { f2 = getProperFraction(); } // Ensure distinct

    let ansAddN = f1.n * f2.d + f2.n * f1.d;
    let ansAddD = f1.d * f2.d;
    let ansAdd = simplify(ansAddN, ansAddD);

    rows.push({
        left: { n: f1.n, d: f1.d }, op: '+', right: { n: f2.n, d: f2.d },
        answer: { num: String(ansAdd.n), den: String(ansAdd.d) }
    });

    // 2. Subtraction with unlike denominators
    let f3 = getProperFraction();
    let f4 = getProperFraction();
    while (f3.d === f4.d) { f4 = getProperFraction(); }

    // Ensure positive result: f3 >= f4
    if (f3.n * f4.d < f4.n * f3.d) {
        [f3, f4] = [f4, f3];
    }

    let ansSubN = f3.n * f4.d - f4.n * f3.d;
    let ansSubD = f3.d * f4.d;
    let ansSub = simplify(ansSubN, ansSubD);

    rows.push({
        left: { n: f3.n, d: f3.d }, op: '-', right: { n: f4.n, d: f4.d },
        answer: { num: String(ansSub.n), den: String(ansSub.d) }
    });

    // 3. Multiplication with unlike denominators
    let f5 = getProperFraction();
    let f6 = getProperFraction();
    while (f5.d === f6.d) { f6 = getProperFraction(); }

    let ansMulN = f5.n * f6.n;
    let ansMulD = f5.d * f6.d;
    let ansMul = simplify(ansMulN, ansMulD);

    rows.push({
        left: { n: f5.n, d: f5.d }, op: '×', right: { n: f6.n, d: f6.d },
        answer: { num: String(ansMul.n), den: String(ansMul.d) }
    });

    // 4. Division with unlike denominators
    let f7 = getProperFraction();
    let f8 = getProperFraction();
    while (f7.d === f8.d) { f8 = getProperFraction(); }

    let ansDivN = f7.n * f8.d;
    let ansDivD = f7.d * f8.n;
    let ansDiv = simplify(ansDivN, ansDivD);

    rows.push({
        left: { n: f7.n, d: f7.d }, op: '÷', right: { n: f8.n, d: f8.d },
        answer: { num: String(ansDiv.n), den: String(ansDiv.d) }
    });

    const answerObj = { 0: rows[0].answer, 1: rows[1].answer, 2: rows[2].answer, 3: rows[3].answer };
    return {
        type: 'tableInput',
        variant: 'fraction',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Fractions'
    };
};

// --- CAT04: Fundamental operations on decimals ---
export const generateDecimals = () => {
    const rows = [];
    const a1 = (getRandomInt(10, 99) / 100).toFixed(2);
    const b1 = (getRandomInt(10, 99) / 10).toFixed(1);
    const ans1 = (parseFloat(a1) + parseFloat(b1)).toFixed(2);
    rows.push({ left: a1, op: '+', right: b1, answer: String(ans1) });

    const a2 = (getRandomInt(50, 99) / 100).toFixed(2);
    const b2 = (getRandomInt(10, 40) / 100).toFixed(2);
    const ans2 = (parseFloat(a2) - parseFloat(b2)).toFixed(2);
    rows.push({ left: a2, op: '-', right: b2, answer: String(ans2) });

    const a3 = (getRandomInt(1, 9) / 10).toFixed(1);
    const b3 = (getRandomInt(1, 9) / 10).toFixed(1);
    const ans3 = (parseFloat(a3) * parseFloat(b3)).toFixed(2);
    rows.push({ left: a3, op: '×', right: b3, answer: String(ans3) });

    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(2, 9);
    const dividendRaw = divisor * quotient;
    const a4 = (dividendRaw / 10).toFixed(1);
    const b4 = (divisor / 10).toFixed(1);
    const ans4 = String(quotient);
    rows.push({ left: a4, op: '÷', right: b4, answer: ans4 });

    const answerObj = { 0: rows[0].answer, 1: rows[1].answer, 2: rows[2].answer, 3: rows[3].answer };
    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Fundamental operations on decimals'
    };
};

// --- CAT05: LCM ---
export const generateLCM = () => {
    const rows = [];

    // Q1: 2 numbers
    let a1 = getRandomInt(4, 15);
    let b1 = getRandomInt(4, 15);
    // Ensure distinct
    while (a1 === b1) {
        b1 = getRandomInt(4, 15);
    }
    const val1 = lcm(a1, b1);
    rows.push({ text: `Find the LCM of $${a1}, ${b1}$`, answer: String(val1) });

    // Q2 removed as per request (keep 1st and 3rd)

    // Q3: 3 numbers
    const set3 = new Set();
    while (set3.size < 3) {
        set3.add(getRandomInt(3, 10));
    }
    const [a3, b3, c3] = [...set3];

    const val3 = lcm(a3, lcm(b3, c3));
    rows.push({ text: `Find the LCM of $${a3}, ${b3}, ${c3}$`, answer: String(val3) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Least Common Multiple'
    };
};

// --- CAT06: HCF ---
export const generateHCF = () => {
    const rows = [];

    let a1 = getRandomInt(12, 40);
    let b1 = getRandomInt(12, 40);
    let val1 = gcd(a1, b1);
    while (val1 <= 1 || a1 === b1) { // Ensure distinct and HCF > 1
        a1 = getRandomInt(12, 40);
        b1 = getRandomInt(12, 40);
        val1 = gcd(a1, b1);
    }
    rows.push({ text: `Find the HCF of $${a1}, ${b1}$`, answer: String(val1) });

    // Q2 removed as per request (keep 1st and 3rd)

    const factor = getRandomInt(2, 6);
    const multipliers = new Set();
    while (multipliers.size < 3) {
        multipliers.add(getRandomInt(3, 9)); // Increased range slightly to avoid infinite loops if range is too small
    }
    const [m1, m2, m3] = [...multipliers];
    const a3 = factor * m1;
    const b3 = factor * m2;
    const c3 = factor * m3;
    const val3 = gcd(a3, gcd(b3, c3));
    rows.push({ text: `Find the HCF of $${a3}, ${b3}, ${c3}$`, answer: String(val3) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Highest Common Factor'
    };
};


// --- CAT05 + CAT06: LCM & HCF (2 numbers only) ---
export const generateLCMandHCF = () => {
    const rows = [];

    // Q1: LCM of 2 numbers
    let lcmA = getRandomInt(4, 15);
    let lcmB = getRandomInt(4, 15);
    while (lcmA === lcmB) {
        lcmB = getRandomInt(4, 15);
    }
    const lcmVal = lcm(lcmA, lcmB);
    rows.push({
        text: `Find the LCM of $${lcmA}, ${lcmB}$`,
        answer: String(lcmVal)
    });

    // Q2: HCF of 2 numbers
    let hcfA = getRandomInt(12, 40);
    let hcfB = getRandomInt(12, 40);
    let hcfVal = gcd(hcfA, hcfB);
    while (hcfVal <= 1 || hcfA === hcfB) {
        hcfA = getRandomInt(12, 40);
        hcfB = getRandomInt(12, 40);
        hcfVal = gcd(hcfA, hcfB);
    }
    rows.push({
        text: `Find the HCF of $${hcfA}, ${hcfB}$`,
        answer: String(hcfVal)
    });

    const answerObj = {};
    rows.forEach((r, i) => {
        answerObj[i] = r.answer;
    });

    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'LCM and HCF'
    };
};


// --- CAT07: Ratio and Proportion ---
export const generateRatioProportion = () => {
    const rows = [];

    // Q1: Direct ratio problem
    const a1 = getRandomInt(2, 5);
    const b1 = getRandomInt(2, 5);
    const x1 = getRandomInt(5, 12);
    const y1 = (b1 * x1) / a1;
    // ensure integer answer
    const adjX1 = (y1 % 1 === 0) ? x1 : x1 * a1;
    const adjY1 = (b1 * adjX1) / a1;
    rows.push({ text: `If $${a1}:${b1} :: ${adjX1}:x$, find $x$`, answer: String(adjY1) });

    // Q2: Word simple
    const total = getRandomInt(20, 100);
    // ensure total divisible by sum of parts
    const ratioA = 2, ratioB = 3;
    const adjTotal = Math.ceil(total / 5) * 5;
    const shareB = (adjTotal / 5) * 3;
    rows.push({ text: `Divide $${adjTotal}$ in ratio $2:3$. Value of second part?`, answer: String(shareB) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Ratio and Proportion'
    };
};

// --- CAT08: Square and Square Roots ---
export const generateSquareRoots = () => {
    const rows = [];

    // 1. Square Question
    const n1 = getRandomInt(11, 30);
    rows.push({ text: `Find the value of $(${n1})^2$`, answer: String(n1 * n1) });

    // 2. Square Root Question
    // User requested "some chances" for the relation: 12^2 = 144, sqrt(144) = 12
    // We'll give a 30% chance for the second question to be the inverse of the first.
    // Otherwise, generate a random perfect square root problem (approx range 1..400+ as requested).
    const isLinked = Math.random() < 0.3;

    let n2;
    if (isLinked) {
        n2 = n1;
    } else {
        // Range for roots: 2 to 30 (Square 4 to 900). 
        // User mentioned "1,4,9...400", which corresponds to roots 1..20. 
        // We'll extend slightly to 30 to match the difficulty of the first question.
        n2 = getRandomInt(2, 30);
        // Ensure it's not same as n1 just to avoid confusion if not linked (though mathematically fine)
        if (!isLinked && n2 === n1) n2 = getRandomInt(2, 30);
    }

    const n2Squared = n2 * n2;
    rows.push({ text: `Find the value of $\\sqrt{${n2Squared}}$`, answer: String(n2) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: '',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Square and Square Roots'
    };
};

// --- CAT09: Cube and Cube Roots ---
export const generateCubeRoots = () => {
    const rows = [];

    // 1. Cube Question: "cube only till 5"
    // Assuming integers. Range 2 to 5.
    // Previous code used negatives, so we'll allow both positive and negative for variety?
    // "cube only till 5" likely means base magnitude <= 5.

    // Choose base magnitude from 2 to 5
    let n1 = getRandomInt(2, 5);
    // 50% chance of negative base
    if (Math.random() < 0.5) n1 *= -1;

    rows.push({ text: `Find the value of $(${n1})^3$`, answer: String(n1 * n1 * n1) });

    // 2. Cube Root Question: "cube root upto 125"
    // Perfect cubes up to 125 are 1^3=1, 2^3=8, 3^3=27, 4^3=64, 5^3=125.
    // So base magnitude is 2 to 5 (ignoring 1 as trivial).

    let n2 = getRandomInt(2, 5);
    // 50% chance of negative root
    if (Math.random() < 0.5) n2 *= -1;

    // Use n2 as the root, so the question is cbrt(n2^3)
    const cb2 = n2 * n2 * n2;
    rows.push({ text: `Find the value of $\\sqrt[3]{${cb2}}$`, answer: String(n2) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: '',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Cube and Cube Roots'
    };
};

// --- CAT10: Laws of Exponents ---
export const generateExponentsNegative = () => {
    // Negative exponent: Find value of (-a)^(-n)
    const base = -1 * getRandomInt(2, 5);
    const exp = -1 * getRandomInt(2, 3); // -2 or -3
    const question = `Find the value of $(${base})^{${exp}}$`;

    // format as fraction if possible
    const den = Math.pow(base, Math.abs(exp)); // e.g. (-2)^2 = 4, (-2)^3 = -8

    // answer string "\frac{1}{4}" or "-\frac{1}{8}" using proper LaTeX
    const answerStr = (den > 0) ? `$\\frac{1}{${den}}$` : `$-\\frac{1}{${Math.abs(den)}}$`;

    const wrongSignFraction = (den > 0) ? `$-\\frac{1}{${den}}$` : `$\\frac{1}{${Math.abs(den)}}$`;

    // Custom distractors for this type
    const options = ensureUnique({ value: answerStr, label: answerStr }, [
        { value: `$${den}$`, label: `$${den}$` },          // 4 or -8
        { value: `$${-den}$`, label: `$${-den}$` },        // -4 or 8
        { value: wrongSignFraction, label: wrongSignFraction } // wrong sign fraction
    ]);
    return { type: 'mcq', question, answer: answerStr, options, topic: 'Laws of Exponents' };
};

// --- CAT11: BODMAS ---
export const generateBODMAS = () => {
    // Convert to Table Input
    const rows = [];

    // Row 1: Simple mixed ops
    const a1 = getRandomInt(2, 9);
    const b1 = getRandomInt(2, 9);
    const c1 = getRandomInt(2, 9);
    // a + b * c
    const ans1 = a1 + (b1 * c1);
    rows.push({ text: `Evaluate: $${a1} + ${b1} \\times ${c1}$`, answer: String(ans1) });

    // Row 2: Brackets
    // Q2 removed as per request (keep 1st and 3rd)

    // Row 3: Complex
    // a + b x (c - d)
    const a3 = getRandomInt(2, 10);
    const b3 = getRandomInt(2, 5);
    const c3 = getRandomInt(6, 12);
    const d3 = getRandomInt(2, 5); // ensure c-d > 0
    const ans3 = a3 + b3 * (c3 - d3);
    rows.push({ text: `Evaluate: $${a3} + ${b3} \\times (${c3} - ${d3})$`, answer: String(ans3) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: '',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'BODMAS'
    };
};

// --- CAT12: Algebraic Aggregation ---
export const generateAlgebraicAdditionSubtraction = () => {
    // Keep as MCQ, but verify format matches image style (12x - 4y + 3z) + (-6x + 10y - 14z)
    const a1 = getRandomInt(5, 15);
    const b1 = getRandomInt(2, 9); // we'll make it negative in string
    const c1 = getRandomInt(2, 9);

    const a2 = -1 * getRandomInt(2, 9);
    const b2 = getRandomInt(5, 15);
    const c2 = -1 * getRandomInt(5, 15);

    // Question: (a1 x - b1 y + c1 z) + (a2 x + b2 y + c2 z)
    // Coeffs X: a1 + a2
    const resX = a1 + a2;
    // Coeffs Y: -b1 + b2
    const resY = -b1 + b2;
    // Coeffs Z: c1 + c2
    const resZ = c1 + c2;

    const question = `$(${a1}x - ${b1}y + ${c1}z) + (${a2}x + ${b2}y ${c2}z)$`;

    const formatTerm = (coeff, variable, isFirst = false) => {
        if (coeff === 0) return "";
        let sign = coeff > 0 ? "+" : "-";
        if (isFirst && coeff > 0) sign = ""; // omit plus for first positive term

        const absCoeff = Math.abs(coeff);
        const val = absCoeff === 1 ? variable : `${absCoeff}${variable}`;

        // Add spacing around operator if not first
        return isFirst ? `${sign}${val}` : ` ${sign} ${val}`;
    };

    let ansStr = formatTerm(resX, 'x', true);
    // If x term was 0, then y becomes the first term visually (though we can just append, but we need to handle the sign correctly)
    // Actually simpler: build array of terms and join
    let terms = [];
    if (resX !== 0) terms.push(formatTerm(resX, 'x', true));
    // For subsequent terms, pass false for isFirst, but we need to be careful if previous terms were 0
    // Simpler approach:

    const buildExpr = (x, y, z) => {
        let t = [];
        if (x !== 0) t.push(x === 1 ? "x" : (x === -1 ? "-x" : `${x}x`));

        if (y !== 0) {
            let s = (y > 0) ? "+" : "-";
            let val = Math.abs(y) === 1 ? "y" : `${Math.abs(y)}y`;
            if (t.length === 0) t.push(y === 1 ? "y" : (y === -1 ? "-y" : `${y}y`)); // First term behavior
            else t.push(`${s} ${val}`);
        }

        if (z !== 0) {
            let s = (z > 0) ? "+" : "-";
            let val = Math.abs(z) === 1 ? "z" : `${Math.abs(z)}z`;
            if (t.length === 0) t.push(z === 1 ? "z" : (z === -1 ? "-z" : `${z}z`)); // First term behavior
            else t.push(`${s} ${val}`);
        }

        return t.length === 0 ? "0" : t.join(" ");
    };

    let ansStrFinal = buildExpr(resX, resY, resZ);

    // distractors
    let d1 = buildExpr(resX, resY - 2, resZ);
    let d2 = buildExpr(resX + 1, resY, resZ);
    let d3 = buildExpr(resX, resY, resZ + 2);
    let d4 = buildExpr(resX + 2, resY + 2, resZ + 2);

    // Helper to wrap
    const wrap = (s) => `$${s}$`;

    const options = ensureUnique({ value: wrap(ansStrFinal), label: wrap(ansStrFinal) }, [
        { value: wrap(d1), label: wrap(d1) },
        { value: wrap(d2), label: wrap(d2) },
        { value: wrap(d3), label: wrap(d3) },
        { value: wrap(d4), label: wrap(d4) }
    ]);

    return { type: 'mcq', question, answer: wrap(ansStrFinal), options, topic: 'Algebraic Addition' };
};

// --- CAT13: Algebraic Multiplication ---
export const generateAlgebraicMultiplication = () => {
    // Keep as MCQ (binomial product) (2x + 3y)(3x - 4y)
    const a = getRandomInt(2, 5);
    const b = getRandomInt(2, 5);
    const c = getRandomInt(2, 5);
    const d = getRandomInt(2, 5);

    // (ax + by)(cx - dy)
    // ac x^2 - ad xy + bc xy - bd y^2
    // ac x^2 + (bc - ad) xy - bd y^2

    const term1 = a * c;
    const term2 = (b * c) - (a * d); // coeff of xy
    const term3 = b * d; // since it is -d, last term is -bd y^2

    const question = `$(${a}x + ${b}y)(${c}x - ${d}y)$`;

    // Helper to format xy term
    const formatXY = (coeff) => {
        if (coeff === 0) return "";
        const sign = coeff > 0 ? "+" : "-";
        const val = Math.abs(coeff) === 1 ? "" : Math.abs(coeff);
        return ` ${sign} ${val}xy`;
    };

    const term2Str = formatXY(term2);
    const ansStr = `${term1}x^2${term2Str} - ${term3}y^2`;

    // format option wrapper with LaTeX delimiters
    const fo = (s) => ({ value: `$${s}$`, label: `$${s}$` });

    // Ensure distractors also format correctly
    // We reuse formatXY or manually build strings ensuring no 0xy

    // Distractor 1: Logic error in xy term
    const d1_term2 = term2 - 2; // e.g. -2xy
    const d1 = `${term1}x^2${formatXY(d1_term2)} - ${term3}y^2`;

    // Distractor 2: Sign error in y^2 (and reuse term2Str)
    const d2 = `${term1}x^2${term2Str} + ${term3}y^2`;

    // Distractor 3: Coefficient error in x^2
    const d3 = `${term1 + 1}x^2${term2Str} - ${term3}y^2`;

    const options = ensureUnique(fo(ansStr), [
        fo(d1),
        fo(d2),
        fo(d3),
        fo(`${term1}x^2${formatXY(Math.abs(term2) + 5)} - ${term3}y^2`)
    ]);

    return { type: 'mcq', question, answer: `$${ansStr}$`, options, topic: 'Algebraic Multiplication' };
};

// --- CAT14: Algebraic Division ---
export const generateAlgebraicDivision = () => {
    // Convert to Table Input
    // Format: (9x - 42) / (3x - 14) = 3
    const rows = [];

    // Q1: Constant factor
    const k1 = getRandomInt(2, 5);
    const a1 = getRandomInt(2, 5);
    const b1 = getRandomInt(5, 20); // (ax - b)
    // Numerator: k(ax - b) = k*a x - k*b
    const num1 = `${k1 * a1}x - ${k1 * b1}`;
    const den1 = `${a1}x - ${b1}`;
    rows.push({ text: `$(${num1}) \\div (${den1})$`, answer: String(k1) });

    // Q2: Quadratic / Quadratic (2 common)
    // (k(ax^2 + bx + c)) / (ax^2 + bx + c)
    // Q2 removed as per request (keep 1st and 3rd)

    // Q3: Monomial division
    // 63 p^4 m^2 n / 7 p^4 m^2 n = 9
    const k3 = getRandomInt(3, 9);
    const c3 = getRandomInt(3, 9);
    const num3 = `${k3 * c3}p^4m^2n`;
    const den3 = `${c3}p^4m^2n`;
    rows.push({ text: `$${num3} \\div ${den3}$`, answer: String(k3) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: '',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Algebraic Division'
    };
};

// --- CAT15: Linear Eq 1 Var ---
export const generateLinearEquationOneVar = () => {
    // Convert to Table Input
    // Format: 4x + 48 = 12 -> x = -9
    const rows = [];

    // Q1: ax + b = c
    const x1 = getRandomInt(2, 9); // let's keep x positive or negative
    const a1 = getRandomInt(2, 6);
    const b1 = getRandomInt(10, 50);
    // make lhs = c
    const c1 = a1 * x1 + b1;
    rows.push({ text: `Solve: $${a1}x + ${b1} = ${c1}$`, answer: String(x1) });

    // Q2: Structure like 2 - (3 - 4x) = 2x + 5  => a - (b - cx) = dx + e
    const x2 = getRandomInt(2, 8); // Answer
    const a2 = getRandomInt(2, 9);
    const b2 = getRandomInt(2, 9);
    const c2 = getRandomInt(4, 9); // Coeff of x inside bracket
    const d2 = getRandomInt(2, 5); // Coeff of x on RHS

    // a - b + cx = dx + e  =>  e = (a - b) + x(c - d)
    const e2 = (a2 - b2) + x2 * (c2 - d2);

    const rhsSign = e2 >= 0 ? '+' : '-';
    rows.push({ text: `Solve: $${a2} - (${b2} - ${c2}x) = ${d2}x ${rhsSign} ${Math.abs(e2)}$`, answer: String(x2) });

    // Q3: Slightly harder? 2x = x + k
    // or variables on both sides? Image is simple 4x+48=12.
    // Let's do variables on both sides: 5x = 3x + 10
    // const x3 = getRandomInt(2, 10);
    // const diff = getRandomInt(2, 5); // 2x
    // const rhs = diff * x3; // 10
    // // 5x = 3x + 10 -> (3+diff)x = 3x + rhs
    // rows.push({ text: `Solve: $${3 + diff}x = 3x + ${rhs}$`, answer: String(x3) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: 'Find the value of x for the following equations:',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Linear Equations in one Variable'
    };
};

// --- CAT16: Simultaneous Equations ---
// --- CAT16: Simultaneous Equations ---
// export const generateSimultaneousEquations = () => {
//     // 5x - 4y = 81
//     // 7x + 4y = 27
//     const rows = [];

//     // Generate integer solution
//     const x = getRandomInt(1, 10);
//     const y = getRandomInt(1, 10);

//     // Eq 1: a1x + b1y = c1
//     const a1 = getRandomInt(2, 9);
//     const b1 = getRandomInt(2, 9);
//     // Randomize signs
//     const sign1 = Math.random() < 0.5 ? -1 : 1;
//     const c1 = a1 * x + (sign1 * b1) * y;

//     // Eq 2: a2x + b2y = c2
//     const a2 = getRandomInt(2, 9);
//     const b2 = getRandomInt(2, 9);
//     // Ensure not parallel/identical lines
//     const sign2 = Math.random() < 0.5 ? -1 : 1;
//     const c2 = a2 * x + (sign2 * b2) * y;

//     const op1 = sign1 === -1 ? '-' : '+';
//     const op2 = sign2 === -1 ? '-' : '+';

//     const eqText = `$$ \\begin{cases} ${a1}x ${op1} ${b1}y = ${c1} \\\\ ${a2}x ${op2} ${b2}y = ${c2} \\end{cases} $$`;

//     rows.push({ text: `x =`, answer: String(x) });
//     rows.push({ text: `y =`, answer: String(y) });

//     const answerObj = { 0: String(x), 1: String(y) };

//     return {
//         type: 'tableInput',
//         question: `Solve Simultaneous Linear Equations in Two Variables: <br/> ${eqText}`,
//         answer: JSON.stringify(answerObj),
//         rows: rows,
//         topic: 'Simultaneous Equations'
//     };
// };

export const generateSimultaneousEquations = () => {
    let x, y, a1, b1, c1, a2, b2, c2, sign1, sign2;
    let isValid = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isValid && attempts < maxAttempts) {
        attempts++;

        // Generate integer solution
        x = getRandomInt(1, 10);
        y = getRandomInt(1, 10);

        // Eq 1: a1x + b1y = c1
        a1 = getRandomInt(2, 9);
        b1 = getRandomInt(2, 9);
        sign1 = Math.random() < 0.5 ? -1 : 1;
        c1 = a1 * x + (sign1 * b1) * y;

        // Eq 2: a2x + b2y = c2
        a2 = getRandomInt(2, 9);
        b2 = getRandomInt(2, 9);
        sign2 = Math.random() < 0.5 ? -1 : 1;
        c2 = a2 * x + (sign2 * b2) * y;

        // Check for valid system (not parallel, not identical)
        // Two lines are parallel/identical if a1/a2 = b1/b2
        // We need: a1 * (sign2 * b2) ≠ a2 * (sign1 * b1)
        const cross1 = a1 * (sign2 * b2);
        const cross2 = a2 * (sign1 * b1);

        // Ensure lines are not parallel (determinant ≠ 0)
        if (cross1 !== cross2) {
            // Additional check: ensure c1 and c2 are not zero
            if (c1 !== 0 && c2 !== 0) {
                // Check that equations are not identical
                // Scale check: if a1/a2 = b1/b2 = c1/c2, they're identical
                const ratio1 = a1 / a2;
                const ratio2 = (sign1 * b1) / (sign2 * b2);
                const ratio3 = c1 / c2;

                if (Math.abs(ratio1 - ratio2) > 0.001 || Math.abs(ratio1 - ratio3) > 0.001) {
                    isValid = true;
                }
            }
        }
    }

    // If we couldn't generate a valid system, use a fallback
    if (!isValid) {
        x = 3;
        y = 2;
        a1 = 5;
        b1 = 4;
        sign1 = -1;
        c1 = a1 * x + (sign1 * b1) * y; // 5*3 - 4*2 = 7
        a2 = 7;
        b2 = 4;
        sign2 = 1;
        c2 = a2 * x + (sign2 * b2) * y; // 7*3 + 4*2 = 29
    }

    const op1 = sign1 === -1 ? '-' : '+';
    const op2 = sign2 === -1 ? '-' : '+';

    const eqText = `$$ \\begin{cases} ${a1}x ${op1} ${b1}y = ${c1} \\\\ ${a2}x ${op2} ${b2}y = ${c2} \\end{cases} $$`;

    const rows = [];
    rows.push({ text: `x =`, answer: String(x) });
    rows.push({ text: `y =`, answer: String(y) });

    const answerObj = { 0: String(x), 1: String(y) };

    return {
        type: 'tableInput',
        question: `Solve Simultaneous Linear Equations in Two Variables: <br/> ${eqText}`,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Simultaneous Equations'
    };
};

// --- CAT17: Quadratic Equations ---
export const generateQuadraticEquation = () => {
    // x^2 - Sum x + Prod = 0
    // Ask for Smaller Root and Larger Root
    const rows = [];

    // Roots
    const r1 = getRandomInt(2, 9);
    const r2 = getRandomInt(r1 + 1, 12); // r2 > r1

    // eq: x^2 - (r1+r2)x + r1*r2 = 0
    const sum = r1 + r2;
    const prod = r1 * r2;
    const eq = `x^2 - ${sum}x + ${prod} = 0`;

    // Display equation using MathJax
    const eqText = `$$ ${eq} $$`;

    rows.push({ text: `Smaller Root $(x_1) =$`, answer: String(r1) });
    rows.push({ text: `Larger Root $(x_2) =$`, answer: String(r2) });



    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: `Solve the following Quadratic Equation: <br/> ${eqText}`,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Quadratic Equations'
    };
};

// --- CAT18: Perimeter ---
// --- CAT18: Perimeter ---
export const generatePerimeter = () => {
    const rows = [];
    const shapeType = getRandomInt(1, 4); // 1: Circle, 2: Rectangle, 3: Square
    let questionText = "";
    let answer = "";
    let svg = "";

    if (shapeType === 1) {
        // Circle
        const r = 7 * getRandomInt(1, 5); // divisible by 7
        questionText = `Find the perimeter of circle with radius $${r}$ cm. (Take $\\pi = \\frac{22}{7}$)`;
        answer = String(2 * (22 / 7) * r);

        svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="70" stroke="#334155" stroke-width="2" fill="#eff6ff" />
            <line x1="100" y1="100" x2="170" y2="100" stroke="#334155" stroke-width="2" />
            <text x="110" y="90" font-family="sans-serif" font-size="16" fill="#334155">${r} cm</text>
        </svg>`;

    } else if (shapeType === 2) {
        // Rectangle
        const l = getRandomInt(5, 15);
        const w = getRandomInt(2, 10);
        questionText = `Find the perimeter of a rectangle with length $${l}$ cm and width $${w}$ cm.`;
        answer = String(2 * (l + w));

        svg = `<svg width="250" height="200" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="50" width="200" height="100" stroke="#334155" stroke-width="2" fill="#eff6ff" />
            <text x="125" y="40" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#334155">${l} cm</text>
            <text x="10" y="105" font-family="sans-serif" font-size="16" fill="#334155">${w} cm</text>
        </svg>`;

    } else {
        // Square
        const s = getRandomInt(4, 12);
        questionText = `Find the perimeter of a square with side $${s}$ cm.`;
        answer = String(4 * s);

        svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="50" width="100" height="100" stroke="#334155" stroke-width="2" fill="#eff6ff" />
            <text x="100" y="40" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#334155">${s} cm</text>
            <text x="15" y="105" font-family="sans-serif" font-size="16" fill="#334155">${s} cm</text>
        </svg>`;
    }

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const imgHtml = `<div style="display:flex; justify-content:center; margin: 15px 0;"><img src="${svgDataUrl}" alt="Shape" style="max-height: 200px;" /></div>`;

    rows.push({ text: `Perimeter =`, unit: 'cm', answer: answer });

    const answerObj = { 0: answer };

    return {
        type: 'tableInput',
        question: questionText + imgHtml,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Perimeter of Plane Figures'
    };
};

// --- CAT19: Area ---
// --- CAT19: Area ---
export const generateArea = () => {
    const rows = [];

    // Logic: Triangle Area. Mixed Units.
    // Area (A) in sq.cm. Base (b) in m. Find Height (h) in cm.
    // User requested: Area <= 50 sq cm. Base = 0.1m or 0.2m.

    // 1. Pick base in m: 0.1 or 0.2
    const b_m = Math.random() > 0.5 ? 0.1 : 0.2;
    const b_cm = b_m * 100; // 10 or 20 cm

    // 2. Determine Height such that Area <= 50
    // Area = 0.5 * b_cm * h_cm
    // 50 >= 0.5 * b_cm * h_cm  => 100 >= b_cm * h_cm => h_cm <= 100 / b_cm

    // Max height allowed:
    const max_h = Math.floor(100 / b_cm); // If b=10, max_h=10; If b=20, max_h=5

    // Ensure height is at least 1 and integer
    const h_cm = getRandomInt(1, max_h);

    const area = 0.5 * b_cm * h_cm; // in sq.cm. Will be <= 50.

    // Text: "If the area of \triangle ABC is {area} sq.cm and the base measure {b_m} m then find the height in cm."
    const questionText = `If the area of $\\triangle ABC$ is $${area}$ sq.cm and the base measure $${b_m}$ m then find the height in cm.`;

    rows.push({ text: `Height =`, unit: 'cm', answer: String(h_cm) });

    const answerObj = { 0: String(h_cm) };

    return {
        type: 'tableInput',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Area of Plane Figures'
    };
};

// --- CAT20: Cartesian Point ---
// --- CAT20: Cartesian Point ---
export const generateCartesianPoint = () => {
    // Show table with Points (x,y) -> Select Box [Quadrant-1, Quadrant-2, Quadrant-3, Quadrant-4]
    const rows = [];
    const options = ['Quadrant-1', 'Quadrant-2', 'Quadrant-3', 'Quadrant-4'];

    const getQuad = (x, y) => {
        if (x > 0 && y > 0) return 'Quadrant-1';
        if (x < 0 && y > 0) return 'Quadrant-2';
        if (x < 0 && y < 0) return 'Quadrant-3';
        if (x > 0 && y < 0) return 'Quadrant-4';
        return 'Quadrant-1';
    };

    // Generate one config for each quadrant:
    // Q1: (+, +), Q2: (-, +), Q3: (-, -), Q4: (+, -)
    const configs = [
        { xSign: 1, ySign: 1 },
        { xSign: -1, ySign: 1 },
        { xSign: -1, ySign: -1 },
        { xSign: 1, ySign: -1 }
    ];

    // Shuffle the quadrants so they appear in random order
    const shuffledConfigs = shuffleArray(configs);

    for (let i = 0; i < 4; i++) {
        // Ensure non-zero coordinates
        let x = getRandomInt(1, 15) * shuffledConfigs[i].xSign;
        let y = getRandomInt(1, 15) * shuffledConfigs[i].ySign;

        rows.push({
            text: `$(${x}, ${y})$`,
            inputType: 'select',
            options: options,
            answer: getQuad(x, y)
        });
    }

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: 'Select the quadrant in which the following points are present:',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Locating a point in a Cartesian Plane'
    };
};

// --- CAT21: Coordinate Geometry ---
export const generateCoordinateGeometry = () => {
    const rows = [];

    // Distance Formula: sqrt((x2-x1)^2 + (y2-y1)^2)
    // We want integer distance results (Pythagorean Triples)
    // Triples: (3,4,5), (5,12,13), (8,15,17), (6,8,10), (9,12,15)

    const triples = [
        [3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [12, 16, 20]
    ];
    const [dx, dy, dist] = triples[getRandomInt(0, triples.length - 1)];

    // Pick P(x1, y1)
    const x1 = getRandomInt(-10, 10);
    const y1 = getRandomInt(-10, 10);

    // Determine Q(x2, y2) based on dx, dy
    // Randomize direction by multiplying dx/dy by -1 or 1
    const sx = Math.random() < 0.5 ? 1 : -1;
    const sy = Math.random() < 0.5 ? 1 : -1;

    const x2 = x1 + (sx * dx);
    const y2 = y1 + (sy * dy);

    // Question Text: "Distance between the points P(x1, y1) and Q(x2, y2)"
    const questionText = `Distance between the points $P(${x1}, ${y1})$ and $Q(${x2}, ${y2})$`;

    rows.push({ text: `Distance =`, unit: 'units', answer: String(dist) });

    const answerObj = { 0: String(dist) };

    return {
        type: 'tableInput',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Coordinate Geometry'
    };
};

// --- CAT22: Section Formula ---
// --- CAT22: Section Formula ---
export const generateSectionFormula = () => {
    // Internal Division
    // P = ( (m*x2 + n*x1)/(m+n), (m*y2 + n*y1)/(m+n) )
    const rows = [];

    // Dynamic Ratio m:n where m, n are randomly chosen from 1 to 3
    let m = getRandomInt(1, 3);
    let n = getRandomInt(1, 3);
    while (m === n) n = getRandomInt(1, 3); // Ensure ratio is not 1:1 or 2:2
    const sum = m + n;

    // Helper to find valid mate coordinate
    // We need |x2 - x1| to be a multiple of 3
    // And x1, x2 in range [-5, 5]
    const getValidPair = () => {
        const c1 = getRandomInt(-5, 5);
        const candidates = [];
        for (let c2 = -5; c2 <= 5; c2++) {
            if (c2 !== c1 && (c2 - c1) % sum === 0) {
                candidates.push(c2);
            }
        }
        // Fallback if no candidate (unlikely given range and step 3)
        // -5 to 5 is span of 10. Steps of 3 fit easily.
        if (candidates.length === 0) return [c1, c1]; // Should not happen
        const c2 = candidates[getRandomInt(0, candidates.length - 1)];
        return [c1, c2];
    };

    const [x1, x2] = getValidPair();
    const [y1, y2] = getValidPair();

    // Calculate P
    // P = (1*x2 + 2*x1) / 3
    const px = (m * x2 + n * x1) / sum;
    const py = (m * y2 + n * y1) / sum;

    const questionText = `Given $A = (${x1}, ${y1})$ and $B = (${x2}, ${y2})$ what are the coordinates of point $P = (x, y)$ which internally divides line segment $\\overleftrightarrow{AB}$ in the ratio ${m}:${n}?`;

    rows.push({ text: `P = `, answer: `(${px},${py})` });

    const answerObj = { 0: { x: String(px), y: String(py) } };

    return {
        type: 'tableInput',
        variant: 'coordinate',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Section Formula'
    };
};

// --- CAT23: Trigonometry ---
export const generateTrigonometry = () => {
    // "If SinA = 3/5 then match the following:"
    // CosA = [], TanA = [], SecA = [], CotA = []

    const rows = [];

    // Pythagorean Triples (Opp, Adj, Hyp)
    const triples = [
        [3, 4, 5], [5, 12, 13], [8, 15, 17]
    ];
    // Randomly pick a triple and swap adj/opp for variety
    let [opp, adj, hyp] = triples[getRandomInt(0, triples.length - 1)];
    if (Math.random() < 0.5) {
        [opp, adj] = [adj, opp];
    }

    // Given SinA = opp/hyp
    // Find CosA(adj/hyp), TanA(opp/adj), SecA(hyp/adj), CotA(adj/opp)

    const ratios = [
        { label: '\\cos A', val: { n: adj, d: hyp } },
        { label: '\\tan A', val: { n: opp, d: adj } },
        { label: '\\sec A', val: { n: hyp, d: adj } },
        { label: '\\cot A', val: { n: adj, d: opp } }
    ];

    // Convert to rows. "text" is label (e.g. CosA = ).
    // We use variant 'fraction' which expects answer stringified {num:..., den:...}
    // Actually, TypeTableInput variant='fraction' uses separate num/den inputs.
    // The expected "answer" string in row object is for validation.
    // But wait, TypeTableInput validation usually compares a string.
    // For 'fraction' variant, the component renders two inputs. 
    // The component's `handleInputChange` updates `{num:..., den:...}`.
    // The final answer object will have keys 0..3, each value is json string or object.

    // Let's format the answer so we can validate it easily?
    // Actually the validation script `test_grade10.mjs` just checks validity of structure.
    // For manual checking or future auto-grading, we should probably store "num,den" string or object.

    const answerObj = {};

    ratios.forEach((r, idx) => {
        rows.push({
            // TypeTableInput logic:
            // If variant='fraction', it renders fraction inputs.
            // We need a visual label "CosA ="
            // The component renders: 
            // <div className={variant === 'fraction' ? Styles.fractionRow ...>
            //   <div ...>{renderCellContent(row.left)}</div>
            //   <div ...>{row.op}</div> ...
            // left, op, right are used if provided. 
            // Or row.text is used.
            // If row.text is used, it renders textCell + inputCell.
            // In 'fraction' mode, inputCell handles fraction inputs.

            // Re-reading TypeTableInput:
            // if (row.text) { render textCell; renderInputCell(idx); }
            // renderInputCell checks variant. If 'fraction', renders fraction inputs.
            // Perfect.

            text: `$${r.label} =$`,
            answer: JSON.stringify({ num: String(r.val.n), den: String(r.val.d) })
        });
        answerObj[idx] = { num: String(r.val.n), den: String(r.val.d) };
    });

    // Given Text
    const questionText = `If $\\sin A = \\frac{${opp}}{${hyp}}$ then match the following trigonometric ratios:`;

    return {
        type: 'tableInput',
        variant: 'fraction',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Trigonometry'
    };
};

// --- CAT24: Trig Ratios of Standard Angles ---
// --- CAT24: Trig Ratios of Standard Angles ---
export const generateTrigRatios = () => {
    const rows = [];

    // Define options for each function that result in integers
    const config = {
        'sin': [{ angle: '0^\\circ', val: '0' }, { angle: '90^\\circ', val: '1' }],
        'cos': [{ angle: '0^\\circ', val: '1' }, { angle: '90^\\circ', val: '0' }],
        'tan': [{ angle: '0^\\circ', val: '0' }, { angle: '45^\\circ', val: '1' }],
        'cot': [{ angle: '45^\\circ', val: '1' }, { angle: '90^\\circ', val: '0' }],
        'sec': [{ angle: '0^\\circ', val: '1' }, { angle: '60^\\circ', val: '2' }],
        'cosec': [{ angle: '30^\\circ', val: '2' }, { angle: '90^\\circ', val: '1' }]
    };

    const functions = ['sin', 'cos', 'tan', 'cot', 'sec', 'cosec'];

    // Shuffle the order of functions so they don't appear in fixed sequence
    const shuffledFuncs = shuffleArray([...functions]);

    shuffledFuncs.forEach(func => {
        const options = config[func];
        // Pick one random angle scenario for this function
        const selected = options[getRandomInt(0, options.length - 1)];

        let labelFunc = (func === 'cosec') ? '\\text{cosec}' : ('\\' + func);

        rows.push({
            text: `$${labelFunc}(${selected.angle}) =$`,
            answer: selected.val
        });
    });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: 'Find the values of the following:',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Trigonometric Ratios of Standard angles'
    };
};

// --- CAT25: Pythagoras ---
// --- CAT25: Pythagoras ---
export const generatePythagoras = () => {
    const rows = [];

    // Find tuples satisfying constraints: base <= 12, height <= 10, hypotenuse is integer
    const candidates = [];
    for (let b = 1; b <= 12; b++) { // Distance limit
        for (let h = 1; h <= 10; h++) { // Height limit
            const hypSq = b * b + h * h;
            const hyp = Math.sqrt(hypSq);
            if (Number.isInteger(hyp)) {
                candidates.push({ b, h, hyp });
            }
        }
    }

    // Pick random valid tuple
    // Fallback if empty (shouldn't happen as 3,4,5 exists)
    const selection = candidates.length > 0 ? candidates[getRandomInt(0, candidates.length - 1)] : { b: 3, h: 4, hyp: 5 };
    const { b: b_val, h: h_val, hyp: hyp_val } = selection;

    // Generate Dynamic SVG
    // Triangle coords: Base starts at (20, 130), goes to (130, 130) max width
    // Simply stick to a right triangle visual. 
    // Vertices: A(20, 20), B(20, 130), C(130, 130) is flipped.
    // Flag pole usually vertical.
    // Let's create a visual scaled reasonably 
    // Pole at right side? Or left? Image showed pole on right.
    // Thread hypotenuse.
    // Let's settle coords:
    // Base line: (20, 140) to (140, 140)
    // Pole: (140, 140) up to (140, 20)
    // Thread: (20, 140) to (140, 20)
    // Vertices: P1(20, 140) [ground left], P2(140, 140) [base of pole], P3(140, 20) [top of pole]

    // We can just label sides. visual scale doesn't need to match perfect aspect ratio for simple schemas, but distinct is nice.
    const svg = `<svg width="200" height="160" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
        <!-- Ground -->
        <line x1="10" y1="150" x2="190" y2="150" stroke="#94a3b8" stroke-width="2" />
        
        <!-- Triangle -->
        <path d="M 40 150 L 160 150 L 160 30 Z" fill="#fef08a" stroke="none" opacity="0.5" />
        <path d="M 40 150 L 160 150 L 160 30 Z" fill="none" stroke="#0f172a" stroke-width="2" />

        <!-- Labels -->
        <text x="170" y="90" font-family="sans-serif" font-size="14" fill="#0f172a">Pole</text>
        <text x="80" y="80" transform="rotate(-38 90 80)" font-family="sans-serif" font-size="14" fill="#0f172a">Thread</text>
        
        <!-- Dimensions -->
        <text x="100" y="145" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0f172a">d</text>
        <!-- Arrows for d -->
        <path d="M 45 135 L 40 140 L 45 145" fill="none" stroke="#0f172a" stroke-width="1.5" />
        <path d="M 155 135 L 160 140 L 155 145" fill="none" stroke="#0f172a" stroke-width="1.5" />
        <line x1="40" y1="140" x2="160" y2="140" stroke="#0f172a" stroke-width="1" />
    </svg>`;

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const imgHtml = `<div style="display:flex; justify-content:center; margin-top:10px;"><img src="${svgDataUrl}" alt="Triangle" /></div>`;

    const questionText = `If a flag pole of height $${h_val}$ meters is erected with the help of a thread of length $${hyp_val}$ meters then what is the distance between base of the thread to base of pole in meters ? ${imgHtml}`;

    rows.push({ text: `$d =$`, unit: 'm', answer: String(b_val) });
    const answerObj = { 0: String(b_val) };

    return {
        type: 'tableInput',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Word Problems - Pythagorean Theorem'
    };
};

// --- CAT26: Clocks ---
export const generateClocks = () => {
    // "What is the angle between the hour hand and minute hand on a clock when the time is 1:30 ?"
    const rows = [];

    // Pick random time
    const h = getRandomInt(1, 12);
    const m = getRandomInt(0, 11) * 5;

    // Angle Formula: | 0.5 * (60h - 11m) |
    const val = Math.abs(0.5 * (60 * h - 11 * m));
    const angle = Math.min(360 - val, val);

    const mStr = m < 10 ? `0${m}` : m;
    const questionText = `What is the angle between the hour hand and minute hand on a clock when the time is $${h}:${mStr}$ ?`;

    rows.push({ text: `$Angle =$`, unit: 'degrees', answer: String(angle) });
    const answerObj = { 0: String(angle) };

    return {
        type: 'tableInput',
        question: questionText,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Clocks'
    };
};

// --- CAT27: True/False (was Probability) ---
export const generateProbability = () => {
    // "True or False" table
    const rows = [];

    const pool = [
        { q: `$\\sqrt{a} + \\sqrt{b} = \\sqrt{a+b}$`, a: 'False' },
        { q: `$-3^2 = 9$`, a: 'False' },
        { q: `$\\frac{a}{a+b} = \\frac{a}{a} + \\frac{a}{b}$`, a: 'False' },
        { q: `$(a+b)^2 = a^2 + b^2$`, a: 'False' },
        // { q: `$\\sqrt{x^2+y^2} = x+y$`, a: 'False' },
        // { q: `$sin(90^\\circ) = 1$`, a: 'True' },
        // { q: `$2^3 \\times 2^2 = 2^5$`, a: 'True' },
        // { q: `$2^2 = -8$`, a: 'False' }
    ];

    const selected = [];
    while (selected.length < 3) {
        const item = pool[getRandomInt(0, pool.length - 1)];
        if (!selected.includes(item)) selected.push(item);
    }

    selected.forEach((item, idx) => {
        rows.push({
            text: item.q,
            inputType: 'radio',
            options: ['True', 'False'],
            answer: item.a
        });
    });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: 'tableInput',
        question: 'True or False',
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Miscellaneous'
    };
};

// --- CAT28: Probability (Dice Sum) ---
export const generateDiceProbability = () => {
    // "Two dice are thrown... probability that sum is X?"
    // Sums map:
    // 2: (1,1) -> 1
    // 3: (1,2),(2,1) -> 2
    // 4: (1,3),(2,2),(3,1) -> 3
    // 5: 4
    // 6: 5
    // 7: 6
    // 8: 5
    // 9: 4
    // 10: 3
    // 11: 2
    // 12: 1

    // Pick a random target sum between 2 and 12
    const targetSum = getRandomInt(2, 12);
    let count = 0;
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
            if (i + j === targetSum) count++;
        }
    }

    // Fraction is count/36
    // Simplify? User input usually expects simplified or raw? 
    // Image implies inputs for num/den. Let's not simplify for now or calculate standard reduction.
    // If I use Fraction type, it checks equivalence usually if implemented right, 
    // but TypeTableInput fraction checking might be simple string compare.
    // Let's assume standard form.

    // Simplification logic
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const common = gcd(count, 36);
    const num = count / common;
    const den = 36 / common;

    const rows = [];
    rows.push({
        text: 'Probability =',
        answer: JSON.stringify({ num: String(num), den: String(den) }) // Fraction variant expects {num, den} answer format?
        // Actually TypeTableInput variant='fraction' usually expects answer to be just the string "num/den" or object?
        // Let's check handleInputChange or check logic. 
        // Logic: if variant fraction, input is object {num, den}. 
        // And comparison? usually simple. Let's return JSON string of object for the row answer to be parsed?
        // Wait, standard `answer` in row object is string.
        // Let's store it as `{num: "1", den: "36"}` (object).
        // But `row.answer` is usually a string in other generators.
        // Let's look at CAT03 (Fractions) if it exists. 
        // Actually I haven't implemented fraction table inputs yet heavily.
        // Let's use string "num/den" and hope check works or I might need to adjust.
        // Wait, `TypeTableInput` check logic: 
        // `if (variant === 'fraction') { ... check num and den ... }`
        // Let's look at TypeTableInput component later if needed. 
        // For now providing key-value "num" and "den".
    });

    // NOTE: The valid answer for the row should be an object for fraction variant comparison
    // But `answer` prop in row is often string. 
    // Let's store it as `{num: "1", den: "36"}` (object).
    rows[0].answer = { num: String(num), den: String(den) };

    const answerObj = { 0: rows[0].answer };

    return {
        type: 'tableInput',
        variant: 'fraction',
        question: `Two dice are thrown at the same time. What is the probability that the sum of numbers on the dice is $${targetSum}$ ?`,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Probability'
    };
};

// --- CAT29: Word Problem (Linear Eq) ---
export const generateAgeProblem = () => {
    // Father = M * Son
    // Father + Y = M_future * (Son + Y)
    // M*S + Y = Mf*S + Mf*Y
    // S(M - Mf) = Y(Mf - 1)
    // S = Y(Mf - 1) / (M - Mf)

    // We need integer S.
    // Let's pick M, Mf, Y such that S is integer.
    // Common sets:
    // M=4, Mf=3. (4-3)=1. Denom is 1. Always works!
    // S = Y(2)/1 = 2Y.
    // If Y=5, S=10. F=40.
    // After 5 yrs: S=15, F=45. 45 = 3*15. Correct.

    // M=3, Mf=2. (3-2)=1. Always works.
    // S = Y(1)/1 = Y.
    // If Y=10, S=10, F=30.
    // After 10: S=20, F=40. 40=2*20. Correct.

    // Let's randomize between these two reliable patterns.
    const pattern = getRandomInt(0, 1);
    let M, Mf, Y, S, F;

    if (pattern === 0) {
        M = 4; Mf = 3;
        Y = getRandomInt(4, 8); // Random years 4-8
        S = 2 * Y;
    } else {
        M = 3; Mf = 2;
        Y = getRandomInt(5, 12);
        S = Y;
    }

    F = M * S;

    const rows = [];
    rows.push({ text: `Robert's age =`, answer: String(S) });
    rows.push({ text: `Robert's father's age =`, answer: String(F) });

    const answerObj = { 0: String(S), 1: String(F) };

    return {
        type: 'tableInput',
        question: `Robert's father is $${M}$ times as old as Robert. After $${Y}$ years, father will be ${Mf === 2 ? 'twice' : Mf === 3 ? 'three times' : '$' + Mf + '$ times'} as old as Robert. Find their present ages.`,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Linear Equations Word Problems'
    };
};

// --- CAT30: Word Problem (Quadratic) ---
export const generateNumberSquareProblem = () => {
    // "Sum of a positive number and its square is X. Find the number."
    // n + n^2 = X
    // Pick n (positive integer).
    const n = getRandomInt(3, 12);
    const X = n + n * n;

    const rows = [];
    // Image shows NO label, just input. 
    // Using "Number =" as text or empty string?
    // If I use empty string, it might trigger the equation view unless I modified it.
    // But I modified `grade10Generators.mjs` not the component heavily for empty text logic logic.
    // Actually, earlier bug was empty text -> equation 4 cols.
    // Safest is "Number =". User surely won't mind a label.
    rows.push({ text: `Number =`, answer: String(n) });

    const answerObj = { 0: String(n) };

    return {
        type: 'tableInput',
        question: `The sum of a positive number and its square is $${X}$. Find the number.`,
        answer: JSON.stringify(answerObj),
        rows: rows,
        topic: 'Quadratic Equations Word Problems'
    };
};

export const generatePerimeterAndArea = () => {
    const rows = [];
    const answerObj = {};
    let index = 0;

    // Helper to create SVGs
    const createSvg = (content, w = 100, h = 80) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto;">${content}</svg>`;

    // 1. Rectangle
    const l = getRandomInt(4, 10);
    const w = getRandomInt(2, l - 1);
    const rectSvg = createSvg(`
        <rect x="10" y="20" width="80" height="40" stroke="crimson" stroke-width="2" fill="none" />
        <text x="50" y="15" font-size="12" text-anchor="middle" fill="black">${l} cm</text>
        <text x="90" y="45" font-size="12" text-anchor="end" fill="black">${w} cm</text>
    `);

    rows.push({ text: `Rectangle`, image: rectSvg });
    answerObj[index++] = { perimeter: String(2 * (l + w)), area: String(l * w) };

    // 2. Square
    const s = getRandomInt(3, 10);
    const sqSvg = createSvg(`
        <rect x="30" y="20" width="40" height="40" stroke="crimson" stroke-width="2" fill="none" />
        <text x="50" y="75" font-size="12" text-anchor="middle" fill="black">${s} cm</text>
    `);

    rows.push({ text: `Square`, image: sqSvg });
    answerObj[index++] = { perimeter: String(4 * s), area: String(s * s) };

    // 3. Triangle (Right Angled for simplicity matches 3,4,5 logic)
    // Draw right triangle
    const triplet = shuffleArray([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]])[0];
    const base = triplet[0];
    const height = triplet[1];
    const hyp = triplet[2];

    const triSvg = createSvg(`
        <polygon points="40,70 40,20 100,70" stroke="crimson" stroke-width="2" fill="none" />
        <text x="35" y="45" font-size="12" text-anchor="end" fill="black">${height} cm</text>
        <text x="70" y="85" font-size="12" text-anchor="middle" fill="black">${base} cm</text>
        <text x="75" y="40" font-size="12" text-anchor="start" fill="black">${hyp} cm</text>
    `, 120, 90);

    rows.push({ text: `Right Triangle`, image: triSvg });
    answerObj[index++] = { perimeter: String(base + height + hyp), area: String(0.5 * base * height) };

    // 4. Parallelogram (base, side, height)
    const pBase = getRandomInt(5, 12);
    const pSide = getRandomInt(4, 10);
    const pHeight = getRandomInt(2, pSide - 1);

    const paraSvg = createSvg(`
        <polygon points="20,70 40,20 90,20 70,70" stroke="crimson" stroke-width="2" fill="none" />
        <line x1="40" y1="20" x2="40" y2="70" stroke="black" stroke-width="1" stroke-dasharray="4" />
        <text x="45" y="85" font-size="12" text-anchor="middle" fill="black">${pBase} cm</text>
        <rect x="40" y="60" width="10" height="10" fill="none" stroke="black" stroke-width="1" />
        <text x="30" y="50" font-size="12" text-anchor="end" fill="black">${pHeight} cm</text> 
        <text x="80" y="45" font-size="12" text-anchor="middle" fill="black">${pSide} cm</text>
    `, 110, 90);

    rows.push({ text: `Parallelogram`, image: paraSvg });
    answerObj[index++] = { perimeter: String(2 * (pBase + pSide)), area: String(pBase * pHeight) };

    // 5. Circle
    const r = 7 * getRandomInt(1, 4);
    const circSvg = createSvg(`
        <circle cx="50" cy="40" r="30" stroke="crimson" stroke-width="2" fill="none" />
        <line x1="50" y1="40" x2="80" y2="40" stroke="black" stroke-width="1" />
        <text x="65" y="35" font-size="12" text-anchor="middle" fill="black">${r} cm</text>
    `);

    rows.push({ text: `Circle`, image: circSvg });
    answerObj[index++] = { perimeter: String(2 * 22 * (r / 7)), area: String(22 * (r / 7) * r) };

    return {
        type: "tableInput",
        variant: "double-input",
        topic: "Perimeter and Area",
        headers: ["Shape", "Perimeter", "Area"],
        inputKeys: ["perimeter", "area"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};
