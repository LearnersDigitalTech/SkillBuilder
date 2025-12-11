const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Integers ---

export const generateIntegerUnderstanding = () => {
    // Identify positive/negative or simple context
    const contexts = [
        { text: "temperature below zero", sign: "-" },
        { text: "temperature above zero", sign: "+" },
        { text: "profit of", sign: "+" },
        { text: "loss of", sign: "-" },
        { text: "deposit of", sign: "+" },
        { text: "withdrawal of", sign: "-" },
        { text: "sea level", sign: "0" } // Special case
    ];

    const ctx = contexts[getRandomInt(0, contexts.length - 1)];
    const val = getRandomInt(5, 50);

    let question, answer;
    if (ctx.sign === "0") {
        question = "What integer represents sea level?";
        answer = "0";
    } else {
        question = `What integer represents a ${ctx.text} $$   ${val}?`;
        answer = `${ctx.sign}${val}`;
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: ctx.sign === "+" ? `-${val}` : `+${val}`, label: ctx.sign === "+" ? `-${val}` : `+${val}` },
        { value: "0", label: "0" },
        { value: String(val + 10), label: String(val + 10) }
    ]);

    // Ensure unique options
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
        type: "mcq",
        question: question,
        topic: "Integers / Understanding",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateIntegerOps = () => {
    // Add, Sub, Mul, Div
    const ops = ["Add", "Subtract", "Multiply", "Divide"];
    const op = ops[getRandomInt(0, 3)];

    let n1 = getRandomInt(-20, 20);
    let n2 = getRandomInt(-20, 20);
    while (n2 === 0) n2 = getRandomInt(-20, 20); // No div by zero

    let question, answer;

    if (op === "Add") {
        question = `Calculate: (${n1}) + (${n2})`;
        answer = String(n1 + n2);
    } else if (op === "Subtract") {
        question = `Calculate: (${n1}) - (${n2})`;
        answer = String(n1 - n2);
    } else if (op === "Multiply") {
        question = `Calculate: (${n1}) × (${n2})`;
        answer = String(n1 * n2);
    } else {
        // Ensure divisibility
        n1 = n2 * getRandomInt(-10, 10);
        question = `Calculate: (${n1}) ÷ (${n2})`;
        answer = String(n1 / n2);
    }

    const val = Number(answer);
    const options = shuffleArray([
        { value: String(val), label: String(val) },
        { value: String(-val), label: String(-val) }, // Sign error
        { value: String(val + 1), label: String(val + 1) },
        { value: String(val - 1), label: String(val - 1) }
    ]);

    // Handle case where val is 0, -val is 0 -> duplicate
    if (val === 0) {
        options[1] = { value: "1", label: "1" };
    }

    // Ensure unique options
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

// --- Whole Numbers ---

export const generateWholeNumberProperties = () => {
    // Commutative, Associative, Distributive
    const props = [
        { name: "Commutative Property", eq: "a + b = b + a" },
        { name: "Associative Property", eq: "(a + b) + c = a + (b + c)" },
        { name: "Distributive Property", eq: "a × (b + c) = a × b + a × c" },
        { name: "Identity Property", eq: "a + 0 = a" }
    ];

    const target = props[getRandomInt(0, 3)];
    const question = `Which property is shown by:  $ ${target.eq} $?`;
    const answer = target.name;

    const options = shuffleArray(props.map(p => ({ value: p.name, label: p.name })));

    return {
        type: "mcq",
        question: question,
        topic: "Whole Numbers / Properties",
        options: options,
        answer: answer
    };
};

export const generateWholeNumberPattern = () => {
    // Simple patterns like triangular numbers or arithmetic
    const type = getRandomInt(0, 1);
    let seq, nextVal, rule;

    if (type === 0) {
        // Arithmetic
        const start = getRandomInt(1, 10);
        const diff = getRandomInt(2, 5);
        seq = [start, start + diff, start + 2 * diff, start + 3 * diff];
        nextVal = start + 4 * diff;
        rule = `Add ${diff}`;
    } else {
        // Triangular numbers: n(n+1)/2 -> 1, 3, 6, 10...
        // Let's do squares: 1, 4, 9, 16...
        const startN = getRandomInt(1, 5);
        seq = [];
        for (let i = 0; i < 4; i++) seq.push((startN + i) * (startN + i));
        nextVal = (startN + 4) * (startN + 4);
        rule = "Square numbers";
    }

    const question = `Find the next number in the pattern: $$ ${seq.join(", ")}, ... $$`;
    const answer = String(nextVal);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(nextVal + 1), label: String(nextVal + 1) },
        { value: String(nextVal - 1), label: String(nextVal - 1) },
        { value: String(nextVal + 10), label: String(nextVal + 10) }
    ]);

    return {
        type: "userInput",
        question: question,
        topic: "Whole Numbers / Patterns",
        answer: answer
    };
};

// --- Fractions ---

export const generateFractionOps = () => {
    // Add, Sub, Mul, Div
    const ops = ["Add", "Subtract", "Multiply", "Divide"];
    const op = ops[getRandomInt(0, 3)];

    const n1 = getRandomInt(1, 5);
    const d1 = getRandomInt(2, 6);
    const n2 = getRandomInt(1, 5);
    const d2 = getRandomInt(2, 6);

    let num, den, question;

    if (op === "Add") {
        question = `Calculate: ${n1}/${d1} + ${n2}/${d2}`;
        num = n1 * d2 + n2 * d1;
        den = d1 * d2;
    } else if (op === "Subtract") {
        // Ensure positive result
        if (n1 / d1 < n2 / d2) {
            question = `Calculate: ${n2}/${d2} - ${n1}/${d1}`;
            num = n2 * d1 - n1 * d2;
            den = d1 * d2;
        } else {
            question = `Calculate: ${n1}/${d1} - ${n2}/${d2}`;
            num = n1 * d2 - n2 * d1;
            den = d1 * d2;
        }
    } else if (op === "Multiply") {
        question = `Calculate: ${n1}/${d1} × ${n2}/${d2}`;
        num = n1 * n2;
        den = d1 * d2;
    } else {
        question = `Calculate: ${n1}/${d1} ÷ ${n2}/${d2}`;
        num = n1 * d2;
        den = d1 * n2;
    }

    // Simplify
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const common = gcd(num, den);
    const sNum = num / common;
    const sDen = den / common;

    const answer = `${sNum}/${sDen}`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${sNum + 1}/${sDen}`, label: `${sNum + 1}/${sDen}` },
        { value: `${sNum}/${sDen + 1}`, label: `${sNum}/${sDen + 1}` },
        { value: `${sDen}/${sNum}`, label: `${sDen}/${sNum}` }
    ]);

    // Ensure unique options
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
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: `Fractions / ${op}`,
        options: uniqueOptions,
        answer: answer
    };
};

// --- Decimals ---

export const generateDecimalConversion = () => {
    const isFracToDec = Math.random() > 0.5;

    if (isFracToDec) {
        const den = [2, 4, 5, 10, 20, 25, 50][getRandomInt(0, 6)];
        const num = getRandomInt(1, den - 1);
        const val = num / den;

        const question = `Convert  $ ${num}/${den} $ to a decimal.`;
        const answer = String(val);

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: String(val + 0.1), label: String(val + 0.1) },
            { value: String(val * 10), label: String(val * 10) },
            { value: String((val + 0.01).toFixed(2)), label: String((val + 0.01).toFixed(2)) }
        ]);
        return {
            type: "userInput",
            question: question,
            topic: "Decimals / Conversion",
            answer: answer
        };
    } else {
        const val = (getRandomInt(1, 99) / 100).toFixed(2);
        const question = `Convert ${val} to a fraction (simplest form).`;

        const num = Math.round(val * 100);
        const den = 100;
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const common = gcd(num, den);
        const answer = `${num / common}/${den / common}`;

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: `${num}/${den}`, label: `${num}/${den}` }, // Unsimplified
            { value: `${den / common}/${num / common}`, label: `${den / common}/${num / common}` },
            { value: `${(num + 1) / common}/${den / common}`, label: `${(num + 1) / common}/${den / common}` }
        ]);

        // Ensure unique options
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
                uniqueOptions.push({ value: val, label: val });
            }
        }

        return {
            type: "mcq",
            question: question,
            topic: "Decimals / Conversion",
            options: uniqueOptions,
            answer: answer
        };
    }
};

// --- Ratio & Proportion ---

export const generateRatio = () => {
    const n1 = getRandomInt(2, 20);
    const n2 = getRandomInt(2, 20);

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const common = gcd(n1, n2);
    const s1 = n1 / common;
    const s2 = n2 / common;

    const question = `Find the simplest ratio of ${n1} to ${n2}.`;
    const answer = `${s1}:${s2}`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${s2}:${s1}`, label: `${s2}:${s1}` },
        { value: `${n1}:${n2}`, label: `${n1}:${n2}` },
        { value: `${s1 + 1}:${s2}`, label: `${s1 + 1}:${s2}` }
    ]);

    // Ensure unique
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
        const val = `${r1}:${r2}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Ratio / Simplify",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateProportion = () => {
    // Find missing term: a:b :: c:x
    const a = getRandomInt(2, 10);
    const b = getRandomInt(2, 10);
    const mult = getRandomInt(2, 5);
    const c = a * mult;
    const x = b * mult;

    const question = `Find x in the proportion: ${a}:${b} :: ${c}:x`;
    const answer = String(x);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(x + 1), label: String(x + 1) },
        { value: String(x - 1), label: String(x - 1) },
        { value: String(c + 1), label: String(c + 1) }
    ]);

    // Ensure unique options
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
        topic: "Proportion / Missing Term",
        answer: answer
    };
};

// --- Algebra ---

export const generateAlgebraExpression = () => {
    const ops = [
        { text: "added to", sign: "+" },
        { text: "subtracted from", sign: "-" }, // Special order
        { text: "multiplied by", sign: "" }, // 5x
        { text: "divided by", sign: "/" }
    ];

    const op = ops[getRandomInt(0, 3)];
    const num = getRandomInt(2, 10);
    const variable = "x";

    let question, answer;
    if (op.sign === "+") {
        question = `Write the expression for: </br> ${num} added to ${variable}`;
        answer = `${variable} + ${num}`;
    } else if (op.text === "subtracted from") {
        question = `Write the expression for: </br> ${num} subtracted from ${variable}`;
        answer = `${variable} - ${num}`;
    } else if (op.sign === "") {
        question = `Write the expression for: </br> ${variable} multiplied by ${num}`;
        answer = `${num}${variable}`;
    } else {
        question = `Write the expression for: </br> ${variable} divided by ${num}`;
        answer = `${variable}/${num}`;
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: op.text === "subtracted from" ? `${num} - ${variable}` : `${variable} - ${num}`, label: op.text === "subtracted from" ? `${num} - ${variable}` : `${variable} - ${num}` },
        { value: `${variable} + ${num}`, label: `${variable} + ${num}` },
        { value: `${num}${variable}`, label: `${num}${variable}` }
    ]);

    // Ensure unique options
    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    // Fill if duplicates removed
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(1, 100);
        const val = `${variable} + ${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Algebra / Expressions",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateSimpleEquation = () => {
    // x + a = b or ax = b
    const isAdd = Math.random() > 0.5;
    const a = getRandomInt(2, 10);
    const x = getRandomInt(2, 10);

    let question, answer;
    if (isAdd) {
        const b = x + a;
        question = `Solve for x: $$ x + ${a} = ${b} $$`;
        answer = String(x);
    } else {
        const b = a * x;
        question = `Solve for x: $$ ${a}x = ${b} $$`;
        answer = String(x);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(x + 1), label: String(x + 1) },
        { value: String(x - 1), label: String(x - 1) },
        { value: String(x + a), label: String(x + a) }
    ]);

    // Ensure unique options
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
        topic: "Algebra / Equations",
        answer: answer
    };
};

// --- Geometry ---

export const generatePolygonSides = () => {
    const polys = [
        { name: "Triangle", sides: 3 },
        { name: "Quadrilateral", sides: 4 },
        { name: "Pentagon", sides: 5 },
        { name: "Hexagon", sides: 6 },
        { name: "Heptagon", sides: 7 },
        { name: "Octagon", sides: 8 }
    ];

    const poly = polys[getRandomInt(0, 5)];
    const question = `How many sides does a ${poly.name} have?`;
    const answer = String(poly.sides);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(poly.sides + 1), label: String(poly.sides + 1) },
        { value: String(poly.sides - 1), label: String(poly.sides - 1) },
        { value: String(poly.sides + 2), label: String(poly.sides + 2) }
    ]);

    return {
        type: "userInput",
        question: question,
        topic: "Geometry / Polygons",
        answer: answer
    };
};

export const generateTriangleType = () => {
    // By sides or angles
    const types = ["Equilateral", "Isosceles", "Scalene", "Right-Angled"];
    const type = types[getRandomInt(0, 3)];

    let question;
    if (type === "Equilateral") question = "A triangle with all 3 sides equal is called?";
    else if (type === "Isosceles") question = "A triangle with 2 sides equal is called?";
    else if (type === "Scalene") question = "A triangle with no sides equal is called?";
    else question = "A triangle with one 90° angle is called?";

    const options = shuffleArray([
        { value: type, label: type },
        { value: types[(types.indexOf(type) + 1) % 4], label: types[(types.indexOf(type) + 1) % 4] },
        { value: types[(types.indexOf(type) + 2) % 4], label: types[(types.indexOf(type) + 2) % 4] },
        { value: types[(types.indexOf(type) + 3) % 4], label: types[(types.indexOf(type) + 3) % 4] }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Triangles",
        options: options,
        answer: type
    };
};

// --- Mensuration ---

export const generateAreaRect = () => {
    const l = getRandomInt(5, 15);
    const b = getRandomInt(2, 10);
    const area = l * b;

    const question = `Find the area of a rectangle with length ${l} cm and breadth ${b} cm.`;
    const answer = `${area} sq cm`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${2 * (l + b)} cm`, label: `${2 * (l + b)} cm` }, // Perimeter
        { value: `${area + 10} sq cm`, label: `${area + 10} sq cm` },
        { value: `${l + b} sq cm`, label: `${l + b} sq cm` }
    ]);

    // Ensure unique options
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
        uniqueOptions.push({ value: `${r} sq cm`, label: `${r} sq cm` });
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Mensuration / Area",
        answer: String(area)
    };
};

export const generatePerimeterRect = () => {
    const l = getRandomInt(5, 15);
    const b = getRandomInt(2, 10);
    const perim = 2 * (l + b);

    const question = `Find the perimeter of a rectangle with length ${l} cm and breadth ${b} cm.`;
    const answer = `${perim} cm`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${l * b} sq cm`, label: `${l * b} sq cm` }, // Area
        { value: `${perim + 5} cm`, label: `${perim + 5} cm` },
        { value: `${l + b} cm`, label: `${l + b} cm` }
    ]);

    // Ensure unique options
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
        uniqueOptions.push({ value: `${r} cm`, label: `${r} cm` });
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Mensuration / Perimeter",
        answer: String(perim)
    };
};

// --- Data Handling ---

export const generateDataInterpretation = () => {
    // Mean, Median, Mode
    const type = ["Mean", "Median", "Mode"][getRandomInt(0, 2)];
    let data, answer, question;

    if (type === "Mean") {
        // Ensure integer mean
        const count = 5;
        const targetMean = getRandomInt(5, 15);
        const total = targetMean * count;
        data = [];
        let currentSum = 0;
        for (let i = 0; i < count - 1; i++) {
            const val = getRandomInt(1, 20);
            data.push(val);
            currentSum += val;
        }
        const last = total - currentSum;
        data.push(last);
        // Shuffle data to hide the construction
        shuffleArray(data);

        question = `Find the Mean of: $$ ${data.join(", ")} $$`;
        answer = String(targetMean);
    } else if (type === "Median") {
        const count = 5; // Odd for simplicity
        data = Array.from({ length: count }, () => getRandomInt(1, 20));
        const sorted = [...data].sort((a, b) => a - b);
        const median = sorted[Math.floor(count / 2)];

        question = `Find the Median of: $$ ${data.join(", ")} $$`;
        answer = String(median);
    } else {
        // Mode
        const modeVal = getRandomInt(1, 10);
        data = [modeVal, modeVal, modeVal, getRandomInt(1, 10), getRandomInt(1, 10)];
        shuffleArray(data);

        question = `Find the Mode of: $$ ${data.join(", ")} $$`;
        answer = String(modeVal);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(Number(answer) + 1), label: String(Number(answer) + 1) },
        { value: String(Number(answer) - 1), label: String(Number(answer) - 1) },
        { value: String(Number(answer) + 2), label: String(Number(answer) + 2) }
    ]);

    // Ensure unique options
    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(1, 20);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: `Data Handling / ${type}`,
        answer: answer
    };
};

// --- Number Theory ---

export const generatePrimeComposite = () => {
    const isPrime = Math.random() > 0.5;

    if (isPrime) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
        const p = primes[getRandomInt(0, primes.length - 1)];
        const question = `Which of these is a Prime number?`;
        const answer = String(p);

        const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
        const dists = [];
        while (dists.length < 3) {
            const c = composites[getRandomInt(0, composites.length - 1)];
            if (!dists.includes(c)) dists.push(c);
        }

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: String(dists[0]), label: String(dists[0]) },
            { value: String(dists[1]), label: String(dists[1]) },
            { value: String(dists[2]), label: String(dists[2]) }
        ]);
        return {
            type: "mcq",
            question: question,
            topic: "Number Theory / Prime",
            options: options,
            answer: answer
        };
    } else {
        const composites = [4, 6, 8, 9, 10, 12, 14, 15];
        const c = composites[getRandomInt(0, composites.length - 1)];
        const question = `Which of these is a Composite number?`;
        const answer = String(c);

        const primes = [2, 3, 5, 7, 11, 13, 17];
        const dists = [];
        while (dists.length < 3) {
            const p = primes[getRandomInt(0, primes.length - 1)];
            if (!dists.includes(p)) dists.push(p);
        }

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: String(dists[0]), label: String(dists[0]) },
            { value: String(dists[1]), label: String(dists[1]) },
            { value: String(dists[2]), label: String(dists[2]) }
        ]);
        return {
            type: "mcq",
            question: question,
            topic: "Number Theory / Composite",
            options: options,
            answer: answer
        };
    }
};

export const generateLCM = () => {
    const pairs = [[4, 6, 12], [3, 5, 15], [6, 8, 24], [2, 7, 14], [5, 10, 10]];
    const pair = pairs[getRandomInt(0, 4)];
    const n1 = pair[0];
    const n2 = pair[1];
    const lcm = pair[2];

    const question = `Find the LCM of ${n1} and ${n2}.`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Theory / LCM",
        answer: String(lcm)
    };
};


export const generateFactorTree = () => {
    // Pick a composite number suitable for grade 6 
    let num = 0;
    const composites = [12, 16, 18, 20, 24, 27, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 81, 100, 108, 120];
    const getRandomIntLocal = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    num = composites[getRandomIntLocal(0, composites.length - 1)];

    let nodeIdCounter = 0;

    const buildTree = (n) => {
        const node = {
            id: `node_${nodeIdCounter++}`,
            val: n,
            children: [],
            isInput: false
        };

        // If composite, split
        const factors = [];
        for (let i = 2; i < n; i++) {
            if (n % i === 0) {
                factors.push(i);
            }
        }

        if (factors.length > 0) {
            // Pick a random factor
            const factor1 = factors[getRandomIntLocal(0, factors.length - 1)];
            const factor2 = n / factor1;

            // Recurse
            node.children.push(buildTree(factor1));
            node.children.push(buildTree(factor2));
        }

        return node;
    };

    const tree = buildTree(num);

    const allNodesButRoot = [];
    const collect = (n) => {
        if (n.children) {
            n.children.forEach(c => {
                allNodesButRoot.push(c);
                collect(c);
            });
        }
    };
    collect(tree);

    // Shuffle and pick some to hide
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffled = shuffle([...allNodesButRoot]);
    const nodesToHideCount = getRandomIntLocal(2, Math.min(4, shuffled.length));

    const correctAnswers = {};

    for (let i = 0; i < nodesToHideCount; i++) {
        shuffled[i].isInput = true;
    }

    const extractAnswers = (n) => {
        if (n.isInput) {
            correctAnswers[n.id] = String(n.val);
        }
        if (n.children) n.children.forEach(extractAnswers);
    };
    extractAnswers(tree);

    const question = `Complete the Factor Tree for ${num}:`;

    return {
        type: "factorTree",
        question: question,
        topic: "Number Theory / Factor Tree",
        tree: tree,
        answer: JSON.stringify(correctAnswers)
    };
};


export const generateAlphabetSymmetry = () => {
    // Letters and their line symmetry counts (standard sans-serif uppercase)
    const items = [
        { char: "A", count: 1 },
        { char: "B", count: 1 },
        { char: "C", count: 1 },
        { char: "D", count: 1 },
        { char: "E", count: 1 },
        { char: "F", count: 0 },
        { char: "G", count: 0 },
        { char: "H", count: 2 },
        { char: "I", count: 2 },
        { char: "J", count: 0 },
        // K is ambiguous, skip
        { char: "L", count: 0 },
        { char: "M", count: 1 },
        { char: "N", count: 0 },
        { char: "O", count: 2 },
        { char: "P", count: 0 },
        { char: "Q", count: 0 },
        { char: "R", count: 0 },
        { char: "S", count: 0 },
        { char: "T", count: 1 },
        { char: "U", count: 1 },
        { char: "V", count: 1 },
        { char: "W", count: 1 },
        { char: "X", count: 2 },
        { char: "Y", count: 1 },
        { char: "Z", count: 0 }
    ];

    const item = items[Math.floor(Math.random() * items.length)];

    // Generate SVG for letter
    const size = 200;
    const svgContent = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" fill="black">${item.char}</text>`;
    const imageUri = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${svgContent}</svg>`).toString('base64')}`;

    const question = `How many lines of symmetry does the letter below have?`;

    return {
        type: "userInput",
        question: question,
        topic: "Geometry / Symmetry",
        image: imageUri,
        answer: String(item.count)
    };
};


export const generateNumberPlay = () => {
    // Concepts: Number Cells (Patterns), Palindrome, Clock
    const types = ["palindrome", "clock", "pattern"];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "palindrome") {
        const isPalindrome = (n) => String(n) === String(n).split('').reverse().join('');
        const generatePalindrome = () => {
            const seed = Math.floor(Math.random() * 9) + 1; // 1-9
            return parseInt(`${seed}${Math.floor(Math.random() * 10)}${seed}`); // e.g. 121, 353
        };
        const generateNonPalindrome = () => {
            let n;
            do {
                n = Math.floor(Math.random() * 900) + 100;
            } while (isPalindrome(n));
            return n;
        };

        const answer = generatePalindrome();
        const dists = [generateNonPalindrome(), generateNonPalindrome(), generateNonPalindrome()];

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const options = shuffle([
            { value: String(answer), label: String(answer) },
            { value: String(dists[0]), label: String(dists[0]) },
            { value: String(dists[1]), label: String(dists[1]) },
            { value: String(dists[2]), label: String(dists[2]) }
        ]);

        return {
            type: "mcq",
            question: "Which of these numbers is a Palindrome?",
            topic: "Number Play / Palindrome",
            options: options,
            answer: String(answer)
        };
    } else if (type === "clock") {
        // Angle between hands at full hours (1:00 to 11:00, avoiding 12 and 6 edge cases for simplicity if needed, but 6 is 180, 12 is 0)
        // Using hours 1-6 for simple smaller angles
        const hour = Math.floor(Math.random() * 5) + 1; // 1 to 6
        const ans = hour * 30;

        return {
            type: "userInput",
            question: `What is the angle (in degrees) between the hour and minute hands at ${hour}:00?`,
            topic: "Number Play / Clock",
            answer: String(ans)
        };
    } else {
        // Pattern / Number Cell
        const patterns = [
            { seq: [2, 4, 6, 8], next: 10, rule: "+2" },
            { seq: [3, 6, 9, 12], next: 15, rule: "+3" },
            { seq: [5, 10, 15, 20], next: 25, rule: "+5" },
            { seq: [1, 4, 9, 16], next: 25, rule: "Squares" },
            { seq: [2, 5, 10, 17], next: 26, rule: "Square + 1" },
            { seq: [10, 20, 30, 40], next: 50, rule: "+10" },
            { seq: [100, 90, 80, 70], next: 60, rule: "-10" }
        ];
        const pat = patterns[Math.floor(Math.random() * patterns.length)];
        const question = `Find the next number in the pattern: ${pat.seq.join(', ')}, ?`;

        return {
            type: "userInput",
            question: question,
            topic: "Number Play / Patterns",
            answer: String(pat.next)
        };
    }
};


export const generateNumberPattern = () => {
    // Select pattern type: 0 = Squares of 1s (Repunits), 1 = Descending 8s
    const type = Math.floor(Math.random() * 2);
    // Grade 6 difficulty: n = 4, 5, 6 (slightly harder than 5's 4-5)
    const n = Math.floor(Math.random() * 3) + 4; // 4, 5, 6

    let latex = "\\begin{aligned} ";
    let questionText = "";
    let answer = "";
    let instructions = "";

    if (type === 0) {
        // Repunit Squares: 12321 = 111 x 111
        for (let i = 1; i < n; i++) {
            const ones = "1".repeat(i);
            const square = (BigInt(ones) * BigInt(ones)).toString();
            latex += `${square} &= ${ones} \\times ${ones} \\\\ `;
        }
        const onesTarget = "1".repeat(n);
        const squareTarget = (BigInt(onesTarget) * BigInt(onesTarget)).toString();

        latex += `${squareTarget} &= ? `;
        instructions = "Type the multiplication expression (e.g. 111 x 111)";
        answer = `${onesTarget} x ${onesTarget}`;
    } else {
        // Times 8 Pattern: 12 x 8 + 2 = 98
        for (let i = 1; i < n; i++) {
            let leftNum = "";
            for (let j = 1; j <= i; j++) leftNum += j;

            // Calculate right side (987...)
            let rightNum = "";
            for (let j = 0; j < i; j++) rightNum += (9 - j);

            latex += `${leftNum} \\times 8 + ${i} &= ${rightNum} \\\\ `;
        }

        let leftNumTarget = "";
        for (let j = 1; j <= n; j++) leftNumTarget += j;

        // Target answer
        let rightNumTarget = "";
        for (let j = 0; j < n; j++) rightNumTarget += (9 - j);

        latex += `${leftNumTarget} \\times 8 + ${n} &= ? `;
        instructions = "Type the result number.";
        answer = rightNumTarget;
    }

    latex += "\\end{aligned}";
    questionText = `Look at this pattern and take it forward: $$${latex}$$`;

    return {
        type: "userInput",
        question: questionText,
        answer: answer,
        topic: "Pattern Recognition",
        instructions: instructions,
        format: "text",
        keypadMode: "multiplication"
    };
};

export const generateAddSubMultipleSelect = () => {
    // Generate simple addition/subtraction expressions that sum to a target
    // Target: 20 to 100
    const target = Math.floor(Math.random() * 81) + 20;

    // Generate correct options
    const correctOptions = [];
    // 1. Addition
    let a1 = Math.floor(Math.random() * (target - 5)) + 1;
    correctOptions.push(`${a1} + ${target - a1}`);

    // 2. Subtraction
    let s1 = target + Math.floor(Math.random() * 20) + 5;
    correctOptions.push(`${s1} - ${s1 - target}`);

    // 3. Maybe another addition or subtraction
    if (Math.random() > 0.5) {
        let a2 = Math.floor(Math.random() * (target - 5)) + 1;
        correctOptions.push(`${a2} + ${target - a2}`);
    } else {
        let s2 = target + Math.floor(Math.random() * 30) + 10;
        correctOptions.push(`${s2} - ${s2 - target}`);
    }

    // Generate wrong options (close to target)
    const wrongOptions = [];
    while (wrongOptions.length < 2) {
        let offset = Math.floor(Math.random() * 10) - 5;
        if (offset === 0) offset = 5;
        const fakeTarget = target + offset;

        // Generate expression for fake target
        if (Math.random() > 0.5) {
            let fa = Math.floor(Math.random() * (fakeTarget - 5)) + 1;
            wrongOptions.push(`${fa} + ${fakeTarget - fa}`);
        } else {
            let fs = fakeTarget + Math.floor(Math.random() * 20) + 5;
            wrongOptions.push(`${fs} - ${fs - fakeTarget}`);
        }
    }

    // Combine and shuffle
    const allOptions = [...correctOptions, ...wrongOptions];
    // Simple shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    // Prepare options format
    const options = allOptions.map((opt, idx) => ({
        label: `${opt}`,
        value: opt
    }));

    // Identify correct *values* (which are the expressions themselves)
    const correctAnswerList = correctOptions.sort(); // Sort for consistent comparison
    // Note: TypeMCQ logic above stringifies the selected array.
    // Our answer checking (GenerateReport) needs to handle this.
    // If I return answer as JSON string of array, calculateScore (tableTree logic) might handle it or fall back to strict equality.
    // Since I updated TypeMCQ to sort selected options, strict equality of JSON strings should work!

    const answer = JSON.stringify(correctAnswerList);

    return {
        type: "mcq",
        allowMultiple: true,
        question: `Select multiple expressions that equal ${target}.`,
        answer: answer,
        topic: "Operations",
        options: options,
        instructions: "Select all correct options."
    };
};
