const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Number Sense & Operations ---

export const generatePlaceValue5Digit = () => {
    // 5-digit numbers
    const num = getRandomInt(10000, 99999);
    const numStr = String(num);
    let pos = getRandomInt(0, 4);
    while (numStr[pos] === '0') {
        pos = getRandomInt(0, 4);
    }
    const digit = numStr[pos];

    const places = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"];
    const values = [10000, 1000, 100, 10, 1];

    const placeValue = Number(digit) * values[pos];
    const question = `What is the place value of the digit ${digit} in the ${places[pos]} place of ${num}?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Place Value",
        answer: String(placeValue)
    };
};

export const generateAddition4Digit = () => {
    const num1 = getRandomInt(1000, 5000);
    const num2 = getRandomInt(1000, 4999);
    const answer = num1 + num2;

    const question = `Add: ${num1} + ${num2} = ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Addition",
        answer: String(answer)
    };
};

export const generateSubtraction4Digit = () => {
    const num1 = getRandomInt(5000, 9999);
    const num2 = getRandomInt(1000, 4999);
    const answer = num1 - num2;

    const question = `Subtract: ${num1} - ${num2} = ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Subtraction",
        answer: String(answer)
    };
};

export const generateMultiplication = () => {
    // 3-digit x 1-digit or 2-digit x 2-digit
    const type = Math.random() > 0.5 ? "3x1" : "2x2";
    let num1, num2;

    if (type === "3x1") {
        num1 = getRandomInt(100, 999);
        num2 = getRandomInt(2, 9);
    } else {
        num1 = getRandomInt(10, 99);
        num2 = getRandomInt(10, 99);
    }

    const answer = num1 * num2;
    const question = `Multiply: ${num1} × ${num2} = ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Multiplication",
        answer: String(answer)
    };
};

export const generateDivision = () => {
    // 3-digit or 4-digit divided by 1-digit
    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(100, 500);
    const dividend = divisor * quotient; // Ensure no remainder for simplicity first

    const question = `Divide: ${dividend} ÷ ${divisor} = ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Division",
        answer: String(quotient)
    };
};

export const generateEstimation = () => {
    // Estimate sum to nearest 100
    const num1 = getRandomInt(100, 900);
    const num2 = getRandomInt(100, 900);

    const round1 = Math.round(num1 / 100) * 100;
    const round2 = Math.round(num2 / 100) * 100;
    const estimatedSum = round1 + round2;

    const question = `Estimate the sum of ${num1} and ${num2} by rounding to the nearest 100.`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Estimation",
        answer: String(estimatedSum)
    };
};

// --- Fractions ---

export const generateFractionTypes = () => {
    // Identify Proper, Improper, Mixed
    const types = ["Proper Fraction", "Improper Fraction", "Mixed Fraction"];
    const type = types[getRandomInt(0, 2)];
    let question, answer;

    if (type === "Proper Fraction") {
        const den = getRandomInt(3, 9);
        const num = getRandomInt(1, den - 1);
        question = `Identify the type of fraction: ${num}/${den}`;
        answer = "Proper Fraction";
    } else if (type === "Improper Fraction") {
        const num = getRandomInt(5, 12);
        const den = getRandomInt(2, num - 1);
        question = `Identify the type of fraction: ${num}/${den}`;
        answer = "Improper Fraction";
    } else {
        const whole = getRandomInt(1, 5);
        const den = getRandomInt(3, 9);
        const num = getRandomInt(1, den - 1);
        question = `Identify the type of fraction: ${whole} ${num}/${den}`;
        answer = "Mixed Fraction";
    }

    const options = shuffleArray([
        { value: "Proper Fraction", label: "Proper Fraction" },
        { value: "Improper Fraction", label: "Improper Fraction" },
        { value: "Mixed Fraction", label: "Mixed Fraction" },
        { value: "Unit Fraction", label: "Unit Fraction" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Types",
        options: options,
        answer: answer
    };
};

export const generateFractionOperations = () => {
    // Add/Sub like fractions
    const den = getRandomInt(3, 12);
    const num1 = getRandomInt(1, den - 2);
    const num2 = getRandomInt(1, den - num1 - 1); // Ensure sum < den for proper fraction result

    const isAddition = Math.random() > 0.5;
    let answerNum, question;

    if (isAddition) {
        answerNum = num1 + num2;
        question = `Solve: ${num1}/${den} + ${num2}/${den} = ?`;
    } else {
        // Ensure num1 > num2 for subtraction
        const n1 = Math.max(num1, num2);
        const n2 = Math.min(num1, num2);
        answerNum = n1 - n2;
        question = `Solve: ${n1}/${den} - ${n2}/${den} = ?`;
    }

    const answer = `${answerNum}/${den}`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${answerNum + 1}/${den}`, label: `${answerNum + 1}/${den}` },
        { value: `${answerNum}/${den + 1}`, label: `${answerNum}/${den + 1}` },
        { value: `${den}/${answerNum}`, label: `${den}/${answerNum}` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Fractions / Operations",
        options: options,
        answer: answer
    };
};

// --- Geometry ---

export const generateAngles = () => {
    const types = ["Acute", "Obtuse", "Right"];
    const type = types[getRandomInt(0, 2)];
    let angle, question;

    if (type === "Acute") {
        angle = getRandomInt(10, 89);
    } else if (type === "Obtuse") {
        angle = getRandomInt(91, 179);
    } else {
        angle = 90;
    }

    question = `What type of angle is ${angle}°?`;

    const options = shuffleArray([
        { value: "Acute", label: "Acute" },
        { value: "Obtuse", label: "Obtuse" },
        { value: "Right", label: "Right" },
        { value: "Straight", label: "Straight" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Angles",
        options: options,
        answer: type
    };
};

export const generateTriangles = () => {
    const types = ["Equilateral", "Isosceles", "Scalene"];
    const type = types[getRandomInt(0, 2)];
    let question;

    if (type === "Equilateral") {
        question = "A triangle with all 3 sides equal is called?";
    } else if (type === "Isosceles") {
        question = "A triangle with exactly 2 sides equal is called?";
    } else {
        question = "A triangle with all 3 sides different is called?";
    }

    const options = shuffleArray([
        { value: "Equilateral", label: "Equilateral" },
        { value: "Isosceles", label: "Isosceles" },
        { value: "Scalene", label: "Scalene" },
        { value: "Right Angled", label: "Right Angled" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Triangles",
        options: options,
        answer: type
    };
};

// --- Measurement ---

export const generateAreaPerimeter = () => {
    const isArea = Math.random() > 0.5;
    const l = getRandomInt(2, 10);
    const b = getRandomInt(2, 10);

    if (isArea) {
        const area = l * b;
        const question = `Find the area of a rectangle with length ${l}cm and breadth ${b}cm.`;
        return {
            type: "userInput",
            question: question,
            topic: "Measurement / Area",
            answer: String(area)
        };
    } else {
        const perimeter = 2 * (l + b);
        const question = `Find the perimeter of a rectangle with length ${l}cm and breadth ${b}cm.`;
        return {
            type: "userInput",
            question: question,
            topic: "Measurement / Perimeter",
            answer: String(perimeter)
        };
    }
};

export const generateTimeConversion = () => {
    // Hours to Minutes
    const hours = getRandomInt(2, 10);
    const minutes = hours * 60;
    const question = `Convert ${hours} hours to minutes.`;

    return {
        type: "userInput",
        question: question,
        topic: "Measurement / Time",
        answer: String(minutes)
    };
};

// --- Data Handling ---

export const generateBarGraph = () => {
    // Interpret simple data
    const apples = getRandomInt(10, 50);
    const oranges = getRandomInt(10, 50);
    const bananas = getRandomInt(10, 50);

    const max = Math.max(apples, oranges, bananas);
    let answer, question;

    if (max === apples) {
        answer = "Apples";
        question = `If Apples=${apples}, Oranges=${oranges}, Bananas=${bananas}, which fruit has the highest count?`;
    } else if (max === oranges) {
        answer = "Oranges";
        question = `If Apples=${apples}, Oranges=${oranges}, Bananas=${bananas}, which fruit has the highest count?`;
    } else {
        answer = "Bananas";
        question = `If Apples=${apples}, Oranges=${oranges}, Bananas=${bananas}, which fruit has the highest count?`;
    }

    const options = shuffleArray([
        { value: "Apples", label: "Apples" },
        { value: "Oranges", label: "Oranges" },
        { value: "Bananas", label: "Bananas" },
        { value: "Grapes", label: "Grapes" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Data Handling / Bar Graph",
        options: options,
        answer: answer
    };
};

// --- Logical Thinking ---

export const generatePattern = () => {
    // Number pattern
    const start = getRandomInt(2, 10);
    const mult = getRandomInt(2, 4);
    const seq = [start, start * mult, start * mult * mult];
    const next = start * mult * mult * mult;

    const question = `Complete the pattern: ${seq.join(", ")}, ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Logical Thinking / Patterns",
        answer: String(next)
    };
};
