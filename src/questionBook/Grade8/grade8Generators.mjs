// Grade 8 with LaTeX - Moderate complexity
// Focus: Rational numbers, negative exponents, square/cube roots, algebraic identities

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- SVG Helpers ---

const generateQuadrilateralSVG = (type, angles) => {
    // scale: 200x150
    // Parallelogram: (30,130) -> (150,130) -> (190,30) -> (70,30)
    // Angles: A(30,130), B(150,130), C(190,30), D(70,30)
    let svg = `<svg width="250" height="160" viewBox="0 0 250 160" xmlns="http://www.w3.org/2000/svg" style="background:white; margin-bottom:10px;">
        <defs></defs>`;

    if (type === "Parallelogram") {
        svg += `<polygon points="30,130 150,130 190,30 70,30" fill="none" stroke="black" stroke-width="2" />
        
        <!-- Angle Arcs (Radius 25) -->
        <!-- A: (30,130). Right to AD. P1(55,130), P2(39,107) -->
        <path d="M 55,130 A 25,25 0 0,0 39,107" fill="none" stroke="black" />
        
        <!-- B: (150,130). Left to BC. P1(125,130), P2(159,107) -->
        <path d="M 125,130 A 25,25 0 0,1 159,107" fill="none" stroke="black" />
        
        <!-- C: (190,30). Left to CB. P1(165,30), P2(181,53) -->
        <path d="M 165,30 A 25,25 0 0,0 181,53" fill="none" stroke="black" />
        
        <!-- D: (70,30). Right to DA. P1(95,30), P2(61,53) -->
        <path d="M 95,30 A 25,25 0 0,1 61,53" fill="none" stroke="black" />

        <!-- Vertical Labels -->
        <text x="20" y="145" font-family="Arial" font-size="14">A</text>
        <text x="160" y="145" font-family="Arial" font-size="14">B</text>
        <text x="200" y="25" font-family="Arial" font-size="14">C</text>
        <text x="60" y="25" font-family="Arial" font-size="14">D</text>`;

        if (angles.A) svg += `<text x="50" y="120" font-size="12">${angles.A}°</text>`; // A
        if (angles.B) svg += `<text x="130" y="120" font-size="12">${angles.B}</text>`;  // B
        if (angles.C) svg += `<text x="160" y="50" font-size="12">${angles.C}</text>`;   // C
        if (angles.D) svg += `<text x="80" y="50" font-size="12">${angles.D}</text>`;     // D
    }
    svg += `</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

const generateSolidShapeSVG = (shape, params) => {
    let svg = `<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" style="background:white;">`;
    // Simple Cube/Cuboid
    // Front face (50,50,100,100), Back (80,30,100,100)
    svg += `<rect x="50" y="60" width="80" height="60" fill="none" stroke="black" stroke-width="2"/>
            <rect x="80" y="30" width="80" height="60" fill="none" stroke="black" stroke-width="2"/>
            <line x1="50" y1="60" x2="80" y2="30" stroke="black" stroke-width="2"/>
            <line x1="130" y1="60" x2="160" y2="30" stroke="black" stroke-width="2"/>
            <line x1="50" y1="120" x2="80" y2="90" stroke="black" stroke-width="2"/>
            <line x1="130" y1="120" x2="160" y2="90" stroke="black" stroke-width="2"/>`;
    svg += `</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

const generateMensurationSVG = (params) => {
    // Trapezium Field
    let svg = `<svg width="250" height="150" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg" style="background:white;">`;
    // (50, 120) -> (200, 120) -> (170, 40) -> (80, 40)
    svg += `<polygon points="50,120 200,120 170,40 80,40" fill="#e0f7fa" stroke="black" stroke-width="2"/>
            <line x1="80" y1="40" x2="80" y2="120" stroke="black" stroke-dasharray="4" />
            <rect x="80" y="110" width="10" height="10" fill="none" stroke="black"/>`;

    svg += `<text x="120" y="140" font-size="14">${params.baseA} m</text>`;
    svg += `<text x="120" y="35" font-size="14">${params.baseB} m</text>`;
    svg += `<text x="85" y="80" font-size="14">${params.height} m</text>`;

    svg += `</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

const generatePieChartSVG = (percentage) => {
    // scale: 200x200, center 100,100, radius 80
    const cx = 100, cy = 100, r = 80;
    const angle = (percentage / 100) * 360;
    const startAngle = -90; // Start at 12 o'clock
    const endAngle = startAngle + angle;

    // Convert degrees to radians
    const toRad = deg => deg * Math.PI / 180;

    // Calculate chart coordinates
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));

    // Flags for arc command
    const largeArc = angle > 180 ? 1 : 0;
    const sweep = 1; // Clockwise

    let svg = `<svg width="250" height="250" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="background:white; display:block; margin:auto;">`;

    // Draw full lighter circle as background (the "rest")
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e0f7fa" stroke="black" stroke-width="1"/>`;

    // Draw the sector
    if (percentage === 100) {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#4facfe" stroke="black" stroke-width="1"/>`;
    } else {
        const d = [
            "M", cx, cy,
            "L", x1, y1,
            "A", r, r, 0, largeArc, sweep, x2, y2,
            "Z"
        ].join(" ");
        svg += `<path d="${d}" fill="#4facfe" stroke="black" stroke-width="1"/>`;
    }

    // Add Label
    // Position: halfway angle
    const midAngle = startAngle + angle / 2;
    // slightly closer to center for text
    const textR = r * 0.6;
    const tx = cx + textR * Math.cos(toRad(midAngle));
    const ty = cy + textR * Math.sin(toRad(midAngle));

    svg += `<text x="${tx}" y="${ty}" font-family="Arial" font-size="16" fill="black" text-anchor="middle" dominant-baseline="middle">${percentage}%</text>`;
    svg += `</svg>`;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// --- Number System ---

export const generateRationalNumbers = () => {
    const type = Math.random() > 0.5 ? "Between" : "Property";
    let question, answer;

    if (type === "Between") {
        const den = getRandomInt(2, 10);
        const n1 = getRandomInt(1, 5);
        const n2 = n1 + 2;
        question = `Find a rational number between $\\frac{${n1}}{${den}}$ and $\\frac{${n2}}{${den}}$`;
        answer = `${n1 + 1}/${den}`;
    } else {
        const num = getRandomInt(1, 10);
        const den = getRandomInt(2, 10);
        question = `What is the additive inverse of $\\frac{${num}}{${den}}$?`;
        answer = `-${num}/${den}`;
    }

    const options = shuffleArray([
        { value: answer, label: answer.includes('-') ? `$-\\frac{${answer.replace('-', '').split('/')[0]}}{${answer.split('/')[1]}}$` : `$\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}$` },
        { value: type === "Between" ? `${parseFloat(answer) + 1}` : answer.replace("-", ""), label: type === "Between" ? `${parseFloat(answer) + 1}` : `$\\frac{${answer.replace("-", "").split('/')[0]}}{${answer.replace("-", "").split('/')[1]}}$` },
        { value: type === "Between" ? `${parseFloat(answer) - 0.5}` : `1/${answer.replace("-", "")}`, label: type === "Between" ? `${parseFloat(answer) - 0.5}` : `$\\frac{1}{${answer.replace("-", "")}}$` },
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
        const r = getRandomInt(1, 20);
        const val = String(r);
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: val });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Rational Numbers",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateExponentsGrade8 = () => {
    const base = getRandomInt(2, 9);
    const pow = getRandomInt(2, 5);

    const question = `Evaluate: $${base}^{-${pow}}$`;
    const val = Math.pow(base, pow);
    const answer = `1/${val}`;

    const options = shuffleArray([
        { value: answer, label: `$\\frac{1}{${val}}$` },
        { value: String(val), label: `$${val}$` },
        { value: `-${val}`, label: `$-${val}$` },
        { value: `1/${val + 1}`, label: `$\\frac{1}{${val + 1}}$` }
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
        const val = `1/${r}`;
        if (!seen.has(val)) {
            seen.add(val);
            uniqueOptions.push({ value: val, label: `$\\frac{1}{${r}}$` });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Exponents & Powers",
        options: uniqueOptions,
        answer: answer
    };
};

export const generateSquaresCubes = () => {
    // Table Input: Squares and Square Roots
    const rows = [];
    const answerObj = {};

    // Row 1: Square of a number (11-20)
    const n1 = getRandomInt(11, 25);
    const sq1 = n1 * n1;
    rows.push({ text: `Find the square of ${n1} ($${n1}^2$).`, inputType: "text" });
    answerObj[0] = String(sq1);

    // Row 2: Square Root (Perfect square)
    const n2 = getRandomInt(15, 30);
    const sq2 = n2 * n2;
    rows.push({ text: `Find the square root of ${sq2} ($\\sqrt{${sq2}}$).`, inputType: "text" });
    answerObj[1] = String(n2);



    return {
        type: "tableInput",
        variant: "default",
        topic: "Squares & Cubes",
        headers: ["Problem", "Value"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Algebra ---

export const generateAlgebraExpressions = () => {
    const type = Math.random() > 0.5 ? "Operation" : "Identity";
    let question, answer;

    const formatCoeff = (coeff, variable = "") => {
        if (coeff === 1) return variable ? variable : "1";
        if (coeff === -1) return variable ? `-${variable}` : "-1";
        return `${coeff}${variable}`;
    };

    if (type === "Operation") {
        const a = getRandomInt(1, 9); // Changed to 1-9 to utilize formatting
        const b = getRandomInt(1, 10);
        const c = getRandomInt(1, 9); // Changed to 1-9
        const d = getRandomInt(1, 10);

        question = `Simplify: $(${formatCoeff(a, "x")} + ${b}) + (${formatCoeff(c, "x")} - ${d})$`;
        const coeff = a + c;
        const constTerm = b - d;
        answer = `$${formatCoeff(coeff, "x")} ${constTerm >= 0 ? '+' : '-'} ${Math.abs(constTerm)}$`;
    } else {
        const a = getRandomInt(1, 9);
        question = `Expand: $(x + ${a})^{2}$`;
        answer = `$x^{2} + ${formatCoeff(2 * a, "x")} + ${a * a}$`;
    }

    const uniqueOptions = new Set([answer]);
    const optionsArr = [{ value: answer, label: answer }];

    while (optionsArr.length < 4) {
        let wrong;
        if (type === "Operation") {
            const r1 = getRandomInt(2, 20);
            const r2 = getRandomInt(1, 10);
            wrong = `$${formatCoeff(r1, "x")} + ${r2}$`; // Simply x term + const for wrong option
        } else {
            const r = getRandomInt(1, 10);
            wrong = `$x^{2} + ${formatCoeff(r, "x")} + ${r * r}$`;
        }

        if (!uniqueOptions.has(wrong)) {
            uniqueOptions.add(wrong);
            optionsArr.push({ value: wrong, label: wrong });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Algebraic Expressions",
        options: shuffleArray(optionsArr),
        answer: answer
    };
};

export const generateFactorisation = () => {
    const type = Math.random() > 0.5 ? "Common" : "DiffSquares";
    let question, answer;

    if (type === "Common") {
        const hcf = getRandomInt(2, 5);
        const a = getRandomInt(2, 5);
        const b = getRandomInt(2, 5);
        const t1 = hcf * a;
        const t2 = hcf * b;
        question = `Factorise: $${t1}x + ${t2}$`;
        answer = `$${hcf}(${a}x + ${b})$`;
    } else {
        const num = getRandomInt(2, 10);
        question = `Factorise: $x^{2} - ${num * num}$`;
        answer = `$(x - ${num})(x + ${num})$`;
    }

    const uniqueOptions = [];
    const seen = new Set();
    uniqueOptions.push({ value: answer, label: answer });
    seen.add(answer);

    while (uniqueOptions.length < 4) {
        let wrong;
        if (type === "Common") {
            const r = getRandomInt(2, 10);
            wrong = `$${r}(x + 1)$`;
        } else {
            const r = getRandomInt(1, 10);
            wrong = `$(x - ${r})(x - ${r})$`;
        }

        if (!seen.has(wrong)) {
            seen.add(wrong);
            uniqueOptions.push({ value: wrong, label: wrong });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Factorisation",
        options: shuffleArray(uniqueOptions),
        answer: answer
    };
};

// --- Updated Q2: Linear Equations (Table) ---
export const generateLinearEquationsGrade8 = () => {
    const rows = [];
    const answerObj = {};

    // Q1: Simple
    const a = getRandomInt(2, 5);
    const b = getRandomInt(1, 10);
    const x = getRandomInt(2, 8);
    const c = a * x - b;
    rows.push({ text: `Solve: $${a}x - ${b} = ${c}$` });
    answerObj[0] = String(x);

    // Q2: Variables both sides
    // 5x - 3 = 3x + 5 (2x=8, x=4)
    const k = getRandomInt(2, 5); // solution
    // ax - b = cx + d => (a-c)x = b+d
    // Let a-c = 2 => c = a-2.
    const a2 = getRandomInt(4, 8);
    const c2 = a2 - 2;
    const diff = 2 * k;
    // b+d = diff.
    const b2 = getRandomInt(1, diff - 1);
    const d2 = diff - b2;
    rows.push({ text: `Solve: $${a2}x - ${b2} = ${c2}x + ${d2}$` });
    answerObj[1] = String(k);

    return {
        type: "tableInput",
        variant: "default",
        topic: "Linear Equations",
        headers: ["Equation", "Value of x"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Geometry & Mensuration (Updated Q12) ---

export const generateMensuration = () => {
    // Generate SVG for a Trapezium Field
    const a = getRandomInt(20, 50); // parallel 1
    const b = a + getRandomInt(10, 30); // parallel 2
    const h = getRandomInt(10, 30);
    const area = 0.5 * (a + b) * h;

    // For simplicity, let's ask for Area directly in table
    const svg = generateMensurationSVG({ baseA: b, baseB: a, height: h });

    const rows = [
        { text: "Identify the shape of the field.", inputType: "select", options: ["Trapezium", "Parallelogram", "Rectangle", "Rhombus"] },
        { text: "Find the height of the field (in m)." },
        { text: "Calculate the total area (in m²)." }
    ];
    const answerObj = {
        0: "Trapezium",
        1: String(h),
        2: String(area)
    };

    return {
        type: "tableInput",
        variant: "default",
        question: "Observe the field dimensions given below:<br/>" + `<img src="${svg}" class="img-fluid" style="max-width:300px; display:block; margin:auto;"/>`,
        topic: "Mensuration",
        headers: ["Question", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateGraphs = () => {
    // Table Input: Quadrants with Dropdown
    // Generate one point for each quadrant
    const rows = [];
    const answerObj = {};
    const quadrants = ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"];

    // Q1: (+, +)
    const x1 = getRandomInt(1, 10);
    const y1 = getRandomInt(1, 10);

    // Q2: (-, +)
    const x2 = getRandomInt(1, 10) * -1;
    const y2 = getRandomInt(1, 10);

    // Q3: (-, -)
    const x3 = getRandomInt(1, 10) * -1;
    const y3 = getRandomInt(1, 10) * -1;

    // Q4: (+, -)
    const x4 = getRandomInt(1, 10);
    const y4 = getRandomInt(1, 10) * -1;

    const points = [
        { type: "Quadrant I", point: `(${x1}, ${y1})` },
        { type: "Quadrant II", point: `(${x2}, ${y2})` },
        { type: "Quadrant III", point: `(${x3}, ${y3})` },
        { type: "Quadrant IV", point: `(${x4}, ${y4})` }
    ];

    // Shuffle points
    const shuffledPoints = shuffleArray(points);

    shuffledPoints.forEach((item, index) => {
        rows.push({
            text: `In which quadrant does the point $${item.point}$ lie?`,
            inputType: "select",
            options: quadrants
        });
        answerObj[index] = item.type;
    });

    return {
        type: "tableInput",
        variant: "default",
        topic: "Introduction to Graphs",
        headers: ["Point", "Quadrant"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Applied Math ---

export const generateProportion = () => {
    const type = Math.random() > 0.5 ? "Direct" : "Inverse";
    let question, answer;

    if (type === "Direct") {
        const n1 = getRandomInt(2, 10);
        const cost1 = n1 * getRandomInt(5, 20);
        const n2 = getRandomInt(2, 10);
        const cost2 = (cost1 / n1) * n2;

        question = `If $${n1}$ pens cost ₹$${cost1}$, what is the cost of $${n2}$ pens?`;
        answer = `₹${cost2}`;
    } else {
        const totalWork = 120;
        const factors = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60, 120];
        const w_1 = factors[getRandomInt(2, 10)];
        const d_1 = totalWork / w_1;
        const w_2 = factors[getRandomInt(2, 10)];
        const d_2 = totalWork / w_2;

        question = `If $${w_1}$ workers can finish a task in $${d_1}$ days, how many days will $${w_2}$ workers take?`;
        answer = `${d_2} days`;
    }

    const val = parseInt(answer.replace(/\D/g, ''));

    const options = shuffleArray([
        { value: answer, label: type === "Direct" ? `₹$${val}$` : `$${val}$ days` },
        { value: type === "Direct" ? `₹${val + 10}` : `${val + 2} days`, label: type === "Direct" ? `₹$${val + 10}$` : `$${val + 2}$ days` },
        { value: type === "Direct" ? `₹${val - 5}` : `${val - 1} days`, label: type === "Direct" ? `₹$${val - 5}$` : `$${val - 1}$ days` },
        { value: type === "Direct" ? `₹${val * 2}` : `${val * 2} days`, label: type === "Direct" ? `₹$${val * 2}$` : `$${val * 2}$ days` }
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
        const valStr = type === "Direct" ? `₹${r}` : `${r} days`;
        if (!seen.has(valStr)) {
            seen.add(valStr);
            uniqueOptions.push({ value: valStr, label: type === "Direct" ? `₹$${r}$` : `$${r}$ days` });
        }
    }

    return {
        type: "userInput",
        question: question + (type === "Direct" ? " (number only, without ₹)" : " (number only, without days)"),
        topic: "Direct & Inverse Proportion",
        answer: String(val)
    };
};

export const generateComparingQuantities = () => {
    // Table Input: Percentage, Profit/Loss, Interest
    const rows = [];
    const answerObj = {};
    const round = (num) => Math.round(num * 100) / 100;

    // Row 1: Percentage Increase
    const val = getRandomInt(5, 19) * 50; // 250 to 950, multiples of 50
    const pct = getRandomInt(10, 50);
    const res = round(val + (val * pct / 100));
    rows.push({ text: `Increase $${val}$ by $${pct}\\%$`, inputType: "text" });
    answerObj[0] = String(res);

    // Row 2: Profit/Loss
    const cp = getRandomInt(5, 19) * 50; // 250 to 950
    const profitPct = getRandomInt(10, 30);
    const profit = round((cp * profitPct) / 100);
    const sp = round(cp + profit);
    rows.push({ text: `Find Selling Price if Cost Price=₹$${cp}$, Profit=$${profitPct}\\%$`, inputType: "text" });
    answerObj[1] = String(sp); // User enters number

    // Row 3: Simple Interest
    const P = getRandomInt(5, 19) * 50; // 250 to 950
    const R = getRandomInt(5, 10);
    const T = getRandomInt(2, 4);
    const SI = (P * R * T) / 100;
    rows.push({ text: `Find Simple Interest for Principal=₹$${P}$, Rate=$${R}\\%$, Time=$${T}$ yrs`, inputType: "text" });
    answerObj[2] = String(SI);

    return {
        type: "tableInput",
        variant: "default",
        topic: "Comparing Quantities",
        headers: ["Problem", "Value"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};


// --- Updated Q3: Quadrilaterals (SVG + Table) ---

export const generateQuadrilateralsGrade8 = () => {
    // Parallelogram with angle props
    const angleA = getRandomInt(50, 130);
    const angleB = 180 - angleA; // Adjacent

    // SVG params
    const svg = generateQuadrilateralSVG("Parallelogram", { A: angleA, B: "x", C: "y", D: "z" });

    // Rows
    const rows = [
        // { text: "Refer to the parallelogram ABCD. Find $x$ (opposite to B)." }, // Removed as per request
        { text: "Find the value of angle $x$ ($\\angle B$)." },
        { text: "Find the value of angle $y$ ($\\angle C$)." },
        { text: "Find the value of angle $z$ ($\\angle D$)." }
    ];

    const answerObj = {
        0: String(angleB),
        1: String(angleA),
        2: String(angleB)
    };

    return {
        type: "tableInput",
        variant: "default",
        question: "In the parallelogram ABCD given below, $\\angle A = " + angleA + "^\\circ$.<br/>" + `<img src="${svg}" class="img-fluid" style="max-width:300px; display:block; margin:auto;"/>`,
        topic: "Understanding Quadrilaterals",
        headers: ["Problem", "Angle Value"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Updated Q4: Practical Geometry (Table) ---
export const generatePracticalGeometryGrade8 = () => {
    // Check properties
    const rows = [
        { text: "Do the diagonals of a Square intersect at 90 degrees?", inputType: "select", options: ["Yes", "No"] },
        { text: "Are the diagonals of a Rectangle always equal?", inputType: "select", options: ["Yes", "No"] },
        { text: "Can a Rhombus have unequal diagonals?", inputType: "select", options: ["Yes", "No"] }
    ];
    const answerObj = {
        0: "Yes",
        1: "Yes",
        2: "Yes"
    };

    return {
        type: "tableInput",
        variant: "default",
        question: "Answer Yes or No for the following property checks:",
        topic: "Practical Geometry",
        headers: ["Property Check", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Updated Q11: Solid Shapes (SVG + Table) ---
export const generateVisualizingSolidShapes = () => {
    // Show a Cube/Cuboid and ask for F, V, E
    const svg = generateSolidShapeSVG("Cuboid");

    const rows = [
        { text: "Number of Faces (F)?" },
        { text: "Number of Vertices (V)?" },
        { text: "Number of Edges (E)?" }
    ];
    const answerObj = {
        0: "6",
        1: "8",
        2: "12"
    };

    return {
        type: "tableInput",
        variant: "default",
        question: "Observe the solid shape (Cuboid) below and verify Euler's Formula:<br/>" + `<img src="${svg}" class="img-fluid" style="max-width:250px; display:block; margin:auto;"/>`,
        topic: "Visualising Solid Shapes",
        headers: ["Attribute", "Count"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- Updated Q5: Data Handling (Table) ---
export const generateDataHandling = () => {
    // Mean, Median, Mode, Range
    const count = getRandomInt(5, 7);
    const numbers = [];
    for (let i = 0; i < count; i++) numbers.push(getRandomInt(1, 10));
    const sorted = [...numbers].sort((a, b) => a - b);

    // Mean
    const sum = numbers.reduce((a, b) => a + b, 0); // Might be decimal

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = (sorted.length % 2 !== 0) ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Range
    const range = sorted[sorted.length - 1] - sorted[0];

    const rows = [
        { text: "Find the Range of the data." },
        { text: "Find the Median of the data." },
        { text: "Find the Sum of the observations." } // Simpler than Mean for exact integer checks usually
    ];

    const answerObj = {
        0: String(range),
        1: String(median),
        2: String(sum)
    };

    return {
        type: "tableInput",
        variant: "default",
        question: `Consider the data set: ${numbers.join(", ")}`,
        topic: "Data Handling",
        headers: ["Statistic", "Value"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateCubesRoots = () => {
    // Table Input: Cubes and Cube Roots
    const rows = [];
    const answerObj = {};

    // Row 1: Cube of a number (2-12)
    const n1 = getRandomInt(2, 5);
    const cb1 = n1 * n1 * n1;
    rows.push({ text: `Find the cube of ${n1} ($${n1}^3$).`, inputType: "text" });
    answerObj[0] = String(cb1);

    // Row 2: Cube Root (Perfect cube)
    const n2 = getRandomInt(2, 5);
    const cb2 = n2 * n2 * n2;
    rows.push({ text: `Find the cube root of ${cb2} ($\\sqrt[3]{${cb2}}$).`, inputType: "text" });
    answerObj[1] = String(n2);



    return {
        type: "tableInput",
        variant: "default",
        topic: "Cubes and Cube Roots",
        headers: ["Problem", "Value"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

// --- New Algebra & Arithmetic Generators (Batch 2) ---

export const generateAlgebraIdentities = () => {
    // (a+b)^2, (a-b)^2, a^2 - b^2, (x+a)(x+b)
    const type = getRandomInt(0, 3);
    let question, answer;

    const formatCoeff = (coeff, variable = "") => {
        if (coeff === 1) return variable ? variable : "1";
        if (coeff === -1) return variable ? `-${variable}` : "-1";
        return `${coeff}${variable}`;
    };

    if (type === 0) { // (a+b)^2
        const a = getRandomInt(1, 9);
        const b = getRandomInt(1, 9);
        question = `Expand using identity: $(${formatCoeff(a, "x")} + ${b})^2$`;
        answer = `$${formatCoeff(a * a, "x^2")} + ${formatCoeff(2 * a * b, "x")} + ${b * b}$`;
    } else if (type === 1) { // (a-b)^2
        const a = getRandomInt(2, 9);
        const b = getRandomInt(1, 9);
        question = `Expand using identity: $(${formatCoeff(a, "x")} - ${b})^2$`;
        answer = `$${formatCoeff(a * a, "x^2")} - ${formatCoeff(2 * a * b, "x")} + ${b * b}$`;
    } else if (type === 2) { // a^2 - b^2
        const a = getRandomInt(2, 9);
        const b = getRandomInt(1, 9);
        question = `Factorise using identity: $${formatCoeff(a * a, "x^2")} - ${b * b}$`;
        answer = `$(${formatCoeff(a, "x")} - ${b})(${formatCoeff(a, "x")} + ${b})$`;
    } else { // (x+a)(x+b)
        const a = getRandomInt(1, 5);
        const b = getRandomInt(1, 5);
        question = `Expand: $(x + ${a})(x + ${b})$`;
        answer = `$x^2 + ${formatCoeff(a + b, "x")} + ${a * b}$`;
    }

    const uniqueOptions = new Set([answer]);
    const optionsArr = [{ value: answer, label: answer }];

    while (optionsArr.length < 4) {
        let wrong;
        if (type === 0) wrong = `$${formatCoeff(getRandomInt(1, 9), "x^2")} + ${formatCoeff(getRandomInt(10, 20), "x")} + ${getRandomInt(1, 9)}$`;
        else if (type === 1) wrong = `$${formatCoeff(getRandomInt(1, 9), "x^2")} - ${formatCoeff(getRandomInt(10, 20), "x")} + ${getRandomInt(1, 9)}$`;
        else if (type === 2) wrong = `$(${formatCoeff(getRandomInt(1, 9), "x")} - ${getRandomInt(1, 9)})(${formatCoeff(getRandomInt(1, 9), "x")} - ${getRandomInt(1, 9)})$`;
        else wrong = `$x^2 + ${formatCoeff(getRandomInt(1, 8), "x")} + ${getRandomInt(1, 8)}$`;

        if (!uniqueOptions.has(wrong)) {
            uniqueOptions.add(wrong);
            optionsArr.push({ value: wrong, label: wrong });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Algebraic Identities",
        options: shuffleArray(optionsArr),
        answer: answer
    };
};

export const generatePlayingWithNumbers = () => {
    // General form, divisibility
    const type = Math.random() > 0.5 ? "GeneralForm" : "Divisibility";
    let question, answer;

    if (type === "GeneralForm") {
        const a = getRandomInt(1, 9);
        const b = getRandomInt(0, 9);
        question = `Write the number $${a}${b}$ in general form.`;
        answer = `$10 \\times ${a} + ${b}$`;
    } else {
        const div = [2, 3, 5, 9, 10][getRandomInt(0, 4)];
        let num = getRandomInt(100, 999);
        // Ensure divisibility
        if (div === 2) num = num % 2 === 0 ? num : num + 1;
        if (div === 5) num = num - (num % 5);
        if (div === 10) num = num - (num % 10);
        if (div === 3) num = num - (num % 3);
        if (div === 9) num = num - (num % 9);

        question = `Which of the following numbers divides $${num}$ exactly?`;
        answer = String(div);
    }

    // Options logic
    const optionsArr = [{ value: answer, label: answer }];
    const uniqueOptions = new Set([answer]);
    while (optionsArr.length < 4) {
        let wrong;
        if (type === "GeneralForm") {
            wrong = `$100 \\times ${getRandomInt(1, 9)} + ${getRandomInt(0, 9)}$`;
        } else {
            wrong = String(getRandomInt(2, 9));
        }
        if (!uniqueOptions.has(wrong)) {
            uniqueOptions.add(wrong);
            optionsArr.push({ value: wrong, label: wrong });
        }
    }

    return {
        type: "mcq",
        question: question,
        topic: "Playing with Numbers",
        options: shuffleArray(optionsArr),
        answer: answer
    };
};

export const generateWordProblemsLinearEq = () => {
    // Age, Sum of numbers
    const type = Math.random() > 0.5 ? "Sum" : "Age";
    let question, answer;

    if (type === "Sum") {
        const x = getRandomInt(10, 50);
        const sum = x + (x + 10);
        question = `Sum of two numbers is ${sum}. One exceeds the other by 10. Find the smaller number.`;
        answer = String(x);
    } else {
        const sonAge = getRandomInt(5, 15);
        const fatherAge = sonAge * 3;
        const years = 5;
        const sumAge = (fatherAge + years) + (sonAge + years);
        question = `A father is 3 times as old as his son. After ${years} years, their combined ages will be ${sumAge} years. Find the son's present age.`;
        answer = String(sonAge);
    }

    return {
        type: "userInput",
        question: question,
        topic: "Linear Equations (Word Problems)",
        answer: answer
    };
};

export const generateQuadrilateralPropertiesAdvanced = () => {
    // Diagonals of Rhombus, Parallelogram
    const type = Math.random() > 0.5 ? "RhombusPerimeter" : "RectDiag";
    let question, answer;

    if (type === "RhombusPerimeter") {
        const k = getRandomInt(1, 5);
        const halfD1 = 3 * k;
        const halfD2 = 4 * k;
        const side = 5 * k;
        const realD1 = halfD1 * 2;
        const realD2 = halfD2 * 2;

        question = `The diagonals of a rhombus are ${realD1} cm and ${realD2} cm. Find its perimeter.`;
        answer = `${side * 4}`; // 4 * side
    } else {
        const xVal = getRandomInt(5, 15);
        question = `The diagonals of a rectangle are represented by $(2x + 4)$ and $(3x - 1)$. Find the value of $x$.`;
        answer = "5";
    }

    return {
        type: "userInput",
        question: question,
        topic: "Quadrilaterals (Advanced)",
        answer: answer
    };
};

// --- Batch 3: Applied Math & Advanced ---

export const generateMensurationGrade8 = () => {
    // Replaced by the specialized SVG version above
    return generateMensuration();
};

export const generateDirectInverseVariation = () => {
    // Table Input: Direct and Inverse Variations
    const rows = [];
    const answerObj = {};

    // Row 1: Direct Proportions (Unitary Method)
    const n1 = getRandomInt(2, 8);
    const cost1 = n1 * getRandomInt(5, 15);
    const n2 = getRandomInt(2, 8);
    const cost2 = (cost1 / n1) * n2;
    rows.push({ text: `If ${n1} pens cost ₹${cost1}, find the cost of ${n2} pens.`, inputType: "text" });
    answerObj[0] = String(cost2);

    // Row 2: Inverse Variation (Workers & Days)
    const w1 = getRandomInt(2, 5);
    const d1 = w1 * getRandomInt(2, 4); // Total man-days
    const w2 = w1 * 2;
    const d2 = d1 / 2; // Should be integer usually if w2 is double
    // Let's ensure integer math
    // Total work = W * D
    // Lets fix Total Work to 36, 48, 60
    const totalWork = [36, 48, 60][getRandomInt(0, 2)];
    // divisors
    const divisors = [];
    for (let i = 2; i <= 12; i++) if (totalWork % i === 0) divisors.push(i);
    const wa = divisors[getRandomInt(0, divisors.length - 1)];
    const da = totalWork / wa;
    const wb = divisors[getRandomInt(0, divisors.length - 1)];
    const db = totalWork / wb;

    rows.push({ text: `If ${wa} workers take ${da} days to complete a task, how many days will it take for ${wb} workers?`, inputType: "text" });
    answerObj[1] = String(db);

    // Row 3: Speed & Time (Inverse)
    const s1 = getRandomInt(40, 60);
    const t1 = getRandomInt(3, 6);
    const dist = s1 * t1;
    const s2 = s1 + 20; // faster
    const t2 = dist / s2;
    // This might be decimal, let's pick nice numbers. 
    // D = 120, 180, 240
    // S = 60 -> T = 2. S = 40 -> T = 3.
    const dist2 = [120, 180, 240][getRandomInt(0, 2)];
    const speedA = [40, 60][getRandomInt(0, 1)];
    const timeA = dist2 / speedA;
    const speedB = (speedA === 40) ? 60 : 40; // Swap
    const timeB = dist2 / speedB; // 3 or 2

    rows.push({ text: `A car travelling at ${speedA} km/h takes ${timeA} hours to reach a destination. How long will it take if it travels at ${speedB} km/h?`, inputType: "text" });
    answerObj[2] = String(timeB);

    return {
        type: "tableInput",
        variant: "default",
        topic: "Direct and Inverse Proportions",
        headers: ["Problem", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateSimpleInterestGrade8 = () => {
    const P = getRandomInt(100, 1000) * 10;
    const R = getRandomInt(2, 10);
    const T = getRandomInt(1, 5);
    const SI = (P * R * T) / 100;

    return {
        type: "userInput",
        question: `Calculate Simple Interest for P=₹${P}, R=${R}%, T=${T} years.`,
        topic: "Simple Interest",
        answer: String(SI)
    };
};

export const generateMensuration3D = () => {
    // SA/Vol of Cylinder
    const r = 7 * getRandomInt(1, 3);
    const h = getRandomInt(5, 20);
    const type = Math.random() > 0.5 ? "CSA" : "Volume";
    let question, answer;

    if (type === "CSA") {
        // 2*pi*r*h
        const csa = 2 * 22 / 7 * r * h;
        question = `Find the Curved Surface Area of a cylinder with radius ${r} cm and height ${h} cm. (Use $\\pi = 22/7$)`;
        answer = String(csa);
    } else {
        // pi*r*r*h
        const vol = 22 / 7 * r * r * h;
        question = `Find the Volume of a cylinder with radius ${r} cm and height ${h} cm. (Use $\\pi = 22/7$)`;
        answer = String(vol);
    }

    return {
        type: "userInput",
        question: question,
        topic: "Mensuration 3D",
        answer: answer
    };
};

export const generateDataInterpretationAdvanced = () => {
    // Pie chart or double bar logic
    // Let's create a simple Pie Chart logic question (text based)
    // "In a pie chart, if 25% represents 50 students, total students?"
    const pct = [10, 20, 25, 50][getRandomInt(0, 3)];
    const val = getRandomInt(5, 20) * 10;
    const total = (val * 100) / pct;

    const svg = generatePieChartSVG(pct);

    const rows = [];
    const answerObj = {};

    // Q1: Total items
    rows.push({ text: `If this sector with ${pct}% represents ${val} items, find the total number of items.` });
    answerObj[0] = String(total);

    // Q2: Central Angle
    const angle = (pct / 100) * 360;
    rows.push({ text: `Find the central angle of this sector (in degrees).` });
    answerObj[1] = String(angle);

    // Q3: Another percentage value
    let otherPct = 10;
    if (pct === 10) otherPct = 20;
    const otherVal = (total * otherPct) / 100;
    rows.push({ text: `How many items would a ${otherPct}% sector represent?` });
    answerObj[2] = String(otherVal);

    return {
        type: "tableInput",
        variant: "default",
        question: `Observe the pie chart below:<br/><img src="${svg}" class="img-fluid" style="max-width:300px; display:block; margin:auto; margin-top:10px;"/>`,
        topic: "Data Interpretation",
        headers: ["Question", "Answer"],
        answer: JSON.stringify(answerObj),
        rows: rows
    };
};

export const generateGraphInterpretation = () => {
    // Linear graph scenario
    const speed = getRandomInt(30, 80);
    const time = getRandomInt(2, 5);
    const dist = speed * time;

    return {
        type: "userInput",
        question: `A car travels at a constant speed of ${speed} km/h. Distance ($D$) varies directly with time ($t$). Distance covered in ${time} hours is?`,
        topic: "Introduction to Graphs (Linear)",
        answer: String(dist)
    };
};

// Aliases/Wrappers for Reusability (Matching Request Names)
export const generatePercentage = () => {
    // Reuse Comparing Quantities Percentage logic
    const val = getRandomInt(100, 500);
    const pct = getRandomInt(10, 50);
    const res = Math.round(val + (val * pct / 100)); // Round for safety
    return {
        type: "userInput",
        question: `Increase $${val}$ by $${pct}\\%$.`,
        topic: "Percentage",
        answer: String(res)
    };
};

export const generateCommercialMath = () => {
    // Reuse Comparing Quantities Profit logic
    const cp = getRandomInt(100, 500);
    const profitPct = getRandomInt(10, 30);
    const sp = Math.round(cp + cp * profitPct / 100);
    return {
        type: "userInput",
        question: `Find S.P. if C.P. = ₹${cp} and Profit% = ${profitPct}%.`,
        topic: "Commercial Math",
        answer: String(sp)
    };
};
