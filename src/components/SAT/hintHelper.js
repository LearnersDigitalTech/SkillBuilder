
export const getHint = (topic, question) => {
    if (!topic) return "Read the question carefully.";

    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes("counting")) {
        if (question && question.includes("backwards")) return "Try counting down from the number.";
        if (question && question.includes("skip")) return "Add the step number repeatedly.";
        return "Try counting the items one by one.";
    }
    if (lowerTopic.includes("addition")) {
        return "Put the numbers together to find the total.";
    }
    if (lowerTopic.includes("subtraction")) {
        return "Take away the smaller number from the bigger one.";
    }
    if (lowerTopic.includes("place value")) {
        return "Think about how many tens and ones are in the number.";
    }
    if (lowerTopic.includes("comparison")) {
        if (question && question.includes("greatest")) return "Look for the biggest number.";
        if (question && question.includes("smallest")) return "Look for the tiny number.";
        return "Compare the numbers carefully.";
    }
    if (lowerTopic.includes("even") || lowerTopic.includes("odd")) {
        return "Even numbers end in 0, 2, 4, 6, 8. Odd numbers end in 1, 3, 5, 7, 9.";
    }
    if (lowerTopic.includes("before") || lowerTopic.includes("after")) {
        if (lowerTopic.includes("before")) return "Which number is mainly behind this one?";
        return "Which number is just ahead of this one?";
    }
    if (lowerTopic.includes("shapes")) {
        return "Look at the corners and sides of the shape.";
    }
    if (lowerTopic.includes("money")) {
        return "Add up the values of the notes/coins.";
    }
    if (lowerTopic.includes("time")) {
        return "Think about when this happens in the day.";
    }
    if (lowerTopic.includes("pattern")) {
        return "Look at what repeats in the sequence.";
    }

    return "Read the question one more time carefully.";
};
