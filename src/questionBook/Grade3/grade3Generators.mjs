const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Number Sense & Operations ---

export const generateAddition = () => {
    // 3-digit addition with carry
    const num1 = getRandomInt(100, 500);
    const num2 = getRandomInt(100, 499);
    const answer = num1 + num2;

    const question = `Add: ${num1} + ${num2} = ?`;

    if (true) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Addition",
            answer: String(answer)
        };
    }

    const options = shuffleArray([
        { value: String(answer), label: String(answer) },
        { value: String(answer + 10), label: String(answer + 10) },
        { value: String(answer - 10), label: String(answer - 10) },
        { value: String(answer + 1), label: String(answer + 1) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Addition",
        options: options,
        answer: String(answer)
    };
};

export const generateSubtraction = () => {
    // 3-digit subtraction with borrow
    const num1 = getRandomInt(500, 999);
    const num2 = getRandomInt(100, 499);
    const answer = num1 - num2;

    const question = `Subtract: ${num1} - ${num2} = ?`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Subtraction",
            answer: String(answer)
        };
    }

    const options = shuffleArray([
        { value: String(answer), label: String(answer) },
        { value: String(answer + 10), label: String(answer + 10) },
        { value: String(answer - 10), label: String(answer - 10) },
        { value: String(answer + 5), label: String(answer + 5) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Subtraction",
        options: options,
        answer: String(answer)
    };
};

export const generateMultiplication = () => {
    // 1-digit x 1-digit or 2-digit x 1-digit
    const isTwoDigit = Math.random() > 0.5;
    const num1 = isTwoDigit ? getRandomInt(10, 20) : getRandomInt(2, 9);
    const num2 = getRandomInt(2, 9);
    const answer = num1 * num2;

    const question = `Multiply: ${num1} × ${num2} = ?`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Multiplication",
            answer: String(answer)
        };
    }

    const options = shuffleArray([
        { value: String(answer), label: String(answer) },
        { value: String(answer + num2), label: String(answer + num2) },
        { value: String(answer - num2), label: String(answer - num2) },
        { value: String(answer + 1), label: String(answer + 1) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Multiplication",
        options: options,
        answer: String(answer)
    };
};

export const generateDivision = () => {
    // Simple division without remainder
    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(2, 12);
    const dividend = divisor * quotient;

    const question = `Divide: ${dividend} ÷ ${divisor} = ?`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Division",
            answer: String(quotient)
        };
    }

    const options = shuffleArray([
        { value: String(quotient), label: String(quotient) },
        { value: String(quotient + 1), label: String(quotient + 1) },
        { value: String(quotient - 1), label: String(quotient - 1) },
        { value: String(quotient + 2), label: String(quotient + 2) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Division",
        options: options,
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

        const question = `Find the missing number: ${num1} + ? = ${total}`;

        if (Math.random() > 0.5) {
            return {
                type: "userInput",
                question: question,
                topic: "Number Sense / Missing Number",
                answer: String(missing)
            };
        }

        const options = shuffleArray([
            { value: String(missing), label: String(missing) },
            { value: String(missing + 1), label: String(missing + 1) },
            { value: String(missing - 1), label: String(missing - 1) },
            { value: String(missing + 5), label: String(missing + 5) }
        ]);

        return {
            type: "mcq",
            question: question,
            topic: "Number Sense / Missing Number",
            options: options,
            answer: String(missing)
        };
    } else {
        const num1 = getRandomInt(20, 60);
        const missing = getRandomInt(5, 15);
        const result = num1 - missing;

        const question = `Find the missing number: ${num1} - ? = ${result}`;

        if (Math.random() > 0.5) {
            return {
                type: "userInput",
                question: question,
                topic: "Number Sense / Missing Number",
                answer: String(missing)
            };
        }

        const options = shuffleArray([
            { value: String(missing), label: String(missing) },
            { value: String(missing + 1), label: String(missing + 1) },
            { value: String(missing - 1), label: String(missing - 1) },
            { value: String(missing + 2), label: String(missing + 2) }
        ]);

        return {
            type: "mcq",
            question: question,
            topic: "Number Sense / Missing Number",
            options: options,
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
    const question = `Solve: ${num1} + ${num2} - ${num3} = ?`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Mixed Operations",
            answer: String(answer)
        };
    }

    const options = shuffleArray([
        { value: String(answer), label: String(answer) },
        { value: String(answer + 1), label: String(answer + 1) },
        { value: String(answer - 1), label: String(answer - 1) },
        { value: String(answer + 2), label: String(answer + 2) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Mixed Operations",
        options: options,
        answer: String(answer)
    };
};

export const generateFractions = () => {
    // Identify fraction from description (visuals are harder without images)
    // "What fraction is 1 part out of 4?"
    const denominator = getRandomInt(2, 8);
    const numerator = getRandomInt(1, denominator - 1);

    const question = `What fraction represents ${numerator} part${numerator > 1 ? 's' : ''} out of ${denominator} equal parts?`;
    const answer = `${numerator}/${denominator}`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Number Sense / Fractions",
            answer: answer
        };
    }

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `${denominator}/${numerator}`, label: `${denominator}/${numerator}` },
        { value: `${numerator}/${denominator + 1}`, label: `${numerator}/${denominator + 1}` },
        { value: `${numerator + 1}/${denominator}`, label: `${numerator + 1}/${denominator}` }
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
    const question = `Compare: ${num}/${den1} _ ${num}/${den2}`;

    const options = shuffleArray([
        { value: ">", label: ">" },
        { value: "<", label: "<" },
        { value: "=", label: "=" }
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
        { name: "Cuboid", properties: "6 rectangular faces, 12 edges, 8 vertices" },
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
    const question = `Convert ${m} meters to centimeters.`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Measurement / Length",
            answer: String(cm)
        };
    }

    const options = shuffleArray([
        { value: String(cm), label: `${cm} cm` },
        { value: String(cm + 10), label: `${cm + 10} cm` },
        { value: String(m * 10), label: `${m * 10} cm` },
        { value: String(cm + 100), label: `${cm + 100} cm` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Length",
        options: options,
        answer: String(cm)
    };
};

export const generateWeightConversion = () => {
    // kg to g
    const kg = getRandomInt(1, 5);
    const g = kg * 1000;
    const question = `Convert ${kg} kg to grams.`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Measurement / Weight",
            answer: String(g)
        };
    }

    const options = shuffleArray([
        { value: String(g), label: `${g} g` },
        { value: String(g + 100), label: `${g + 100} g` },
        { value: String(kg * 100), label: `${kg * 100} g` },
        { value: String(g + 500), label: `${g + 500} g` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Weight",
        options: options,
        answer: String(g)
    };
};

export const generateCapacityConversion = () => {
    // L to mL
    const l = getRandomInt(1, 5);
    const ml = l * 1000;
    const question = `Convert ${l} liters to milliliters.`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Measurement / Capacity",
            answer: String(ml)
        };
    }

    const options = shuffleArray([
        { value: String(ml), label: `${ml} mL` },
        { value: String(ml + 100), label: `${ml + 100} mL` },
        { value: String(l * 100), label: `${l * 100} mL` },
        { value: String(ml + 250), label: `${ml + 250} mL` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Capacity",
        options: options,
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
    // Identify notes/coins or simple addition
    const notes = [10, 20, 50, 100, 200, 500];
    const note = notes[getRandomInt(0, notes.length - 1)];

    const question = `Identify the value of a ₹${note} note.`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Money / Identification",
            answer: String(note)
        };
    }

    const options = shuffleArray([
        { value: String(note), label: `₹${note}` },
        { value: String(note + 10), label: `₹${note + 10}` },
        { value: String(note * 2), label: `₹${note * 2}` },
        { value: String(note / 2), label: `₹${note / 2}` }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Money / Identification",
        options: options,
        answer: String(note)
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

        if (Math.random() > 0.5) {
            return {
                type: "userInput",
                question: question,
                topic: "Money / Operations",
                answer: String(total)
            };
        }

        const options = shuffleArray([
            { value: String(total), label: `₹${total}` },
            { value: String(total + 10), label: `₹${total + 10}` },
            { value: String(total - 5), label: `₹${total - 5}` },
            { value: String(total + 5), label: `₹${total + 5}` }
        ]);

        return {
            type: "mcq",
            question: question,
            topic: "Money / Operations",
            options: options,
            answer: String(total)
        };
    } else {
        const total = amount1 - amount2;
        const question = `Subtract: ₹${amount1} - ₹${amount2} = ?`;

        if (Math.random() > 0.5) {
            return {
                type: "userInput",
                question: question,
                topic: "Money / Operations",
                answer: String(total)
            };
        }

        const options = shuffleArray([
            { value: String(total), label: `₹${total}` },
            { value: String(total + 10), label: `₹${total + 10}` },
            { value: String(total - 5), label: `₹${total - 5}` },
            { value: String(total + 2), label: `₹${total + 2}` }
        ]);

        return {
            type: "mcq",
            question: question,
            topic: "Money / Operations",
            options: options,
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

    const question = `Count the tally marks: ${tally}`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Data Handling / Tally",
            answer: String(count)
        };
    }

    const options = shuffleArray([
        { value: String(count), label: String(count) },
        { value: String(count + 1), label: String(count + 1) },
        { value: String(count - 1), label: String(count - 1) },
        { value: String(count + 2), label: String(count + 2) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Data Handling / Tally",
        options: options,
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

    const question = `Complete the pattern: ${seq.join(", ")}, ?`;

    if (Math.random() > 0.5) {
        return {
            type: "userInput",
            question: question,
            topic: "Patterns / Number Patterns",
            answer: String(next)
        };
    }

    const options = shuffleArray([
        { value: String(next), label: String(next) },
        { value: String(next + step), label: String(next + step) },
        { value: String(next - 1), label: String(next - 1) },
        { value: String(next + 1), label: String(next + 1) }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Patterns / Number Patterns",
        options: options,
        answer: String(next)
    };
};
