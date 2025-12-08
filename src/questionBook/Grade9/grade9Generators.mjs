const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Number System ---

export const generateRealNumbers = () => {
    const type = Math.random() > 0.5 ? "Irrational" : "Exponents";
    let question, answer;

    if (type === "Irrational") {
        const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
        const nonPerfect = [2, 3, 5, 6, 7, 8, 10, 11, 12];

        const ps = perfectSquares[getRandomInt(0, perfectSquares.length - 1)];
        const np = nonPerfect[getRandomInt(0, nonPerfect.length - 1)];

        question = "Which of the following is an irrational number?";
        answer = `$\\sqrt{${np}}$`;

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: `$\\sqrt{${ps}}$`, label: `$\\sqrt{${ps}}$` },
            { value: `${getRandomInt(2, 10)}`, label: `$${getRandomInt(2, 10)}$` },
            { value: `${getRandomInt(1, 9)}.${getRandomInt(1, 9)}`, label: `$${getRandomInt(1, 9)}.${getRandomInt(1, 9)}$` }
        ]);

        return {
            type: "mcq",
            question: question,
            topic: "Number System / Real Numbers",
            options: options,
            answer: answer
        };
    } else {
        const base = getRandomInt(2, 5);
        const m = getRandomInt(2, 4);
        const n = getRandomInt(2, 3);

        question = `Simplify: $(${base}^{${m}})^{${n}}$`;
        answer = `$${base}^{${m * n}}$`;

        const options = shuffleArray([
            { value: answer, label: answer },
            { value: `$${base}^{${m + n}}$`, label: `$${base}^{${m + n}}$` },
            { value: `$${base}^{${Math.abs(m - n)}}$`, label: `$${base}^{${Math.abs(m - n)}}$` },
            { value: `$${base * 2}^{${m}}$`, label: `$${base * 2}^{${m}}$` }
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
            const val = `$${base}^{${r}}$`;
            if (!seen.has(val)) {
                seen.add(val);
                uniqueOptions.push({ value: val, label: val });
            }
        }

        return {
            type: "mcq",
            question: question,
            topic: "Number System / Exponents",
            options: uniqueOptions,
            answer: answer
        };
    }
};

// --- Polynomials ---

export const generatePolynomialBasics = () => {
    const type = Math.random() > 0.5 ? "Degree" : "Value";
    let question, answer;

    if (type === "Degree") {
        const deg = getRandomInt(2, 5);
        const coeffs = [getRandomInt(2, 9), getRandomInt(2, 9)];
        question = `Find the degree of the polynomial: $${coeffs[0]}x^{${deg}} + ${coeffs[1]}x^{${deg - 1}} + 5$`;
        answer = String(deg);
    } else {
        const x = getRandomInt(0, 3);
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 5);
        const c = getRandomInt(1, 10);
        question = `Find the value of $p(${x})$ for $p(x) = ${a}x^{2} + ${b}x + ${c}$`;
        const val = a * x * x + b * x + c;
        answer = String(val);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(Number(answer) + 1), label: String(Number(answer) + 1) },
        { value: String(Number(answer) - 1), label: String(Number(answer) - 1) },
        { value: String(Number(answer) * 2), label: String(Number(answer) * 2) }
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
        const r = getRandomInt(10, 50);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Polynomials / Basics",
        answer: answer
    };
};

export const generatePolynomialOperations = () => {
    const isAdd = Math.random() > 0.5;
    const a1 = getRandomInt(2, 5);
    const b1 = getRandomInt(1, 9);
    const a2 = getRandomInt(2, 5);
    const b2 = getRandomInt(1, 9);

    const op = isAdd ? "+" : "-";
    const question = `Simplify: $(${a1}x + ${b1}) ${op} (${a2}x + ${b2})$`;

    const resA = isAdd ? a1 + a2 : a1 - a2;
    const resB = isAdd ? b1 + b2 : b1 - b2;

    const answer = `$${resA}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB)}$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `$${resA}x ${resB >= 0 ? '-' : '+'} ${Math.abs(resB)}$`, label: `$${resA}x ${resB >= 0 ? '-' : '+'} ${Math.abs(resB)}$` },
        { value: `$${resA + 1}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB)}$`, label: `$${resA + 1}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB)}$` },
        { value: `$${resA}x ${resB + 2 >= 0 ? '+' : '-'} ${Math.abs(resB + 2)}$`, label: `$${resA}x ${resB + 2 >= 0 ? '+' : '-'} ${Math.abs(resB + 2)}$` }
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
        const val = `$${r1}x + ${r2}$`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Polynomials / Operations",
        options: uniqueOptions,
        answer: answer
    };
};

export const generatePolynomialFactorization = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);

    const sum = a + b;
    const prod = a * b;

    const question = `Factorise: $x^{2} + ${sum}x + ${prod}$`;
    const answer = `$(x + ${a})(x + ${b})$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `$(x - ${a})(x - ${b})$`, label: `$(x - ${a})(x - ${b})$` },
        { value: `$(x + ${a})(x - ${b})$`, label: `$(x + ${a})(x - ${b})$` },
        { value: `$(x + ${a + 1})(x + ${b})$`, label: `$(x + ${a + 1})(x + ${b})$` }
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
        const r = getRandomInt(1, 10);
        const val = `$(x + ${r})(x + ${r})$`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Polynomials / Factorization",
        options: uniqueOptions,
        answer: answer
    };
};

export const generatePolynomialZeroes = () => {
    const a = getRandomInt(2, 5);
    const b = a * getRandomInt(1, 5);

    const question = `Find the zero of the polynomial $p(x) = ${a}x + ${b}$`;
    const root = -b / a;
    const answer = String(root);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(-root), label: String(-root) },
        { value: String(root + 1), label: String(root + 1) },
        { value: "0", label: "$0$" }
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
        const r = getRandomInt(-10, 10);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Polynomials / Zeroes",
        answer: answer
    };
};

// --- Linear Equations in Two Variables ---

export const generateLinearEquationSolutions = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const x = getRandomInt(0, 5);
    const y = getRandomInt(0, 5);
    const c = a * x + b * y;

    const question = `Check which point is a solution to the equation: $${a}x + ${b}y = ${c}$`;
    const answer = `(${x}, ${y})`;

    const options = shuffleArray([
        { value: answer, label: `$(${x}, ${y})$` },
        { value: `(${x + 1}, ${y})`, label: `$(${x + 1}, ${y})$` },
        { value: `(${x}, ${y + 1})`, label: `$(${x}, ${y + 1})$` },
        { value: `(0, 0)`, label: `$(0, 0)$` }
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
        const r1 = getRandomInt(0, 10);
        const r2 = getRandomInt(0, 10);
        const val = `(${r1}, ${r2})`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$(${r1}, ${r2})$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Linear Equations / Solutions",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateLinearEquationSolving = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const x = getRandomInt(1, 5);
    const y = getRandomInt(1, 5);
    const c = a * x + b * y;

    const question = `Find the value of $y$ in $${a}x + ${b}y = ${c}$ if $x = ${x}$.`;
    const answer = String(y);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(y + 1), label: String(y + 1) },
        { value: String(y - 1), label: String(y - 1) },
        { value: "0", label: "$0$" }
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
        const r = getRandomInt(-10, 10);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Linear Equations / Solving",
        answer: answer
    };
};

// --- Coordinate Geometry ---

export const generateCoordinateBasics = () => {
    const x = getRandomInt(-5, 5);
    const y = getRandomInt(-5, 5);
    if (x === 0 || y === 0) return generateCoordinateBasics();

    const question = `In which quadrant does the point $(${x}, ${y})$ lie?`;
    let answer;
    if (x > 0 && y > 0) answer = "Quadrant I";
    else if (x < 0 && y > 0) answer = "Quadrant II";
    else if (x < 0 && y < 0) answer = "Quadrant III";
    else answer = "Quadrant IV";

    const options = shuffleArray([
        { value: "Quadrant I", label: "Quadrant I" },
        { value: "Quadrant II", label: "Quadrant II" },
        { value: "Quadrant III", label: "Quadrant III" },
        { value: "Quadrant IV", label: "Quadrant IV" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Coordinate Geometry / Basics",
        options: options,
        answer: answer
    };
};

export const generateCoordinateFormulas = () => {
    const triplets = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
    const [dx, dy, d] = triplets[getRandomInt(0, triplets.length - 1)];

    const x1 = getRandomInt(0, 5);
    const y1 = getRandomInt(0, 5);
    const x2 = x1 + dx;
    const y2 = y1 + dy;

    const question = `Find the distance between points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
    const answer = String(d);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(d + 1), label: String(d + 1) },
        { value: String(d - 1), label: String(d - 1) },
        { value: String(d * 2), label: String(d * 2) }
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
        topic: "Coordinate Geometry / Formulas",
        answer: answer
    };
};

// --- Mensuration ---

export const generateMensurationArea = () => {
    const scale = getRandomInt(1, 5);
    const a = 3 * scale;
    const b = 4 * scale;
    const c = 5 * scale;
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    const question = `Find the area of a triangle with sides $${a}$ cm, $${b}$ cm, and $${c}$ cm.`;
    const answer = `${area} cm²`;

    const options = shuffleArray([
        { value: answer, label: `$${area}$ cm²` },
        { value: `${area + 2} cm²`, label: `$${area + 2}$ cm²` },
        { value: `${area * 2} cm²`, label: `$${area * 2}$ cm²` },
        { value: `${area / 2} cm²`, label: `$${area / 2}$ cm²` }
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
        const r = getRandomInt(10, 50);
        const val = `${r} cm²`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$${r}$ cm²` });
        }
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Mensuration / Area",
        answer: String(area)
    };
};

export const generateMensurationVolume = () => {
    const type = Math.random() > 0.5 ? "Cube" : "Cuboid";
    let question, answer;

    if (type === "Cube") {
        const side = getRandomInt(2, 10);
        const vol = side * side * side;
        question = `Find the volume of a cube with side $${side}$ cm.`;
        answer = `${vol} cm³`;
    } else {
        const l = getRandomInt(2, 10);
        const w = getRandomInt(2, 10);
        const h = getRandomInt(2, 10);
        const sa = 2 * (l * w + w * h + h * l);
        question = `Find the total surface area of a cuboid with dimensions $${l}$ cm $\\times$ $${w}$ cm $\\times$ $${h}$ cm.`;
        answer = `${sa} cm²`;
    }

    const val = parseFloat(answer.split(' ')[0]);
    const unit = answer.split(' ')[1];

    const options = shuffleArray([
        { value: answer, label: `$${val}$ ${unit}` },
        { value: `${val + 10} ${unit}`, label: `$${val + 10}$ ${unit}` },
        { value: `${val * 2} ${unit}`, label: `$${val * 2}$ ${unit}` },
        { value: `${val - 5} ${unit}`, label: `$${val - 5}$ ${unit}` }
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
        const valStr = `${r} ${unit}`;
        if (!seen.has(valStr)) {
            seen.add(valStr);
            uniqueOptions.push({ value: valStr, label: `$${r}$ ${unit}` });
        }
    }

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: "Mensuration / Volume & SA",
        answer: String(val)
    };
};

// --- Statistics & Probability ---

export const generateStatistics = () => {
    const type = ["Mean", "Median", "Mode"][getRandomInt(0, 2)];
    let question, answer;
    const data = Array.from({ length: 5 }, () => getRandomInt(1, 10));

    if (type === "Mean") {
        const sum = data.reduce((a, b) => a + b, 0);
        const remainder = sum % 5;
        if (remainder !== 0) {
            data[4] += (5 - remainder);
        }
        const newSum = data.reduce((a, b) => a + b, 0);
        const mean = newSum / 5;
        question = `Find the mean of the data: $${data.join(", ")}$`;
        answer = String(mean);
    } else if (type === "Median") {
        data.sort((a, b) => a - b);
        const median = data[2];
        question = `Find the median of the data: $${shuffleArray([...data]).join(", ")}$`;
        answer = String(median);
    } else {
        const modeVal = getRandomInt(1, 5);
        const dataMode = [modeVal, modeVal, modeVal, getRandomInt(6, 9), getRandomInt(6, 9)];
        question = `Find the mode of the data: $${shuffleArray(dataMode).join(", ")}$`;
        answer = String(modeVal);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(Number(answer) + 1), label: String(Number(answer) + 1) },
        { value: String(Number(answer) - 1), label: String(Number(answer) - 1) },
        { value: String(Number(answer) + 2), label: String(Number(answer) + 2) }
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
        const r = getRandomInt(1, 10);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Statistics",
        answer: answer
    };
};

export const generateProbability = () => {
    const type = Math.random() > 0.5 ? "Coin" : "Dice";
    let question, answer;

    if (type === "Coin") {
        question = "Two coins are tossed simultaneously. Find the probability of getting exactly one head.";
        answer = "1/2";
    } else {
        const eventType = Math.random() > 0.5 ? "Even" : "GreaterThan4";
        if (eventType === "Even") {
            question = "A die is thrown. Find the probability of getting an even number.";
            answer = "1/2";
        } else {
            question = "A die is thrown. Find the probability of getting a number greater than $4$.";
            answer = "1/3";
        }
    }

    const options = shuffleArray([
        { value: answer, label: `$\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}$` },
        { value: "1/4", label: "$\\frac{1}{4}$" },
        { value: "1/6", label: "$\\frac{1}{6}$" },
        { value: "2/3", label: "$\\frac{2}{3}$" }
    ]);

    const uniqueOptions = [];
    const seen = new Set();
    for (const opt of options) {
        if (!seen.has(opt.value)) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }
    if (uniqueOptions.length < 4 && !seen.has("1")) { uniqueOptions.push({ value: "1", label: "$1$" }); seen.add("1"); }
    if (uniqueOptions.length < 4 && !seen.has("0")) { uniqueOptions.push({ value: "0", label: "$0$" }); seen.add("0"); }

    while (uniqueOptions.length < 4) {
        const r = getRandomInt(2, 5);
        const val = `1/${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$\\frac{1}{${r}}$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Probability",
        options: uniqueOptions,
        answer: answer
    };
};
