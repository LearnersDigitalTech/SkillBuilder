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
    const num2 = getRandomInt(2, 10);
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
export const generateNumberReading = () => {
    // Generate a random number between 1 and 100
    const number = getRandomInt(1, 100);

    // Function to convert a number to its word form
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

    const numberInWords = numberToWords(number);

    // Randomly choose the type of question: either a numeral or a number name
    const isNumeralQuestion = Math.random() < 0.5; // 50% chance

    let question;
    let options;

    if (isNumeralQuestion) {
        // The question asks for the number name, given the numeral
        question = `What is the number name for: $ ${number} $`;

        // Create options as number names (words)
        options = shuffleArray([
            { value: numberInWords, label: numberInWords }, // correct number name
            { value: numberToWords(getRandomInt(1, 100)), label: numberToWords(getRandomInt(1, 100)) }, // random number name
            { value: numberToWords(getRandomInt(1, 100)), label: numberToWords(getRandomInt(1, 100)) }, // random number name
            { value: numberToWords(getRandomInt(1, 100)), label: numberToWords(getRandomInt(1, 100)) } // random number name
        ]);
    } else {
        // The question asks for the numeral, given the number name
        question = `What is the number for: $ ${numberInWords} $`;

        // Create options as numerals (numbers)
        options = shuffleArray([
            { value: number.toString(), label: number.toString() }, // correct numeral
            { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() }, // random numeral
            { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() }, // random numeral
            { value: getRandomInt(1, 100).toString(), label: getRandomInt(1, 100).toString() } // random numeral
        ]);
    }

    return {
        type: "mcq",
        question: question,
        topic: "Measurement / Numbers",
        options: options,
        answer: isNumeralQuestion ? numberInWords : number.toString()
    };
};

export const generateDoublingHalvingQuestion = () => {
    // Generate a random number between 1 and 50 for simplicity
    const number = getRandomInt(1, 50);

    // Randomly decide whether the question is about doubling or halving
    const isDoubling = Math.random() < 0.5; // 50% chance of doubling or halving

    let question;
    let correctAnswer;

    // Doubling or halving logic
    if (isDoubling) {
        question = `What is double of $ ${number} $`;
        correctAnswer = number * 2;
    } else {
        question = `What is half of $ ${number} $`;
        correctAnswer = number / 2;
    }

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
        { value: correctAnswer, label: correctAnswer.toString() },
        { value: generateRandomIncorrectAnswer(), label: generateRandomIncorrectAnswer().toString() },
        { value: generateRandomIncorrectAnswer(), label: generateRandomIncorrectAnswer().toString() },
        { value: generateRandomIncorrectAnswer(), label: generateRandomIncorrectAnswer().toString() }
    ]);

    return {
        type: "mcq",
        question: question,
        topic: "Doubling and Halving",
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
