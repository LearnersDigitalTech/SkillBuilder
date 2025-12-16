import {
    generateAddition2digit,
    generateAddition3digit,
    generateSubtraction2digit,
    generateSubtraction3digit,
    generateMultiplication7and8and9and12,
    generateMultiplication13to19,
    generateDivision1stlevel,
    generateDivision2ndlevel,
    generateMissingNumberAddition,
    generateMissingNumberSubtraction,
    generateAdditionThenSubtraction,
    generateSubtractionThenAddition,
    generateFractions,
    generateCompareFractions,
    generateNumberToWords,
    generateWordsToNumber,
    generateShapes,
    generateDoublingQuestion,
    generateHalvingQuestion,
    generateSymmetry,
    generateLengthConversion,
    generateWeightConversion,
    generateCapacityConversion,
    generateTimeReading,
    generateIdentifyMoney,
    generateMoneyOperations,
    generateTally,
    generateNumberPattern,
    generateShapeComposition,
    generate3DShapeMatching
} from './grade3Generators.mjs';

const generate = (generator, count = 10) => {
    return Array.from({ length: count }, () => generator());
};

const Grade3Questions = {
    q1: generate(generateAddition2digit),
    q2: generate(generateAddition3digit),
    q3: generate(generateSubtraction2digit),
    q4: generate(generateSubtraction3digit),
    q5: generate(generateMultiplication7and8and9and12),
    q6: generate(generateMultiplication13to19),
    q7: generate(generateDivision1stlevel),
    q8: generate(generateDivision2ndlevel),
    q9: generate(generateMissingNumberAddition),
    q10: generate(generateMissingNumberSubtraction),
    q11: generate(generateAdditionThenSubtraction),
    q12: generate(generateSubtractionThenAddition),
    // q13: generate(generateFractions),
    q13: generate(generateFractions),
    // q15: generate(generateCompareFractions),
    q14: generate(generateNumberToWords),
    q15: generate(generateWordsToNumber),
    // q16: generate(generateShapes),
    q16: generate(generateDoublingQuestion),
    q17: generate(generateHalvingQuestion),
    q18: generate(generateSymmetry),
    q19: generate(generateShapeComposition),
    q20: generate(generate3DShapeMatching),
    q21: generate(generateLengthConversion),
    q22: generate(generateWeightConversion),
    q23: generate(generateCapacityConversion),
    q24: generate(generateTimeReading),
    q25: generate(generateIdentifyMoney),
    q26: generate(generateMoneyOperations),
    q27: generate(generateTally),
    q28: generate(generateNumberPattern),

};


export const Grade3GeneratorMap = {
    "Number Sense / Addition": generateAddition2digit, // Maps to 2-digit by default or handled by topic? 
    // Wait, multiple functions (2digit, 3digit) share the same topic string "Number Sense / Addition" in grade3Generators.mjs!
    // This creates ambiguity for regeneration.
    // In Grade 1, we used unique topics or logic in helper.
    // In generic helper, we just use map[topic].
    // Soluton: Since the Generic Helper blindly calls map[topic], if we map "Number Sense / Addition": generateAddition2digit, 
    // then ALL "Number Sense / Addition" questions (even 3-digit ones) will regenerate as 2-digit.
    // Ideally, we should fix the topics in grade3Generators.mjs to be unique (e.g. "Number Sense / Addition 2-Digit"),
    // but that requires changing the question generation string/logic which might affect scoring or analytics if matched by topic string.
    // However, for "Practice Mode" simply regenerating *a* relevant question is often acceptable. 
    // Or, I can array them? No, helper expects a function.

    // Better approach: I will map the topic to a WRAPPER function that randomly picks one of the sub-generators? 
    // Or just pick the most common one.
    // Let's look at the file again.

    "Number Sense / Addition": () => Math.random() > 0.5 ? generateAddition2digit() : generateAddition3digit(),
    "Number Sense / Subtraction": () => Math.random() > 0.5 ? generateSubtraction2digit() : generateSubtraction3digit(),
    "Number Sense / Multiplication": () => Math.random() > 0.5 ? generateMultiplication7and8and9and12() : generateMultiplication13to19(),
    "Number Sense / Division": () => Math.random() > 0.5 ? generateDivision1stlevel() : generateDivision2ndlevel(),
    "Number Sense / Missing Number": () => Math.random() > 0.5 ? generateMissingNumberAddition() : generateMissingNumberSubtraction(),
    "Number Sense / Mixed Operations": () => Math.random() > 0.5 ? generateAdditionThenSubtraction() : generateSubtractionThenAddition(),

    "Number Sense / Fractions": generateFractions,
    "Number Sense / Compare Fractions": generateCompareFractions,

    "Number Sense / Number Names": generateNumberToWords,
    "Number Sense / Number Reading": generateWordsToNumber,

    "Number Sense / Doubling": generateDoublingQuestion,
    "Number Sense / Halving": generateHalvingQuestion,

    "Geometry / 3D Shapes": generateShapes,
    "Geometry / Symmetry": generateSymmetry,
    "Geometry / Shape Recognition": generateShapeComposition,

    "Measurement / Length": generateLengthConversion,
    "Measurement / Weight": generateWeightConversion,
    "Measurement / Capacity": generateCapacityConversion,
    "Measurement / Time": generateTimeReading, // This function name was duplicate in file (line 593 vs 627), checking which one is active. The one at 627 overwrites? No, 593 is commented out. 627 is active.

    "Money / Basics": generateIdentifyMoney,
    "Money / Operations": generateMoneyOperations,

    "Data Handling / Tally": generateTally,

    "Patterns / Number Patterns": generateNumberPattern
};

export default Grade3Questions;
