const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Number Sense & Operations ---
export const generateAddition2digit = () => {
    // 2-digit addition with carry
    const num1 = getRandomInt(10, 99);
    const num2 = getRandomInt(10, 99);
    const answer = num1 + num2;

    const question = `Add: $$ ${num1} + ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Addition",
        answer: String(answer)
    };
};

export const generateAddition3digit = () => {
    // 3-digit addition with carry
    const num1 = getRandomInt(100, 500);
    const num2 = getRandomInt(100, 499);
    const answer = num1 + num2;

    const question = `Add: $$ ${num1} + ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Addition",
        answer: String(answer)
    };
};

export const generateSubtraction2digit = () => {
    // 2-digit subtraction with borrow
    const num1 = getRandomInt(10, 99);
    const num2 = getRandomInt(10, num1);
    const answer = num1 - num2;

    const question = `Subtract: $$ ${num1} - ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Subtraction",
        answer: String(answer)
    };
};

export const generateSubtraction3digit = () => {
    // 3-digit subtraction with borrow
    const num1 = getRandomInt(500, 999);
    const num2 = getRandomInt(100, 499);
    const answer = num1 - num2;

    const question = `Subtract: $$ ${num1} - ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Subtraction",
        answer: String(answer)
    };
};

export const generateMultiplication7and8and9and12 = () => {
    // Only 9 and 12 times tables
    const tables = [7, 8, 9, 12];
    const num1 = tables[getRandomInt(0, tables.length - 1)];
    const num2 = getRandomInt(1, 10);
    const answer = num1 * num2;

    const question = `Multiply: $$ ${num1} × ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Multiplication",
        answer: String(answer)
    };
};

export const generateMultiplication13to19 = () => {
    // Only 9 and 12 times tables
    const tables = [13, 14, 15, 16, 17, 18, 19];
    const num1 = tables[getRandomInt(0, tables.length - 1)];
    const num2 = getRandomInt(1, 10);
    const answer = num1 * num2;

    const question = `Multiply: $$ ${num1} × ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Multiplication",
        answer: String(answer)
    };
};

export const generateDivision1stlevel = () => {
    // Simple division without remainder
    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(2, 12);
    const dividend = divisor * quotient;

    const question = `Divide: $$ ${dividend} \\div ${divisor} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Division",
        answer: String(quotient)
    };
};

export const generateDivision2ndlevel = () => {
    // Simple division without remainder
    const divisor = getRandomInt(10, 15);
    const quotient = getRandomInt(2, 10);
    const dividend = divisor * quotient;

    const question = `Divide: $$ ${dividend} \\div ${divisor} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Division",
        answer: String(quotient)
    };
};

export const generateMissingNumber = () => {
    // e.g., 15 + ? = 25 or ? - 5 = 10
    const isAddition = Math.random() > 0.5;

    if (isAddition) {
        const num1 = getRandomInt(10, 50);
        const missing = getRandomInt(5, 20);
        const total = num1 + missing;

        const question = `Find the missing number: $$ ${num1} +  ?  = ${total} $$`;

        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Missing Number",
            answer: String(missing)
        };
    } else {
        const num1 = getRandomInt(20, 60);
        const missing = getRandomInt(5, 15);
        const result = num1 - missing;

        const question = `Find the missing number: ${num1} - ? = ${result}`;

        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Missing Number",
            answer: String(missing)
        };
    }
};

export const generateMixedOperations = () => {
    // e.g., 5 + 3 - 2 = ?
    const num1 = getRandomInt(5, 15);
    const num2 = getRandomInt(2, 10);
    const num3 = getRandomInt(1, 5);

    const answer = num1 + num2 - num3;
    const question = `Solve: $$ ${num1} + ${num2} - ${num3} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Mixed Operations",
        answer: String(answer)
    };
};

export const generateFractions = () => {
    // Identify fraction from description (visuals are harder without images)
    // "What fraction is 1 part out of 4?"
    const denominator = getRandomInt(2, 8);
    const numerator = getRandomInt(1, denominator - 1);

    const question = `What fraction represents ${numerator} part${numerator > 1 ? 's' : ''} out of ${denominator} equal parts?`;
    const answer = `$\\frac{${numerator}}{${denominator}}$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `$\\frac{${denominator}}{${numerator}}$`, label: `$\\frac{${denominator}}{${numerator}}$` },
        { value: `$\\frac{${numerator}}{${denominator + 1}}$`, label: `$\\frac{${numerator}}{${denominator + 1}}$` },
        { value: `$\\frac{${numerator + 1}}{${denominator}}$`, label: `$\\frac{${numerator + 1}}{${denominator}}$` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Fractions",
        options: options,
        answer: answer
    };
};

export const generateCompareFractions = () => {
    // Compare unit fractions: 1/3 vs 1/5
    const num = 1;
    const den1 = getRandomInt(2, 5);
    let den2 = getRandomInt(2, 5);
    while (den1 === den2) den2 = getRandomInt(2, 5);

    const answer = den1 < den2 ? ">" : "<"; // Smaller denominator means larger fraction
    const question = `Compare: $\\frac{${num}}{${den1}}$   ?    $\\frac{${num}}{${den2}}$`;

    const options = shuffleArray([
        { value: ">", label: "> More than" },
        { value: "<", label: "< Less than" },
        { value: "=", label: "= Equal to" }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Compare Fractions",
        options: options,
        answer: answer
    };
};

// --- Geometry ---

export const generateShapes = () => {
    const shapes = [
        { name: "Cube", properties: "6 faces, 12 edges, 8 vertices" },
        // { name: "Cuboid", properties: "6 rectangular faces, 12 edges, 8 vertices" },
        { name: "Cone", properties: "1 circular face, 1 vertex" },
        { name: "Cylinder", properties: "2 circular faces, 0 vertices" },
        { name: "Sphere", properties: "0 faces, 0 edges, 0 vertices" }
    ];

    const shape = shapes[getRandomInt(0, shapes.length - 1)];
    const question = `Which 3D shape has ${shape.properties}?`;

    const distractors = shapes.filter(s => s.name !== shape.name);
    const selectedDistractors = shuffleArray(distractors).slice(0, 3);
    const finalOptions = shuffleArray([
        { value: shape.name, label: shape.name },
        ...selectedDistractors.map(s => ({ value: s.name, label: s.name }))
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / 3D Shapes",
        options: finalOptions,
        answer: shape.name
    };
};

export const generateSymmetry = () => {
    // Concept check
    const objects = [
        { name: "Butterfly", symmetric: "Yes" },
        { name: "Human Face", symmetric: "Yes" },
        { name: "Circle", symmetric: "Yes" },
        { name: "Scalene Triangle", symmetric: "No" },
        { name: "Letter F", symmetric: "No" },
        { name: "Letter G", symmetric: "No" }
    ];

    const obj = objects[getRandomInt(0, objects.length - 1)];
    const question = `Is a ${obj.name} symmetrical?`;

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Symmetry",
        options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
        ],
        answer: obj.symmetric
    };
};

// --- Measurement ---

export const generateLengthConversion = () => {
    // m to cm
    const m = getRandomInt(1, 9);
    const cm = m * 100;
    const question = `Convert ${m} meter to centimeters.`;

    return {
        type: "userInput",
        question: question,
        topic: "Measurement / Length",
        answer: String(cm)
    };
};

export const generateWeightConversion = () => {
    // kg to g
    const kg = getRandomInt(1, 5);
    const g = kg * 1000;
    const question = `Convert ${kg} kg to grams.`;

    return {
        type: "userInput",
        question: question,
        topic: "Measurement / Weight",
        answer: String(g)
    };
};

export const generateCapacityConversion = () => {
    // L to mL
    const l = getRandomInt(1, 5);
    const ml = l * 1000;
    const question = `Convert ${l} liters to milliliters.`;

    return {
        type: "userInput",
        question: question,
        topic: "Measurement / Capacity",
        answer: String(ml)
    };
};

export const generateTimeReading = () => {
    const hour = getRandomInt(1, 12);
    const minute = getRandomInt(0, 11) * 5;
    const minuteStr = minute < 10 ? `0${minute}` : minute;
    const time = `${hour}:${minuteStr}`;

    const question = `What time is it? (Hour hand at ${hour}, Minute hand at ${minute / 5 === 0 ? 12 : minute / 5})`;

    const options = shuffleArray([
        { value: time, label: time },
        { value: `${hour + 1}:${minuteStr}`, label: `${hour + 1}:${minuteStr}` },
        { value: `${hour}:${minute < 10 ? minute + 15 : '00'}`, label: `${hour}:${minute < 10 ? minute + 15 : '00'}` },
        { value: `${hour - 1}:${minuteStr}`, label: `${hour - 1}:${minuteStr}` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Time",
        options: options,
        answer: time
    };
};

// --- Money ---

export const generateIdentifyMoney = () => {
    const notes = [10, 20, 50, 100, 200, 500];
    const note = notes[getRandomInt(0, notes.length - 1)];

    const question = `Identify the note </br>₹${note}`;

    // Create options with other note values
    const uniqueOptions = new Set();
    uniqueOptions.add(note);

    // Add 3 random different notes as distractors
    while (uniqueOptions.size < 4) {
        const randomNote = notes[getRandomInt(0, notes.length - 1)];
        uniqueOptions.add(randomNote);
    }

    // Convert to array and create MCQ options with images
    const optionsArray = Array.from(uniqueOptions).map(value => ({
        value: `/assets/grade2/rupee_${value}.jpg`,
        // label: `₹${value}`,
        image: `/assets/grade2/rupee_${value}.jpg`
    }));

    return {
        type: "mcq",
        question: question,
        topic: "Money / Basics",
        answer: `/assets/grade2/rupee_${note}.jpg`,
        // image: `/assets/grade2/rupee_${note}.jpg`,
        options: shuffleArray(optionsArray)
    };
};

export const generateMoneyOperations = () => {
    // Add/Sub money
    const isAddition = Math.random() > 0.5;
    const amount1 = getRandomInt(10, 100);
    const amount2 = getRandomInt(5, 50);

    if (isAddition) {
        const total = amount1 + amount2;
        const question = `Add: ₹${amount1} + ₹${amount2} = ?`;

        return {
            type: "userInput",
            question: question,
            topic: "Money / Operations",
            answer: String(total)
        };
    } else {
        const total = amount1 - amount2;
        const question = `Subtract: ₹${amount1} - ₹${amount2} = ?`;

        return {
            type: "userInput",
            question: question,
            topic: "Money / Operations",
            answer: String(total)
        };
    }
};

// --- Data Handling ---

export const generateTally = () => {
    // Count tally marks (represented as text for now, e.g., ||||)
    const count = getRandomInt(1, 10);
    let tally = "";
    for (let i = 0; i < count; i++) {
        tally += "|";
    }

    const question = `Count the tally marks:</br> ${tally}`;

    return {
        type: "userInput",
        question: question,
        topic: "Data Handling / Tally",
        answer: String(count)
    };
};

// --- Patterns ---

export const generateNumberPattern = () => {
    // e.g., 2, 4, 6, ?
    const start = getRandomInt(1, 10);
    const step = getRandomInt(2, 5);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const next = start + step * 4;

    const question = `Complete the pattern:</br> ${seq.join(", ")}, ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Patterns / Number Patterns",
        answer: String(next)
    };
};
