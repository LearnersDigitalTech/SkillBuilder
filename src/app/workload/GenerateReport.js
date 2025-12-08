function analyzeResponses(responses, grade) {
    const result = {
        summary: {
            totalQuestions: 0,
            attempted: 0,
            correct: 0,
            wrong: 0,
            accuracyPercent: 0
        },
        topicFeedback: {}, // topic -> { correctCount, wrongCount, positiveFeedback, improvementFeedback }
        perQuestionReport: [], // detailed per-question info
        timeReport: [], // { questionId, question, timeTaken }
        learningPlanSummary: "" // final human-readable plan
    };

    if (!Array.isArray(responses) || responses.length === 0) {
        result.learningPlanSummary = "No responses found. Try attempting a few questions to get a personalized learning plan.";
        return result;
    }

    result.summary.totalQuestions = responses.length;

    // Helper to safely normalize answers (string/number/null)
    const normalize = (value) => (value === null || value === undefined)
        ? ""
        : String(value).trim();

    // Helper to calculate score (supports partial marking for tableInput)
    const calculateScore = (item, normalizeFunc) => {
        const givenAnswer = normalizeFunc(item.userAnswer);
        const correctAnswer = normalizeFunc(item.answer);

        if (!givenAnswer) return 0;

        // Partial marking for tableInput
        if (item.type === 'tableInput' && (item.question || item.rows)) {
            // We need to compare row by row.
            try {
                const correctObj = JSON.parse(correctAnswer);
                const userObj = JSON.parse(givenAnswer);

                // If item.rows is present, use it for length. If not, use keys of correctObj
                const totalRows = item.rows ? item.rows.length : Object.keys(correctObj).length;

                if (totalRows === 0) return givenAnswer === correctAnswer ? 1 : 0;

                let matchCount = 0;
                for (let i = 0; i < totalRows; i++) {
                    const u = userObj[i];
                    const c = correctObj[i];

                    // Check for fraction comparison
                    if (u && c && (u.num !== undefined || u.d !== undefined) && (u.den !== undefined || u.d !== undefined) && c.num !== undefined && c.den !== undefined) {
                        // Normalize key names: tableInput uses 'num'/'den'
                        // Use parseFloat to handle strings like "4" or "4.0" or even "4.5" if user enters decimals
                        const uNum = parseFloat(u.num);
                        const uDen = parseFloat(u.den);
                        const cNum = parseFloat(c.num);
                        const cDen = parseFloat(c.den);

                        if (!isNaN(uNum) && !isNaN(uDen) && !isNaN(cNum) && !isNaN(cDen) && uDen !== 0 && cDen !== 0) {
                            // Cross multiply with epsilon for float safety: |uNum/uDen - cNum/cDen| < epsilon
                            // => |uNum*cDen - cNum*uDen| < epsilon
                            if (Math.abs(uNum * cDen - cNum * uDen) < 0.0001) {
                                matchCount++;
                                continue;
                            }
                        }
                    }

                    // Strict equality for JSON objects/strings fallback
                    if (JSON.stringify(u) === JSON.stringify(c)) {
                        matchCount++;
                    }
                }

                return matchCount / totalRows;
            } catch (e) {
                // If parsing fails, fall back to strict match
                return givenAnswer === correctAnswer ? 1 : 0;
            }
        }

        return givenAnswer === correctAnswer ? 1 : 0;
    };

    // Step 1: Iterate and compute per-question stats
    responses.forEach((item) => {
        if (!item) return;
        const {
            questionId,
            question,
            topic,
            answer,
            userAnswer,
            timeTaken
        } = item;

        const correctAnswer = normalize(answer);
        const givenAnswer = normalize(userAnswer);
        let attempted = givenAnswer !== "";

        // Special check for TableInput empty JSON
        if (attempted && givenAnswer.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(givenAnswer);
                if (Object.keys(parsed).length === 0) {
                    attempted = false;
                }
            } catch (e) {
                // ignore
            }
        }

        const score = calculateScore(item, normalize);
        const isCorrect = score === 1; // Strict correct for badges

        if (attempted) {
            result.summary.attempted += 1;
            result.summary.correct += score;
            result.summary.wrong += (1 - score);
        }

        // Track topic stats
        if (!result.topicFeedback[topic]) {
            result.topicFeedback[topic] = {
                correctCount: 0,
                wrongCount: 0,
                positiveFeedback: "",
                improvementFeedback: ""
            };
        }

        if (attempted) {
            result.topicFeedback[topic].correctCount += score;
            result.topicFeedback[topic].wrongCount += (1 - score);
        }

        // Per-question report
        result.perQuestionReport.push({
            questionId,
            question,
            topic,
            correctAnswer,
            userAnswer: givenAnswer || null,
            attempted,
            isCorrect, // Keep strict boolean for UI badges
            score, // Add score for detailed view if needed
            timeTaken: typeof timeTaken === "number" ? timeTaken : null
        });

        // Time report
        result.timeReport.push({
            questionId,
            question,
            timeTaken: typeof timeTaken === "number" ? timeTaken : null
        });
    });

    // Step 2: Accuracy
    if (result.summary.attempted > 0) {
        result.summary.accuracyPercent = Math.round(
            (result.summary.correct / result.summary.attempted) * 100
        );
    } else {
        result.summary.accuracyPercent = 0;
    }

    // Step 3: Topic-wise feedback (customized messages)
    Object.keys(result.topicFeedback).forEach((topic) => {
        const t = result.topicFeedback[topic];
        const totalTopicAttempts = t.correctCount + t.wrongCount;
        const topicAccuracy = totalTopicAttempts === 0
            ? 0
            : (t.correctCount / totalTopicAttempts) * 100;

        // Positive feedback
        if (topicAccuracy >= 80) {
            t.positiveFeedback = `You are strong in ${topic}. You quickly understand patterns and apply them correctly.`;
        } else if (topicAccuracy >= 50) {
            t.positiveFeedback = `You have a fair understanding of ${topic}, and with a bit more practice you can master it.`;
        } else if (totalTopicAttempts > 0) {
            t.positiveFeedback = `You have started working on ${topic}. Keep practicing to build confidence.`;
        } else {
            t.positiveFeedback = `No attempts recorded in ${topic} yet. Try a few questions to gauge your understanding.`;
        }

        // Improvement feedback (only if there are wrong answers)
        if (t.wrongCount > 0) {
            if (topic === "Number Series") {
                if (["Grade 1", "Grade 2", "Grade 3"].includes(grade)) {
                    t.improvementFeedback = "Work more on understanding the order of numbers, especially ‘before’ and ‘after’ numbers. Practice counting forwards and backwards from different starting points.";
                } else if (["Grade 4", "Grade 5", "Grade 6"].includes(grade)) {
                    t.improvementFeedback = "Focus on identifying patterns like skip counting, multiplication, or division in the series. Practice with larger numbers.";
                } else {
                    t.improvementFeedback = "Analyze complex patterns involving multiple operations (e.g., n^2 + 1, Fibonacci). Practice algebraic sequences.";
                }
            } else {
                t.improvementFeedback = `You need some improvement in ${topic}. Review the core concepts and solve a few guided practice problems.`;
            }
        } else {
            t.improvementFeedback = "No major issues noticed in this topic so far.";
        }
    });

    // Step 4: Learning plan summary (based on overall accuracy and grade)
    const acc = result.summary.accuracyPercent;
    let plan = "";

    const isPrimary = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"].includes(grade);

    if (acc === 100) {
        plan += "Excellent work! You answered all the attempted questions correctly. 🎉\n\n";
        if (isPrimary) {
            plan += "- Continue practicing slightly more challenging number series problems.\n";
            plan += "- Try mixed questions: ‘before’, ‘after’, and ‘between’ numbers.\n";
            plan += "- Introduce timed quizzes to maintain your speed and accuracy.";
        } else {
            plan += "- Challenge yourself with advanced sequences and series problems.\n";
            plan += "- Explore competitive exam level questions (Olympiad, NTSE).\n";
            plan += "- Focus on speed and accuracy under time constraints.";
        }
    } else if (acc >= 70) {
        plan += "Good job! You have a strong foundation but there is still room to improve.\n\n";
        plan += "- Revise the mistakes you made and understand why the correct answer is different.\n";
        if (isPrimary) {
            plan += "- Practice 10–15 more questions on ‘before’ and ‘after’ numbers daily.\n";
            plan += "- Mix very easy and slightly tricky questions to build confidence and speed.";
        } else {
            plan += "- Practice identifying different types of progressions (AP, GP).\n";
            plan += "- Solve problems involving squares, cubes, and prime numbers.";
        }
    } else if (acc > 0) {
        plan += "You’ve made a start, and this is a good step. Now let’s focus on building your basics.\n\n";
        if (isPrimary) {
            plan += "- Start with simple counting: say and write numbers from 1 to 100.\n";
            plan += "- Practice questions like ‘number before’ and ‘number after’ using a number line or chart.\n";
        } else {
            plan += "- Review the basic rules of arithmetic progressions and number patterns.\n";
            plan += "- Practice finding the difference between consecutive terms.\n";
        }
        plan += "- Re-attempt the questions you got wrong and discuss them with a teacher/mentor if needed.";
    } else {
        plan += "No questions were answered yet, so we can’t judge your level.\n\n";
        plan += "- Try answering at least 5–10 questions on number series.\n";
        plan += "- Don’t worry about speed in the beginning—focus on understanding the pattern.\n";
        plan += "- Once you are comfortable, we can create a more detailed learning plan for you.";
    }

    // Add small note about time usage
    plan += "\n\nTime Tip:\n";
    plan += "- For questions you know well, try to reduce the time taken gradually.\n";
    plan += "- If a question feels confusing, it’s okay to take a bit longer and think calmly rather than guessing.";

    result.learningPlanSummary = plan;

    return result;
}


export default analyzeResponses;