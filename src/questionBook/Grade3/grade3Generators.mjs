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
    const num2 = getRandomInt(100, num1); // Ensure num2 <= num1 for positive answer
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
    const tables = [6, 7, 8, 9];
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
    const tables = [12, 13, 14, 15, 16, 17, 18, 19];
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

// export const generateMissingNumber = () => {
//     // e.g., 15 + ? = 25 or ? - 5 = 10
//     const isAddition = Math.random() > 0.5;

//     if (isAddition) {
//         const num1 = getRandomInt(10, 50);
//         const missing = getRandomInt(5, 20);
//         const total = num1 + missing;

//         const question = `Find the missing number: $$ ${num1} +  ?  = ${total} $$`;

//         return {
//             type: "userInput",
//             question: question,
//             topic: "Number Sense / Missing Number",
//             answer: String(missing)
//         };
//     } else {
//         const num1 = getRandomInt(20, 60);
//         const missing = getRandomInt(5, 15);
//         const result = num1 - missing;

//         const question = `Find the missing number: $$ ${num1} - ? = ${result} $$`;

//         return {
//             type: "userInput",
//             question: question,
//             topic: "Number Sense / Missing Number",
//             answer: String(missing)
//         };
//     }
// };

export const generateMissingNumberAddition = () => {
    // Random numbers for addition
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
};

export const generateMissingNumberSubtraction = () => {
    // Random numbers for subtraction
    const num1 = getRandomInt(20, 60);
    const missing = getRandomInt(5, 15);
    const result = num1 - missing;

    const question = `Find the missing number: $$ ${num1} - ? = ${result} $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Missing Number",
        answer: String(missing)
    };
};




// export const generateMixedOperations = () => {
//     // e.g., 5 + 3 - 2 = ?
//     const num1 = getRandomInt(5, 15);
//     const num2 = getRandomInt(2, 10);
//     const num3 = getRandomInt(1, 5);

//     const answer = num1 + num2 - num3;
//     const question = `Solve: $$ ${num1} + ${num2} - ${num3} = ? $$`;

//     return {
//         type: "userInput",
//         question: question,
//         topic: "Number Sense / Mixed Operations",
//         answer: String(answer)
//     };
// };

export const generateAdditionThenSubtraction = () => {
    // Random numbers for addition and subtraction
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



export const generateSubtractionThenAddition = () => {
    // Random numbers for subtraction and addition
    const num1 = getRandomInt(5, 15);
    // Ensure num2 is not greater than num1 to avoid negative result
    const num2 = getRandomInt(2, num1);
    const num3 = getRandomInt(1, 5);

    const answer = num1 - num2 + num3;
    const question = `Solve: $$ ${num1} - ${num2} + ${num3} = ? $$`;

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

// export const generateNumberReading = () => {
//     // Generate a random number between 1 and 100
//     const number = getRandomInt(1, 100);

//     // Function to convert a number to its word form
//     const numberToWords = (num) => {
//         const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//         const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

//         if (num < 20) {
//             return ones[num];
//         } else {
//             const tensPlace = Math.floor(num / 10);
//             const onesPlace = num % 10;
//             return `${tens[tensPlace]} ${ones[onesPlace]}`.trim();
//         }
//     };

//     const numberInWords = numberToWords(number);

//     // Create the question by giving a mix of number and word options
//     const question = `What is the number for: $$ ${numberInWords} ? $$`;

//     // Options will include the number in word form, numeral form, and other similar values
//     const options = shuffleArray([
//         { value: numberInWords, label: numberInWords }, // correct word form
//         { value: number.toString(), label: number.toString() }, // correct number
//         { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() }, // random number
//         { value: numberToWords(getRandomInt(1, 100)), label: numberToWords(getRandomInt(1, 100)) } // random word form
//     ]);

//     return {
//         type: "mcq",
//         question: question,
//         topic: "Measurement / Numbers",
//         options: options,
//         answer: numberInWords
//     };
// };


// --- Geometry ---

// Helper function to convert number to words (shared by both functions)
const numberToWords = (num) => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num < 20) {
        return ones[num];
    } else {
        const tensPlace = Math.floor(num / 10);
        const onesPlace = num % 10;
        return `${tens[tensPlace]} ${ones[onesPlace]}`.trim();
    }
};

export const generateNumberToWords = () => {
    // Generate a random number between 1 and 99 (100 not supported by helper)
    const number = getRandomInt(1, 99);
    const numberInWords = numberToWords(number);

    // The question asks for the number name, given the numeral
    const question = `What is the number name for: $ ${number} $`;

    // Create options as number names (words)
    const options = shuffleArray([
        { value: numberInWords, label: numberInWords }, // correct number name
        { value: numberToWords(getRandomInt(1, 99)), label: numberToWords(getRandomInt(1, 99)) }, // random number name
        { value: numberToWords(getRandomInt(1, 99)), label: numberToWords(getRandomInt(1, 99)) }, // random number name
        { value: numberToWords(getRandomInt(1, 99)), label: numberToWords(getRandomInt(1, 99)) } // random number name
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Number Names",
        options: options,
        answer: numberInWords
    };
};

export const generateWordsToNumber = () => {
    // Generate a random number between 1 and 100
    const number = getRandomInt(1, 100);
    const numberInWords = numberToWords(number);

    // The question asks for the numeral, given the number name
    const question = `What is the number for: $ ${numberInWords} $`;

    // Create options as numerals (numbers)
    const options = shuffleArray([
        { value: number.toString(), label: number.toString() }, // correct numeral
        { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() }, // random numeral
        { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() }, // random numeral
        { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() } // random numeral
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Number Reading",
        options: options,
        answer: number.toString()
    };
};

export const generateDoublingQuestion = () => {
    // Generate a random number between 1 and 50 for doubling
    const number = getRandomInt(1, 20);
    const correctAnswer = number * 2;

    const question = `What is double of $ ${number} $`;

    // Generate random incorrect answers within a range of 1-100 (but avoid the correct answer)
    const generateRandomIncorrectAnswer = () => {
        let randomAnswer;
        do {
            randomAnswer = getRandomInt(1, 100);
        } while (randomAnswer === correctAnswer);
        return randomAnswer;
    };

    // Create the options with the correct answer and 3 random incorrect answers
    const options = shuffleArray([
        { value: correctAnswer.toString(), label: correctAnswer.toString() },
        { value: generateRandomIncorrectAnswer().toString(), label: generateRandomIncorrectAnswer().toString() },
        { value: generateRandomIncorrectAnswer().toString(), label: generateRandomIncorrectAnswer().toString() },
        { value: generateRandomIncorrectAnswer().toString(), label: generateRandomIncorrectAnswer().toString() }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Doubling",
        options: options,
        answer: correctAnswer.toString()
    };
};

export const generateHalvingQuestion = () => {
    // Generate an even random number between 2 and 20 for Grade 3
    const number = getRandomInt(1, 10) * 2; // Ensures even number (2, 4, 6, 8, 10, 12, 14, 16, 18, 20)
    const correctAnswer = number / 2;

    const question = `What is half of $ ${number} $`;

    // Generate random incorrect answers within a range of 1-10 (but avoid the correct answer)
    const generateRandomIncorrectAnswer = () => {
        let randomAnswer;
        do {
            randomAnswer = getRandomInt(1, 10);
        } while (randomAnswer === correctAnswer);
        return randomAnswer;
    };

    // Create the options with the correct answer and 3 random incorrect answers
    // Fixed: Generate each incorrect answer once and store it
    const wrong1 = generateRandomIncorrectAnswer();
    const wrong2 = generateRandomIncorrectAnswer();
    const wrong3 = generateRandomIncorrectAnswer();

    const options = shuffleArray([
        { value: correctAnswer.toString(), label: correctAnswer.toString() },
        { value: wrong1.toString(), label: wrong1.toString() },
        { value: wrong2.toString(), label: wrong2.toString() },
        { value: wrong3.toString(), label: wrong3.toString() }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Number Sense / Halving",
        options: options,
        answer: correctAnswer.toString()
    };
};


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
        { name: "Butterfly", symmetric: "Yes", image: "/assets/grade3/butterfly.png" },
        // { name: "Human Face", symmetric: "Yes" }, // No image available
        { name: "Circle", symmetric: "Yes", image: "/assets/grade3/circle.png" },
        // { name: "Scalene Triangle", symmetric: "No" },
        { name: "Letter F", symmetric: "No", image: "/assets/grade3/F.png" },
        { name: "Letter G", symmetric: "No", image: "/assets/grade3/G.png" }
    ];

    // Filter out objects without images if we want to enforce images, 
    // or just pick from all. Given the user request implies using these images, 
    // I will prioritize ones with images or just leave the list as is with images added.
    // I'll stick to the ones with images enabled for a better experience, 
    // so I commented out Human Face which had no image in the list.

    const obj = objects[getRandomInt(0, objects.length - 1)];
    const question = `Is a ${obj.name} symmetrical?`;

    return {
        type: "mcq",
        question: question,
        topic: "Geometry / Symmetry",
        image: obj.image,
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

// export const generateTimeReading = () => {
//     // Available clock images showing different hours
//     const availableClocks = [1, 2, 3, 5, 7, 8, 9, 10, 12];
//     const hour = availableClocks[getRandomInt(0, availableClocks.length - 1)];

//     // For simplicity, using :00 (on the hour) times
//     const time = `${hour}:00`;

//     const question = `What time is it?`;

//     // Generate plausible wrong answers
//     const wrongHour1 = hour === 12 ? 1 : hour + 1;
//     const wrongHour2 = hour === 1 ? 12 : hour - 1;
//     const wrongHour3 = hour <= 10 ? hour + 2 : hour - 2;

//     const options = shuffleArray([
//         { value: time, label: time },
//         { value: `${wrongHour1}:00`, label: `${wrongHour1}:00` },
//         { value: `${wrongHour2}:00`, label: `${wrongHour2}:00` },
//         { value: `${wrongHour3}:00`, label: `${wrongHour3}:00` }
//     ]);

//     return {
//         type: "userInput",
//         question: question,
//         topic: "Measurement / Time",
//         image: `/assets/grade3/ClockAt${hour}.png`,
//         options: options,
//         answer: time
//     };
// };

// --- Money ---

export const generateTimeReading = () => {
    // Available clock images showing different hours
    const availableClocks = [1, 2, 3, 5, 7, 8, 9, 10, 12];
    const hour = availableClocks[getRandomInt(0, availableClocks.length - 1)];

    // Question: What hour is shown on the clock?
    const question = `What hour is shown on the clock?`;

    // Generate plausible wrong answers (hours close to the correct hour)
    const wrongHour1 = hour === 12 ? 1 : hour + 1;
    const wrongHour2 = hour === 1 ? 12 : hour - 1;
    const wrongHour3 = hour <= 10 ? hour + 2 : hour - 2;

    // Options for the multiple-choice question
    const options = shuffleArray([
        { value: hour, label: hour.toString() }, // Correct answer as a number
        { value: wrongHour1, label: wrongHour1.toString() }, // Incorrect option 1
        { value: wrongHour2, label: wrongHour2.toString() }, // Incorrect option 2
        { value: wrongHour3, label: wrongHour3.toString() }  // Incorrect option 3
    ]);

    return {
        type: "userInput",
        question: question,
        topic: "Measurement / Time",
        image: `/assets/grade3/ClockAt${hour}.png`, // Path to the clock image showing the selected hour
        options: options, // Multiple-choice options
        answer: hour.toString() // The correct answer is the hour as a string (e.g., "1", "2", etc.)
    };
};


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

const createTallySVG = (count) => {
    const groupWidth = 60;
    const height = 50; // Increased height for better visibility
    const spacing = 20;
    // Calculate total width based on number of groups. 
    // Each group takes about 40px width plus spacing.
    // We have Math.ceil(count / 5) groups.
    const numGroups = Math.ceil(count / 5);
    const totalWidth = numGroups * (40 + spacing);

    let svgLines = "";

    for (let g = 0; g < numGroups; g++) {
        const groupX = g * (40 + spacing);
        const marksInGroup = Math.min(5, count - g * 5);

        // Draw vertical lines (up to 4)
        for (let i = 0; i < Math.min(marksInGroup, 4); i++) {
            const x = groupX + i * 10;
            svgLines += `<line x1="${x}" y1="5" x2="${x}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />`;
        }

        // Draw diagonal line for the 5th mark
        if (marksInGroup === 5) {
            svgLines += `<line x1="${groupX - 5}" y1="5" x2="${groupX + 35}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />`;
        }
    }

    return `<svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; overflow:visible;">
        ${svgLines}
    </svg>`;
};

export const generateTally = () => {
    const count = getRandomInt(1, 10);
    const tallySVG = createTallySVG(count);

    const question = `Count the tally marks:</br> <div style="margin-top: 20px;">${tallySVG}</div>`;

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

// Helper function to create shape SVG icons for MCQ options
const createShapeIcon = (shapeName, size = 30) => {
    let svgContent = "";
    const half = size / 2;

    switch (shapeName.toLowerCase()) {
        case "circle":
            svgContent = `<circle cx="${half}" cy="${half}" r="${half - 2}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>`;
            break;
        case "square":
            svgContent = `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>`;
            break;
        case "rectangle":
            svgContent = `<rect x="2" y="${size * 0.25}" width="${size - 4}" height="${size * 0.5}" fill="#10b981" stroke="#065f46" stroke-width="2"/>`;
            break;
        case "triangle":
            svgContent = `<polygon points="${half},2 ${size - 2},${size - 2} 2,${size - 2}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>`;
            break;
    }

    return `data:image/svg+xml;base64,${btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${svgContent}</svg>`)}`;
};

export const generateShapeComposition = () => {
    // Define different toys/objects made from shapes
    const toys = [
        {
            name: "Robot",
            shapes: ["Circle", "Rectangle", "Square"],
            svg: (w, h) => `
                <rect x="${w * 0.3}" y="${h * 0.15}" width="${w * 0.4}" height="${h * 0.25}" fill="#e0e0e0" stroke="#333" stroke-width="2"/>
                <circle cx="${w * 0.4}" cy="${h * 0.23}" r="${w * 0.05}" fill="#333"/>
                <circle cx="${w * 0.6}" cy="${h * 0.23}" r="${w * 0.05}" fill="#333"/>
                <rect x="${w * 0.35}" y="${h * 0.45}" width="${w * 0.3}" height="${h * 0.35}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="${w * 0.2}" y="${h * 0.5}" width="${w * 0.1}" height="${h * 0.25}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
                <rect x="${w * 0.7}" y="${h * 0.5}" width="${w * 0.1}" height="${h * 0.25}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
            `
        },
        {
            name: "House",
            shapes: ["Rectangle", "Triangle", "Square"],
            svg: (w, h) => `
                <polygon points="${w * 0.5},${h * 0.15} ${w * 0.15},${h * 0.45} ${w * 0.85},${h * 0.45}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
                <rect x="${w * 0.2}" y="${h * 0.45}" width="${w * 0.6}" height="${h * 0.4}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>
                <rect x="${w * 0.35}" y="${h * 0.55}" width="${w * 0.15}" height="${h * 0.25}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="${w * 0.6}" y="${h * 0.55}" width="${w * 0.12}" height="${w * 0.12}" fill="#60a5fa" stroke="#1e40af" stroke-width="2"/>
            `
        },
        {
            name: "Ice Cream Cone",
            shapes: ["Circle", "Triangle"],
            svg: (w, h) => `
                <circle cx="${w * 0.5}" cy="${h * 0.25}" r="${w * 0.2}" fill="#ec4899" stroke="#be185d" stroke-width="2"/>
                <circle cx="${w * 0.45}" cy="${h * 0.35}" r="${w * 0.15}" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
                <circle cx="${w * 0.55}" cy="${h * 0.35}" r="${w * 0.15}" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
                <polygon points="${w * 0.5},${h * 0.9} ${w * 0.25},${h * 0.45} ${w * 0.75},${h * 0.45}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>
            `
        },
        {
            name: "Car",
            shapes: ["Rectangle", "Circle"],
            svg: (w, h) => `
                <rect x="${w * 0.15}" y="${h * 0.5}" width="${w * 0.7}" height="${h * 0.25}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="${h * 0.2}" fill="#60a5fa" stroke="#1e40af" stroke-width="2"/>
                <circle cx="${w * 0.3}" cy="${h * 0.75}" r="${w * 0.1}" fill="#1f2937" stroke="#000" stroke-width="2"/>
                <circle cx="${w * 0.7}" cy="${h * 0.75}" r="${w * 0.1}" fill="#1f2937" stroke="#000" stroke-width="2"/>
            `
        },
        {
            name: "Tree",
            shapes: ["Rectangle", "Circle", "Triangle"],
            svg: (w, h) => `
                <rect x="${w * 0.43}" y="${h * 0.5}" width="${w * 0.14}" height="${h * 0.4}" fill="#92400e" stroke="#78350f" stroke-width="2"/>
                <circle cx="${w * 0.5}" cy="${h * 0.3}" r="${w * 0.25}" fill="#10b981" stroke="#065f46" stroke-width="2"/>
                <polygon points="${w * 0.5},${h * 0.15} ${w * 0.25},${h * 0.45} ${w * 0.75},${h * 0.45}" fill="#10b981" stroke="#065f46" stroke-width="2"/>
            `
        }
    ];

    // Select a random toy
    const toy = toys[getRandomInt(0, toys.length - 1)];

    // Generate the toy SVG
    const width = 300;
    const height = 300;
    const toyImage = `data:image/svg+xml;base64,${btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${toy.svg(width, height)}</svg>`)}`;

    // Create the correct answer label with shape icons
    const correctAnswer = toy.shapes.sort().join(" and ");

    // Generate distractor options (wrong shape combinations)
    const allShapes = ["Circle", "Square", "Rectangle", "Triangle"];
    const wrongCombinations = [];

    // Generate 3 wrong combinations with safety counter
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops

    while (wrongCombinations.length < 3 && attempts < maxAttempts) {
        attempts++;
        const numShapes = getRandomInt(2, 3);
        const combo = [];
        const availableShapes = allShapes.filter(s => !toy.shapes.includes(s));

        // Ensure we have shapes to work with
        if (availableShapes.length === 0) {
            // If no wrong shapes available, use all shapes
            const randomShapes = [...allShapes];
            for (let i = 0; i < numShapes && randomShapes.length > 0; i++) {
                const idx = getRandomInt(0, randomShapes.length - 1);
                combo.push(randomShapes[idx]);
                randomShapes.splice(idx, 1);
            }
        } else if (Math.random() > 0.5 && toy.shapes.length > 0 && availableShapes.length > 0) {
            // Mix some correct and some incorrect shapes
            combo.push(toy.shapes[0]); // Add one correct shape
            const wrongShape = availableShapes[getRandomInt(0, availableShapes.length - 1)];
            combo.push(wrongShape);
        } else {
            // All wrong shapes
            for (let i = 0; i < numShapes && availableShapes.length > 0; i++) {
                const idx = getRandomInt(0, availableShapes.length - 1);
                combo.push(availableShapes[idx]);
                availableShapes.splice(idx, 1);
            }
        }

        // Only add if combo is not empty
        if (combo.length > 0) {
            const comboStr = combo.sort().join(" and ");
            if (comboStr !== correctAnswer && !wrongCombinations.includes(comboStr)) {
                wrongCombinations.push(comboStr);
            }
        }
    }

    // Fallback: if we couldn't generate 3 unique combinations, fill with simple alternatives
    while (wrongCombinations.length < 3) {
        const fallbackShapes = ["Circle", "Square", "Rectangle", "Triangle"];
        const randomCombo = [];
        for (let i = 0; i < 2; i++) {
            randomCombo.push(fallbackShapes[getRandomInt(0, fallbackShapes.length - 1)]);
        }
        const comboStr = randomCombo.sort().join(" and ");
        if (comboStr !== correctAnswer && !wrongCombinations.includes(comboStr)) {
            wrongCombinations.push(comboStr);
        }
    }

    // Create MCQ options with shape icons
    const createOptionWithIcons = (shapeList) => {
        const shapes = shapeList.split(" and ");

        // Create a combined SVG with all shapes side by side
        const iconSize = 40;
        const spacing = 5;
        const totalWidth = shapes.length * iconSize + (shapes.length - 1) * spacing;

        let combinedSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='${iconSize}' viewBox='0 0 ${totalWidth} ${iconSize}'>`;

        shapes.forEach((shape, index) => {
            const xOffset = index * (iconSize + spacing);
            const shapeName = shape.trim().toLowerCase();
            let shapeContent = '';

            const half = iconSize / 2;
            switch (shapeName) {
                case "circle":
                    shapeContent = `<circle cx="${xOffset + half}" cy="${half}" r="${half - 2}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>`;
                    break;
                case "square":
                    shapeContent = `<rect x="${xOffset + 2}" y="2" width="${iconSize - 4}" height="${iconSize - 4}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>`;
                    break;
                case "rectangle":
                    shapeContent = `<rect x="${xOffset + 2}" y="${iconSize * 0.25}" width="${iconSize - 4}" height="${iconSize * 0.5}" fill="#10b981" stroke="#065f46" stroke-width="2"/>`;
                    break;
                case "triangle":
                    shapeContent = `<polygon points="${xOffset + half},2 ${xOffset + iconSize - 2},${iconSize - 2} ${xOffset + 2},${iconSize - 2}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>`;
                    break;
            }
            combinedSVG += shapeContent;
        });

        combinedSVG += '</svg>';

        return {
            value: shapeList,
            label: shapeList,
            image: `data:image/svg+xml;base64,${btoa(combinedSVG)}`
        };
    };

    const options = shuffleArray([
        createOptionWithIcons(correctAnswer),
        createOptionWithIcons(wrongCombinations[0]),
        createOptionWithIcons(wrongCombinations[1]),
        createOptionWithIcons(wrongCombinations[2])
    ]);

    return {
        type: "mcq",
        question: `Look at this ${toy.name}. Which shapes can you see in it?`,
        image: toyImage,
        topic: "Geometry / Shape Recognition",
        options: options,
        answer: correctAnswer
    };
};

// --- 3D Shape Matching Questions ---

// Helper functions to create SVG representations of 3D shapes
const createCylinderSVG = () => {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <ellipse cx='75' cy='40' rx='50' ry='15' fill='#FFD700' stroke='#000' stroke-width='2'/>
        <rect x='25' y='40' width='100' height='120' fill='#FFD700' stroke='none'/>
        <line x1='25' y1='40' x2='25' y2='160' stroke='#000' stroke-width='2'/>
        <line x1='125' y1='40' x2='125' y2='160' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='160' rx='50' ry='15' fill='#FFA500' stroke='#000' stroke-width='2'/>
        <text x='75' y='190' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cylinder</text>
    </svg>`;
};

const createSphereSVG = () => {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <circle cx='75' cy='90' r='60' fill='#FF6B6B' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='90' rx='60' ry='30' fill='none' stroke='#8B0000' stroke-width='1.5' opacity='0.3'/>
        <ellipse cx='75' cy='90' rx='30' ry='60' fill='none' stroke='#8B0000' stroke-width='1.5' opacity='0.3'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Sphere</text>
    </svg>`;
};

const createCubeSVG = () => {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 75 30 L 125 60 L 125 120 L 75 150 L 25 120 L 25 60 Z' fill='#4ECDC4' stroke='#000' stroke-width='2'/>
        <path d='M 75 30 L 75 90 L 25 120 L 25 60 Z' fill='#3BA99C' stroke='#000' stroke-width='2'/>
        <path d='M 75 30 L 125 60 L 125 120 L 75 90 Z' fill='#5FD9CF' stroke='#000' stroke-width='2'/>
        <path d='M 75 90 L 125 120 L 75 150 L 25 120 Z' fill='#2D8B80' stroke='#000' stroke-width='2'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cube</text>
    </svg>`;
};

const createCuboidSVG = () => {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 40 50 L 110 50 L 130 70 L 130 130 L 60 130 L 40 110 Z' fill='#FFE66D' stroke='#000' stroke-width='2'/>
        <path d='M 40 50 L 40 110 L 60 130 L 60 70 Z' fill='#E6C84F' stroke='#000' stroke-width='2'/>
        <path d='M 110 50 L 130 70 L 130 130 L 110 110 Z' fill='#FFF099' stroke='#000' stroke-width='2'/>
        <path d='M 60 70 L 110 70 L 110 110 L 60 110 Z' fill='#FFE66D' stroke='#000' stroke-width='2'/>
        <text x='75' y='165' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cuboid</text>
    </svg>`;
};

const createConeSVG = () => {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 75 20 L 25 140 L 125 140 Z' fill='#C77DFF' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='140' rx='50' ry='15' fill='#9D4EDD' stroke='#000' stroke-width='2'/>
        <line x1='75' y1='20' x2='75' y2='140' stroke='#7B2CBF' stroke-width='1.5' stroke-dasharray='5,3' opacity='0.5'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cone</text>
    </svg>`;
};

// Question 1: Cylinder Matching
export const generateCylinderMatching = () => {
    const correctObjects = ['Bottle', 'Chalk', 'Glue Stick', 'Pencils'];
    const wrongObjects = [
        'Globe', 'Ball', 'Marble',  // Sphere
        'Dice', 'Rubik\'s Cube', 'Chalk Box',  // Cube
        'First-Aid box', 'Book', 'Whiteboards',  // Cuboid
        'Megaphone', 'Birthday cap', 'Funnel'  // Cone
    ];

    const correctAnswer = correctObjects[getRandomInt(0, correctObjects.length - 1)];
    const shuffledWrong = shuffleArray([...wrongObjects]);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const shapeImage = `data:image/svg+xml;base64,${btoa(createCylinderSVG())}`;

    return {
        type: "mcq",
        question: "Which object is shaped like a Cylinder?",
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};

// Question 2: Sphere Matching
export const generateSphereMatching = () => {
    const correctObjects = ['Globe', 'Ball', 'Marble', 'Paperweight'];
    const wrongObjects = [
        'Bottle', 'Chalk', 'Glue Stick',  // Cylinder
        'Dice', 'Rubik\'s Cube', 'Dustbin',  // Cube
        'First-Aid box', 'Book', 'Desks',  // Cuboid
        'Megaphone', 'Birthday cap', 'Funnel'  // Cone
    ];

    const correctAnswer = correctObjects[getRandomInt(0, correctObjects.length - 1)];
    const shuffledWrong = shuffleArray([...wrongObjects]);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const shapeImage = `data:image/svg+xml;base64,${btoa(createSphereSVG())}`;

    return {
        type: "mcq",
        question: "Which object is shaped like a Sphere?",
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};

// Question 3: Cube Matching
export const generateCubeMatching = () => {
    const correctObjects = ['Dice', 'Rubik\'s Cube', 'Chalk Box', 'Dustbin'];
    const wrongObjects = [
        'Bottle', 'Chalk', 'Pencils',  // Cylinder
        'Globe', 'Ball', 'Marble',  // Sphere
        'First-Aid box', 'Book', 'Whiteboards',  // Cuboid
        'Megaphone', 'Birthday cap', 'Funnel'  // Cone
    ];

    const correctAnswer = correctObjects[getRandomInt(0, correctObjects.length - 1)];
    const shuffledWrong = shuffleArray([...wrongObjects]);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const shapeImage = `data:image/svg+xml;base64,${btoa(createCubeSVG())}`;

    return {
        type: "mcq",
        question: "Which object is shaped like a Cube?",
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};

// Question 4: Cuboid Matching
export const generateCuboidMatching = () => {
    const correctObjects = ['First-Aid box', 'Book', 'Whiteboards', 'Desks'];
    const wrongObjects = [
        'Bottle', 'Chalk', 'Glue Stick',  // Cylinder
        'Globe', 'Ball', 'Paperweight',  // Sphere
        'Dice', 'Rubik\'s Cube', 'Chalk Box',  // Cube
        'Megaphone', 'Birthday cap', 'Funnel'  // Cone
    ];

    const correctAnswer = correctObjects[getRandomInt(0, correctObjects.length - 1)];
    const shuffledWrong = shuffleArray([...wrongObjects]);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const shapeImage = `data:image/svg+xml;base64,${btoa(createCuboidSVG())}`;

    return {
        type: "mcq",
        question: "Which object is shaped like a Cuboid?",
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};

// Question 5: Cone Matching
export const generateConeMatching = () => {
    const correctObjects = ['Megaphone', 'Birthday cap', 'Funnel'];
    const wrongObjects = [
        'Bottle', 'Chalk', 'Pencils',  // Cylinder
        'Globe', 'Ball', 'Marble',  // Sphere
        'Dice', 'Rubik\'s Cube', 'Dustbin',  // Cube
        'First-Aid box', 'Book', 'Whiteboards'  // Cuboid
    ];

    const correctAnswer = correctObjects[getRandomInt(0, correctObjects.length - 1)];
    const shuffledWrong = shuffleArray([...wrongObjects]);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const shapeImage = `data:image/svg+xml;base64,${btoa(createConeSVG())}`;

    return {
        type: "mcq",
        question: "Which object is shaped like a Cone?",
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};


// Helper function to create simple SVG icons for objects
const createObjectIcon = (objectName) => {
    const size = 80;
    let svgContent = '';

    switch (objectName) {
        case 'Bottle':
            svgContent = `
                <rect x="30" y="15" width="20" height="10" fill="#4299e1" stroke="#2b6cb0" stroke-width="2" rx="2"/>
                <rect x="25" y="25" width="30" height="45" fill="#63b3ed" stroke="#2b6cb0" stroke-width="2" rx="3"/>
                <ellipse cx="40" cy="35" rx="8" ry="12" fill="#bee3f8" opacity="0.5"/>
            `;
            break;
        case 'Chalk':
            svgContent = `
                <rect x="20" y="15" width="40" height="50" fill="#f7fafc" stroke="#cbd5e0" stroke-width="2" rx="20"/>
                <line x1="25" y1="25" x2="55" y2="25" stroke="#e2e8f0" stroke-width="2"/>
                <line x1="25" y1="55" x2="55" y2="55" stroke="#e2e8f0" stroke-width="2"/>
            `;
            break;
        case 'Glue Stick':
            svgContent = `
                <rect x="25" y="10" width="30" height="15" fill="#9f7aea" stroke="#6b46c1" stroke-width="2" rx="3"/>
                <rect x="28" y="25" width="24" height="45" fill="#d6bcfa" stroke="#6b46c1" stroke-width="2" rx="12"/>
            `;
            break;
        case 'Pencils':
            svgContent = `
                <polygon points="40,10 45,20 35,20" fill="#f6ad55" stroke="#c05621" stroke-width="1.5"/>
                <rect x="35" y="20" width="10" height="45" fill="#fbd38d" stroke="#c05621" stroke-width="2"/>
                <rect x="35" y="60" width="10" height="8" fill="#fc8181" stroke="#c05621" stroke-width="1.5"/>
            `;
            break;
        case 'Globe':
            svgContent = `
                <circle cx="40" cy="40" r="25" fill="#4299e1" stroke="#2b6cb0" stroke-width="2"/>
                <ellipse cx="40" cy="40" rx="25" ry="12" fill="none" stroke="#2c5282" stroke-width="1.5"/>
                <ellipse cx="40" cy="40" rx="12" ry="25" fill="none" stroke="#2c5282" stroke-width="1.5"/>
                <line x1="40" y1="15" x2="40" y2="65" stroke="#2c5282" stroke-width="1.5"/>
            `;
            break;
        case 'Ball':
            svgContent = `
                <circle cx="40" cy="40" r="25" fill="#fc8181" stroke="#c53030" stroke-width="2"/>
                <path d="M 20 30 Q 40 25 60 30" fill="none" stroke="#e53e3e" stroke-width="2"/>
                <path d="M 20 50 Q 40 55 60 50" fill="none" stroke="#e53e3e" stroke-width="2"/>
                <circle cx="40" cy="40" r="18" fill="none" stroke="#e53e3e" stroke-width="2"/>
            `;
            break;
        case 'Marble':
            svgContent = `
                <circle cx="40" cy="40" r="20" fill="#9f7aea" stroke="#6b46c1" stroke-width="2"/>
                <circle cx="35" cy="35" r="8" fill="#d6bcfa" opacity="0.7"/>
                <circle cx="32" cy="32" r="4" fill="#faf5ff"/>
            `;
            break;
        case 'Paperweight':
            svgContent = `
                <ellipse cx="40" cy="55" rx="22" ry="8" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>
                <path d="M 18 55 L 30 25 L 50 25 L 62 55" fill="#e2e8f0" stroke="#4a5568" stroke-width="2"/>
                <circle cx="40" cy="30" r="6" fill="#4299e1"/>
            `;
            break;
        case 'Dice':
            svgContent = `
                <rect x="20" y="20" width="40" height="40" fill="#f7fafc" stroke="#2d3748" stroke-width="2" rx="4"/>
                <circle cx="30" cy="30" r="3" fill="#2d3748"/>
                <circle cx="50" cy="30" r="3" fill="#2d3748"/>
                <circle cx="30" cy="50" r="3" fill="#2d3748"/>
                <circle cx="50" cy="50" r="3" fill="#2d3748"/>
                <circle cx="40" cy="40" r="3" fill="#2d3748"/>
            `;
            break;
        case "Rubik's Cube":
            svgContent = `
                <rect x="15" y="25" width="15" height="15" fill="#fc8181" stroke="#2d3748" stroke-width="1.5"/>
                <rect x="30" y="25" width="15" height="15" fill="#4299e1" stroke="#2d3748" stroke-width="1.5"/>
                <rect x="45" y="25" width="15" height="15" fill="#48bb78" stroke="#2d3748" stroke-width="1.5"/>
                <rect x="15" y="40" width="15" height="15" fill="#fbd38d" stroke="#2d3748" stroke-width="1.5"/>
                <rect x="30" y="40" width="15" height="15" fill="#f7fafc" stroke="#2d3748" stroke-width="1.5"/>
                <rect x="45" y="40" width="15" height="15" fill="#9f7aea" stroke="#2d3748" stroke-width="1.5"/>
            `;
            break;
        case 'Chalk Box':
            svgContent = `
                <rect x="15" y="25" width="50" height="35" fill="#fbd38d" stroke="#c05621" stroke-width="2" rx="3"/>
                <rect x="20" y="30" width="8" height="25" fill="#f7fafc" stroke="#cbd5e0" stroke-width="1.5" rx="4"/>
                <rect x="32" y="30" width="8" height="25" fill="#fc8181" stroke="#c53030" stroke-width="1.5" rx="4"/>
                <rect x="44" y="30" width="8" height="25" fill="#4299e1" stroke="#2b6cb0" stroke-width="1.5" rx="4"/>
            `;
            break;
        case 'Dustbin':
            svgContent = `
                <rect x="22" y="20" width="36" height="5" fill="#4a5568" stroke="#2d3748" stroke-width="2" rx="2"/>
                <path d="M 25 25 L 28 60 L 52 60 L 55 25" fill="#718096" stroke="#2d3748" stroke-width="2"/>
                <line x1="35" y1="30" x2="37" y2="55" stroke="#4a5568" stroke-width="2"/>
                <line x1="45" y1="30" x2="43" y2="55" stroke="#4a5568" stroke-width="2"/>
            `;
            break;
        case 'First-Aid box':
            svgContent = `
                <rect x="15" y="25" width="50" height="35" fill="#f7fafc" stroke="#e53e3e" stroke-width="3" rx="4"/>
                <rect x="37" y="30" width="6" height="25" fill="#fc8181" stroke="#c53030" stroke-width="2"/>
                <rect x="27" y="40" width="26" height="6" fill="#fc8181" stroke="#c53030" stroke-width="2"/>
            `;
            break;
        case 'Book':
            svgContent = `
                <rect x="20" y="20" width="40" height="50" fill="#4299e1" stroke="#2b6cb0" stroke-width="2" rx="2"/>
                <rect x="22" y="22" width="36" height="46" fill="#63b3ed" stroke="#2b6cb0" stroke-width="1"/>
                <line x1="25" y1="20" x2="25" y2="70" stroke="#2c5282" stroke-width="2"/>
            `;
            break;
        case 'Whiteboards':
            svgContent = `
                <rect x="10" y="15" width="60" height="50" fill="#f7fafc" stroke="#2d3748" stroke-width="3" rx="3"/>
                <line x1="15" y1="25" x2="45" y2="25" stroke="#4299e1" stroke-width="2"/>
                <line x1="15" y1="35" x2="55" y2="35" stroke="#48bb78" stroke-width="2"/>
                <circle cx="60" cy="55" r="4" fill="#fc8181"/>
            `;
            break;
        case 'Desks':
            svgContent = `
                <rect x="15" y="20" width="50" height="8" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>
                <rect x="18" y="28" width="6" height="35" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>
                <rect x="56" y="28" width="6" height="35" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>
            `;
            break;
        case 'Megaphone':
            svgContent = `
                <path d="M 20 40 L 35 30 L 35 50 Z" fill="#fbd38d" stroke="#c05621" stroke-width="2"/>
                <path d="M 35 30 L 60 20 L 60 60 L 35 50 Z" fill="#f6ad55" stroke="#c05621" stroke-width="2"/>
                <rect x="30" y="45" width="15" height="8" fill="#fc8181" stroke="#c05621" stroke-width="2" rx="2"/>
            `;
            break;
        case 'Birthday cap':
            svgContent = `
                <path d="M 40 10 L 20 55 L 60 55 Z" fill="#9f7aea" stroke="#6b46c1" stroke-width="2"/>
                <ellipse cx="40" cy="55" rx="20" ry="6" fill="#d6bcfa" stroke="#6b46c1" stroke-width="2"/>
                <circle cx="40" cy="10" r="5" fill="#fbd38d"/>
                <line x1="25" y1="45" x2="55" y2="45" stroke="#d6bcfa" stroke-width="2"/>
            `;
            break;
        case 'Funnel':
            svgContent = `
                <path d="M 20 15 L 60 15 L 45 45 L 35 45 Z" fill="#e2e8f0" stroke="#4a5568" stroke-width="2"/>
                <rect x="35" y="45" width="10" height="20" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>
                <ellipse cx="40" cy="15" rx="20" ry="5" fill="#f7fafc" stroke="#4a5568" stroke-width="2"/>
            `;
            break;
        default:
            svgContent = `<circle cx="40" cy="40" r="25" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>`;
    }

    return `data:image/svg+xml;base64,${btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${svgContent}</svg>`)}`;
};

// Single Dynamic 3D Shape Matching Question (Randomly picks from all 5 shapes)
export const generate3DShapeMatching = () => {
    // Define all shapes with their properties
    const shapes = {
        'Cylinder': {
            name: 'Cylinder',
            objects: ['Bottle', 'Chalk', 'Glue Stick', 'Pencils'],
            svg: createCylinderSVG()
        },
        'Sphere': {
            name: 'Sphere',
            objects: ['Globe', 'Ball', 'Marble', 'Paperweight'],
            svg: createSphereSVG()
        },
        'Cube': {
            name: 'Cube',
            objects: ['Dice', 'Rubik\'s Cube', 'Chalk Box', 'Dustbin'],
            svg: createCubeSVG()
        },
        'Cuboid': {
            name: 'Cuboid',
            objects: ['First-Aid box', 'Book', 'Whiteboards', 'Desks'],
            svg: createCuboidSVG()
        },
        'Cone': {
            name: 'Cone',
            objects: ['Megaphone', 'Birthday cap', 'Funnel'],
            svg: createConeSVG()
        }
    };

    // Randomly select one shape
    const shapeNames = Object.keys(shapes);
    const selectedShapeName = shapeNames[getRandomInt(0, shapeNames.length - 1)];
    const selectedShape = shapes[selectedShapeName];

    // Get correct answer (one of the objects for this shape)
    const correctAnswer = selectedShape.objects[getRandomInt(0, selectedShape.objects.length - 1)];

    // Generate wrong answers from other shapes
    const wrongObjects = [];
    for (const shapeName of shapeNames) {
        if (shapeName !== selectedShapeName) {
            // Add all objects from other shapes
            wrongObjects.push(...shapes[shapeName].objects);
        }
    }

    // Shuffle and pick 3 wrong answers
    const shuffledWrong = shuffleArray(wrongObjects);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    // Create options with proper format AND visual icons for Grade 3 students
    const allOptions = [
        {
            value: correctAnswer,
            label: correctAnswer,
            image: createObjectIcon(correctAnswer)
        },
        {
            value: wrongAnswers[0],
            label: wrongAnswers[0],
            image: createObjectIcon(wrongAnswers[0])
        },
        {
            value: wrongAnswers[1],
            label: wrongAnswers[1],
            image: createObjectIcon(wrongAnswers[1])
        },
        {
            value: wrongAnswers[2],
            label: wrongAnswers[2],
            image: createObjectIcon(wrongAnswers[2])
        }
    ];

    // Shuffle options
    const options = shuffleArray(allOptions);

    // Create SVG image
    const shapeImage = `data:image/svg+xml;base64,${btoa(selectedShape.svg)}`;

    return {
        type: "mcq",
        question: `Which object is shaped like a ${selectedShape.name}?`,
        image: shapeImage,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: correctAnswer
    };
};
