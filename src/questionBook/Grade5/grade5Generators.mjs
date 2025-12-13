const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Number Sense ---

// export const generatePlaceValueLarge = () => {
//     // Up to 10 Lakhs (7 digits)
//     const num = getRandomInt(100000, 9999999);
//     const numStr = String(num);

//     // Ensure we pick a non-zero digit to avoid duplicate 0 options
//     let pos = getRandomInt(0, numStr.length - 1);
//     while (numStr[pos] === '0') {
//         pos = getRandomInt(0, numStr.length - 1);
//     }

//     const digit = numStr[pos];
//     const power = numStr.length - 1 - pos;
//     const placeValue = Number(digit) * Math.pow(10, power);

//     // Determine place name (Indian System)
//     let placeName = "";
//     if (power === 0) placeName = "Ones";
//     else if (power === 1) placeName = "Tens";
//     else if (power === 2) placeName = "Hundreds";
//     else if (power === 3) placeName = "Thousands";
//     else if (power === 4) placeName = "Ten Thousands";
//     else if (power === 5) placeName = "Lakhs";
//     else if (power === 6) placeName = "Ten Lakhs";

//     const question = `What is the place value of the digit ${digit} in ${num}?`; // Simplified question

//     return {
//         type: "userInput",
//         question: question,
//         topic: "Number Sense / Place Value",
//         answer: String(placeValue)
//     };
// };

export const generatePlaceValueLarge = () => {
    // Up to 10 Lakhs (7 digits)
    const num = getRandomInt(100000, 9999999);
    const numStr = String(num);

    // Collect positions of digits that are unique and non-zero
    const uniquePositions = [];
    for (let i = 0; i < numStr.length; i++) {
        const digit = numStr[i];
        if (digit !== '0' && numStr.indexOf(digit) === numStr.lastIndexOf(digit)) {
            uniquePositions.push(i);
        }
    }

    // If no unique non-zero digit, retry
    if (uniquePositions.length === 0) return generatePlaceValueLarge();

    // Pick a random position from unique digits
    const pos = uniquePositions[getRandomInt(0, uniquePositions.length - 1)];
    const digit = numStr[pos];
    const power = numStr.length - 1 - pos;
    const placeValue = Number(digit) * Math.pow(10, power);

    // Determine place name (Indian System)
    let placeName = "";
    switch (power) {
        case 0: placeName = "Ones"; break;
        case 1: placeName = "Tens"; break;
        case 2: placeName = "Hundreds"; break;
        case 3: placeName = "Thousands"; break;
        case 4: placeName = "Ten Thousands"; break;
        case 5: placeName = "Lakhs"; break;
        case 6: placeName = "Ten Lakhs"; break;
    }

    const question = `What is the place value of the digit ${digit} in ${num}?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Place Value",
        answer: String(placeValue)
    };
};


export const generateExpandedForm = () => {
    const num = getRandomInt(10000, 999999);
    const numStr = String(num);
    const parts = [];

    for (let i = 0; i < numStr.length; i++) {
        const digit = numStr[i];
        if (digit !== '0') {
            parts.push(`${digit}${'0'.repeat(numStr.length - 1 - i)}`);
        }
    }

    const answer = parts.join(" + ");
    const question = `Write the expanded form of ${num}.`;

    // Distractors
    const dist1 = parts.join(" + ").replace(/00/g, "0"); // Fewer zeros
    const dist2 = parts.join(" - "); // Wrong operator

    // Create a subtle wrong expanded form
    const partsWrong = [...parts];
    if (partsWrong.length > 1) {
        partsWrong[partsWrong.length - 1] = partsWrong[partsWrong.length - 1] + "0";
    }
    const dist3 = partsWrong.join(" + ");

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: dist1, label: dist1 },
        { value: dist3, label: dist3 },
        { value: String(num), label: String(num) } // Just the number
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Expanded Form",
        options: options,
        answer: answer
    };
};

export const generateCompareLarge = () => {
    const num1 = getRandomInt(100000, 999999);
    let num2 = getRandomInt(100000, 999999);
    while (num1 === num2) num2 = getRandomInt(100000, 999999);

    const question = `Compare: $$ ${num1}  \\quad ? \\quad ${num2} $$`;
    let answer;
    if (num1 > num2) answer = ">";
    else answer = "<";

    const options = ([
        { value: ">", label: "> Greater than" },
        { value: "<", label: "< Less than" },
        { value: "=", label: "= Equal to" },
        { value: "None", label: "None" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Comparison",
        options: options,
        answer: answer
    };
};

// --- Operations ---

export const generateAdditionLarge = () => {
    const num1 = getRandomInt(10000, 99999);
    const num2 = getRandomInt(10000, 99999);
    const answer = num1 + num2;

    const question = `Add: $$ ${num1} + ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Operations / Addition",
        answer: String(answer)
    };
};

export const generateSubtractionLarge = () => {
    const num1 = getRandomInt(50000, 99999);
    const num2 = getRandomInt(10000, 49999);
    const answer = num1 - num2;

    const question = `Subtract: $$ ${num1} - ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Operations / Subtraction",
        answer: String(answer)
    };
};

export const generateMultiplicationLarge = () => {
    // 3-digit x 2-digit or 3-digit x 3-digit
    const is3x3 = Math.random() > 0.5;
    const num1 = getRandomInt(100, 999);
    const num2 = is3x3 ? getRandomInt(100, 999) : getRandomInt(10, 99);

    const answer = num1 * num2;
    const question = `Multiply:  $$ ${num1} × ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Operations / Multiplication",
        answer: String(answer)
    };
};

export const generateDivisionLarge = () => {
    // Divide by 1-digit or 2-digit
    const is2DigitDivisor = Math.random() > 0.5;
    const divisor = is2DigitDivisor ? getRandomInt(10, 25) : getRandomInt(2, 9);
    const quotient = getRandomInt(50, 500);
    const remainder = getRandomInt(0, divisor - 1);
    const dividend = (divisor * quotient) + remainder;

    const question = `Divide: $$ ${dividend} ÷ ${divisor} $$`;
    const answer = `$$ Q: ${quotient}, R: ${remainder} $$`;

    // Distractors
    const dist1 = `$$ Q: ${quotient + 1}, R: ${remainder} $$`;
    const dist2 = `$$ Q: ${quotient}, R: ${remainder + 1} $$`;
    const dist3 = `$$ Q: ${quotient - 1}, R: ${remainder} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: dist1, label: dist1 },
        { value: dist2, label: dist2 },
        { value: dist3, label: dist3 }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Operations / Division",
        options: options,
        answer: answer
    };
};

export const generateEstimationOps = () => {
    // Estimate Sum or Difference
    const isSum = Math.random() > 0.5;
    const num1 = getRandomInt(1000, 9000);
    const num2 = getRandomInt(1000, 9000);

    const r1 = Math.round(num1 / 1000) * 1000;
    const r2 = Math.round(num2 / 1000) * 1000;

    let val, opName;
    if (isSum) {
        val = r1 + r2;
        opName = "sum";
    } else {
        // Ensure positive difference for simplicity
        const big = Math.max(r1, r2);
        const small = Math.min(r1, r2);
        val = big - small;
        opName = "difference";
    }

    const question = `Estimate the ${opName} of ${num1} and ${num2} by rounding to the nearest 1000.`;

    return {
        type: "userInput",
        question: question,
        topic: "Operations / Estimation",
        answer: String(val)
    };
};

// --- Fractions ---

export const generateEquivalentFractions = () => {
    const num = getRandomInt(1, 5);
    const den = getRandomInt(2, 6); // Base fraction
    const mult = getRandomInt(2, 5); // Multiplier

    const eqNum = num * mult;
    const eqDen = den * mult;

    const question = `Which fraction is equivalent to $$ ${num}/${den}? $$`;
    const answer = `$$ ${eqNum}/${eqDen} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${eqNum + 1}/${eqDen}`, label: `$$ ${eqNum + 1}/${eqDen} $$` },
        { value: `${eqNum}/${eqDen + 1}`, label: `$$ ${eqNum}/${eqDen + 1} $$` },
        { value: `${den}/${num}`, label: `$$ ${den}/${num} $$` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Equivalent",
        options: options,
        answer: answer
    };
};

export const generateSimplifyFractions = () => {
    let num = getRandomInt(2, 9);
    let den = getRandomInt(num + 1, 12);

    // Ensure coprime
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    while (gcd(num, den) !== 1) {
        num = getRandomInt(2, 9);
        den = getRandomInt(num + 1, 12);
    }

    const mult = getRandomInt(2, 5);

    const bigNum = num * mult;
    const bigDen = den * mult;

    const question = `Reduce $$ ${bigNum}/${bigDen} $$ to its lowest terms.`;
    const answer = `$$ ${num}/${den} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${num + 1}/${den}`, label: `$$ ${num + 1}/${den} $$` },
        { value: `${num}/${den - 1}`, label: `$$ ${num}/${den - 1} $$` },
        { value: `${bigNum}/${bigDen}`, label: `$$ ${bigNum}/${bigDen} $$` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Simplify",
        options: options,
        answer: answer
    };
};

export const generateAddUnlikeFractions = () => { // Renamed logically but keeping export name for compatibility
    // Grade 5: Mixed Fractions Addition (Like Denominators or Simple)
    // Example: 2 1/2 + 3 1/2
    const d = getRandomInt(2, 9);

    // Generate two mixed numbers
    const w1 = getRandomInt(1, 4);
    const n1 = getRandomInt(1, d - 1);

    const w2 = getRandomInt(1, 4);
    const n2 = getRandomInt(1, d - 1);

    // Question string
    const question = `Add: $$ ${w1} \\frac{${n1}}{${d}} + ${w2} \\frac{${n2}}{${d}} = ? $$`;

    // Calculate sum
    let totalWhole = w1 + w2;
    let totalNum = n1 + n2;
    let totalDen = d;

    // Simplify improper fraction part if needed
    if (totalNum >= totalDen) {
        totalWhole += Math.floor(totalNum / totalDen);
        totalNum = totalNum % totalDen;
    }

    // Simplify fraction part
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(totalNum, totalDen);
    totalNum /= divisor;
    totalDen /= divisor;

    let answer;
    if (totalNum === 0) {
        answer = `$$ ${totalWhole} $$`;
    } else {
        answer = `$$ ${totalWhole} \\frac{${totalNum}}{${totalDen}} $$`;
    }

    // Generate Distractors
    // 1. Forgot to carry over
    const badWhole = w1 + w2;
    const badNum = n1 + n2;
    const dist1 = `$$ ${badWhole} \\frac{${badNum}}{${d}} $$`;

    // 2. Add straight across without simplifying/carrying correctly
    const dist2 = `$$ ${totalWhole + 1} \\frac{${totalNum}}{${totalDen}} $$`;

    // 3. Random error
    const dist3 = `$$ ${totalWhole} \\frac{${totalNum + 1}}{${totalDen}} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: dist1, label: dist1 },
        { value: dist2, label: dist2 },
        { value: dist3, label: dist3 }
    ]);

    // Ensure options are unique 
    const params = [w1, n1, w2, n2, d].join('-');

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Mixed Addition",
        options: options,
        answer: answer
    };
};

export const generateMixedImproper = () => {
    const isMixedToImp = Math.random() > 0.5;
    const whole = getRandomInt(1, 5);
    const den = getRandomInt(2, 9);
    const num = getRandomInt(1, den - 1);

    const impNum = (whole * den) + num;

    if (isMixedToImp) {
        const question = `Convert $$ ${whole} ${num}/${den} $$ to an improper fraction.`;
        const answer = `$$ ${impNum}/${den} $$`;
        const options = shuffleArray([
            { value: answer, label: answer },
            { value: `${impNum + 1}/${den}`, label: `$$ ${impNum + 1}/${den} $$` },
            { value: `${whole * num}/${den}`, label: `$$ ${whole * num}/${den} $$` },
            { value: `${impNum}/${den + 1}`, label: `$$ ${impNum}/${den + 1} $$` }
        ]);
        return {
            type: "mcq",
            question: question,
            topic: "Fractions / Conversion",
            options: options,
            answer: answer
        };
    } else {
        const question = `Convert $$ ${impNum}/${den} $$ to a mixed fraction.`;
        const answer = `$$ ${whole} ${num}/${den} $$`;
        const options = shuffleArray([
            { value: answer, label: answer },
            { value: `${whole + 1} ${num}/${den}`, label: `$$ ${whole + 1} ${num}/${den} $$` },
            { value: `${whole} ${num + 1}/${den}`, label: `$$ ${whole} ${num + 1}/${den} $$` },
            { value: `${whole} ${num}/${den + 1}`, label: `$$ ${whole} ${num}/${den + 1} $$` }
        ]);
        return {
            type: "mcq",
            question: question,
            topic: "Fractions / Conversion",
            options: options,
            answer: answer
        };
    }
};

// --- Decimals ---

export const generateDecimalPlaceValue = () => {
    const whole = getRandomInt(0, 9);
    const tenth = getRandomInt(0, 9);
    const hundredth = getRandomInt(0, 9);

    const num = `${whole}.${tenth}${hundredth}`;
    const digits = [
        { digit: whole, place: "ones", val: String(whole) },
        { digit: tenth, place: "tenths", val: `0.${tenth}` },
        { digit: hundredth, place: "hundredths", val: `0.0${hundredth}` }
    ];

    // Filter digits that are unique
    const counts = {};
    for (const d of digits) {
        counts[d.digit] = (counts[d.digit] || 0) + 1;
    }
    const uniqueDigits = digits.filter(d => counts[d.digit] === 1);

    // If no unique digit, retry
    if (uniqueDigits.length === 0) return generateDecimalPlaceValue();

    // Pick a random unique digit
    const choice = uniqueDigits[getRandomInt(0, uniqueDigits.length - 1)];

    const question = `What is the place value of ${choice.digit} in ${num}?`;

    return {
        type: "userInput",
        question: question,
        topic: "Decimals / Place Value",
        answer: choice.val
    };
};


export const generateDecimalOps = () => {
    const isAdd = Math.random() > 0.5;
    const n1 = getRandomInt(1, 9) + (getRandomInt(1, 9) / 10);
    const n2 = getRandomInt(1, 9) + (getRandomInt(1, 9) / 10);

    let ans, question;
    if (isAdd) {
        ans = (n1 + n2).toFixed(1);
        question = `Add: $$ ${n1} + ${n2} = ? $$`;
    } else {
        const big = Math.max(n1, n2);
        const small = Math.min(n1, n2);
        ans = (big - small).toFixed(1);
        question = `Subtract: $$ ${big} - ${small} = ? $$`;
    }

    return {
        type: "userInput",
        question: question,
        topic: "Decimals / Operations",
        answer: ans
    };
};

// --- Measurement ---

export const generateUnitConversion = () => {
    // Length, Weight, Capacity
    const types = ["Length", "Weight", "Capacity"];
    const type = types[getRandomInt(0, 2)];
    let question, answer;

    if (type === "Length") {
        const m = getRandomInt(2, 20);
        question = `Convert ${m} m to cm.`;
        answer = `${m * 100} cm`;
    } else if (type === "Weight") {
        const kg = getRandomInt(2, 10);
        question = `Convert ${kg} kg to grams.`;
        answer = `${kg * 1000} g`;
    } else {
        const l = getRandomInt(2, 10);
        question = `Convert ${l} L to mL.`;
        answer = `${l * 1000} mL`;
    }

    const val = parseInt(answer);
    const unit = answer.split(" ")[1];

    return {
        type: "userInput",
        question: question + " (number only)",
        topic: `Measurement / ${type}`,
        answer: String(val)
    };
};

export const generateTimeElapsed = () => {
    const startHour = getRandomInt(1, 10);
    const duration = getRandomInt(2, 3);
    const endHour = startHour + duration;

    const question = `If a movie starts at ${startHour}:00 PM and lasts for ${duration} hours, when does it end?`;
    const answer = `${endHour}:00 PM`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${endHour + 1}:00 PM`, label: `${endHour + 1}:00 PM` },
        { value: `${endHour - 1}:00 PM`, label: `${endHour - 1}:00 PM` },
        { value: `${startHour + duration + 2}:00 PM`, label: `${startHour + duration + 2}:00 PM` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Time",
        options: options,
        answer: answer
    };
};

// --- Geometry ---

export const generateAngleTypes = () => {
    const types = ["Acute", "Obtuse", "Right", "Straight", "Reflex"];
    const type = types[getRandomInt(0, 4)];
    let angle, question;

    if (type === "Acute") angle = getRandomInt(10, 89);
    else if (type === "Right") angle = 90;
    else if (type === "Obtuse") angle = getRandomInt(91, 179);
    else if (type === "Straight") angle = 180;
    else angle = getRandomInt(181, 359);

    question = `What type of angle is ${angle}°?`;

    const options = shuffleArray([
        { value: type, label: type },
        { value: types[(types.indexOf(type) + 1) % 5], label: types[(types.indexOf(type) + 1) % 5] },
        { value: types[(types.indexOf(type) + 2) % 5], label: types[(types.indexOf(type) + 2) % 5] },
        { value: types[(types.indexOf(type) + 3) % 5], label: types[(types.indexOf(type) + 3) % 5] }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Angles",
        options: options,
        answer: type
    };
};

export const generateAreaPerimeterShapes = () => {
    let side = getRandomInt(3, 12);
    while (side === 4) side = getRandomInt(3, 12); // Avoid side 4 where Area = Perimeter
    const isArea = Math.random() > 0.5;

    if (isArea) {
        const area = side * side;
        const question = `Find the area of a square with side ${side} cm.`;
        return {
            type: "userInput",
            question: question,
            topic: "Geometry / Area",
            answer: String(area)
        };
    } else {
        const perimeter = side * 4;
        const question = `Find the perimeter of a square with side ${side} cm.`;
        return {
            type: "userInput",
            question: question,
            topic: "Geometry / Perimeter",
            answer: String(perimeter)
        };
    }
};

// --- Data Handling ---

export const generatePieChart = () => {
    // Data: Total students = 100 or 200 or similar
    const total = 100 * getRandomInt(1, 4); // 100, 200, 300, 400

    // Percentages: Cricket 50%, Football 25%, Tennis 25%
    const percentCricket = 50;
    const percentFootball = 25;
    const percentTennis = 25;

    // Question: "Total students: ${total}. How many students like Cricket?"
    const question = `Total students: ${total}. How many students like Cricket?`;
    const answer = String((total * percentCricket) / 100);

    // Generate SVG Pie Chart
    // 50% = 180 deg, 25% = 90 deg
    // Colors: Cricket (Blue), Football (Green), Tennis (Orange)
    const cricketPath = `M 100 100 L 100 20 A 80 80 0 0 1 100 180 Z`;
    const footballPath = `M 100 100 L 100 180 A 80 80 0 0 1 20 100 Z`;
    const tennisPath = `M 100 100 L 20 100 A 80 80 0 0 1 100 20 Z`;

    // Labels
    const textCricket = `<text x="140" y="100" fill="white" font-size="12">Cricket 50%</text>`;
    const textFootball = `<text x="60" y="150" fill="white" font-size="12">Football 25%</text>`;
    const textTennis = `<text x="60" y="60" fill="white" font-size="12">Tennis 25%</text>`;

    const svgContent = `
        <circle cx="100" cy="100" r="80" fill="#eee" />
        <path d="${cricketPath}" fill="#3b82f6" />
        <path d="${footballPath}" fill="#10b981" />
        <path d="${tennisPath}" fill="#f59e0b" />
        ${textCricket}
        ${textFootball}
        ${textTennis}
    `;

    const imageUri = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>${svgContent}</svg>`).toString('base64')}`;

    return {
        type: "userInput",
        question: question,
        image: imageUri,
        topic: "Data Handling / Pie Chart",
        answer: answer,
        instructions: "Calculate the number of students."
    };
};

// --- Number Theory ---

export const generateFactors = () => {
    const num = getRandomInt(6, 50);

    // Find factors
    const factors = [];
    for (let i = 1; i <= num; i++) {
        if (num % i === 0) factors.push(i);
    }

    // ❗ If the number is prime, regenerate
    if (factors.length === 2) {
        return generateFactors();
    }

    const question = `What are the factors of  $ ${num} $ `;
    const correct = factors[getRandomInt(1, factors.length - 1)]; // avoid 1 to make it meaningful

    // Generate distractors (non-factors)
    const distractors = [];
    while (distractors.length < 3) {
        const d = getRandomInt(2, num + 5);
        if (num % d !== 0 && d !== correct && !distractors.includes(d)) {
            distractors.push(d);
        }
    }

    return {
        type: "userInput",
        question: question,
        topic: "Number Theory / Factors",
        answer: String(correct)
    };
};

export const generateLCM = () => {
    // Simple LCM pairs
    const pairs = [
        [4, 6, 12],
        [5, 10, 10],
        [8, 12, 24],
        [3, 7, 21],
        [9, 6, 18]
    ];

    const pair = pairs[getRandomInt(0, pairs.length - 1)];
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

export const generateHCF = () => {
    // Simple HCF
    const pairs = [[12, 18, 6], [10, 15, 5], [8, 12, 4], [20, 30, 10]];
    const pair = pairs[getRandomInt(0, 3)];
    const n1 = pair[0];
    const n2 = pair[1];
    const hcf = pair[2];

    const question = `Find the HCF of ${n1} and ${n2}.`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Theory / HCF",
        answer: String(hcf)
    };
};

export const generateFactorTree = () => {
    // Pick a composite number suitable for grade 5 (12 to 100)
    // Avoid primes
    let num = 0;
    const composites = [12, 16, 18, 20, 24, 27, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 81, 100];
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
        // Find split pair
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

    // Flatten tree to list of nodes (excluding root usually, but here we can include root if we want root hidden? No, usually leaf or intermediate)
    const nodes = [];
    const traverse = (n) => {
        if (n.children && n.children.length > 0) {
            // Intermediate or root
            // We can hide intermediate nodes
            n.children.forEach(c => {
                nodes.push(c);
                traverse(c);
            });
        }
    };
    traverse(tree);

    // Also include leaves?
    // Actually, usually we hide some leaves (prime factors) or some intermediate factors.
    // Let's re-collect ALL nodes except root.
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
    // For visual simplicity, let's just pick 2 or 3 random nodes to hide from allNodesButRoot
    // Helper shuffle
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffled = shuffle([...allNodesButRoot]);
    const nodesToHideCount = getRandomIntLocal(2, Math.min(4, shuffled.length));

    // Map required answers
    const expectedAnswers = {};

    for (let i = 0; i < nodesToHideCount; i++) {
        shuffled[i].isInput = true;
    }

    const correctAnswers = {};
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

export const generateSymmetry = () => {
    const items = [
        { name: "Square", count: 4 },
        { name: "Rectangle", count: 2 },
        { name: "Equilateral Triangle", count: 3 },
        { name: "Isosceles Triangle", count: 1 },
        { name: "Regular Pentagon", count: 5 },
        { name: "Regular Hexagon", count: 6 },
        { name: "Rhombus", count: 2 },
        { name: "Kite", count: 1 },
        { name: "Parallelogram", count: 0 },
        { name: "Isosceles Trapezoid", count: 1 },
        { name: "Scalene Triangle", count: 0 },
        { name: "Star", count: 5 },
        { name: "Arrow", count: 1 },
        { name: "Cross", count: 4 },
    ];

    const getShapeSvg = (name) => {
        let svgContent = "";
        const size = 200;
        const center = size / 2;
        const style = "fill='none' stroke='black' stroke-width='4'";

        switch (name) {
            case "Square":
                svgContent = `<rect x='50' y='50' width='100' height='100' ${style} />`;
                break;
            case "Rectangle":
                svgContent = `<rect x='25' y='60' width='150' height='80' ${style} />`;
                break;
            case "Equilateral Triangle":
                // Height = sqrt(3)/2 * side. Side ~ 120
                svgContent = `<polygon points='100,40 40,160 160,160' ${style} />`;
                break;
            case "Isosceles Triangle":
                svgContent = `<polygon points='100,20 60,160 140,160' ${style} />`;
                break;
            case "Regular Pentagon":
                // Approximate points
                svgContent = `<polygon points='100,20 176,75 147,163 53,163 24,75' ${style} />`;
                break;
            case "Regular Hexagon":
                svgContent = `<polygon points='100,20 170,60 170,140 100,180 30,140 30,60' ${style} />`;
                break;
            case "Rhombus":
                svgContent = `<polygon points='100,20 160,100 100,180 40,100' ${style} />`;
                break;
            case "Kite":
                svgContent = `<polygon points='100,20 160,80 100,180 40,80' ${style} />`;
                break;
            case "Parallelogram":
                svgContent = `<polygon points='60,140 160,140 140,60 40,60' ${style} />`;
                break;
            case "Isosceles Trapezoid":
                svgContent = `<polygon points='50,140 150,140 120,60 80,60' ${style} />`;
                break;
            case "Scalene Triangle":
                svgContent = `<polygon points='40,160 180,160 60,40' ${style} />`;
                break;
            case "Star":
                svgContent = `<polygon points='100,20 123,85 195,85 136,125 158,190 100,150 42,190 64,125 5,85 77,85' ${style} />`;
                break;
            case "Arrow":
                svgContent = `<polygon points='100,20 160,80 130,80 130,180 70,180 70,80 40,80' ${style} />`;
                break;
            case "Cross":
                svgContent = `<polygon points='80,20 120,20 120,80 180,80 180,120 120,120 120,180 80,180 80,120 20,120 20,80 80,80' ${style} />`;
                break;
            default:
                svgContent = "";
        }

        if (!svgContent) return null;

        return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${svgContent}</svg>`).toString('base64')}`;
    };

    const item = items[Math.floor(Math.random() * items.length)];
    const imageUri = getShapeSvg(item.name);

    return {
        type: "userInput",
        question: `How many lines of symmetry does the shape below have?`,
        image: imageUri,
        answer: String(item.count),
        topic: "Geometry / Symmetry",
        instructions: "Enter the number.",
        format: "integer"
    };
};

export const generateNumberPattern = () => {
    // Select pattern type: 0 = Squares of 1s (Repunits), 1 = Descending 8s, 2 = Ascending 9s
    const type = Math.floor(Math.random() * 2);
    // Difficulty adjustment: Limit n to 4 or 5 lines to keep it simple for Grade 5
    const n = Math.floor(Math.random() * 2) + 4; // 4, 5

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
        // 1 x 8 + 1 = 9
        // 123 x 8 + 3 = 987
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
        instructions: instructions, // Dynamic instructions
        format: "text",
        keypadMode: "multiplication"
    };
};

export const generatePicturePattern = () => {
    // Rotating Arrow Pattern
    // Random start angle: 0, 90, 180, 270
    const angles = [0, 90, 180, 270];
    const startIndex = Math.floor(Math.random() * 4);

    // Sequence of 3 items
    const seqAngles = [
        angles[startIndex % 4],
        angles[(startIndex + 1) % 4],
        angles[(startIndex + 2) % 4]
    ];
    const nextAngle = angles[(startIndex + 3) % 4];

    // Helper to generate SVG for a single Arrow at specific rotation
    // ViewBox 0 0 100 100
    const getArrowSvg = (angle, xOffset = 0) => {
        // Arrow path centered at 50,50 (inside 100x100 box)
        return `<g transform="translate(${xOffset}, 0) rotate(${angle} 50 50)">
            <path d="M 50 80 L 50 20 L 30 40 M 50 20 L 70 40" stroke="black" stroke-width="4" fill="none" />
        </g>`;
    };

    // Helper to produce full SVG data URI
    const encodeSvg = (content, width, height) => {
        return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${content}</svg>`).toString('base64')}`;
    };

    // 1. Generate Question Image (Sequence of 3)
    let questionSvgContent = "";
    questionSvgContent += getArrowSvg(seqAngles[0], 0);
    questionSvgContent += getArrowSvg(seqAngles[1], 100);
    questionSvgContent += getArrowSvg(seqAngles[2], 200);

    const questionImage = encodeSvg(questionSvgContent, 300, 100);

    // 2. Generate Options
    const optionsData = angles.map(angle => {
        const svg = encodeSvg(getArrowSvg(angle, 0), 100, 100);
        return {
            label: "",
            value: String(angle),
            image: svg
        };
    });

    // Shuffle options
    for (let i = optionsData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsData[i], optionsData[j]] = [optionsData[j], optionsData[i]];
    }

    // Assign labels
    optionsData.forEach((opt, idx) => {
        opt.label = `Option ${idx + 1}`;
    });

    const correctOption = optionsData.find(opt => opt.value === String(nextAngle));

    return {
        type: "mcq",
        question: "Observe the pattern below. Which image comes next?",
        image: questionImage,
        topic: "Pattern Recognition / Visual",
        options: optionsData,
        answer: correctOption.value,
        instructions: "Select the correct image."
    };
};
