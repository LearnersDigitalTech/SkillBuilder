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
    let questionText, answer;
    const rows = [];

    if (type === "Degree") {
        const deg = getRandomInt(2, 5);
        const coeffs = [getRandomInt(2, 9), getRandomInt(2, 9)];
        questionText = `Find the degree of the polynomial: $${coeffs[0]}x^{${deg}} + ${coeffs[1]}x^{${deg - 1}} + 5$`;
        answer = String(deg);
    } else {
        const x = getRandomInt(0, 3);
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 5);
        const c = getRandomInt(1, 10);
        questionText = `Find the value of $p(${x})$ for <br> $p(x) = ${a}x^{2} + ${b}x + ${c}$`;
        const val = a * x * x + b * x + c;
        answer = String(val);
    }

    rows.push({
        text: questionText,
        answer: answer
    });

    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Solve the following problem:",
        topic: "Polynomials / Basics",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generatePolynomialOperations = () => {
    const isAdd = Math.random() > 0.5;
    const a1 = getRandomInt(2, 5);
    const b1 = getRandomInt(1, 9);
    const a2 = getRandomInt(2, 5);
    const b2 = getRandomInt(1, 9);

    const op = isAdd ? "+" : "-";
    const questionText = `$(${a1}x + ${b1}) ${op} (${a2}x + ${b2})$`;

    const resA = isAdd ? a1 + a2 : a1 - a2;
    const resB = isAdd ? b1 + b2 : b1 - b2;

    const answer = `$${resA}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB)}$`;

    // Distractors
    const w1 = `$${resA}x ${resB >= 0 ? '-' : '+'} ${Math.abs(resB)}$`; // Flip sign of constant
    const w2 = `$${resA + 1}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB)}$`; // Wrong coeff
    const w3 = `$${resA}x ${resB >= 0 ? '+' : '-'} ${Math.abs(resB) + 1}$`; // Wrong constant

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: w1, label: w1 },
        { value: w2, label: w2 },
        { value: w3, label: w3 }
    ]);
    const uniqueOptions = [];
    const seen = new Set();
    for (const o of options) { if (!seen.has(o.value)) { seen.add(o.value); uniqueOptions.push(o); } }

    return {
        type: "mcq",
        question: `Simplify: ${questionText}`,
        topic: "Polynomials / Operations",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generatePolynomialFactorization = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);

    const sum = a + b;
    const prod = a * b;

    const questionText = `$x^{2} + ${sum}x + ${prod}$`;
    const answer = `$(x + ${a})(x + ${b})$`;

    // Distractors
    const w1 = `$(x - ${a})(x - ${b})$`;
    const w2 = `$(x + ${a})(x - ${b})$`;
    const w3 = `$(x - ${a})(x + ${b})$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: w1, label: w1 },
        { value: w2, label: w2 },
        { value: w3, label: w3 }
    ]);
    const uniqueOptions = [];
    const seen = new Set();
    for (const o of options) { if (!seen.has(o.value)) { seen.add(o.value); uniqueOptions.push(o); } }

    return {
        type: "mcq",
        question: `Factorise: ${questionText}`,
        topic: "Polynomials / Factorization",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generatePolynomialZeroes = () => {
    const a = getRandomInt(2, 5);
    const b = a * getRandomInt(1, 5);

    const questionText = `$p(x) = ${a}x + ${b}$`;
    const root = -b / a;
    const answer = String(root);
    const rows = [{ text: questionText, answer: answer }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Find the zero of the following problem:",
        topic: "Polynomials / Zeroes",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Linear Equations in Two Variables ---

export const generateLinearEquationSolutions = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const x = getRandomInt(0, 5);
    const y = getRandomInt(0, 5);
    const c = a * x + b * y;

    const questionText = `$${a}x + ${b}y = ${c}$`;
    const answer = `(${x}, ${y})`;
    const rows = [{ text: questionText, answer: answer }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Check which point is a solution to the following problem:",
        topic: "Linear Equations / Solutions",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateLinearEquationSolving = () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const x = getRandomInt(1, 5);
    const y = getRandomInt(1, 5);
    const c = a * x + b * y;

    const questionText = `$${a}x + ${b}y = ${c}$ if $x = ${x}$.`;
    const answer = String(y);
    const rows = [{ text: questionText, answer: answer }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Solve the following problem:",
        topic: "Linear Equations / Solving",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Coordinate Geometry ---

export const generateCoordinateBasics = () => {
    const x = getRandomInt(-5, 5);
    const y = getRandomInt(-5, 5);
    if (x === 0 || y === 0) return generateCoordinateBasics();

    const questionText = `In which quadrant does the point $(${x}, ${y})$ lie? (I/II/III/IV)`;
    let answer;
    if (x > 0 && y > 0) answer = "Quadrant I";
    else if (x < 0 && y > 0) answer = "Quadrant II";
    else if (x < 0 && y < 0) answer = "Quadrant III";
    else answer = "Quadrant IV";

    // For table input we might want a dropdown, but for now simple text match or rewrite
    // To match user's request for identical UI, we'll use Select if possible or just text
    // Assuming simple text row for consistency
    const rows = [{
        text: questionText,
        inputType: 'select',
        options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
        answer: answer
    }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Select the correct option:",
        topic: "Coordinate Geometry / Basics",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateCoordinateFormulas = () => {
    const triplets = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
    const [dx, dy, d] = triplets[getRandomInt(0, triplets.length - 1)];

    const x1 = getRandomInt(0, 5);
    const y1 = getRandomInt(0, 5);
    const x2 = x1 + dx;
    const y2 = y1 + dy;

    const questionText = `$A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
    const answer = String(d);
    const rows = [{ text: questionText, answer: answer }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Find the distance between points given",
        topic: "Coordinate Geometry / Formulas",
        answer: JSON.stringify(answerObj),
        rows: rows
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

    const questionText = `Find the area of a triangle with sides $${a}$ cm, $${b}$ cm, and $${c}$ cm.`;
    const answer = `${area} cm²`;
    const rows = [{ text: questionText, answer: String(area), unit: 'cm²' }];
    const answerObj = { 0: String(area) };

    return {
        type: "tableInput",
        question: "Solve the following problem:",
        topic: "Mensuration / Area",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateMensurationVolume = () => {
    const type = Math.random() > 0.5 ? "Cube" : "Cuboid";
    let questionText, answer, val, unit;

    if (type === "Cube") {
        const side = getRandomInt(2, 10);
        const vol = side * side * side;
        questionText = `Find the volume of a cube with side $${side}$ cm.`;
        val = vol;
        unit = "cm³";
        answer = `${vol} cm³`;
    } else {
        const l = getRandomInt(2, 10);
        const w = getRandomInt(2, 10);
        const h = getRandomInt(2, 10);
        const sa = 2 * (l * w + w * h + h * l);
        questionText = `Find the total surface area of a cuboid with dimensions $${l}$ cm $\\times$ $${w}$ cm $\\times$ $${h}$ cm.`;
        val = sa;
        unit = "cm²";
        answer = `${sa} cm²`;
    }

    const rows = [{ text: questionText, answer: String(val), unit: unit }];
    const answerObj = { 0: String(val) };

    return {
        type: "tableInput",
        question: "Solve the following problem:",
        topic: "Mensuration / Volume & SA",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Statistics & Probability ---

export const generateStatistics = () => {
    const type = ["Mean", "Median", "Mode"][getRandomInt(0, 2)];
    let questionText, answer;
    const data = Array.from({ length: 5 }, () => getRandomInt(1, 10));

    if (type === "Mean") {
        const sum = data.reduce((a, b) => a + b, 0);
        const remainder = sum % 5;
        if (remainder !== 0) {
            data[4] += (5 - remainder);
        }
        const newSum = data.reduce((a, b) => a + b, 0);
        const mean = newSum / 5;
        questionText = `Find the mean of the data: $${data.join(", ")}$`;
        answer = String(mean);
    } else if (type === "Median") {
        data.sort((a, b) => a - b);
        const median = data[2];
        questionText = `Find the median of the data: $${shuffleArray([...data]).join(", ")}$`;
        answer = String(median);
    } else {
        const modeVal = getRandomInt(1, 5);
        const dataMode = [modeVal, modeVal, modeVal, getRandomInt(6, 9), getRandomInt(6, 9)];
        questionText = `Find the mode of the data: $${shuffleArray(dataMode).join(", ")}$`;
        answer = String(modeVal);
    }

    const rows = [{ text: questionText, answer: answer }];
    const answerObj = { 0: answer };

    return {
        type: "tableInput",
        question: "Solve the following problem:",
        topic: "Statistics",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateProbability = () => {
    const type = Math.random() > 0.5 ? "Coin" : "Dice";
    let questionText, answer, answerVal;

    if (type === "Coin") {
        questionText = "Two coins are tossed simultaneously. Find the probability of getting exactly one head.";
        answer = "1/2";
        answerVal = { num: '1', den: '2' };
    } else {
        const eventType = Math.random() > 0.5 ? "Even" : "GreaterThan4";
        if (eventType === "Even") {
            questionText = "A die is thrown. Find the probability of getting an even number.";
            answer = "1/2";
            answerVal = { num: '1', den: '2' };
        } else {
            questionText = "A die is thrown. Find the probability of getting a number greater than $4$.";
            answer = "1/3";
            answerVal = { num: '1', den: '3' };
        }
    }

    const rows = [{ text: questionText, answer: answerVal }];
    const answerObj = { 0: answerVal };

    return {
        type: "tableInput",
        variant: "fraction",
        question: "Solve the following probability:",
        topic: "Probability",
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};
