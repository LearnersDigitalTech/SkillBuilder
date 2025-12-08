const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const numberToWords = (num) => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num === 0) return 'zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  return String(num);
};

// --- Number Sense ---

export const generateCounting = () => {
  const start = getRandomInt(100, 990);
  const answer = start + 1;

  const question = `What number comes after ${start}?`;

  return {
    type: "userInput",
    question: question,
    topic: "Number Sense / Counting",
    answer: String(answer)
  };
};

export const generatePlaceValue = () => {
  let hundreds = getRandomInt(1, 9);
  let tens = getRandomInt(0, 9);
  let ones = getRandomInt(0, 9);
const values = [hundreds, tens, ones];
const answer = values[Math.floor(Math.random() * 3)];

  // Ensure digits are distinct to avoid duplicate options
  while (tens === hundreds) tens = getRandomInt(0, 9);
  while (ones === hundreds || ones === tens) ones = getRandomInt(0, 9);

  const number = hundreds * 100 + tens * 10 + ones;

  const options = shuffleArray([
    { value: `Ones`, label: `Ones` },
    { value: `Tens`, label: `Tens` },
    { value: `Hundreds`, label: `Hundreds` },
    // { value: `Thousands`, label: `Thousands` }
  ]);

  return {
    type: "mcq",
    // question: `In the number ${number}, what place is the digit ${answer} in?`,
    question: `In the number ${number}, the digit ${answer} is in the ____ place?`,
    topic: "Number Sense / Place Value",
    options: options,
    answer: answer
  };
};

export const generateValue = () => {
  let hundreds = getRandomInt(1, 9);
  let tens = getRandomInt(0, 9);
  let ones = getRandomInt(0, 9);
const values = [hundreds, tens, ones];
const answer = values[Math.floor(Math.random() * 3)];

  // Ensure digits are distinct to avoid duplicate options
  while (tens === hundreds) tens = getRandomInt(0, 9);
  while (ones === hundreds || ones === tens) ones = getRandomInt(0, 9);

  const number = hundreds * 100 + tens * 10 + ones;

  const options = shuffleArray([
    // { value: `${answer}000`, label: `${answer}000` },
    { value: `${answer}0`, label: `${answer}0` },
    { value: `${answer}`, label: `${answer}` },
    { value: `${answer}00`, label: `${answer}00` }
  ]);

  return {
    type: "mcq",
    question: `What is the value of ${answer} in ${number}?`,
    topic: "Number Sense / Place Value",
    options: options,
    answer: answer
  };
};

export const generateExpandedForm = () => {
  const hundreds = getRandomInt(1, 9);
  const tens = getRandomInt(1, 9);
  const ones = getRandomInt(1, 9);
  const number = hundreds * 100 + tens * 10 + ones;

  const answer = `${hundreds * 100} + ${tens * 10} + ${ones}`;

  const options = shuffleArray([
    { value: answer, label: answer },
    { value: `${hundreds * 100} + ${tens} + ${ones}`, label: `${hundreds * 100} + ${tens} + ${ones}` },
    { value: `${hundreds} + ${tens * 10} + ${ones}`, label: `${hundreds} + ${tens * 10} + ${ones}` },
    { value: `${hundreds * 100} + ${tens * 10} + ${ones * 10}`, label: `${hundreds * 100} + ${tens * 10} + ${ones * 10}` }
  ]);

  return {
    type: "mcq",
    question: `What is the expanded form of ${number}?`,
    topic: "Number Sense / Expanded Form",
    options: options,
    answer: answer
  };
};

export const generateComparison = () => {
  const num1 = getRandomInt(100, 999);
  let num2 = getRandomInt(100, 999);
  while (num1 === num2) num2 = getRandomInt(100, 999);

  const answer = num1 > num2 ? ">" : "<";

  const question = `Compare: ${num1} _ ${num2}`;

  const options = shuffleArray([
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "=", label: "=" }
  ]);

  return {
    type: "mcq",
    question: question,
    topic: "Number Sense / Comparison",
    options: options,
    answer: answer
  };
};

export const generateAscendingDescending = () => {
  const nums = [];
  while (nums.length < 4) {
    const n = getRandomInt(100, 999);
    if (!nums.includes(n)) nums.push(n);
  }

  const type = Math.random() > 0.5 ? "ascending" : "descending";
  const sorted = [...nums].sort((a, b) => type === "ascending" ? a - b : b - a);
  const answer = sorted.join(", ");

  // Generate distractors
  const distractor1 = [...sorted].reverse().join(", ");

  // Create random permutations for other distractors
  const getPermutation = () => {
    const p = [...nums];
    for (let i = p.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p.join(", ");
  };

  const optionsSet = new Set();
  optionsSet.add(answer);
  optionsSet.add(distractor1);

  while (optionsSet.size < 4) {
    optionsSet.add(getPermutation());
  }

  const optionsArray = Array.from(optionsSet).map(val => ({ value: val, label: val }));

  return {
    type: "mcq",
    question: `Arrange in ${type} order: ${nums.join(", ")}`,
    topic: "Number Sense / Ordering",
    options: shuffleArray(optionsArray),
    answer: answer
  };
};

export const generateNumberNames = () => {
  const num = getRandomInt(100, 999);
  const answer = numberToWords(num);

  const options = shuffleArray([
    { value: answer, label: answer },
    { value: numberToWords(num + 1), label: numberToWords(num + 1) },
    { value: numberToWords(num - 1), label: numberToWords(num - 1) },
    { value: numberToWords(num + 10), label: numberToWords(num + 10) }
  ]);

  return {
    type: "mcq",
    question: `Write the number name for ${num}`,
    topic: "Number Sense / Number Names",
    options: options,
    answer: answer
  };
};

export const generateSkipCounting = (step) => {
  const start = getRandomInt(1, 20) * step;
  const sequence = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;

  return {
    type: "userInput",
    question: `Skip count by ${step}: ${sequence.join(", ")}, ...?`,
    topic: "Number Sense / Skip Counting",
    answer: String(answer)
  };
};

export const generateEvenOdd = () => {
  const num = getRandomInt(10, 99);
  const isEven = num % 2 === 0;
  const answer = isEven ? "Even" : "Odd";

  return {
    type: "mcq",
    question: `Is ${num} Even or Odd?`,
    topic: "Number Sense / Even & Odd",
    options: [
      { value: "Even", label: "Even" },
      { value: "Odd", label: "Odd" }
    ],
    answer: answer
  };
};

// --- Addition ---

export const generateAddNoCarry = () => {
  const num1 = getRandomInt(10, 50);
  const num2 = getRandomInt(10, 40);
  // Ensure no carry
  const u1 = num1 % 10;
  const u2 = num2 % 10;
  if (u1 + u2 >= 10) return generateAddNoCarry(); // Retry if carry

  const answer = num1 + num2;

  return {
    type: "userInput",
    question: `Add: ${num1} + ${num2} = ?`,
    topic: "Addition / Without Carry",
    answer: String(answer)
  };
};

export const generateAddWithCarry = () => {
  const num1 = getRandomInt(15, 58);
  const num2 = getRandomInt(15, 39);
  // Ensure carry
  const u1 = num1 % 10;
  const u2 = num2 % 10;
  if (u1 + u2 < 10) return generateAddWithCarry(); // Retry if no carry

  const answer = num1 + num2;

  return {
    type: "userInput",
    question: `Add: ${num1} + ${num2} = ?`,
    topic: "Addition / With Carry",
    answer: String(answer)
  };
};

export const generateAddWordProblems = () => {
  const names = ["Raju", "Sita", "Ali", "John"];
  const items = ["marbles", "stamps", "cards", "coins"];

  const name = names[getRandomInt(0, names.length - 1)];
  const item = items[getRandomInt(0, items.length - 1)];
  const num1 = getRandomInt(15, 45);
  const num2 = getRandomInt(10, 30);
  const answer = num1 + num2;

  const question = `${name} has ${num1} ${item}. He buys ${num2} more. How many ${item} does he have in total?`;

  return {
    type: "userInput",
    question: question,
    topic: "Addition / Word Problems",
    answer: String(answer)
  };
};

// --- Subtraction ---

export const generateSubNoBorrow = () => {
  const num1 = getRandomInt(50, 99);
  const num2 = getRandomInt(10, 40);
  // Ensure no borrow
  const u1 = num1 % 10;
  const u2 = num2 % 10;
  if (u1 < u2) return generateSubNoBorrow(); // Retry if borrow needed

  const answer = num1 - num2;

  return {
    type: "userInput",
    question: `Subtract: ${num1} - ${num2} = ?`,
    topic: "Subtraction / Without Borrow",
    answer: String(answer)
  };
};

export const generateSubWithBorrow = () => {
  const num1 = getRandomInt(50, 90);
  const num2 = getRandomInt(15, 48);
  // Ensure borrow
  const u1 = num1 % 10;
  const u2 = num2 % 10;
  if (u1 >= u2) return generateSubWithBorrow(); // Retry if no borrow needed

  const answer = num1 - num2;

  return {
    type: "userInput",
    question: `Subtract: ${num1} - ${num2} = ?`,
    topic: "Subtraction / With Borrow",
    answer: String(answer)
  };
};

export const generateSubWordProblems = () => {
  const names = ["Raju", "Sita", "Ali", "John"];
  const items = ["apples", "candies", "toys", "books"];

  const name = names[getRandomInt(0, names.length - 1)];
  const item = items[getRandomInt(0, items.length - 1)];
  const num1 = getRandomInt(40, 80);
  const num2 = getRandomInt(10, 30);
  const answer = num1 - num2;

  const question = `${name} had ${num1} ${item}. She gave ${num2} to her friend. How many ${item} are left?`;

  return {
    type: "userInput",
    question: question,
    topic: "Subtraction / Word Problems",
    answer: String(answer)
  };
};

// --- Multiplication ---

export const generateRepeatedAddition = () => {
  const num = getRandomInt(2, 5);
  const times = getRandomInt(2, 5);
  const answer = num * times;

  const additionStr = Array(times).fill(num).join(" + ");
  const question = `${times} times ${num} is the same as: ${additionStr} = ?`;

  return {
    type: "userInput",
    question: question,
    topic: "Multiplication / Repeated Addition",
    answer: String(answer)
  };
};

export const generateTables = () => {
  const num = getRandomInt(2, 5);
  const times = getRandomInt(1, 10);
  const answer = num * times;

  const question = `${num} x ${times} = ?`;

  return {
    type: "userInput",
    question: question,
    topic: "Multiplication / Tables",
    answer: String(answer)
  };
};

// --- Money ---

export const generateIdentifyMoney = () => {
  const notes = [1, 2, 5, 10, 20, 50, 100];
  const note = notes[getRandomInt(0, notes.length - 1)];

  const question = `Identify the note: ₹${note}`;

  const uniqueOptions = new Set();
  uniqueOptions.add(note);

  while (uniqueOptions.size < 4) {
    const distractor = note + getRandomInt(1, 50) * (Math.random() > 0.5 ? 1 : -1);
    if (distractor > 0 && !uniqueOptions.has(distractor)) {
      uniqueOptions.add(distractor);
    }
  }

  return {
    type: "userInput",
    question: question,
    topic: "Money / Basics",
    answer: String(note)
  };
};

export const generateAddMoney = () => {
  const num1 = getRandomInt(10, 50);
  const num2 = getRandomInt(10, 40);
  const answer = num1 + num2;

  const question = `₹${num1} + ₹${num2} = ?`;

  return {
    type: "userInput",
    question: question,
    topic: "Money / Addition",
    answer: String(answer)
  };
};

export const generateSubMoney = () => {
  const num1 = getRandomInt(50, 90);
  const num2 = getRandomInt(10, 40);
  const answer = num1 - num2;

  const question = `₹${num1} - ₹${num2} = ?`;

  return {
    type: "userInput",
    question: question,
    topic: "Money / Subtraction",
    answer: String(answer)
  };
};

// --- Measurement ---

export const generateLength = () => {
  const length = getRandomInt(5, 20);
  const unit = "cm";

  const question = `If a pencil is ${length} ${unit} long, what is its length?`;

  const options = shuffleArray([
    { value: `${length} ${unit}`, label: `${length} ${unit}` },
    { value: `${length + 2} ${unit}`, label: `${length + 2} ${unit}` },
    { value: `${length - 1} ${unit}`, label: `${length - 1} ${unit}` },
    { value: `${length + 5} ${unit}`, label: `${length + 5} ${unit}` }
  ]);

  return {
    type: "mcq",
    question: question,
    topic: "Measurement / Length",
    options: options,
    answer: `${length} ${unit}`
  };
};

export const generateWeight = () => {
  const comparisons = [
    { heavy: "Elephant", light: "Ant" },
    { heavy: "Truck", light: "Car" },
    { heavy: "Book", light: "Paper" },
    { heavy: "Watermelon", light: "Grape" }
  ];

  const comp = comparisons[getRandomInt(0, comparisons.length - 1)];
  const askHeavy = Math.random() > 0.5;

  const question = askHeavy
    ? `Which object is heavier?`
    : `Which object is lighter?`;

  const answer = askHeavy ? comp.heavy : comp.light;

  const options = shuffleArray([
    { value: comp.heavy, label: comp.heavy },
    { value: comp.light, label: comp.light }
  ]);

  return {
    type: "mcq",
    question: question,
    topic: "Measurement / Weight",
    options: options,
    answer: answer
  };
};

export const generateCapacity = () => {
  const comparisons = [
    { more: "Bucket", less: "Mug" },
    { more: "Tank", less: "Bucket" },
    { more: "Bottle", less: "Spoon" },
    { more: "Jug", less: "Cup" }
  ];

  const comp = comparisons[getRandomInt(0, comparisons.length - 1)];
  const askMore = Math.random() > 0.5;

  const question = askMore
    ? `Which container holds more?`
    : `Which container holds less?`;

  const answer = askMore ? comp.more : comp.less;

  const options = shuffleArray([
    { value: comp.more, label: comp.more },
    { value: comp.less, label: comp.less }
  ]);

  return {
    type: "mcq",
    question: question,
    topic: "Measurement / Capacity",
    options: options,
    answer: answer
  };
};

export const generateTime = () => {
  const hour = getRandomInt(1, 12);
  const minute = getRandomInt(0, 11) * 5; // 0, 5, 10... 55
  const minuteStr = minute < 10 ? `0${minute}` : minute;

  const time = `${hour}:${minuteStr}`;

  const question = `What time does the clock show if the hour hand is at ${hour} and minute hand is at ${minute / 5 === 0 ? 12 : minute / 5}?`;

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

// --- Geometry ---

export const generateShapes = () => {
  const shapes = [
    { name: "Cube", properties: "6 faces, 12 edges, 8 vertices" },
    { name: "Cone", properties: "1 circular face, 1 vertex" },
    { name: "Cylinder", properties: "2 circular faces, 0 vertices" },
    { name: "Sphere", properties: "0 faces, 0 edges, 0 vertices" }
  ];

  const shape = shapes[getRandomInt(0, shapes.length - 1)];

  const question = `Which shape has ${shape.properties}?`;

  const options = shuffleArray(shapes.map(s => ({ value: s.name, label: s.name })));

  return {
    type: "mcq",
    question: question,
    topic: "Geometry / 3D Shapes",
    options: options,
    answer: shape.name
  };
};

export const generatePatterns = () => {
  const patterns = [
    { seq: ["A", "B", "C", "A", "B"], next: "C", wrong: "A" },
    { seq: ["⭐", "⭐", "🌙", "⭐", "⭐"], next: "🌙", wrong: "⭐" },
    { seq: ["10", "20", "30", "40"], next: "50", wrong: "60" },
    { seq: ["⬆️", "⬇️", "⬆️", "⬇️"], next: "⬆️", wrong: "⬇️" }
  ];

  const pattern = patterns[getRandomInt(0, patterns.length - 1)];

  const question = `Complete the pattern: ${pattern.seq.join(", ")}, ...?`;

  const options = shuffleArray([
    { value: pattern.next, label: pattern.next },
    { value: pattern.wrong, label: pattern.wrong }
  ]);

  return {
    type: "mcq",
    question: question,
    topic: "Geometry / Patterns",
    options: options,
    answer: pattern.next
  };
};

// --- Data Handling ---

export const generateTally = () => {
  const count = getRandomInt(5, 15);
  // Simple representation for tally marks as text is tricky, using simple count for now or description
  const question = `How many tally marks represent the number ${count}?`;

  // Generating simple text representation like ||||| |||||
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  const tallyStr = "卌 ".repeat(groups) + "|".repeat(remainder);

  const options = shuffleArray([
    { value: tallyStr.trim(), label: tallyStr.trim() },
    { value: "卌 ".repeat(groups + 1).trim(), label: "卌 ".repeat(groups + 1).trim() },
    { value: "卌 ".repeat(groups > 0 ? groups - 1 : 0).trim(), label: "卌 ".repeat(groups > 0 ? groups - 1 : 0).trim() },
    { value: (tallyStr + "|").trim(), label: (tallyStr + "|").trim() }
  ]);

  // Note: Tally marks in text are hard to render perfectly without SVG/Images. 
  // Switching question to: "Which number does this tally show?"

  const question2 = `What number does this tally show: ${tallyStr}?`;

  return {
    type: "userInput",
    question: question2,
    topic: "Data Handling / Tally",
    answer: String(count)
  };
};

export const generatePictograph = () => {
  const scale = getRandomInt(2, 5);
  const count = getRandomInt(2, 6);
  const total = count * scale;

  const question = `If 1 🍎 = ${scale} apples, how many apples are there in: ${"🍎 ".repeat(count)}?`;

  return {
    type: "userInput",
    question: question,
    topic: "Data Handling / Pictograph",
    answer: String(total)
  };
};

// --- Logical ---

export const generateSequences = () => {
  const start = getRandomInt(1, 10);
  const step = getRandomInt(2, 5);
  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  const next = start + 4 * step;

  const question = `Complete the sequence: ${seq.join(", ")}, ...?`;

  return {
    type: "userInput",
    question: question,
    topic: "Logical / Sequences",
    answer: String(next)
  };
};

export const generateMissingNumbers = () => {
  const start = getRandomInt(20, 80);
  const question = `Fill in the missing number: ${start}, _, ${start + 2}`;
  const answer = start + 1;

  return {
    type: "userInput",
    question: question,
    topic: "Logical / Missing Numbers",
    answer: String(answer)
  };
};
