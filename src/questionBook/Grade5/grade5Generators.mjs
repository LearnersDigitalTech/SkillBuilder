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

export const generateAddUnlikeFractions = () => {
    // Simple unlike fractions e.g. 1/2 + 1/3
    const d1 = getRandomInt(2, 5);
    let d2 = getRandomInt(2, 5);
    while (d1 === d2) d2 = getRandomInt(2, 5);

    const n1 = 1;
    const n2 = 1;

    const commonDen = d1 * d2;
    const numSum = (n1 * d2) + (n2 * d1);

    const question = `Add: $$ ${n1}/${d1} + ${n2}/${d2} = ? $$`;
    const answer = `$$ ${numSum}/${commonDen} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${n1 + n2}/${d1 + d2}`, label: `$$ ${n1 + n2}/${d1 + d2} $$` }, // Common mistake
        { value: `${numSum + 1}/${commonDen}`, label: `$$ ${numSum + 1}/${commonDen} $$` },
        { value: `${numSum}/${commonDen + 1}`, label: `$$ ${numSum}/${commonDen + 1} $$` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Addition",
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
    const duration = getRandomInt(1, 5);
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
    // Simple interpretation
    const question = "In a pie chart representing 100 students, if 50% like Cricket, how many students like Cricket?";
    const answer = "50";

    return {
        type: "userInput",
        question: question,
        topic: "Data Handling / Pie Chart",
        answer: answer
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

