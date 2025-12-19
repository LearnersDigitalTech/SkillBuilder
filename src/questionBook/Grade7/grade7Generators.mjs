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

export const generateExponentLaws = (allowedTypes = [0, 1, 2, 3]) => {
    // Law Names Map (0-6)
    const lawNames = {
        0: "Product Law",
        1: "Quotient Law",
        2: "Power of a Power Law",
        3: "Zero Exponent Law",
        4: "Power of a Product Law",
        5: "Power of a Quotient Law",
        6: "Negative Exponent Law"
    };

    // Pick a type
    const typeIdx = allowedTypes[getRandomInt(0, allowedTypes.length - 1)];
    const lawName = lawNames[typeIdx] || "Exponent Law";

    const base = getRandomInt(2, 5);
    const p1 = getRandomInt(2, 5);
    const p2 = getRandomInt(2, 5);
    let expr, ans, wrong1, wrong2, wrong3;

    if (typeIdx === 0) { // Product: a^m * a^n = a^(m+n)
        expr = `$${base}^{${p1}} \\times ${base}^{${p2}}$`;
        ans = `$${base}^{${p1 + p2}}$`;
        wrong1 = `$${base}^{${p1 * p2}}$`;
        wrong2 = `$${base}^{${Math.abs(p1 - p2)}}$`;
        wrong3 = `$${base * 2}^{${p1 + p2}}$`;
    } else if (typeIdx === 1) { // Quotient: a^m / a^n = a^(m-n)
        const big = Math.max(p1, p2) + 2;
        const small = Math.min(p1, p2);
        expr = `$${base}^{${big}} \\div ${base}^{${small}}$`;
        ans = `$${base}^{${big - small}}$`;
        wrong1 = `$${base}^{${big + small}}$`;
        wrong2 = `$${base}^{${big * small}}$`;
        wrong3 = `$1$`;
    } else if (typeIdx === 2) { // Power of Power: (a^m)^n = a^(mn)
        expr = `$(${base}^{${p1}})^{${p2}}$`;
        ans = `$${base}^{${p1 * p2}}$`;
        wrong1 = `$${base}^{${p1 + p2}}$`;
        wrong2 = `$${base}^{${Math.abs(p1 - p2)}}$`;
        wrong3 = `$${base}^{${p1 * p2 * 2}}$`;
    } else if (typeIdx === 3) { // Zero Exponent: a^0 = 1
        const complexBase = getRandomInt(10, 100);
        expr = `$(${complexBase} \\times ${base}^{${p1}})^0$`;
        ans = `$1$`;
        wrong1 = `$0$`;
        wrong2 = `$${base}$`;
        wrong3 = `$${complexBase}$`;
    } else if (typeIdx === 4) { // Power of Product: (ab)^m = a^m b^m
        const base2 = getRandomInt(2, 5);
        expr = `$(${base} \\times ${base2})^{${p1}}$`;
        ans = `$${base}^{${p1}} \\times ${base2}^{${p1}}$`;
        wrong1 = `$${base}^{${p1}} \\times ${base2}$`;
        wrong2 = `$${base} \\times ${base2}^{${p1}}$`;
        wrong3 = `$${base + base2}^{${p1}}$`;
    } else if (typeIdx === 5) { // Power of Quotient: (a/b)^m = a^m / b^m
        let base2 = getRandomInt(2, 5);
        while (base2 === base) base2 = getRandomInt(2, 5); // Ensure distinct bases
        expr = `$(\\frac{${base}}{${base2}})^{${p1}}$`;
        ans = `$\\frac{${base}^{${p1}}}{${base2}^{${p1}}}$`;
        wrong1 = `$\\frac{${base}^{${p1}}}{${base2}}$`;
        wrong2 = `$\\frac{${base}}{${base2}^{${p1}}}$`;
        wrong3 = `$\\frac{${base * p1}}{${base2 * p1}}$`;
    } else if (typeIdx === 6) { // Negative Exponent: a^-m = 1/a^m
        expr = `$${base}^{-${p1}}$`;
        ans = `$\\frac{1}{${base}^{${p1}}}$`;
        wrong1 = `$${base}^{${p1}}$`;
        wrong2 = `$-${base}^{${p1}}$`;
        wrong3 = `$\\frac{1}{${base}^{-${p1}}}$`;
    }

    const question = `Using the <b>${lawName}</b>, simplify: ${expr}`;

    const options = shuffleArray([
        { value: ans, label: ans },
        { value: wrong1, label: wrong1 },
        { value: wrong2, label: wrong2 },
        { value: wrong3, label: wrong3 }
    ]);

    // Dedupe
    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    // Fill if needed (rare)
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(1, 10);
        const val = `$${r}$`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: `Exponents / ${lawName}`,
        options: uniqueOptions,
        answer: ans
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
    // Grade 7 specific: 4 questions including Division and Brackets
    const rows = [];
    // Helper within scope or assume getRandomInt is available in module scope (it is)

    // Row 1: Simple mixed ops
    const a1 = getRandomInt(2, 9);
    const b1 = getRandomInt(2, 9);
    const c1 = getRandomInt(2, 9);
    // a + b * c
    const ans1 = a1 + (b1 * c1);
    rows.push({ text: `Evaluate: $${a1} + ${b1} \\times ${c1}$`, answer: String(ans1) });

    // Row 2: Brackets
    const a2 = getRandomInt(2, 9);
    const b2 = getRandomInt(2, 9);
    const c2 = getRandomInt(2, 5);
    const ans2 = (a2 + b2) * c2;
    rows.push({ text: `Evaluate: $(${a2} + ${b2}) \\times ${c2}$`, answer: String(ans2) });

    // Row 3: Complex
    // a + b x (c - d)
    const a3 = getRandomInt(2, 10);
    const b3 = getRandomInt(2, 5);
    const c3 = getRandomInt(6, 12);
    const d3 = getRandomInt(2, 5); // ensure c-d > 0
    const ans3 = a3 + b3 * (c3 - d3);
    rows.push({ text: `Evaluate: $${a3} + ${b3} \\times (${c3} - ${d3})$`, answer: String(ans3) });

    // Row 4: Division
    const b4 = getRandomInt(2, 5); // Divisor
    const q4 = getRandomInt(2, 9); // Quotient
    const a4 = b4 * q4; // Dividend
    const c4 = getRandomInt(2, 9);
    // a / b + c
    const ans4 = (a4 / b4) + c4;
    rows.push({ text: `Evaluate: $${a4} \\div ${b4} + ${c4}$`, answer: String(ans4) });

    const answerObj = {};
    rows.forEach((r, i) => answerObj[i] = r.answer);

    return {
        type: "tableInput",
        topic: "BODMAS",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Geometry ---

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

    // Draw triangle: (40, 70) -> (40, 20) -> (100, 70) (shifted right for spacing)
    const triSvg = createSvg(`
        <polygon points="40,70 40,20 100,70" stroke="crimson" stroke-width="2" fill="none" />
        <text x="35" y="45" font-size="12" text-anchor="end" fill="black">${height} cm</text>
        <text x="70" y="85" font-size="12" text-anchor="middle" fill="black">${base} cm</text>
        <text x="75" y="40" font-size="12" text-anchor="start" fill="black">${hyp} cm</text>
    `, 120, 90);

    rows.push({ text: `Right Triangle`, image: triSvg });
    answerObj[index++] = { perimeter: String(base + height + hyp), area: String(0.5 * base * height) };

    // 4. Parallelogram (base, side, height)
    // Draw parallelogram
    const pBase = getRandomInt(5, 12);
    const pSide = getRandomInt(4, 10);
    const pHeight = getRandomInt(2, pSide - 1);

    // Points: (10,70) -> (30,20) -> (90,20) -> (70,70)
    // Height line: (30,20) -> (30,70) dashed
    const paraSvg = createSvg(`
        <polygon points="20,70 40,20 90,20 70,70" stroke="crimson" stroke-width="2" fill="none" />
        <line x1="40" y1="20" x2="40" y2="70" stroke="black" stroke-width="1" stroke-dasharray="4" />
        <text x="45" y="85" font-size="12" text-anchor="middle" fill="black">${pBase} cm</text>
        <rect x="40" y="60" width="10" height="10" fill="none" stroke="black" stroke-width="1" />
        <text x="30" y="50" font-size="12" text-anchor="end" fill="black">${pHeight} cm</text> 
        <text x="80" y="45" font-size="12" text-anchor="middle" fill="black">${pSide} cm</text>
    `, 110, 90); // Added side label

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
        headers: ["Shape", "Perimeter", "Area"], // Custom headers - images display in Shape column
        inputKeys: ["perimeter", "area"], // Ensure UI uses correct keys for validation
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateCommercialMath = () => {
    const rows = [];
    const answerObj = {};
    let index = 0;

    // 1. Profit & Loss: Given CP and SP, find Profit/Loss Amount
    // Case 1: Profit
    const cp1 = (getRandomInt(10, 50) * 10); // 100 to 500
    const profit1 = (getRandomInt(1, 5) * 10); // 10, 20... 50
    const sp1 = cp1 + profit1;
    rows.push({ text: `Cost Price = ₹${cp1}, Selling Price = ₹${sp1}. Find Profit.` });
    answerObj[index++] = String(profit1);

    // Case 2: Loss
    const cp2 = (getRandomInt(20, 80) * 10);
    const loss2 = (getRandomInt(2, 5) * 10);
    const sp2 = cp2 - loss2;
    rows.push({ text: `Cost Price = ₹${cp2}, Selling Price = ₹${sp2}. Find Loss.` });
    answerObj[index++] = String(loss2);

    // 2. Simple Interest: Given P, R, T, find SI
    // Case 3: Simple values
    const P3 = getRandomInt(5, 20) * 100; // 500 to 2000
    const R3 = getRandomInt(2, 5); // 2% to 5%
    const T3 = getRandomInt(1, 3); // 1 to 3 years
    const SI3 = (P3 * R3 * T3) / 100;
    rows.push({ text: `Principal = ₹${P3}, Rate = ${R3}%, Time = ${T3} yrs. Find S.I.` });
    answerObj[index++] = String(SI3);

    // Case 4: Total Amount
    const P4 = getRandomInt(10, 30) * 100;
    const R4 = getRandomInt(3, 6);
    const T4 = getRandomInt(2, 4);
    const SI4 = (P4 * R4 * T4) / 100;
    const Amt4 = P4 + SI4;
    // rows.push({ text: `Principal = ₹${P4}, Rate = ${R4}%, Time = ${T4} yrs. Find Amount.` });
    rows.push({
        text: `Ravi invested ₹${P4} at ${R4}% per annum for ${T4} years on simple interest. Find the amount he will receive at the end of ${T4} years.`
    });
    answerObj[index++] = String(Amt4);

    return {
        type: "tableInput",
        variant: "default", // Changed from double-input to single
        question: "Calculate the missing values:",
        topic: "Commercial Math",
        answer: JSON.stringify(answerObj),
        rows: rows
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
    const subQuestions = [];
    const answer = {};

    const types = ["Convert", "Find"];
    shuffleArray(types);

    for (let i = 0; i < 2; i++) {
        const type = types[i];
        let questionText, correctVal;

        if (type === "Convert") {
            const num = getRandomInt(1, 10);
            const divisors = [2, 4, 5, 10, 20, 25, 50];
            const den = divisors[getRandomInt(0, divisors.length - 1)];
            const val = (num / den) * 100;
            questionText = `Convert $\\frac{${num}}{${den}}$ to percentage`;
            correctVal = `${val}%`;
        } else {
            const pct = getRandomInt(1, 10) * 10;
            const total = getRandomInt(1, 20) * 10;
            const val = (pct / 100) * total;
            questionText = `Find $${pct}\\%$ of $${total}$`;
            correctVal = String(val);
        }

        subQuestions.push({ text: questionText });
        answer[String(i)] = correctVal;
    }

    return {
        type: "tableInput",
        question: "Solve the following problems:",
        rows: subQuestions,
        headers: ["Problem", "Answer"], // Question col, Answer col
        answer: JSON.stringify(answer),
        topic: "Commercial Math / Percentage",
        variant: "default" // Standard table input
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

export const generateGrade7Algebra = () => {
    const rows = [];
    const answerObj = {};

    // Helper to generate a linear equation
    const genEq = () => {
        const A = getRandomInt(2, 6);
        const X = getRandomInt(2, 10);
        const B = getRandomInt(1, 10);
        const C = A * X + B;
        return { q: `Solve for x: $${A}x + ${B} = ${C}$`, a: String(X) };
    };

    // Helper to generate a term identification
    const genTerm = (type) => { // Accept type
        const c = getRandomInt(2, 9);
        const v = ["x", "y", "z"][getRandomInt(0, 2)];
        const k = getRandomInt(1, 15);
        // Force type if provided, otherwise random (fallback)
        const isCoeff = type ? type === "Coefficient" : Math.random() > 0.5;

        if (isCoeff) {
            return { q: `What is the Coefficient of $${v}$ in $${c}${v} + ${k}$`, a: String(c) };
        } else {
            return { q: `What is the Constant in $${c}${v} + ${k}$`, a: String(k) };
        }
    };

    // Generate 3 rows
    // Row 0: Equation
    const eq = genEq();
    rows.push({ text: eq.q });
    answerObj[0] = eq.a;

    // Rows 1-2: Terms (ensure distinct types)
    const termTypes = ["Coefficient", "Constant"];
    shuffleArray(termTypes);

    for (let i = 0; i < 2; i++) {
        const item = genTerm(termTypes[i]);
        rows.push({ text: item.q });
        answerObj[i + 1] = item.a;
    }

    return {
        type: "tableInput",
        variant: "default",
        question: "Solve the following algebra problems:",
        topic: "Algebra",
        headers: ["Problem", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateAlgebraWordProblemTable = () => {
    const rows = [];
    const answerObj = {};

    // Define available problem types
    const types = ["Number", "Age"];
    // Shuffle to randomize order
    shuffleArray(types);

    types.forEach((type, i) => {
        let q, a;
        if (type === "Number") {
            const num = getRandomInt(2, 9);
            const m = getRandomInt(2, 5);
            const res = m * num;
            q = `If $${m}$ times x is $${res}$, find x.`;
            a = String(num);
        } else {
            const age = getRandomInt(5, 12);
            const k = getRandomInt(2, 3);
            q = `Ali is $${k}$ times Ben's age ($${age}$). Ali's age?`;
            a = String(age * k);
        }
        rows.push({ text: q });
        answerObj[i] = a;
    });

    return {
        type: "tableInput",
        variant: "default",
        question: "Solve the following word problems:",
        topic: "Algebra / Word Problems",
        headers: ["Problem", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateLinesAndAngles = () => {
    // Relationships based on standard transversal diagram (1-4 top, 5-8 bottom)
    const relationships = [
        { type: "Corresponding Angles", pairs: [[1, 5], [2, 6], [3, 7], [4, 8]] },
        { type: "Alternate Interior Angles", pairs: [[3, 5], [4, 6]] },
        { type: "Alternate Exterior Angles", pairs: [[1, 7], [2, 8]] },
        { type: "Vertically Opposite Angles", pairs: [[1, 3], [2, 4], [5, 7], [6, 8]] }
        // { type: "Interior Angles on Same Side", pairs: [[3, 6], [4, 5]] }
    ];

    const chosenRel = relationships[getRandomInt(0, relationships.length - 1)]; // Pick a relationship type
    const pair = chosenRel.pairs[getRandomInt(0, chosenRel.pairs.length - 1)];
    const target = pair[0];
    const answer = String(pair[1]);

    // Question: Identify the angle related to {target}
    const question = `In the given figure, which angle corresponds to Angle ${target} as ${chosenRel.type}?`;

    // Options
    const options = shuffleArray([
        { value: answer, label: `Angle ${answer}` },
        { value: String(answer === '1' ? '2' : '1'), label: `Angle ${answer === '1' ? '2' : '1'}` }, // Random wrong
        { value: String(parseInt(answer) + 1 > 8 ? 1 : parseInt(answer) + 1), label: `Angle ${parseInt(answer) + 1 > 8 ? 1 : parseInt(answer) + 1}` },
        { value: String(parseInt(answer) - 1 < 1 ? 8 : parseInt(answer) - 1), label: `Angle ${parseInt(answer) - 1 < 1 ? 8 : parseInt(answer) - 1}` }
    ]);

    // Dedupe options
    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(1, 8);
        if (!seen.has(String(r))) {
            seen.add(String(r));
            uniqueOptions.push({ value: String(r), label: `Angle ${r}` });
        }
    }

    return {
        type: "mcq",
        question: question,
        image: "/lines_angles_q15.png", // Path to public image
        topic: "Lines and Angles",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateTrianglesProperties = () => {
    // Types: Isosceles, Right (Removed Exterior due to image issues)
    const typeIdx = getRandomInt(0, 1);
    let question, answer, imagePath;

    if (typeIdx === 0) {
        // Isosceles Triangle: Vertical markings imply equal sides => equal base angles
        imagePath = "/triangle_isosceles_clean.png";
        const vertexAngle = getRandomInt(30, 80) * 2; // Make it even for integer base angles
        const baseAngle = (180 - vertexAngle) / 2;

        // Q: Vertex given, find base x
        question = `In the given isosceles triangle, the vertex angle is $${vertexAngle}^\\circ$. Find the value of base angle $x$.`;
        answer = String(baseAngle);
    } else {
        // Right Angled Triangle: One is 90
        imagePath = "/triangle_right_clean.png";
        const givenAngle = getRandomInt(20, 60);
        const findAngle = 90 - givenAngle;

        question = `In the given right-angled triangle, one acute angle is $${givenAngle}^\\circ$. Find the other acute angle $x$.`;
        answer = String(findAngle);
    }

    const options = shuffleArray([
        { value: answer, label: `${answer}$^\\circ$` },
        { value: String(Number(answer) + 10), label: `${Number(answer) + 10}$^\\circ$` },
        { value: String(Number(answer) - 10), label: `${Number(answer) - 10}$^\\circ$` },
        { value: String(180 - Number(answer)), label: `${180 - Number(answer)}$^\\circ$` }
    ]);

    // Dedupe
    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(30, 150);
        if (!seen.has(String(r))) {
            seen.add(String(r));
            uniqueOptions.push({ value: String(r), label: `${r}$^\\circ$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        image: imagePath,
        topic: "Triangles and Properties",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateSolidShapesProperties = () => {
    // 3D Shapes Data
    const shapes = [
        { name: "Cube", img: "/solid_cube_q17.png", f: 6, v: 8, e: 12 },
        { name: "Cuboid", img: "/solid_cuboid_q17.png", f: 6, v: 8, e: 12 },
        { name: "Cylinder", img: "/solid_cylinder_q17.png", f: 3, v: 0, e: 2 },
        { name: "Cone", img: "/solid_cone_q17.png", f: 2, v: 1, e: 1 },
        { name: "Triangular Prism", img: "/solid_tri_prism_q17.png", f: 5, v: 6, e: 9 },
        { name: "Square Pyramid", img: "/solid_sq_pyramid_q17.png", f: 5, v: 5, e: 8 }
    ];

    // Select 3 random shapes for the table
    const shuffled = shuffleArray(shapes);
    const selected = shuffled.slice(0, 3);

    const rows = [];
    const answerObj = {};

    selected.forEach((shape, idx) => {
        rows.push({
            image: shape.img, // Show image in first column
            text: '' // No text, just visual
        });
        answerObj[idx] = {
            faces: String(shape.f),
            vertices: String(shape.v),
            edges: String(shape.e)
        };
    });

    return {
        type: "tableInput",
        variant: "triple-input", // Custom variant we added
        question: "Observe the shapes and identify the number of Faces, Vertices, and Edges.",
        topic: "Visualizing Solid Shapes",
        // headers: ["Identify the shape", "Faces", "Vertices", "Edges"], // Removed - headers are hardcoded in component
        inputKeys: ["faces", "vertices", "edges"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateDataHandling = () => {
    // Helper to generate meaningful datasets
    const getSubQuestion = (type) => {
        let data = [];
        let answer = 0;

        if (type === "Median") {
            const count = 5; // Odd count for simplicity
            data = Array.from({ length: count }, () => getRandomInt(1, 25));
            const sorted = [...data].sort((a, b) => a - b);
            answer = sorted[Math.floor(count / 2)];
        } else if (type === "Mode") {
            // Ensure a distinct mode
            const modeVal = getRandomInt(1, 10);
            data = [modeVal, modeVal, getRandomInt(11, 20), getRandomInt(11, 20), getRandomInt(11, 20)];
            shuffleArray(data);
            answer = modeVal;
        } else { // Range
            const count = getRandomInt(5, 7);
            data = Array.from({ length: count }, () => getRandomInt(1, 30));
            const min = Math.min(...data);
            const max = Math.max(...data);
            answer = max - min;
        }

        return {
            text: `Find ${type}: ${data.join(", ")}`,
            answer: String(answer)
        };
    };

    const subQuestions = [];
    const answerObj = {};

    const types = ["Mode", "Median", "Range"]; // Define types here, fixed order or shuffled? User listed "modde,median,range". Let's use that order or shuffle.
    // shuffleArray(types); // User said "show all three modde,median,range". I will NOT shuffle to preserve a clean order: Mode, Median, Range. Or maybe shuffle is better for variety? 
    // The previous code shuffled. "show all three" implies presence, not necessarily order. random order is better for a quiz.
    shuffleArray(types);

    for (let i = 0; i < 3; i++) { // Changed 2 to 3
        const q = getSubQuestion(types[i]); // Pass the specific type
        subQuestions.push({ text: q.text });
        answerObj[String(i)] = q.answer;
    }

    return {
        type: "tableInput",
        rows: subQuestions,
        headers: ["Problem", "Answer"],
        answer: JSON.stringify(answerObj),
        topic: "Data Handling",
        variant: "default"
    };
};

export const generateBarGraph = () => {
    // Decide Single or Double bar graph scenario
    const isDouble = Math.random() > 0.5;
    const subjects = ["Math", "Sci", "Eng", "Hist", "Art"];
    const rows = [];
    const answerObj = {};

    let dataTable = "";
    let data = {}; // { Math: [v1, v2?], ... }

    if (!isDouble) {
        // Single Bar Graph (e.g. Students in a class, or Marks)
        dataTable = "<table border='1' style='border-collapse:collapse; width:100%; text-align:center;'><tr><th>Subject</th><th>Marks</th></tr>";
        subjects.forEach(sub => {
            const val = getRandomInt(4, 9) * 10; // 40, 50... 90
            data[sub] = val;
            dataTable += `<tr><td>${sub}</td><td>${val}</td></tr>`;
        });
        dataTable += "</table>";

        // Generate 2 questions
        const qTypes = ["Max", "Min", "Total", "Diff"];
        shuffleArray(qTypes);

        for (let i = 0; i < 2; i++) {
            const type = qTypes[i];
            let qText, ans, rowOptions;
            if (type === "Max") {
                const maxVal = Math.max(...Object.values(data));
                const subject = Object.keys(data).find(k => data[k] === maxVal);
                qText = "Which subject has the maximum marks?";
                ans = subject;
                rowOptions = subjects; // Dropdown options
            } else if (type === "Min") {
                const minVal = Math.min(...Object.values(data));
                const subject = Object.keys(data).find(k => data[k] === minVal);
                qText = "Which subject has the minimum marks?";
                ans = subject;
                rowOptions = subjects; // Dropdown options
            } else if (type === "Total") {
                const total = Object.values(data).reduce((a, b) => a + b, 0);
                qText = "Find the total marks obtained in all subjects.";
                ans = String(total);
            } else {
                // Diff between max and min
                const maxVal = Math.max(...Object.values(data));
                const minVal = Math.min(...Object.values(data));
                qText = "Find the difference between highest and lowest marks.";
                ans = String(maxVal - minVal);
            }

            if (rowOptions) {
                rows.push({ text: qText, inputType: "select", options: rowOptions });
            } else {
                rows.push({ text: qText });
            }
            answerObj[i] = ans;
        }

    } else {
        // Double Bar Graph (Term 1 vs Term 2)
        dataTable = "<table border='1' style='border-collapse:collapse; width:100%; text-align:center;'><tr><th>Subject</th><th>Term 1</th><th>Term 2</th></tr>";
        subjects.forEach(sub => {
            const v1 = getRandomInt(4, 9) * 10;
            const v2 = getRandomInt(4, 9) * 10;
            data[sub] = [v1, v2];
            dataTable += `<tr><td>${sub}</td><td>${v1}</td><td>${v2}</td></tr>`;
        });
        dataTable += "</table>";

        // Questions: Max Improvement, Max Ratio, specific subject comparison
        // Q1: Improvement
        let maxImp = -100;
        let maxImpSub = "";
        Object.keys(data).forEach(sub => {
            const diff = data[sub][1] - data[sub][0];
            if (diff > maxImp) {
                maxImp = diff;
                maxImpSub = sub;
            }
        });
        rows.push({ text: "In which subject did the performance improve the most? (write subject name)" });
        answerObj[0] = maxImp > 0 ? maxImpSub : "None"; // Simplification if all negative? unlikely given random

        // If 'None' or ambiguous, let's fix Q1 to simply "Marks in Math term 2?" to be safe? 
        // Or "Total marks in Term 1?"
        // Let's go with "Total marks in Term 1" for Q1 to be safe and robust.
        const totalT1 = Object.values(data).reduce((a, b) => a + b[0], 0);
        rows[0] = { text: "Total marks obtained in Term 1?" };
        answerObj[0] = String(totalT1);

        // Q2: Difference in specific subject
        const targetSub = subjects[getRandomInt(0, 4)];
        const diff = data[targetSub][1] - data[targetSub][0]; // Term 2 - Term 1
        rows.push({ text: `Difference between Term 2 and Term 1 marks in ${targetSub}?` });
        answerObj[1] = String(diff);
    }

    return {
        type: "tableInput",
        variant: "default",
        question: isDouble
            ? `Study the table showing marks in Term 1 and Term 2 and answer the questions:<br/><br/>` + dataTable
            : `Study the table showing marks obtained in different subjects and answer the questions:<br/><br/>` + dataTable,
        topic: "Data Handling / Graphs",
        headers: ["Problem", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};
