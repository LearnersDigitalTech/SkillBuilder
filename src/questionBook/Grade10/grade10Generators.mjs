const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Real Numbers ---

export const generateRealNumbers = () => {
    // HCF/LCM or Prime Factorization
    const type = Math.random() > 0.5 ? "HCF_LCM" : "PrimeFactor";
    let question, answer;

    if (type === "HCF_LCM") {
        const a = getRandomInt(2, 20);
        const b = getRandomInt(2, 20);
        const subType = Math.random() > 0.5 ? "HCF" : "LCM";

        const gcd = (x, y) => !y ? x : gcd(y, x % y);
        const lcm = (x, y) => (x * y) / gcd(x, y);

        const val = subType === "HCF" ? gcd(a, b) : lcm(a, b);
        question = `Find the ${subType} of $${a}$ and $${b}$.`;
        answer = String(val);
    } else {
        // Prime Factorization of simple composite numbers
        const primes = [2, 3, 5, 7];
        const p1 = primes[getRandomInt(0, 3)];
        const p2 = primes[getRandomInt(0, 3)];
        const p3 = primes[getRandomInt(0, 2)]; // Keep numbers small
        const num = p1 * p2 * p3;

        question = `Express $${num}$ as a product of its prime factors.`;
        // Sort factors for consistent answer string
        const factors = [p1, p2, p3].sort((a, b) => a - b);
        answer = factors.join(" × ");
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: answer.includes("×") ? answer.replace("2", "3") : String(Number(answer) + 1), label: answer.includes("×") ? answer.replace("2", "3") : String(Number(answer) + 1) },
        { value: answer.includes("×") ? answer.replace("3", "5") : String(Number(answer) - 1), label: answer.includes("×") ? answer.replace("3", "5") : String(Number(answer) - 1) },
        { value: answer.includes("×") ? answer + " × 2" : String(Number(answer) * 2), label: answer.includes("×") ? answer + " × 2" : String(Number(answer) * 2) }
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
        const r = getRandomInt(1, 100);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (type === "HCF_LCM" && Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Real Numbers",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Real Numbers",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Polynomials ---

export const generatePolynomials = () => {
    // Zeroes & Coefficients or Forming Quadratic Polynomial
    const type = Math.random() > 0.5 ? "Relation" : "Forming";
    let question, answer;

    if (type === "Relation") {
        // Given ax^2 + bx + c, find sum or product of zeroes
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 10);
        const c = getRandomInt(1, 10);
        const subType = Math.random() > 0.5 ? "Sum" : "Product";

        question = `Find the ${subType.toLowerCase()} of the zeroes of the polynomial $${a}x^{2} + ${b}x + ${c}$.`;

        let val;
        if (subType === "Sum") val = -b / a; // alpha + beta = -b/a
        else val = c / a; // alpha * beta = c/a

        // Format to 2 decimal places if not integer
        answer = Number.isInteger(val) ? String(val) : val.toFixed(2);
    } else {
        // Form quadratic polynomial given sum and product
        const sum = getRandomInt(-5, 5);
        const prod = getRandomInt(-5, 5);

        question = `Find a quadratic polynomial whose sum and product of zeroes are $${sum}$ and $${prod}$ respectively.`;
        // k(x^2 - (sum)x + prod)
        const term2 = sum >= 0 ? `- ${sum}x` : `+ ${Math.abs(sum)}x`;
        const term3 = prod >= 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
        answer = `$x^{2} ${term2} ${term3}$`;
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: answer.includes("x^{2}") ? answer.replace("-", "+").replace("+", "-") : String(Number(answer) + 1), label: answer.includes("x^{2}") ? answer.replace("-", "+").replace("+", "-") : String(Number(answer) + 1) },
        { value: answer.includes("x^{2}") ? answer.replace("x^{2}", "2x^{2}") : String(Number(answer) - 1), label: answer.includes("x^{2}") ? answer.replace("x^{2}", "2x^{2}") : String(Number(answer) - 1) },
        { value: answer.includes("x^{2}") ? `$x^{2} + ${getRandomInt(1, 5)}x + 1$` : String(Number(answer) * 2), label: answer.includes("x^{2}") ? `$x^{2} + ${getRandomInt(1, 5)}x + 1$` : String(Number(answer) * 2) }
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
        const val = answer.includes("x^{2}") ? `$x^{2} + ${r}x + ${r}$` : String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (type === "Relation" && Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Polynomials",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Polynomials",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Linear Equations ---

export const generateLinearEquations = () => {
    // Solve pair of linear equations
    // x + y = a, x - y = b => 2x = a+b => x = (a+b)/2
    // Ensure integer solutions
    const x = getRandomInt(1, 10);
    const y = getRandomInt(1, 10);

    const eq1_rhs = x + y;
    const eq2_rhs = x - y;

    const question = `Solve for $x$ and $y$: <br/> $x + y = ${eq1_rhs}$ and $x - y = ${eq2_rhs}$`;
    const answer = `x=${x}, y=${y}`;

    const options = shuffleArray([
        { value: answer, label: `$x=${x}, y=${y}$` },
        { value: `x=${x + 1}, y=${y}`, label: `$x=${x + 1}, y=${y}$` },
        { value: `x=${x}, y=${y + 1}`, label: `$x=${x}, y=${y + 1}$` },
        { value: `x=${y}, y=${x}`, label: `$x=${y}, y=${x}$` }
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
        const val = `x=${r1}, y=${r2}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$x=${r1}, y=${r2}$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Linear Equations",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Quadratic Equations ---

export const generateQuadraticEquations = () => {
    // Roots or Discriminant
    const type = Math.random() > 0.5 ? "Roots" : "Discriminant";
    let question, answer;

    if (type === "Roots") {
        // Find roots of x^2 - (a+b)x + ab = 0
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 5);
        const sum = a + b;
        const prod = a * b;

        question = `Find the roots of the quadratic equation: <br/> $x^{2} - ${sum}x + ${prod} = 0$`;
        answer = `${a}, ${b}`;
    } else {
        // Find discriminant D = b^2 - 4ac
        const a = getRandomInt(1, 5);
        const b = getRandomInt(5, 10);
        const c = getRandomInt(1, 5);

        question = `Find the discriminant of the quadratic equation: <br/> $${a}x^{2} + ${b}x + ${c} = 0$`;
        const D = b * b - 4 * a * c;
        answer = String(D);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: answer.includes(",") ? `${parseInt(answer.split(',')[0]) + 1}, ${answer.split(',')[1]}` : String(Number(answer) + 10), label: answer.includes(",") ? `${parseInt(answer.split(',')[0]) + 1}, ${answer.split(',')[1]}` : String(Number(answer) + 10) },
        { value: answer.includes(",") ? `${answer.split(',')[0]}, ${parseInt(answer.split(',')[1]) + 1}` : String(Number(answer) - 10), label: answer.includes(",") ? `${answer.split(',')[0]}, ${parseInt(answer.split(',')[1]) + 1}` : String(Number(answer) - 10) },
        { value: answer.includes(",") ? `${parseInt(answer.split(',')[0]) + 1}, ${parseInt(answer.split(',')[1]) + 1}` : String(Number(answer) * 2), label: answer.includes(",") ? `${parseInt(answer.split(',')[0]) + 1}, ${parseInt(answer.split(',')[1]) + 1}` : String(Number(answer) * 2) }
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
        const val = answer.includes(",") ? `${r}, ${r + 1}` : String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (type === "Discriminant" && Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Quadratic Equations",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Quadratic Equations",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Arithmetic Progression ---

export const generateArithmeticProgression = () => {
    // nth term or Sum of n terms
    const type = Math.random() > 0.5 ? "NthTerm" : "Sum";
    const a = getRandomInt(1, 10);
    const d = getRandomInt(2, 5);
    const n = getRandomInt(5, 15);
    let question, answer;

    if (type === "NthTerm") {
        // an = a + (n-1)d
        const an = a + (n - 1) * d;
        question = `Find the $${n}^{\\text{th}}$ term of the AP: $${a}, ${a + d}, ${a + 2 * d}, \\ldots$`;
        answer = String(an);
    } else {
        // Sn = n/2 [2a + (n-1)d]
        const Sn = (n / 2) * (2 * a + (n - 1) * d);
        question = `Find the sum of the first $${n}$ terms of the AP: $${a}, ${a + d}, ${a + 2 * d}, \\ldots$`;
        answer = String(Sn);
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(Number(answer) + d), label: String(Number(answer) + d) },
        { value: String(Number(answer) - d), label: String(Number(answer) - d) },
        { value: String(Number(answer) + 2 * d), label: String(Number(answer) + 2 * d) }
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
        const r = getRandomInt(10, 100);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Arithmetic Progression",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Arithmetic Progression",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Coordinate Geometry ---

export const generateCoordinateGeometry = () => {
    // Distance or Midpoint
    const type = Math.random() > 0.5 ? "Distance" : "Midpoint";
    let question, answer;

    if (type === "Distance") {
        // Use Pythagorean triplets
        const triplets = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
        const [dx, dy, dist] = triplets[getRandomInt(0, triplets.length - 1)];

        const x1 = getRandomInt(0, 5);
        const y1 = getRandomInt(0, 5);
        const x2 = x1 + dx;
        const y2 = y1 + dy;

        question = `Find the distance between $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
        answer = String(dist);
    } else {
        // Midpoint: ((x1+x2)/2, (y1+y2)/2)
        // Ensure even sum for integer coordinates
        const x1 = getRandomInt(0, 10);
        const y1 = getRandomInt(0, 10);
        const x2 = x1 + 2 * getRandomInt(1, 5);
        const y2 = y1 + 2 * getRandomInt(1, 5);

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        question = `Find the midpoint of the line segment joining $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
        answer = `(${mx}, ${my})`;
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: answer.includes("(") ? `(${parseInt(answer.split(',')[0].slice(1)) + 1}, ${answer.split(',')[1]}` : String(Number(answer) + 1), label: answer.includes("(") ? `(${parseInt(answer.split(',')[0].slice(1)) + 1}, ${answer.split(',')[1]}` : String(Number(answer) + 1) },
        { value: answer.includes("(") ? `(${answer.split(',')[0].slice(1)}, ${parseInt(answer.split(',')[1]) + 1})` : String(Number(answer) - 1), label: answer.includes("(") ? `(${answer.split(',')[0].slice(1)}, ${parseInt(answer.split(',')[1]) + 1})` : String(Number(answer) - 1) },
        { value: answer.includes("(") ? `(0, 0)` : String(Number(answer) * 2), label: answer.includes("(") ? `(0, 0)` : String(Number(answer) * 2) }
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
        const val = answer.includes("(") ? `(${r}, ${r})` : String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (type === "Distance" && Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Coordinate Geometry",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Coordinate Geometry",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Trigonometry ---

export const generateTrigonometry = () => {
    // Ratios or Identities
    const type = Math.random() > 0.5 ? "Ratios" : "Identities";
    let question, answer;

    if (type === "Ratios") {
        // Given sin A = 3/5, find cos A
        const triplets = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
        const [opp, adj, hyp] = triplets[getRandomInt(0, triplets.length - 1)];

        question = `If $\\sin A = \\frac{${opp}}{${hyp}}$, find $\\cos A$.`;
        answer = `$\\frac{${adj}}{${hyp}}$`;
    } else {
        // Identity: sin^2 + cos^2 = 1
        const angle = getRandomInt(10, 80);
        question = `Find the value of $\\sin^{2}${angle}^{\\circ} + \\cos^{2}${angle}^{\\circ}$.`;
        answer = "1";
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: "0", label: "$0$" },
        { value: "1/2", label: "$\\frac{1}{2}$" },
        { value: "2", label: "$2$" }
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
        const r = getRandomInt(2, 10);
        const val = `1/${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$\\frac{1}{${r}}$` });
        }
    }

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Trigonometry",
            answer: answer.replace(/\$/g, '').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Trigonometry",
        options: uniqueOptions,
        answer: answer.replace(/\$/g, '').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
    };
};

// --- Mensuration ---

export const generateMensuration = () => {
    // Volume/SA of Cone, Sphere, Cylinder
    const shape = ["Cone", "Sphere", "Cylinder"][getRandomInt(0, 2)];
    let question, answer;
    const r = getRandomInt(2, 7);
    const h = getRandomInt(5, 10);

    if (shape === "Cone") {
        // Volume = 1/3 pi r^2 h
        const vol = (1 / 3) * Math.PI * r * r * h;
        question = `Find the volume of a cone with radius $${r}$ cm and height $${h}$ cm. (Use $\\pi = 3.14$)`;
        answer = `${vol.toFixed(2)} cm³`;
    } else if (shape === "Sphere") {
        // Surface Area = 4 pi r^2
        const sa = 4 * Math.PI * r * r;
        question = `Find the surface area of a sphere with radius $${r}$ cm. (Use $\\pi = 3.14$)`;
        answer = `${sa.toFixed(2)} cm²`;
    } else {
        // Cylinder Volume = pi r^2 h
        const vol = Math.PI * r * r * h;
        question = `Find the volume of a cylinder with radius $${r}$ cm and height $${h}$ cm. (Use $\\pi = 3.14$)`;
        answer = `${vol.toFixed(2)} cm³`;
    }

    const val = parseFloat(answer.split(' ')[0]);
    const unit = answer.split(' ')[1];

    const options = shuffleArray([
        { value: answer, label: `$${val.toFixed(2)}$ ${unit}` },
        { value: `${(val + 10).toFixed(2)} ${unit}`, label: `$${(val + 10).toFixed(2)}$ ${unit}` },
        { value: `${(val * 2).toFixed(2)} ${unit}`, label: `$${(val * 2).toFixed(2)}$ ${unit}` },
        { value: `${(val / 2).toFixed(2)} ${unit}`, label: `$${(val / 2).toFixed(2)}$ ${unit}` }
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
        const r = getRandomInt(10, 100);
        const valStr = `${r.toFixed(2)} ${unit}`;
        if (!seen.has(valStr)) {
            seen.add(valStr);
            uniqueOptions.push({ value: valStr, label: `$${r.toFixed(2)}$ ${unit}` });
        }
    }

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question + " (number only)",
            topic: "Mensuration",
            answer: String(val)
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Mensuration",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Statistics ---

export const generateStatistics = () => {
    // Empirical Relationship: Mode = 3Median - 2Mean
    const mean = getRandomInt(10, 20);
    const median = getRandomInt(10, 20);
    const mode = 3 * median - 2 * mean;
    let question, answer;

    question = `If the Mean is $${mean}$ and Median is $${median}$, find the Mode using the empirical relationship.`;
    answer = String(mode);

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: String(mode + 1), label: String(mode + 1) },
        { value: String(mode - 1), label: String(mode - 1) },
        { value: String(mode + 2), label: String(mode + 2) }
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
        const r = getRandomInt(1, 50);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Statistics",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Statistics",
        options: uniqueOptions,
        answer: answer
    };
};

// --- Probability ---

export const generateProbability = () => {
    // Dice or Cards
    const type = Math.random() > 0.5 ? "Dice" : "Cards";
    let question, answer;

    if (type === "Dice") {
        question = "A die is thrown once. Find the probability of getting a prime number.";
        answer = "1/2"; // 2, 3, 5 -> 3/6
    } else {
        question = "One card is drawn from a well-shuffled deck of $52$ cards. Find the probability of getting a King.";
        answer = "1/13"; // 4/52
    }

    const allOptions = [
        { value: answer, label: `$\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}$` },
        { value: "1/4", label: "$\\frac{1}{4}$" },
        { value: "1/2", label: "$\\frac{1}{2}$" },
        { value: "1/13", label: "$\\frac{1}{13}$" },
        { value: "1/52", label: "$\\frac{1}{52}$" },
        { value: "1/3", label: "$\\frac{1}{3}$" },
        { value: "1/6", label: "$\\frac{1}{6}$" }
    ];

    // Ensure unique options
    const uniqueOptions = [];
    const seen = new Set();

    // Always add answer first
    seen.add(answer);
    uniqueOptions.push({ value: answer, label: `$\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}$` });

    // Add distractors
    for (const opt of shuffleArray(allOptions)) {
        if (!seen.has(opt.value) && uniqueOptions.length < 4) {
            seen.add(opt.value);
            uniqueOptions.push(opt);
        }
    }

    // Fill if still needed
    while (uniqueOptions.length < 4) {
        const r = getRandomInt(5, 10);
        const val = `1/${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$\\frac{1}{${r}}$` });
        }
    }

    const finalOptions = shuffleArray(uniqueOptions);

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Probability",
            answer: answer
        };
    }

    return {
        type: "mcq",
        question: question,
        topic: "Probability",
        options: finalOptions,
        answer: answer
    };
};
