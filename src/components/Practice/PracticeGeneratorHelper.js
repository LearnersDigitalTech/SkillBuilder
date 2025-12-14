
export const regenerateQuestion = (currentQuestion, generatorMap) => {
    if (!currentQuestion || !generatorMap) return null;

    // 1. Direct topic match
    let generator = generatorMap[currentQuestion.topic];

    // 2. Resolve ambiguities where multiple generators share a topic
    // Ideally this logic should also be moved out or generalized, 
    // but for now we keep common shared logic or rely on the generatorMap to be specific enough.

    // For specific Grade 1 "fixes" like Counting Backwards vs Forwards, 
    // we can rely on the generatorMap having these specific keys if we change the topic names,
    // OR we can pass a "resolver" function. 
    // To keep it simple for this refactor, we will look for the specific generator in the map 
    // using the SAME logic if the map has those "raw" functional generators available,
    // BUT the cleaner way is to expect the 'generatorMap' to handle the mapping.

    // However, the previous logic did some string matching on 'currentQuestion.question'.
    // We will keep that logic GENERIC if possible, or assume generatorMap handles it.

    // Let's assume the generatorMap passed in IS the map of "Topic Name" -> "Generator Function".

    // Checking for specific overrides that were in the original file:
    // "Number Sense / Counting" -> Found in Forward and Backward
    if (currentQuestion.topic === "Number Sense / Counting") {
        if (currentQuestion.question.toLowerCase().includes("backwards") && generatorMap["Number Sense / Counting Backwards"]) {
            return generatorMap["Number Sense / Counting Backwards"]();
        }
        if (generatorMap["Number Sense / Counting Forwards"]) {
            return generatorMap["Number Sense / Counting Forwards"]();
        }
        // Fallback if specific keys aren't there but the generic topic is
        if (generator) return generator();
    }

    // "Number Sense / Skip Counting" -> Needs step inference
    if (currentQuestion.topic === "Number Sense / Skip Counting" && generatorMap["Number Sense / Skip Counting"]) {
        // The generator for Skip Counting likely needs arguments. 
        // The previous implementation imported 'generateSkipCounting' directly.
        // If generatorMap["Number Sense / Skip Counting"] is the function 'generateSkipCounting', we can call it.
        const msg = currentQuestion.question;
        const step = msg.includes("2s") ? 2 : msg.includes("5s") ? 5 : msg.includes("10s") ? 10 : 2;
        return generatorMap["Number Sense / Skip Counting"](step);
    }

    // "Number Sense / Comparison" -> Greatest vs Smallest
    if (currentQuestion.topic === "Number Sense / Comparison" && generatorMap["Number Sense / Comparison"]) {
        const type = currentQuestion.question.toLowerCase().includes("smallest") ? 'smallest' : 'greatest';
        return generatorMap["Number Sense / Comparison"](type);
    }

    if (generator) {
        return generator();
    }

    return null;
};

