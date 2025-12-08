// Grade 7 with LaTeX - Moderate complexity
// Focus: Fractions, exponents, simple algebra, percentages

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Integers ---

export const generateIntegerOps = () => {
    const ops = ["Add", "Subtract", "Multiply", "Divide"];
    const op = ops[getRandomInt(0, 3)];

    let n1 = getRandomInt(-50, 50);
    let n2 = getRandomInt(-20, 20);
    while (n2 === 0) n2 = getRandomInt(-20, 20);

    let question, answer;

    if (op === "Add") {
        question = `Evaluate: $${n1} + (${n2})$`;
        answer = String(n1 + n2);
    } else if (op === "Subtract") {
        question = `Evaluate: $${n1} - (${n2})$`;
        answer = String(n1 - n2);
    } else if (op === "Multiply") {
        question = `Evaluate: $${n1} \\times (${n2})$`;
        answer = String(n1 * n2);
    } else {
        n1 = n2 * getRandomInt(-10, 10);
        question = `Evaluate: $${n1} \\div (${n2})$`;
        answer = String(n1 / n2);
    }

    const val = Number(answer);
    const options = shuffleArray([
        { value: String(val), label: String(val) },
        { value: String(-val), label: String(-val) },
        { value: String(val + 1), label: String(val + 1) },
        { value: String(val - 1), label: String(val - 1) }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(100, 200);
        uniqueOptions.push({ value: String(r), label: String(r) });
    }

    return {
        type: "userInput",
        question: question,
        topic: `Integers / ${op}`,
        answer: answer
    };
};

// --- Rational Numbers ---

export const generateRationalOps = () => {
    const op = Math.random() > 0.5 ? "+" : "-";
    const d = getRandomInt(2, 10);
    const n1 = getRandomInt(-10, 10);
    const n2 = getRandomInt(-10, 10);

    const question = `Simplify: $\\frac{${n1}}{${d}} ${op} \\frac{${n2}}{${d}}$`;
    let num;
    if (op === "+") num = n1 + n2;
    else num = n1 - n2;

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const common = Math.abs(gcd(num, d));
    const sNum = num / common;
    const sDen = d / common;

    const answer = `${sNum}/${sDen}`;

    const options = shuffleArray([
        { value: answer, label: `$\\frac{${sNum}}{${sDen}}$` },
        { value: `${-sNum}/${sDen}`, label: `$\\frac{${-sNum}}{${sDen}}$` },
        { value: `${sNum}/${sDen + 1}`, label: `$\\frac{${sNum}}{${sDen + 1}}$` },
        { value: `${sDen}/${sNum}`, label: `$\\frac{${sDen}}{${sNum}}$` }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r1 = getRandomInt(1, 10);
        const r2 = getRandomInt(1, 10);
        const val = `${r1}/${r2}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$\\frac{${r1}}{${r2}}$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Rational Numbers / Operations",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Exponents ---

export const generateExponentLaws = () => {
    const base = getRandomInt(2, 5);
    const p1 = getRandomInt(2, 5);
    const p2 = getRandomInt(2, 5);
    const type = Math.random() > 0.5 ? "Mul" : "Div";

    let question, answer, wrong1;

    if (type === "Mul") {
        question = `Simplify: $${base}^{${p1}} \\times ${base}^{${p2}}$`;
        answer = `$${base}^{${p1 + p2}}$`;
        wrong1 = `$${base}^{${p1 * p2}}$`;
    } else {
        const big = Math.max(p1, p2) + 2;
        const small = Math.min(p1, p2);
        question = `Simplify: $${base}^{${big}} \\div ${base}^{${small}}$`;
        answer = `$${base}^{${big - small}}$`;
        wrong1 = `$${base}^{${big + small}}$`;
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: wrong1, label: wrong1 },
        { value: `$${base}^{${Math.abs(p1 - p2) + 1}}$`, label: `$${base}^{${Math.abs(p1 - p2) + 1}}$` },
        { value: `$${base + 1}^{${p1}}$`, label: `$${base + 1}^{${p1}}$` }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(2, 10);
        const val = `$${base}^{${r}}$`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Exponents / Laws",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateStandardForm = () => {
    const num = getRandomInt(1, 9);
    const decimal = getRandomInt(10, 99);
    const power = getRandomInt(3, 8);

    const valStr = `${num}${decimal}` + "0".repeat(power - 2);
    const question = `Write $${valStr}$ in standard form.`;
    const answer = `$${num}.${decimal} \\times 10^{${power}}$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `$${num}.${decimal} \\times 10^{${power - 1}}$`, label: `$${num}.${decimal} \\times 10^{${power - 1}}$` },
        { value: `$${num}${decimal} \\times 10^{${power - 2}}$`, label: `$${num}${decimal} \\times 10^{${power - 2}}$` },
        { value: `$0.${num}${decimal} \\times 10^{${power + 1}}$`, label: `$0.${num}${decimal} \\times 10^{${power + 1}}$` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Exponents / Standard Form",
        options: options,
        answer: answer
    };
};

// --- BODMAS ---

export const generateBODMAS = () => {
    const n1 = getRandomInt(2, 10);
    const n2 = getRandomInt(2, 10);
    const n3 = getRandomInt(2, 10);
    const n4 = getRandomInt(2, 10);

    const question = `Evaluate: $${n1} + ${n2} \\times ${n3} - ${n4}$`;
    const answer = String(n1 + (n2 * n3) - n4);
    const wrong1 = String((n1 + n2) * n3 - n4);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: wrong1, label: wrong1 },
        { value: String(Number(answer) + 10), label: String(Number(answer) + 10) },
        { value: String(Number(answer) - 5), label: String(Number(answer) - 5) }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(20, 50);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "BODMAS",
        answer: answer
    };
};

// --- Algebra ---

export const generateAlgebraTerms = () => {
    const coeff = getRandomInt(2, 9);
    const variable = ["x", "y", "z", "a", "b"][getRandomInt(0, 4)];
    const constant = getRandomInt(1, 10);
    const term = `${coeff}${variable}`;
    const expr = `${term} + ${constant}`;

    const type = Math.random() > 0.5 ? "Coefficient" : "Constant";
    let question, answer;

    if (type === "Coefficient") {
        question = `Identify the coefficient of $${variable}$ in the expression: $${expr}$`;
        answer = String(coeff);
    } else {
        question = `Identify the constant term in the expression: $${expr}$`;
        answer = String(constant);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(coeff + constant), label: String(coeff + constant) },
        { value: String(Math.abs(coeff - constant)), label: String(Math.abs(coeff - constant)) },
        { value: "1", label: "$1$" }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(10, 20);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Algebra / Basics",
        answer: answer
    };
};

export const generateLinearEquation = () => {
    const a = getRandomInt(2, 9);
    const x = getRandomInt(2, 10);
    const b = getRandomInt(1, 20);
    const c = a * x + b;

    const question = `Solve for $x$: $${a}x + ${b} = ${c}$`;
    const answer = String(x);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(x + 1), label: String(x + 1) },
        { value: String(x - 1), label: String(x - 1) },
        { value: String(c), label: String(c) }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(20, 50);
        uniqueOptions.push({ value: String(r), label: String(r) });
    }

    return {
        type: "userInput",
        question: question,
        topic: "Algebra / Linear Equations",
        answer: answer
    };
};

export const generateAlgebraWordProblem = () => {
    const type = Math.random() > 0.5 ? "Number" : "Age";
    let question, answer;

    if (type === "Number") {
        const x = getRandomInt(5, 20);
        const mult = getRandomInt(2, 5);
        const add = getRandomInt(1, 10);
        const res = mult * x + add;

        question = `If $${add}$ is added to $${mult}$ times a number, the result is $${res}$. Find the number.`;
        answer = String(x);
    } else {
        const bAge = getRandomInt(5, 15);
        const times = getRandomInt(2, 4);
        const aAge = times * bAge;
        const sum = aAge + bAge;

        question = `Ram is $${times}$ times as old as Shyam. The sum of their ages is $${sum}$. How old is Shyam?`;
        answer = String(bAge);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(Number(answer) + 2), label: String(Number(answer) + 2) },
        { value: String(Number(answer) - 1), label: String(Number(answer) - 1) },
        { value: String(Number(answer) * 2), label: String(Number(answer) * 2) }
    ]);

    return {
        type: "userInput",
        question: question,
        topic: "Algebra / Word Problems",
        answer: answer
    };
};

// --- Commercial Math ---

export const generatePercentage = () => {
    const type = Math.random() > 0.5 ? "Convert" : "Find";
    let question, answer;

    if (type === "Convert") {
        const num = getRandomInt(1, 10);
        const den = [2, 4, 5, 10, 20, 25, 50][getRandomInt(0, 6)];
        const val = (num / den) * 100;

        question = `Convert $\\frac{${num}}{${den}}$ to percentage.`;
        answer = `${val}%`;
    } else {
        const pct = getRandomInt(1, 10) * 10;
        const total = getRandomInt(1, 20) * 10;
        const val = (pct / 100) * total;

        question = `Find $${pct}\\%$ of $${total}$.`;
        answer = String(val);
    }

    const options = shuffleArray([
        { value: answer, label: type === "Convert" ? `$${parseFloat(answer)}\\%$` : answer },
        { value: type === "Convert" ? `${parseFloat(answer) + 10}%` : String(Number(answer) + 10), label: type === "Convert" ? `$${parseFloat(answer) + 10}\\%$` : String(Number(answer) + 10) },
        { value: type === "Convert" ? `${parseFloat(answer) / 2}%` : String(Number(answer) / 2), label: type === "Convert" ? `$${parseFloat(answer) / 2}\\%$` : String(Number(answer) / 2) },
        { value: type === "Convert" ? `${parseFloat(answer) * 2}%` : String(Number(answer) * 2), label: type === "Convert" ? `$${parseFloat(answer) * 2}\\%$` : String(Number(answer) * 2) }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(10, 90);
        const val = type === "Convert" ? `${r}%` : String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: type === "Convert" ? `$${r}\\%$` : String(r) });
        }
    }

    return {
        type: "userInput",
        question: question + (type === "Convert" ? " (number only, without %)" : ""),
        topic: "Commercial Math / Percentage",
        answer: answer.replace("%", "")
    };
};

export const generateProfitLoss = () => {
    const cp = getRandomInt(10, 100) * 10;
    const isProfit = Math.random() > 0.5;
    let sp, question, answer;

    if (isProfit) {
        const profit = getRandomInt(1, 5) * 10;
        sp = cp + profit;
        question = `A shopkeeper bought an item for ₹$${cp}$ and sold it for ₹$${sp}$. Find the profit.`;
        answer = `₹${profit}`;
    } else {
        const loss = getRandomInt(1, 5) * 10;
        sp = cp - loss;
        question = `A shopkeeper bought an item for ₹$${cp}$ and sold it for ₹$${sp}$. Find the loss.`;
        answer = `₹${loss}`;
    }

    const val = parseInt(answer.replace("₹", ""));
    const options = shuffleArray([
        { value: answer, label: `₹$${val}$` },
        { value: `₹${val + 10}`, label: `₹$${val + 10}$` },
        { value: `₹${val - 5}`, label: `₹$${val - 5}$` },
        { value: `₹${val * 2}`, label: `₹$${val * 2}$` }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(10, 100);
        const val = `₹${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `₹$${r}$` });
        }
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Commercial Math / Profit & Loss",
        answer: answer.replace("₹", "")
    };
};

export const generateSimpleInterest = () => {
    const P = getRandomInt(1, 10) * 1000;
    const R = getRandomInt(2, 10);
    const T = getRandomInt(1, 5);
    const SI = (P * R * T) / 100;

    const question = `Find Simple Interest for $P = $ ₹$${P}$, $R = ${R}\\%$, $T = ${T}$ years.`;
    const answer = `₹${SI}`;

    const options = shuffleArray([
        { value: answer, label: `₹$${SI}$` },
        { value: `₹${SI + 100}`, label: `₹$${SI + 100}$` },
        { value: `₹${SI - 50}`, label: `₹$${SI - 50}$` },
        { value: `₹${SI * 2}`, label: `₹$${SI * 2}$` }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(100, 500);
        const val = `₹${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `₹$${r}$` });
        }
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Commercial Math / Simple Interest",
        answer: answer.replace("₹", "")
    };
};
