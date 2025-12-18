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


export const generatePlaceValue5DigitVisual = () => {
    // Generate 5-digit number
    const num = getRandomInt(10000, 99999);
    const numStr = String(num);

    // Pick a random non-zero digit
    let pos = getRandomInt(0, 4);
    while (numStr[pos] === '0') {
        pos = getRandomInt(0, 4);
    }
    const digit = numStr[pos];

    const places = ["Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"];
    const values = [10000, 1000, 100, 10, 1];

    // Calculate place value
    const placeValue = Number(digit) * values[pos];

    // SVG dimensions
    const width = 550;
    const height = 120;
    const cellWidth = 100;
    const cellHeight = 50;
    const padding = 10;

    // Create SVG table for the number
    let svgParts = [
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
        `<rect width="100%" height="100%" fill="white" />`
    ];

    // Draw cells and digits
    for (let i = 0; i < 5; i++) {
        const x = padding + i * cellWidth;
        const y = 20;
        // Highlight the chosen digit
        const fillColor = i === pos ? "#f4a261" : "#a8dadc";

        // Cell rectangle
        svgParts.push(`<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${fillColor}" stroke="#1d3557" stroke-width="2"/>`);

        // Digit text
        svgParts.push(`<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 6}" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">${numStr[i]}</text>`);

        // Place label
        svgParts.push(`<text x="${x + cellWidth / 2}" y="${y + cellHeight + 20}" font-family="Arial" font-size="14" text-anchor="middle">${places[i]}</text>`);
    }

    svgParts.push(`</svg>`);

    const svgString = svgParts.join('');
    const base64Svg = typeof Buffer !== 'undefined'
        ? Buffer.from(svgString).toString('base64')
        : btoa(svgString);
    const imagePath = `data:image/svg+xml;base64,${base64Svg}`;

    const question = `Look at the table below and find the place value of the highlighted digit.`;

    return {
        type: "userInput",
        topic: "Number Sense / Place Value",
        question: question,
        answer: String(placeValue),
        image: imagePath
    };
};




// export const generateAddition4Digit = () => {
//     const num1 = getRandomInt(1000, 5000);
//     const num2 = getRandomInt(1000, 4999);
//     const answer = num1 + num2;

//     const question = `Add: ${num1} + ${num2} = ?`;

//     return {
//         type: "userInput",
//         question: question,
//         topic: "Number Sense / Addition",
//         answer: String(answer)
//     };
// };

export const generateExpandedForm = () => {
    const num = getRandomInt(1000, 9999);
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

export const generateAddition4Digit = () => {
    const num1 = getRandomInt(1000, 5000);
    const num2 = getRandomInt(1000, 4999);
    // Ensure carry
    const u1 = num1 % 10;
    const u2 = num2 % 10;
    if (u1 + u2 < 10) return generateAddition4Digit(); // Retry if no carry

    const answer = num1 + num2;

    return {
        type: "userInput",
        question: `Add: $$ ${num1} + ${num2} = ? $$`,
        topic: "Addition / With Carry",
        answer: String(answer)
    };
};

export const generateAddition4DigitAppliactionLevel = () => {
    const num1 = getRandomInt(1000, 5000);
    const num2 = getRandomInt(1000, 4999);

    // Ensure carry
    const u1 = num1 % 10;
    const u2 = num2 % 10;
    if (u1 + u2 < 10) return generateAddition4DigitAppliactionLevel(); // Retry if no carry

    const scenarios = [
        `You bought a toy for $${num1}$ and a storybook for $${num2}$ How much did you spend?`,
        `You bought pencils for $${num1}$ and crayons for $${num2}$ What is the total cost?`,
        `You bought a backpack for $${num1}$ and a water bottle for $${num2}$ How much did you pay altogether?`,
        `You bought chocolates for $${num1}$ and ice cream for $${num2}$ How much did you spend in total?`,
        `You bought shoes for $${num1}$ and socks for $${num2}$ How much is the total?`,
        `You bought a football for $${num1}$ and a jersey for $${num2}$ What is the total amount?`,
        `You bought notebooks for $${num1}$ and a lunch box for $${num2}$ How much did you spend?`,
        `You bought a puzzle for $${num1}$ and a coloring book for $${num2}$ What is the total?`,
        `You bought stickers for $${num1}$ and markers for $${num2}$ How much did you spend altogether?`,
        `You bought a teddy bear for $${num1}$ and a toy car for $${num2}$ What is the total cost?`
    ];

    const question = scenarios[Math.floor(Math.random() * scenarios.length)];
    const answer = num1 + num2;

    return {
        type: "userInput",
        topic: "Addition / With Carry",
        question,
        answer: String(answer)
    };
};


// export const generateSubtraction4Digit = () => {
//     const num1 = getRandomInt(5000, 9999);
//     const num2 = getRandomInt(1000, 4999);
//     const answer = num1 - num2;

//     const question = `Subtract: ${num1} - ${num2} = ?`;

//     return {
//         type: "userInput",
//         question: question,
//         topic: "Number Sense / Subtraction",
//         answer: String(answer)
//     };
// };

export const generateSubtraction4Digit = () => {
    const num1 = getRandomInt(5000, 9999);
    const num2 = getRandomInt(1000, 4999);
    // Ensure borrow
    const u1 = num1 % 10;
    const u2 = num2 % 10;
    if (u1 >= u2) return generateSubtraction4Digit(); // Retry if no borrow needed

    const answer = num1 - num2;

    return {
        type: "userInput",
        question: `Subtract: $$ ${num1} - ${num2} = ? $$`,
        topic: "Subtraction / With Borrow",
        answer: String(answer)
    };
};

export const generateSubtraction4DigitAppliactionLevel = () => {
    const num1 = getRandomInt(5000, 9999);
    const num2 = getRandomInt(1000, 4999);

    // Ensure borrow
    const u1 = num1 % 10;
    const u2 = num2 % 10;
    if (u1 >= u2) return generateSubtraction4DigitAppliactionLevel(); // Retry if no borrow needed

    const scenarios = [
        `You had ${num1} stickers. You gave ${num2} stickers to your friend. How many stickers are left?`,
        `A shop had ${num1} pencils. It sold ${num2} pencils. How many pencils remain?`,
        `A library had ${num1} books. After students borrowed ${num2} books, how many books are still there?`,
        `You collected ${num1} coins. You spent ${num2} coins. How many coins do you have now?`,
        `There were ${num1} visitors at a park. ${num2} visitors left. How many visitors are still in the park?`,
        `A farmer had ${num1} apples. He sold ${num2} apples. How many apples are left?`,
        `Your school printed ${num1} worksheets. Teachers used ${num2} worksheets. How many are left?`,
        `A toy store had ${num1} balloons. ${num2} balloons flew away. How many balloons remain?`,
        `You walked ${num1} steps today. You rested after ${num2} steps. How many more steps are needed?`,
        `A museum had ${num1} tickets available. ${num2} tickets were sold. How many tickets remain?`
    ];

    const question = scenarios[Math.floor(Math.random() * scenarios.length)];
    const answer = num1 - num2;

    return {
        type: "userInput",
        topic: "Subtraction / With Borrow",
        question,
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
    const question = `Multiply: $$ ${num1} × ${num2} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Multiplication",
        answer: String(answer)
    };
};

export const generateMultiplicationApplicationLevel = () => {
    const num1 = getRandomInt(10, 99);
    const num2 = getRandomInt(10, 99);

    const scenarios = [
        `Each box has ${num1} chocolates. If you buy ${num2} boxes, how many chocolates do you have in total?`,
        `A teacher printed ${num1} worksheets for each class. There are ${num2} classes. How many worksheets did she print?`,
        `You collected ${num1} stickers each day for ${num2} days. How many stickers did you collect in total?`,
        `A garden has ${num1} rows of plants and ${num2} plants in each row. How many plants are there altogether?`,
        `A toy shop packs ${num1} toys in one carton. If it has ${num2} cartons, how many toys are there?`,
        `A school bought ${num1} pencils for each student. There are ${num2} students. How many pencils were bought in total?`,
        `A farmer planted ${num1} seeds in each row. He made ${num2} rows. How many seeds did he plant?`,
        `Each notebook has ${num1} pages. If you buy ${num2} notebooks, how many pages do you have?`,
        `You read ${num1} pages each day for ${num2} days. How many pages did you read?`,
        `A box has ${num1} marbles. You bought ${num2} boxes. How many marbles do you have altogether?`
    ];

    const question = scenarios[Math.floor(Math.random() * scenarios.length)];
    const answer = num1 * num2;

    return {
        type: "userInput",
        topic: "Multiplication / 2-digit × 2-digit",
        question,
        answer: String(answer)
    };
};


export const generateDivision = () => {
    // 3-digit or 4-digit divided by 1-digit
    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(100, 500);
    const dividend = divisor * quotient; // Ensure no remainder for simplicity first

    const question = `Divide: $$ \\frac{${dividend}}{${divisor}} = ? $$`;

    return {
        type: "userInput",
        question: question,
        topic: "Number Sense / Division",
        answer: String(quotient)
    };
};

export const generateDivisionApplicationLevel = () => {
    // 3-digit dividend, 1-digit divisor
    const divisor = getRandomInt(2, 9);
    const quotient = getRandomInt(10, 99); // so dividend becomes 3-digit
    const dividend = divisor * quotient; // ensures no remainder

    const scenarios = [
        `You have ${dividend} candies. You want to share them equally among ${divisor} friends. How many candies does each friend get?`,
        `A teacher has ${dividend} stickers. She divides them equally among ${divisor} students. How many stickers does each student get?`,
        `A farmer collected ${dividend} apples. He packed them equally into ${divisor} baskets. How many apples go in each basket?`,
        `There are ${dividend} pages to read in a book. You want to read the same number of pages for ${divisor} days. How many pages will you read each day?`,
        `A shopkeeper has ${dividend} balloons. He ties them into groups of ${divisor}. How many groups can he make?`,
        `A library has ${dividend} books to arrange. The bookshelves hold equal numbers and there are ${divisor} shelves. How many books go on each shelf?`,
        `You collected ${dividend} coins and want to put them equally into ${divisor} jars. How many coins go in each jar?`,
        `A box has ${dividend} crayons. You want to pack them into sets of ${divisor}. How many crayons are in each set?`,
        `A class folded ${dividend} paper airplanes. They divide them equally among ${divisor} teams. How many airplanes does each team get?`,
        `A baker made ${dividend} cookies and packed them equally into ${divisor} boxes. How many cookies go in each box?`
    ];

    const question = scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
        type: "userInput",
        topic: "Division / 3-digit ÷ 1-digit",
        question,
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

export const generateLCM = () => {
    const num1 = getRandomInt(2, 10);
    const num2 = getRandomInt(2, 10);

    // helper to calculate LCM
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (num1 * num2) / gcd(num1, num2);

    const question = `Find the LCM of ${num1} and ${num2}.`;
    const answer = String(lcm);

    return {
        type: "userInput",
        topic: "Number Sense / LCM",
        question,
        answer
    };
};


// --- Fractions ---
// Helper: compute gcd
const gcd = (a, b) => {
    if (b === 0) return a;
    return gcd(b, a % b);
};

// Function 1: Proper vs Improper Fractions (50% chance each)
export const generateProperImproperFractions = () => {
    const types = ["Proper Fraction", "Improper Fraction"];
    const type = types[getRandomInt(0, 1)]; // 50% chance each
    let question, answer, imagePath;

    if (type === "Proper Fraction") {
        // Select random proper fraction image (1-4)
        const imageNum = getRandomInt(1, 4);
        imagePath = `/assets/grade4/proper_fraction_${imageNum}.png`;

        question = `Identify the type of fraction shown in the image:`;
        answer = "Proper Fraction";

    } else { // Improper Fraction
        // Select random improper fraction image (1-3)
        const imageNum = getRandomInt(1, 3);
        imagePath = `/assets/grade4/improper_fraction_${imageNum}.png`;

        question = `Identify the type of fraction shown in the image:`;
        answer = "Improper Fraction";
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
        answer: answer,
        image: imagePath
    };
};

// Function 2: Mixed vs Unit Fractions (50% chance each)
export const generateMixedUnitFractions = () => {
    const types = ["Mixed Fraction", "Unit Fraction"];
    const type = types[getRandomInt(0, 1)]; // 50% chance each
    let question, answer, imagePath;

    if (type === "Mixed Fraction") {
        // Select random mixed fraction image (1-3)
        const imageNum = getRandomInt(1, 3);
        imagePath = `/assets/grade4/mixed_fraction_${imageNum}.png`;

        question = `Identify the type of fraction shown in the image`;
        answer = "Mixed Fraction";

    } else { // Unit Fraction
        // Select random unit fraction image (1-4)
        const imageNum = getRandomInt(1, 4);
        imagePath = `/assets/grade4/unit_fraction_${imageNum}.png`;

        question = `Identify the type of fraction shown in the image`;
        answer = "Unit Fraction";
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
        answer: answer,
        image: imagePath
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
        question = `Solve: $$ \\frac{${num1}}{${den}} + \\frac{${num2}}{${den}} = ? $$`;
    } else {
        // Ensure num1 > num2 for subtraction
        const n1 = Math.max(num1, num2);
        const n2 = Math.min(num1, num2);
        answerNum = n1 - n2;
        question = `Solve: $$ \\frac{${n1}}{${den}} - \\frac{${n2}}{${den}} = ? $$`;
    }

    const answer = `$$ \\frac{${answerNum}}{${den}} $$`;

    const options = shuffleArray([
        { value: answer, label: answer },
        { value: `$$ \\frac{${answerNum + 1}}{${den}} $$`, label: `$$ \\frac{${answerNum + 1}}{${den}} $$` },
        { value: `$$ \\frac{${answerNum}}{${den + 1}} $$`, label: `$$ \\frac{${answerNum}}{${den + 1}} $$` },
        { value: `$$ \\frac{${den}}{${answerNum}} $$`, label: `$$ \\frac{${den}}{${answerNum}} $$` }
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
    const types = ["Acute", "Obtuse", "Right", "Straight"];
    const type = types[getRandomInt(0, 3)];
    let imagePath, question;

    if (type === "Acute") {
        // 3 acute angle images available
        const imageNum = getRandomInt(1, 3);
        imagePath = `/assets/grade4/acute_angle_${imageNum}.png`;
        question = `Identify the type of angle shown in the image`;

    } else if (type === "Obtuse") {
        // 3 obtuse angle images available
        const imageNum = getRandomInt(1, 3);
        imagePath = `/assets/grade4/obtuse_angle_${imageNum}.png`;
        question = `Identify the type of angle shown in the image`;

    } else if (type === "Right") {
        // 2 right angle images available
        const imageNum = getRandomInt(1, 2);
        imagePath = `/assets/grade4/right_angle_${imageNum}.png`;
        question = `Identify the type of angle shown in the image`;

    } else { // Straight
        // 1 straight angle image available
        imagePath = `/assets/grade4/straight_angle_1.png`;
        question = `Identify the type of angle shown in the image`;
    }

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
        answer: type,
        image: imagePath
    };
};

export const generateTriangles = () => {
    const types = ["Equilateral", "Isosceles", "Scalene"];
    const type = types[getRandomInt(0, 2)];
    let imagePath;

    // Select random image variant (1 or 2)
    const imageNum = getRandomInt(1, 2);

    if (type === "Equilateral") {
        imagePath = `/assets/grade4/triangle_equilateral_${imageNum}.svg`;
    } else if (type === "Isosceles") {
        imagePath = `/assets/grade4/triangle_isosceles_${imageNum}.svg`;
    } else {
        imagePath = `/assets/grade4/triangle_scalene_${imageNum}.svg`;
    }

    const question = "Identify the type of triangle based on the side lengths shown in the image:";

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
        answer: type,
        image: imagePath
    };
};

// --- Measurement ---


export const generateAreaShape = () => {
    // randomly choose: 0 = rectangle, 1 = square
    const shapeType = getRandomInt(0, 1);

    if (shapeType === 0) {
        // Rectangle
        const l = getRandomInt(2, 10);
        const b = getRandomInt(2, 10);
        const area = l * b;

        // Generate SVG for rectangle
        const width = 300;
        const height = 250;
        const padding = 50;

        // Scale the rectangle proportionally
        const maxDim = Math.max(l, b);
        const scale = 150 / maxDim;
        const rectWidth = l * scale;
        const rectHeight = b * scale;

        const rectX = (width - rectWidth) / 2;
        const rectY = (height - rectHeight) / 2;

        const svgParts = [
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
            `<rect width="100%" height="100%" fill="white" />`,
            // Rectangle
            `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="#a8dadc" stroke="#1d3557" stroke-width="3"/>`,
            // Length label (top)
            `<text x="${rectX + rectWidth / 2}" y="${rectY - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${l}cm</text>`,
            // Breadth label (right side)
            `<text x="${rectX + rectWidth + 20}" y="${rectY + rectHeight / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${b}cm</text>`,
            `</svg>`
        ];

        const svgString = svgParts.join('');
        const base64Svg = typeof Buffer !== 'undefined'
            ? Buffer.from(svgString).toString('base64')
            : btoa(svgString);
        const imagePath = `data:image/svg+xml;base64,${base64Svg}`;

        return {
            type: "userInput",
            topic: "Measurement / Area",
            question: `Find the area of the rectangle shown in the image:`,
            answer: String(area),
            image: imagePath
        };
    } else {
        // Square
        const side = getRandomInt(2, 10);
        const area = side * side;

        // Generate SVG for square
        const width = 300;
        const height = 250;

        const squareSize = 150;
        const squareX = (width - squareSize) / 2;
        const squareY = (height - squareSize) / 2;

        const svgParts = [
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
            `<rect width="100%" height="100%" fill="white" />`,
            // Square
            `<rect x="${squareX}" y="${squareY}" width="${squareSize}" height="${squareSize}" fill="#f4a261" stroke="#1d3557" stroke-width="3"/>`,
            // Side label (top)
            `<text x="${squareX + squareSize / 2}" y="${squareY - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${side}cm</text>`,
            // Side label (right)
            `<text x="${squareX + squareSize + 20}" y="${squareY + squareSize / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${side}cm</text>`,
            `</svg>`
        ];

        const svgString = svgParts.join('');
        const base64Svg = typeof Buffer !== 'undefined'
            ? Buffer.from(svgString).toString('base64')
            : btoa(svgString);
        const imagePath = `data:image/svg+xml;base64,${base64Svg}`;

        return {
            type: "userInput",
            topic: "Measurement / Area",
            question: `Find the area of the square shown in the image:`,
            answer: String(area),
            image: imagePath
        };
    }
};



export const generatePerimeterShape = () => {
    // 0 = rectangle, 1 = square (50% chance each)
    const shapeType = getRandomInt(0, 1);

    if (shapeType === 0) {
        // Rectangle
        const l = getRandomInt(2, 10);
        const b = getRandomInt(2, 10);
        const perimeter = 2 * (l + b);

        // Generate SVG for rectangle
        const width = 300;
        const height = 250;

        // Scale the rectangle proportionally
        const maxDim = Math.max(l, b);
        const scale = 150 / maxDim;
        const rectWidth = l * scale;
        const rectHeight = b * scale;

        const rectX = (width - rectWidth) / 2;
        const rectY = (height - rectHeight) / 2;

        const svgParts = [
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
            `<rect width="100%" height="100%" fill="white" />`,
            // Rectangle
            `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="#a8dadc" stroke="#1d3557" stroke-width="3"/>`,
            // Length label (top)
            `<text x="${rectX + rectWidth / 2}" y="${rectY - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${l}cm</text>`,
            // Breadth label (right side)
            `<text x="${rectX + rectWidth + 20}" y="${rectY + rectHeight / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${b}cm</text>`,
            `</svg>`
        ];

        const svgString = svgParts.join('');
        const base64Svg = typeof Buffer !== 'undefined'
            ? Buffer.from(svgString).toString('base64')
            : btoa(svgString);
        const imagePath = `data:image/svg+xml;base64,${base64Svg}`;

        return {
            type: "userInput",
            topic: "Measurement / Perimeter",
            question: `Find the perimeter of the rectangle shown in the image:`,
            answer: String(perimeter),
            image: imagePath
        };
    } else {
        // Square
        const side = getRandomInt(2, 10);
        const perimeter = 4 * side;

        // Generate SVG for square
        const width = 300;
        const height = 250;

        const squareSize = 150;
        const squareX = (width - squareSize) / 2;
        const squareY = (height - squareSize) / 2;

        const svgParts = [
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
            `<rect width="100%" height="100%" fill="white" />`,
            // Square
            `<rect x="${squareX}" y="${squareY}" width="${squareSize}" height="${squareSize}" fill="#f4a261" stroke="#1d3557" stroke-width="3"/>`,
            // Side label (top)
            `<text x="${squareX + squareSize / 2}" y="${squareY - 10}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${side}cm</text>`,
            // Side label (right)
            `<text x="${squareX + squareSize + 20}" y="${squareY + squareSize / 2}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${side}cm</text>`,
            `</svg>`
        ];

        const svgString = svgParts.join('');
        const base64Svg = typeof Buffer !== 'undefined'
            ? Buffer.from(svgString).toString('base64')
            : btoa(svgString);
        const imagePath = `data:image/svg+xml;base64,${base64Svg}`;

        return {
            type: "userInput",
            topic: "Measurement / Perimeter",
            question: `Find the perimeter of the square shown in the image:`,
            answer: String(perimeter),
            image: imagePath
        };
    }
};



export const generateMeasurementConversion = () => {
    const types = ["Time", "Capacity", "Length", "Mass"];
    const type = types[getRandomInt(0, 3)];
    let question, answer, topic;

    if (type === "Time") {
        const hours = getRandomInt(2, 10);
        const minutes = hours * 60;
        question = `Convert ${hours} hours to minutes.`;
        topic = "Measurement / Time";
        answer = String(minutes);
    } else if (type === "Capacity") {
        // Litre to ml (1 L = 1000 ml)
        const liters = getRandomInt(2, 9);
        const ml = liters * 1000;
        question = `Convert ${liters} liters to milliliters.`;
        topic = "Measurement / Capacity";
        answer = String(ml);
    } else if (type === "Length") {
        // cm to m (100 cm = 1 m)
        // Check user request: "cm to m"
        // Generate cm as multiples of 100
        const meters = getRandomInt(2, 9);
        const cm = meters * 100;
        question = `Convert ${cm} centimeters to meters.`;
        topic = "Measurement / Length";
        answer = String(meters);
    } else {
        // kg to g (1 kg = 1000 g)
        const kg = getRandomInt(2, 9);
        const g = kg * 1000;
        question = `Convert ${kg} kg to grams.`;
        topic = "Measurement / Mass";
        answer = String(g);
    }

    return {
        type: "userInput",
        question: question,
        topic: topic,
        answer: answer
    };
};



export const generateMeasurementConversionApplicationLevel = () => {
    const types = ["Time", "Capacity", "Length", "Mass"];
    const type = types[getRandomInt(0, 3)];

    let question, answer, topic;

    if (type === "Time") {
        // 1–5 hours → minutes
        const hours = getRandomInt(1, 5);
        const minutes = hours * 60;

        const scenarios = [
            `You studied for ${hours} hours. How many minutes did you study?`,
            `A movie lasts ${hours} hours. How many minutes long is it?`,
            `You played outside for ${hours} hours. How many minutes is that?`,
            `Your class picnic lasted ${hours} hours. Convert it into minutes.`,
            `You watched cartoons for ${hours} hours. How many minutes did you watch?`
        ];

        question = scenarios[Math.floor(Math.random() * scenarios.length)];
        topic = "Measurement / Time";
        answer = String(minutes);

    } else if (type === "Capacity") {
        // 1–5 L → ml
        const liters = getRandomInt(1, 5);
        const ml = liters * 1000;

        const scenarios = [
            `A bottle holds ${liters} liters of juice. How many milliliters is that?`,
            `Your mother bought ${liters} liters of milk. Convert it to milliliters.`,
            `A water jug contains ${liters} liters of water. How many milliliters does it hold?`,
            `A lemonade jar has ${liters} liters of lemonade. Convert to milliliters.`,
            `A tank stores ${liters} liters of water. How many milliliters is that?`
        ];

        question = scenarios[Math.floor(Math.random() * scenarios.length)];
        topic = "Measurement / Capacity";
        answer = String(ml);

    } else if (type === "Length") {
        // 100–500 cm → meters
        const meters = getRandomInt(1, 5);
        const cm = meters * 100;

        const scenarios = [
            `A rope is ${cm} centimeters long. How many meters is that?`,
            `Your table is ${cm} centimeters long. Convert it into meters.`,
            `A jump rope measures ${cm} centimeters. How many meters long is it?`,
            `A ribbon is ${cm} centimeters long. Convert to meters.`,
            `A bench is ${cm} centimeters long. How many meters is that?`
        ];

        question = scenarios[Math.floor(Math.random() * scenarios.length)];
        topic = "Measurement / Length";
        answer = String(meters);

    } else {
        // 1–5 kg → grams
        const kg = getRandomInt(1, 5);
        const g = kg * 1000;

        const scenarios = [
            `A bag of rice weighs ${kg} kilograms. How many grams is that?`,
            `You bought a ${kg}-kilogram packet of sugar. Convert it to grams.`,
            `A puppy weighs ${kg} kilograms. How many grams does it weigh?`,
            `A watermelon weighs ${kg} kilograms. Convert its weight to grams.`,
            `Your school bag weighs ${kg} kilograms. How many grams is that?`
        ];

        question = scenarios[Math.floor(Math.random() * scenarios.length)];
        topic = "Measurement / Mass";
        answer = String(g);
    }

    return {
        type: "userInput",
        topic,
        question,
        answer
    };
};

export const generateTimeConversion5to10 = () => {
    // Hours to Minutes
    const hours = getRandomInt(5, 10);
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
    // Generate values ensuring no ties
    let apples, oranges, bananas;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        apples = getRandomInt(10, 50);
        oranges = getRandomInt(10, 50);
        bananas = getRandomInt(10, 50);
        attempts++;

        // Ensure all three values are different (no ties)
    } while ((apples === oranges || oranges === bananas || apples === bananas) && attempts < maxAttempts);

    // Fallback: if still tied after max attempts, force them to be different
    if (apples === oranges || oranges === bananas || apples === bananas) {
        apples = 30;
        oranges = 40;
        bananas = 20;
    }

    const maxVal = Math.max(apples, oranges, bananas);
    const yAxisMax = Math.ceil(maxVal / 10) * 10 + 10; // Round up to nearest 10, add padding

    let answer;
    if (maxVal === apples) {
        answer = "Apples";
    } else if (maxVal === oranges) {
        answer = "Oranges";
    } else {
        answer = "Bananas";
    }

    // Dynamic SVG Generation
    const width = 400;
    const height = 300;
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Calculate bar dimensions
    const barWidth = 60;
    const gap = (chartWidth - (3 * barWidth)) / 4;

    // Helper to map value to y-coordinate
    const getY = (val) => height - padding - (val / yAxisMax) * chartHeight;

    const svgParts = [
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
        // Background
        `<rect width="100%" height="100%" fill="white" />`,
        // Axes
        `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="black" stroke-width="2"/>`, // X-axis
        `<line x1="${padding}" y1="${height - padding}" x2="${padding}" y2="${padding}" stroke="black" stroke-width="2"/>` // Y-axis
    ];

    // Y-axis labels
    for (let i = 0; i <= yAxisMax; i += 10) {
        const y = getY(i);
        svgParts.push(
            `<line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="black"/>`,
            `<text x="${padding - 10}" y="${y + 5}" font-family="Arial" font-size="12" text-anchor="end">${i}</text>`
        );
    }

    // Bars
    const data = [
        { label: "Apples", value: apples, color: "#ff6b6b" },
        { label: "Oranges", value: oranges, color: "#ffa502" },
        { label: "Bananas", value: bananas, color: "#ffeaa7" }
    ];

    data.forEach((item, index) => {
        const x = padding + gap + (index * (barWidth + gap));
        const y = getY(item.value);
        const barHeight = (height - padding) - y;

        svgParts.push(
            // Bar
            `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${item.color}" stroke="black"/>`,
            // Value Label (top of bar)
            `<text x="${x + barWidth / 2}" y="${y - 5}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${item.value}</text>`,
            // X-axis Label
            `<text x="${x + barWidth / 2}" y="${height - padding + 20}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${item.label}</text>`
        );
    });

    svgParts.push(`</svg>`);

    const svgString = svgParts.join('');
    // Base64 encode for data URI
    const base64Svg = typeof Buffer !== 'undefined'
        ? Buffer.from(svgString).toString('base64')
        : btoa(svgString);

    const imagePath = `data:image/svg+xml;base64,${base64Svg}`;
    const question = `Look at the bar graph. Which fruit has the highest count?`;

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
        answer: answer,
        image: imagePath
    };
};

// --- Logical Thinking ---

export const generatePattern = () => {
    // Number pattern
    const start = getRandomInt(2, 5);
    const mult = getRandomInt(1, 3);
    const seq = [start, start * mult];
    const next = start * mult * mult;

    const question = `Complete the pattern: </br> ${seq.join(", ")}, ?`;

    return {
        type: "userInput",
        question: question,
        topic: "Logical Thinking / Patterns",
        answer: String(next)
    };
};



export const generateSimpleGrade4Pattern = () => {
    const patternType = getRandomInt(1, 3); // 1=addition, 2=subtraction, 3=multiplication

    let start, step, seq, next;

    switch (patternType) {
        case 1:
            // ➕ Addition pattern
            start = getRandomInt(2, 20);
            step = getRandomInt(2, 10);

            seq = [
                start,
                start + step,
                start + step * 2
            ];

            next = start + step * 3;
            break;

        case 2:
            // ➖ Subtraction pattern (safe: no negative results)
            start = getRandomInt(30, 60);
            step = getRandomInt(2, 10);

            seq = [
                start,
                start - step,
                start - step * 2
            ];

            next = start - step * 3;
            break;

        case 3:
            // ✖ Multiplication pattern (×2 or ×3, small numbers)
            start = getRandomInt(1, 5);
            step = getRandomInt(2, 3); // ×2 or ×3

            seq = [
                start,
                start * step,
                start * step * step
            ];

            next = start * step * step * step;
            break;
    }

    return {
        type: "userInput",
        question: `Complete the pattern: </br> ${seq.join(", ")}, ?`,
        topic: "Number Patterns",
        answer: String(next)
    };
};

// --- 3D Shapes ---

// Dynamic 3D Shape Identification Question
export const generate3DShapeIdentification = () => {
    // Define all 3D shapes with their image paths
    const shapes = {
        'Triangular Prism': {
            name: 'Triangular Prism',
            category: 'Prism',
            imagePath: '/assets/grade4/3d_shapes/triangular_prism.png'
        },
        'Square Prism': {
            name: 'Square Prism',
            category: 'Prism',
            imagePath: '/assets/grade4/3d_shapes/square_prism.png'
        },
        'Hexagonal Prism': {
            name: 'Hexagonal Prism',
            category: 'Prism',
            imagePath: '/assets/grade4/3d_shapes/hexagonal_prism.png'
        },
        'Triangular Pyramid': {
            name: 'Triangular Pyramid',
            category: 'Pyramid',
            imagePath: '/assets/grade4/3d_shapes/triangular_pyramid.png'
        },
        'Square Pyramid': {
            name: 'Square Pyramid',
            category: 'Pyramid',
            imagePath: '/assets/grade4/3d_shapes/square_pyramid.png'
        },
        'Pentagonal Pyramid': {
            name: 'Pentagonal Pyramid',
            category: 'Pyramid',
            imagePath: '/assets/grade4/3d_shapes/pentagonal_pyramid.png'
        }
    };

    // Randomly select one shape
    const shapeNames = Object.keys(shapes);
    const selectedShapeName = shapeNames[getRandomInt(0, shapeNames.length - 1)];
    const selectedShape = shapes[selectedShapeName];

    // Generate wrong answers from other shapes
    const wrongShapes = shapeNames.filter(name => name !== selectedShapeName);
    const shuffledWrong = shuffleArray(wrongShapes);
    const wrongAnswers = shuffledWrong.slice(0, 3);

    // Create options with proper format
    const allOptions = [
        { value: selectedShapeName, label: selectedShapeName },
        { value: wrongAnswers[0], label: wrongAnswers[0] },
        { value: wrongAnswers[1], label: wrongAnswers[1] },
        { value: wrongAnswers[2], label: wrongAnswers[2] }
    ];

    // Shuffle options
    const options = shuffleArray(allOptions);

    return {
        type: "mcq",
        question: `Identify the 3D shape shown in the image:`,
        image: selectedShape.imagePath,
        topic: "Geometry / 3D Shapes",
        options: options,
        answer: selectedShapeName
    };
};

// FVE (Faces, Vertices, Edges) Table Input Question
export const generateFVETable = () => {
    // Define all 3D shapes with their FVE properties
    const shapes = [
        {
            name: 'Cube',
            image: '/assets/grade4/FVE/cube_square_Prism.png',
            faces: 6,
            vertices: 8,
            edges: 12
        },
        {
            name: 'Cuboid',
            image: '/assets/grade4/FVE/cuboid_rectangular_Prism.png',
            faces: 6,
            vertices: 8,
            edges: 12
        },
        {
            name: 'Triangular Pyramid',
            image: '/assets/grade4/FVE/triangular_Pyramid .png',
            faces: 4,
            vertices: 4,
            edges: 6
        },
        {
            name: 'Square Pyramid',
            image: '/assets/grade4/FVE/square_pyramid .png',
            faces: 5,
            vertices: 5,
            edges: 8
        },
        {
            name: 'Triangular Prism',
            image: '/assets/grade4/FVE/triangular_Prism .png',
            faces: 5,
            vertices: 6,
            edges: 9
        }
    ];

    // Randomly select 2 shapes for Grade 4 (simpler for young students)
    const shuffledShapes = shuffleArray([...shapes]);
    const selectedShapes = shuffledShapes.slice(0, 2);

    // Create answer object
    const answer = {};
    selectedShapes.forEach((shape, index) => {
        answer[index] = {
            faces: shape.faces,
            vertices: shape.vertices,
            edges: shape.edges
        };
    });

    // Create table rows - each row has text (shape name) and image
    const rows = selectedShapes.map((shape) => ({
        text: shape.name,
        image: shape.image
    }));

    return {
        type: "tableInput",
        variant: "triple-input",
        question: "",
        topic: "Geometry / 3D Shapes - Faces, Vertices, Edges",
        headers: ["Shapes", "Number of faces (F)", "Number of vertices (V)", "Number of edges (E)"],
        inputKeys: ["faces", "vertices", "edges"],
        placeholders: ["", "", ""],
        rows: rows,
        answer: JSON.stringify(answer)
    };
};
