const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Q1: Linear Function Evaluation ---
export const generateQ1 = () => {
    // If f(x) = x + c1 and g(x) = c2*x, finding k3*f(k4) - g(k4)
    const c1 = getRandomInt(5, 15);
    const c2 = getRandomInt(3, 9);
    const k3 = getRandomInt(2, 5); // multiplier for f
    const k4 = getRandomInt(2, 5); // input

    // f(k4) = k4 + c1
    const fVal = k4 + c1;
    // g(k4) = c2 * k4
    const gVal = c2 * k4;

    // Result
    const ans = (k3 * fVal) - gVal;

    const question = `If $f(x) = x + ${c1}$ and $g(x) = ${c2}x$, what is the value of $${k3}f(${k4}) - g(${k4})$?`;

    // Options
    const distractors = [
        ans + getRandomInt(1, 5),
        ans - getRandomInt(1, 5),
        ans + 10
    ];

    const options = shuffleArray([
        { value: String(ans), label: String(ans) },
        ...distractors.map(d => ({ value: String(d), label: String(d) }))
    ]);

    return { type: 'mcq', question, answer: String(ans), options, topic: 'Linear functions' };
};

// --- Q2: Y-Intercept ---
export const generateQ2 = () => {
    // y-intercept of y = mx + c
    const m = -1 * getRandomInt(2, 9);
    const c = -1 * getRandomInt(10, 50);

    const question = `The $y$-intercept of the graph of $y = ${m}x ${c}$ in the $xy$-plane is $(0, y)$. What is the value of $y$?`;

    const ans = c;
    const distractors = [
        c + getRandomInt(1, 10),
        -c,
        m
    ];

    const options = shuffleArray([
        { value: String(ans), label: String(ans) },
        ...distractors.map(d => ({ value: String(d), label: String(d) }))
    ]);

    return { type: 'mcq', question, answer: String(ans), options, topic: 'Linear equations graphs' };
};

// --- Q3: Graph Interpretation (Slope) ---
export const generateQ3 = () => {
    // Context: Video game system total cost
    // y = mx + b. b = initial cost, m = cost per game.
    const initialCost = getRandomInt(50, 150); // b
    const costPerGame = getRandomInt(20, 60); // m

    // Equation: y = costPerGame * x + initialCost
    const questionText = `The graph of the function $f$, where $y = f(x)$, models the total cost $y$, in dollars, for a certain video game system and $x$ games. What is the best interpretation of the slope of the graph in this context?`;

    // SVG graph generation
    // ViewBox: 0 0 400 350 (widened slightly for Y labels)
    // Calculate nice scale for Y axis
    const maxDataValue = initialCost + (costPerGame * 10);

    // Prefer intervals of 20, 40, etc. as requested
    let stepY = 20;
    // If range is large, increase step size to avoid too many ticks (max ~20 ticks for readability)
    if (maxDataValue > 400) stepY = 50;
    if (maxDataValue > 1250) stepY = 100;

    const numYSteps = Math.ceil(maxDataValue / stepY);
    const maxY = numYSteps * stepY;

    // SVG Graph
    // ViewBox: 0 0 400 350
    // Origin (0,0) at SVG (60, 300)
    // X axis length: 300 (steps of 30 for 10 units)
    // Y axis length: 300
    const startX = 60;
    const startY = 300;
    const graphH = 300;
    const graphW = 300;

    // Generate Y grid lines separately
    const yGrid = Array.from({ length: numYSteps + 1 }).map((_, i) => {
        const y = startY - (i * (graphH / numYSteps));
        const horizLine = `<line x1="${startX}" y1="${y}" x2="${startX + graphW}" y2="${y}" stroke="#f0f0f0" stroke-width="1" />`;
        const yLabel = `<text x="${startX - 10}" y="${y + 5}" font-size="12" text-anchor="end" fill="#666">${i * stepY}</text>`;
        return horizLine + yLabel;
    }).join('');

    // Generate X grid lines separately (0 to 10)
    const xGrid = Array.from({ length: 11 }).map((_, i) => {
        const x = startX + (i * (graphW / 10));
        const vertLine = `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY - graphH}" stroke="#f0f0f0" stroke-width="1" />`;
        const xLabel = `<text x="${x}" y="${startY + 20}" font-size="12" text-anchor="middle" fill="#666">${i}</text>`;
        return vertLine + xLabel;
    }).join('');

    const svg = `
    <svg width="100%" height="300" viewBox="0 0 400 350" style="background:#fff; border:1px solid #ccc; margin: 10px 0; font-family: sans-serif;">
       <!-- Grid & Labels -->
       ${yGrid}
       ${xGrid}
       
       <!-- Axes -->
       <line x1="${startX}" y1="${startY}" x2="${startX + graphW}" y2="${startY}" stroke="black" stroke-width="2"/>
       <line x1="${startX}" y1="${startY}" x2="${startX}" y2="${startY - graphH}" stroke="black" stroke-width="2"/>
       
       <!-- Axis Titles -->
       <text x="${startX - 40}" y="20" font-size="14" font-weight="bold" fill="black">y</text>
       <text x="${startX + 310}" y="${startY + 5}" font-size="14" font-weight="bold" fill="black">x</text>

       <!-- Line Graph -->
       <!-- 
          Point 1: x=0, y=initialCost
          Point 2: x=10, y=initialCost + 10*costPerGame
       -->
       <line 
         x1="${startX}" 
         y1="${startY - (initialCost / maxY * graphH)}" 
         x2="${startX + graphW}" 
         y2="${startY - ((initialCost + costPerGame * 10) / maxY * graphH)}" 
         stroke="#2563eb" 
         stroke-width="3" 
       />
    </svg>`;

    const ans = `Each game costs $${costPerGame}.`;

    const distractors = [
        `The video game system costs $${initialCost}.`,
        `The video game system costs $${costPerGame}.`,
        `Each game costs $${initialCost}.`
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question: svg + questionText, answer: ans, options, topic: 'Linear Graph Interpretation' };
};

// --- Q4: Inequality Solution ---
export const generateQ4 = () => {
    // y < -Ax + B
    const A = getRandomInt(2, 5);
    const B = getRandomInt(2, 6);

    const question = `Which point $(x, y)$ is a solution to the given inequality in the $xy$-plane? <br/> $$ y < -${A}x + ${B} $$`;

    // Generate correct answer: y < -Ax + B
    const cx = getRandomInt(2, 5);
    const limit = -A * cx + B;
    const cy = limit - getRandomInt(2, 5); // ensure less than
    const ansLabel = `(${cx}, ${cy})`;

    // Generate distractors (points NOT satisfying)
    const generateWrong = () => {
        const wx = getRandomInt(-5, 5);
        const wy = (-A * wx + B) + getRandomInt(0, 5); // greater or equal
        return `(${wx}, ${wy})`;
    };

    let distractors = [];
    while (distractors.length < 3) {
        let wrong = generateWrong();
        if (wrong !== ansLabel && !distractors.includes(wrong)) distractors.push(wrong);
    }

    const options = shuffleArray([
        { value: ansLabel, label: ansLabel },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ansLabel, options, topic: 'Linear Inequalities' };
};

// --- Q5: Linear Equation Interpretation ---
export const generateQ5 = () => {
    // 3x + 6y = 63. x = sides of Fig A, y = sides of Fig B.
    // What is best interpretation of coefficient of y?

    const sidesA = getRandomInt(3, 5);
    const sidesB = getRandomInt(6, 8); // Fig B
    const perimeterA = getRandomInt(3, 5); // length per side
    const perimeterB = getRandomInt(3, 5);

    // Equation: (lenA)x + (lenB)y = Total
    // User image: Figure A perimeter + Figure B perimeter = Total? 
    // Image says: "sum of perimeter of figure A and perimeter of figure B is 63".
    // 3x + 6y = 63. x is number of sides of A, y is number of sides of B.
    // Wait, the equation 3x + 6y = 63 represents perimeters?
    // "Figure A and B are regular polygons. Sum of perimeters is 63. Equation 3x + 6y = 63 represents this."
    // "x is number of sides of A, y is number of sides of B."
    // Then 3 must be length of one side of A? And 6 is length of one side of B?
    // Perimeter A = (length A) * x. Perimeter B = (length B) * y.

    const lenA = getRandomInt(2, 5);
    const lenB = getRandomInt(4, 8);

    const total = lenA * 3 + lenB * 4; // Just dummy total for context
    const eq = `${lenA}x + ${lenB}y = ${total}`;

    const question = `Figure A and Figure B are both regular polygons. The sum of the perimeter of Figure A and the perimeter of Figure B is ${total} inches. The equation $${eq}$ represents this situation, where $x$ is the number of sides of Figure A and $y$ is the number of sides of Figure B. Which statement is the best interpretation of ${lenB} in this context?`;

    const ans = `Each side of Figure B has a length of ${lenB} inches.`;

    const distractors = [
        `The number of sides of Figure B is ${lenB}.`,
        `Each side of Figure A has a length of ${lenB} inches.`,
        `The number of sides of Figure A is ${lenB}.`
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Linear Interpretation' };
};

// --- Q6: Systems Word Problem ---
export const generateQ6 = () => {
    // Cost of berries.
    // A: X per pint Rasp, Y per pint Black. Total 37.
    // B: X per pint Rasp, Y per pint Black. Total 66.
    // Actually image says: Store A (rasp X, black Y) cost ?, Store B (rasp X, black Y) cost ?
    // "Store A sells raspberries for $5.50 and blackberries for $3.00. Store B... $6.50 and $8.00"
    // "Certain purchase of R and B would cost 37 at A and 66 at B."
    // "How many pints of blackberries in this purchase?"

    const rCostA = 5.50;
    const bCostA = 3.00;
    const rCostB = 6.50;
    const bCostB = 8.00;

    const numR = getRandomInt(3, 6);
    const numB = getRandomInt(3, 6); // Answer

    const totalA = (rCostA * numR) + (bCostA * numB);
    const totalB = (rCostB * numR) + (bCostB * numB);

    const question = `Store A sells raspberries for &#36;${rCostA.toFixed(2)} per pint and blackberries for &#36;${bCostA.toFixed(2)} per pint. Store B sells raspberries for &#36;${rCostB.toFixed(2)} per pint and blackberries for &#36;${bCostB.toFixed(2)} per pint. A certain purchase of raspberries and blackberries would cost &#36;${totalA.toFixed(2)} at Store A or &#36;${totalB.toFixed(2)} at Store B. How many pints of blackberries are in this purchase?`;

    const ans = String(numB);
    const distractors = [
        String(numR),
        String(numB + 2),
        String(Math.abs(numB - 2) || 1)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Systems of Equations' };
};

// --- Q7: Min Value of Quadratic ---
export const generateQ7 = () => {
    // g(x) = x^2 + c. Min value?
    const c = getRandomInt(10, 100);
    const question = `$$ g(x) = x^2 + ${c} $$ <br/> What is the minimum value of the given function?`;

    const ans = String(c);
    const distractors = [
        String(c * c),
        String(0),
        String(c / 2)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Quadratic Functions' };

};

// --- Q8: Exponential Function ---
export const generateQ8 = () => {
    // h(x) = a^x + b. Passes (0, y1) and (x2, y2). Find ab.
    // (0, 10) -> a^0 + b = 10 -> 1 + b = 10 -> b = 9.
    // (-2, val) -> a^-2 + 9 = val.

    const bVal = getRandomInt(5, 15);
    const y1 = 1 + bVal; // at x=0, y = 1+b

    const aVal = getRandomInt(2, 6); // base
    const x2 = -2;
    // y2 = a^-2 + b = 1/a^2 + b
    const y2Num = 1 + bVal * (aVal * aVal);
    const y2Den = aVal * aVal;

    // Question asks for value of a*b
    const ab = aVal * bVal;

    const question = `The function $h$ is defined by $h(x) = a^x + b$, where $a$ and $b$ are positive constants. The graph of $y = h(x)$ in the $xy$-plane passes through the points $(0, ${y1})$ and $(-2, \\frac{${y2Num}}{${y2Den}})$. What is the value of $ab$?`;

    const ans = String(ab);
    const distractors = [
        String(ab + 5),
        String(y1 * aVal),
        String(bVal)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Nonlinear Functions' };
};

// --- Q9: Distinct Real Solutions ---
export const generateQ9 = () => {
    // (x-1)^2 = -4 -> 0 solutions.
    const k = getRandomInt(1, 10);
    const rhs = -1 * getRandomInt(2, 9); // Negative means 0 solutions

    const question = `$$ (x - ${k})^2 = ${rhs} $$ <br/> How many distinct real solutions does the given equation have?`;

    const ans = "Zero";
    const distractors = [
        "Exactly one",
        "Exactly two",
        "Infinitely many"
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Quadratic Equations' };
};

// --- Q10: Rational Expressions ---
export const generateQ10 = () => {
    // 4 / (4x-5) - 1 / (x+1)
    // Dynamic: A / (Ax - B) - 1 / (x + 1)
    // Let's stick to simple integers
    const A = getRandomInt(3, 6);
    const B = getRandomInt(2, 8);
    // Expr: A / (Ax - B) - 1 / (x + 1)
    // Common denom: (Ax-B)(x+1)
    // Num: A(x+1) - 1(Ax-B) = Ax + A - Ax + B = A + B

    const num = A + B;

    const question = `Which expression is equivalent to $$ \\frac{${A}}{${A}x - ${B}} - \\frac{1}{x+1} $$ ?`;

    const ans = `\\frac{${num}}{(${A}x - ${B})(x+1)}`;

    // Distractors
    const d1 = `\\frac{${Math.abs(A - B)}}{(${A}x - ${B})(x+1)}`;
    const d2 = `\\frac{${num}}{${A}x^2 - ${B}}`; // Lazy denom
    const d3 = `\\frac{1}{(${A}x - ${B})(x+1)}`;

    const wrap = (s) => `$${s}$`;

    const options = shuffleArray([
        { value: wrap(ans), label: wrap(ans) },
        { value: wrap(d1), label: wrap(d1) },
        { value: wrap(d2), label: wrap(d2) },
        { value: wrap(d3), label: wrap(d3) }
    ]);

    return { type: 'mcq', question, answer: wrap(ans), options, topic: 'Rational Expressions' };
};

// --- Q11: Exponential Decay ---
export const generateQ11 = () => {
    // f(0) = 86, decreases by 80%.
    const init = getRandomInt(50, 100);
    const percent = 80; // keep 80 or similar
    const decayFactor = 1 - (percent / 100); // 0.2

    // f(x) = init * (0.2)^x
    // Question asks for f(2)? Image says "value of f(2)".
    const t = 2;
    const val = init * Math.pow(decayFactor, t);

    const question = `For the function $f$, $f(0) = ${init}$, and for each increase in $x$ by 1, the value of $f(x)$ decreases by ${percent}%. What is the value of $f(${t})$?`;

    const ans = val.toFixed(2);

    // Distractors
    const d1 = (init * decayFactor).toFixed(2); // f(1)
    const d2 = (init * (1 + percent / 100)).toFixed(2); // growth
    const d3 = (init - percent).toFixed(2); // linear subtraction

    const options = shuffleArray([
        { value: ans, label: ans },
        { value: d1, label: d1 },
        { value: d2, label: d2 },
        { value: d3, label: d3 }
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Exponential Functions' };
};

// --- Q12: Nonlinear Systems (Discriminant) ---
export const generateQ12 = () => {
    // Line 2y = c (y = c/2) intersects parabola y = -ax^2 + bx at one point.
    // eq: c/2 = -ax^2 + bx => ax^2 - bx + c/2 = 0
    // Discriminant D = (-b)^2 - 4(a)(c/2) = b^2 - 2ac = 0 => b^2 = 2ac.
    // We need integer b. So 2ac must be a perfect square.
    // Let b be even, say 2k. b^2 = 4k^2. 2ac = 4k^2 => ac = 2k^2.
    // Pick k, a. Calc c, then b.

    const k = getRandomInt(2, 6);
    const b = 2 * k; // b is positive constant
    const a = getRandomInt(1, 4);
    // ac = 2k^2 => c = 2k^2 / a. Need a to divide 2k^2.
    // Easier: Pick a, c such that 2ac is perfect square?
    // Let's stick to the b calc direction. 
    // b = sqrt(2ac).
    // Let's pick a and c first to make clean b?
    // If a=4, c=4.5 (from image 2y=9 -> y=4.5). 2ac = 2*4*4.5 = 36. b=6.

    // Let's generate 'a' (integer) and 'val' (y-value of line).
    // y = val. Parabola y = -a x^2 + bx.
    // ax^2 - bx + val = 0.
    // D = b^2 - 4(a)(val) = 0 => b^2 = 4*a*val.
    // b = sqrt(4 * a * val) = 2 * sqrt(a * val).
    // We need a * val to be a perfect square.

    const square = getRandomInt(2, 10);
    const root = square * square; // e.g. 4, 9, 16...

    // a * val must equal 'root'.
    // split root into factors.
    const aVal = getRandomInt(1, 4); // small integer coefficient
    // val = root / aVal.
    // To ensure val is simple decimal or int:
    // Let's just pick b first!
    // b (positive constant).
    const bVal = getRandomInt(4, 12);
    // b^2 = 4 a val => val = b^2 / (4a).
    const aVal2 = getRandomInt(1, 5); // coefficient of x^2
    const val = (bVal * bVal) / (4 * aVal2);

    // Construct question
    // Line 2y = 2*val (or just y = val)
    // Image says "2y = 4.5". Let's use "cy = d" or just "y = val" or "2y = 2*val"
    const lineLHS = getRandomInt(1, 3); // 1y or 2y or 3y
    const lineRHS = val * lineLHS;

    const question = `In the $xy$-plane, a line with equation $${lineLHS}y = ${parseFloat(lineRHS.toFixed(2))}$ intersects a parabola at exactly one point. If the parabola has equation $y = -${aVal2}x^2 + bx$, where $b$ is a positive constant, what is the value of $b$?`;

    const ans = String(bVal);
    const distractors = [
        String(bVal * 2),
        String(bVal + 2),
        String(Math.abs(bVal - 2) || 1)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Nonlinear Systems' };
};

// --- Q13: Scatterplot Best Fit ---
export const generateQ13 = () => {
    // Generate data points around y = -mx + c
    // We want the line to be visible in X[20, 40] and Y[0, 20].
    // Center at (30, 10).
    // range of y is +/- 10 from center. dx is +/- 10 from center.
    // So |m| should be < 1. To be safe with noise, use max m=0.7.
    const m = getRandomInt(3, 7) / 10; // Slope 0.3 to 0.7
    // c such that at x=30, y=10 => 10 = -m(30) + c => c = 10 + 30m
    const c = 10 + (30 * m);

    // Line fit
    // Ask for y at x = targetX
    const startX = 20;
    const endX = 40;
    const targetX = 32; // Query point
    const targetY = (-m * targetX + c).toFixed(1); // Exact line value

    // SVG Scatterplot
    const pts = [];
    // Reduced points for clarity
    let attempts = 0;
    while (pts.length < 10 && attempts < 100) {
        attempts++;
        const x = startX + Math.random() * (endX - startX);
        const noise = (Math.random() - 0.5) * 4; // +/- 2
        let y = -m * x + c + noise;

        // Ensure points are strictly inside Y range [0.5, 19.5] to avoid clipping
        if (y < 0.5 || y > 19.5) continue;

        pts.push({ x, y });
    }

    // Coordinate mapping
    // X: 20-40 -> 0-300 width (plus margins)
    // Y: 0-20 -> 250-0 height (plus margins)

    // Margins inside SVG
    const mLeft = 40;
    const mRight = 20;
    const mTop = 20;
    const mBottom = 40;
    const graphW = 300;
    const graphH = 250;

    const mapX = (val) => mLeft + ((val - 20) / 20) * graphW;
    const mapY = (val) => mTop + graphH - ((val / 20) * graphH);

    let pointsSvg = pts.map(p => `<circle cx="${mapX(p.x)}" cy="${mapY(p.y)}" r="4" fill="black" />`).join('');

    const lineX1 = 20;
    const lineY1 = -m * 20 + c;
    const lineX2 = 40;
    const lineY2 = -m * 40 + c;
    const lineSvg = `<line x1="${mapX(lineX1)}" y1="${mapY(lineY1)}" x2="${mapX(lineX2)}" y2="${mapY(lineY2)}" stroke="black" stroke-width="2" />`;

    // Grid and Labels
    let gridSvg = '';

    // X-axis: 20, 24, 28, 32, 36, 40 (Step 4)
    for (let val = 20; val <= 40; val += 4) {
        const x = mapX(val);
        // Vertical grid line
        gridSvg += `<line x1="${x}" y1="${mTop}" x2="${x}" y2="${mTop + graphH}" stroke="#e2e8f0" stroke-width="1" />`;
        // Label
        gridSvg += `<text x="${x}" y="${mTop + graphH + 20}" font-size="12" text-anchor="middle" fill="#475569">${val}</text>`;
    }

    // Y-axis: 0, 4, 8, 12, 16, 20 (Step 4)
    for (let val = 0; val <= 20; val += 4) {
        const y = mapY(val);
        // Horizontal grid line
        gridSvg += `<line x1="${mLeft}" y1="${y}" x2="${mLeft + graphW}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;
        // Label
        gridSvg += `<text x="${mLeft - 10}" y="${y + 4}" font-size="12" text-anchor="end" fill="#475569">${val}</text>`;
    }

    const svg = `
    <svg width="100%" height="320" viewBox="0 0 380 320" style="background:#fff; border:1px solid #cbd5e1; margin: 10px 0; font-family: sans-serif;">
        ${gridSvg}
        
        <!-- Axes -->
        <line x1="${mLeft}" y1="${mTop + graphH}" x2="${mLeft + graphW}" y2="${mTop + graphH}" stroke="#1e293b" stroke-width="2" />
        <line x1="${mLeft}" y1="${mTop + graphH}" x2="${mLeft}" y2="${mTop}" stroke="#1e293b" stroke-width="2" />
        
        ${pointsSvg}
        ${lineSvg}
        
        <!-- Axis Titles -->
        <text x="${mLeft + graphW - 10}" y="${mTop + graphH + 35}" font-size="12" font-weight="bold" fill="#1e293b">x</text>
        <text x="${mLeft - 10}" y="${mTop - 5}" font-size="12" font-weight="bold" fill="#1e293b">y</text>
    </svg>
    `;

    const question = `${svg} <br/> The scatterplot shows the relationship between two variables, x and y. A line of best fit is also shown. At $x = ${targetX}$, which of the following is closest to the y-value predicted by the line of best fit?`;

    const ans = targetY;

    const distractors = [
        (parseFloat(targetY) + 1.5).toFixed(1),
        (parseFloat(targetY) - 1.5).toFixed(1),
        (parseFloat(targetY) * 1.5).toFixed(1)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Data Analysis' };
};

// --- Q14: Percentages ---
export const generateQ14 = () => {
    // 40% red. 30% of red have stripes. What % of total have red AND stripes? 
    const p1 = getRandomInt(20, 60); // % red
    const p2 = getRandomInt(10, 50); // % of red with stripes

    const question = `In a group, ${p1}% of all items are red. In the group, ${p2}% of the red items have stripes. What percentage of the items in the group are red and have stripes?`;

    // Calc: p1/100 * p2/100 -> result in %.
    // (p1 * p2) / 100
    const ansVal = (p1 * p2) / 100;
    const ans = `${ansVal}%`;

    const distractors = [
        `${p1 - p2}%`,
        `${p1 + p2}%`,
        `${(p1 + p2) / 2}%`
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Percentages' };
};

// --- Q15: Density and Volume ---
export const generateQ15 = () => {
    // Density D kg/m3. Mass M kg. What is edge length (cube)?
    const density = getRandomInt(300, 800);
    const edge = (getRandomInt(80, 120) / 100); // 0.80 to 1.20 meters
    const volume = edge * edge * edge;
    const mass = Math.round(density * volume); // Round to integer? Image says "Sample... is 345 kg"

    // Recalculate edge from rounded mass to get "nearest hundredth" answer match
    const trueVol = mass / density;
    const trueEdge = Math.pow(trueVol, 1 / 3);
    const ans = trueEdge.toFixed(2);

    const question = `The density of a certain type of wood is ${density} kilograms per cubic meter. A sample of this type of wood is in the shape of a cube and has a mass of ${mass} kilograms. To the nearest hundredth of a meter, what is the length of one edge of this sample?`;

    const distractors = [
        (trueEdge + 0.1).toFixed(2),
        (trueEdge - 0.1).toFixed(2),
        (trueEdge * 1.1).toFixed(2)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Geometry (Volume)' };
};

// --- Q16: Similar Triangles (Shadows) ---
export const generateQ16 = () => {
    // Tree1 H1, S1. Tree2 H2? S2 given.
    const h1 = getRandomInt(8, 15);
    const ratio = getRandomInt(1, 3) * 0.5; // shadow = ratio * height? Image: 10ft tall, 5ft shadow (ratio 0.5)
    // Actually image: 10 ft tall -> 5 ft shadow.
    // So ratio = S/H.
    const s1 = h1 * ratio;

    // Tree 2
    const h2 = getRandomInt(15, 30);
    const s2 = h2 * ratio;

    // Question: asks for height of other tree given its shadow? 
    // Image: "length of the shadow of the other tree is 2 feet long. How tall is the other tree?"
    // Let's generate: Given H1, S1. Given S2, find H2.

    const question = `Two nearby trees are perpendicular to the ground, which is flat. One of these trees is ${h1} feet tall and has a shadow that is ${s1} feet long. At the same time, the shadow of the other tree is ${s2} feet long. How tall, in feet, is the other tree?`;

    const ans = String(h2);

    const distractors = [
        String(Math.abs(h2 - 2)),
        String(s2 + 2),
        String(h2 * 2)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Similar Triangles' };
};

// --- Q17: Pythagorean Theorem ---
export const generateQ17 = () => {
    // Rectangle diagonal D, shorter side S. Find Long L.
    // D^2 = S^2 + L^2
    // Use pythagorean triples scaled. (3,4,5), (5,12,13), (8,15,17).

    const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25]
    ];

    const t = triples[getRandomInt(0, triples.length - 1)];
    const scale = getRandomInt(1, 4);

    // Shorter side
    const S = t[0] * scale;
    const L = t[1] * scale;
    const D = t[2] * scale; // Integer diagonal

    // But image used sqrt(17). "diagonal 5sqrt(17)".
    // Let's stick to integer answer for L.
    // Let's allow Diagonal to be irrational. 
    // Image: 5sqrt(17). S=5. D^2 = 25*17 = 425. S^2=25. L^2=400. L=20.
    // 5, 20, 5sqrt(17). 1, 4, sqrt(17). 

    // Let's generate L and S, calculate D string.
    const side1 = getRandomInt(3, 10); // Shorter
    const side2 = side1 * getRandomInt(2, 4); // Longer

    // D = sqrt(s1^2 + s2^2).
    const dSq = side1 * side1 + side2 * side2;
    // Simplify sqrt? 
    // We can just say "diagonal is sqrt(dSq)".

    const question = `The length of a rectangle's diagonal is $\\sqrt{${dSq}}$, and the length of the rectangle's shorter side is ${side1}. What is the length of the rectangle's longer side?`;

    const ans = String(side2);

    const distractors = [
        String(side2 + 2),
        String(side1 + side2),
        String(dSq)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Geometry (Rectangle)' };
};

// --- Q18: Circle Arc Length ---
export const generateQ18 = () => {
    // Arc AB is deg degrees. Length is L. Circumference?
    // C = L * 360 / deg.

    const deg = getRandomInt(30, 90); // e.g. 45
    // Make sure 360/deg is clean or semi clean?
    // 30, 45, 60, 90.
    const commonAngles = [30, 45, 60, 90, 72, 120];
    const angle = commonAngles[getRandomInt(0, commonAngles.length - 1)];

    const lengths = [2, 3, 4, 5, 6];
    const len = lengths[getRandomInt(0, lengths.length - 1)];

    // C = len * (360/angle).
    const circ = len * (360 / angle);

    const question = `A circle has center O, and points A and B lie on the circle. The measure of arc AB is $${angle}^{\\circ}$ and the length of arc AB is ${len} inches. What is the circumference, in inches, of the circle?`;

    const ans = String(circ);

    const distractors = [
        String(circ / 2),
        String(circ * 2),
        String(len * angle)
    ];

    const options = shuffleArray([
        { value: ans, label: ans },
        ...distractors.map(d => ({ value: d, label: d }))
    ]);

    return { type: 'mcq', question, answer: ans, options, topic: 'Geometry (Circles)' };
};

