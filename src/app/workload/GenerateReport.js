function analyzeResponses(responses, grade) {
    const result = {
        summary: {
            totalQuestions: 0,
            attempted: 0,
            correct: 0,
            wrong: 0,
            accuracyPercent: 0,
            totalTime: 0
        },
        topicFeedback: {}, // topic -> { correctCount, wrongCount, positiveFeedback, improvementFeedback }
        perQuestionReport: [], // detailed per-question info
        timeReport: [], // { questionId, question, timeTaken }
        learningPlanSummary: "", // final human-readable plan (legacy)
        learningPlan: [] // structured learning plan: [{ day, skillCategory, learnWithTutor, selfLearn }]
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

        // Helper function to calculate GCD (Greatest Common Divisor)
        const gcd = (a, b) => {
            a = Math.abs(a);
            b = Math.abs(b);
            return b === 0 ? a : gcd(b, a % b);
        };

        // Helper function to simplify fraction to lowest terms
        const simplifyFraction = (num, den) => {
            if (den === 0) return { num, den }; // Avoid division by zero
            const divisor = gcd(num, den);
            return {
                num: num / divisor,
                den: den / divisor
            };
        };

        // Partial marking for tableInput
        if (item.type === 'tableInput' && (item.question || item.rows)) {
            // We need to compare row by row.
            try {
                const correctObj = JSON.parse(correctAnswer);
                const userObj = JSON.parse(givenAnswer);

                // If item.rows is present, use it for length. If not, use keys of correctObj
                const totalRows = item.rows ? item.rows.length : Object.keys(correctObj).length;

                if (totalRows === 0) return givenAnswer === correctAnswer ? 1 : 0;

                let totalScoreSum = 0;

                for (let i = 0; i < totalRows; i++) {
                    const u = userObj[i];
                    const c = correctObj[i];

                    // 1. Fraction Row (special object structure) - Prioritize this check!
                    // Check if both user and correct answers have fraction properties (num/den or n/d)
                    const isFraction = u && c &&
                        (u.num !== undefined || u.d !== undefined || u.n !== undefined) &&
                        (u.den !== undefined || u.d !== undefined) &&
                        (c.num !== undefined || c.n !== undefined || c.num !== undefined) &&
                        (c.den !== undefined || c.d !== undefined);

                    if (isFraction) {
                        const uNum = parseFloat(u.num || u.n);
                        const uDen = parseFloat(u.den || u.d);
                        const cNum = parseFloat(c.num || c.n);
                        const cDen = parseFloat(c.den || c.d);

                        if (!isNaN(uNum) && !isNaN(uDen) && !isNaN(cNum) && !isNaN(cDen) && uDen !== 0 && cDen !== 0) {
                            // Simplify both fractions to their lowest terms
                            const userSimplified = simplifyFraction(uNum, uDen);
                            const correctSimplified = simplifyFraction(cNum, cDen);

                            // Compare simplified forms (handles both positive and negative fractions)
                            if (Math.abs(userSimplified.num - correctSimplified.num) < 0.0001 &&
                                Math.abs(userSimplified.den - correctSimplified.den) < 0.0001) {
                                totalScoreSum += 1;
                            }
                        }
                    }
                    // 2. Complex Object Row (e.g. {perimeter:..., area:...} or {x:..., y:...})
                    else if (typeof c === 'object' && c !== null) {
                        // If user didn't answer this row at all (undefined/null), score is 0
                        if (!u || typeof u !== 'object') {
                            continue;
                        }

                        // Special case: Linear Equation validation
                        // Check if this is a coordinate pair with equation coefficients
                        if (c._equation && c._equation.a !== undefined && c._equation.b !== undefined && c._equation.c !== undefined) {
                            const { a, b, c: constant } = c._equation;
                            const userX = parseFloat(u.x);
                            const userY = parseFloat(u.y);

                            // Check if user's (x, y) satisfies the equation: a*x + b*y = c
                            if (!isNaN(userX) && !isNaN(userY)) {
                                const leftSide = a * userX + b * userY;
                                // Allow small tolerance for floating point errors
                                if (Math.abs(leftSide - constant) < 0.0001) {
                                    totalScoreSum += 1;
                                }
                            }
                            continue;
                        }

                        const cKeys = Object.keys(c);
                        const totalKeys = cKeys.length;
                        if (totalKeys === 0) {
                            totalScoreSum += 1; // Empty object implies nothing to check?
                            continue;
                        }

                        let correctKeysCount = 0;
                        cKeys.forEach(key => {
                            // Skip internal validation keys like _equation
                            if (key.startsWith('_')) return;

                            // Normalize both values
                            const valC = normalizeFunc(c[key]);
                            const valU = normalizeFunc(u[key]);
                            if (valC === valU) {
                                correctKeysCount++;
                            }
                        });

                        totalScoreSum += (correctKeysCount / totalKeys);
                    }
                    // 3. Simple Primitive Row (String/Number)
                    else {
                        // Try numeric comparison first (handles decimals with trailing zeros)
                        const uNum = parseFloat(u);
                        const cNum = parseFloat(c);

                        if (!isNaN(uNum) && !isNaN(cNum)) {
                            // Numeric comparison with small tolerance for floating point errors
                            if (Math.abs(uNum - cNum) < 0.0001) {
                                totalScoreSum += 1;
                            }
                        } else {
                            // Fall back to string comparison for non-numeric values
                            if (JSON.stringify(u) === JSON.stringify(c)) {
                                totalScoreSum += 1;
                            }
                        }
                    }
                }

                return totalScoreSum / totalRows;
            } catch (e) {
                console.log("Error checking score: ", e);
                // If parsing fails, fall back to strict match
                return givenAnswer === correctAnswer ? 1 : 0;
            }
        }

        // Special check for Factor Tree - Accept multiple valid factorization paths
        if (item.type === 'factorTree') {
            try {
                const correctObj = JSON.parse(correctAnswer);
                const userObj = JSON.parse(givenAnswer);

                // Get the original tree structure from the question
                const tree = item.tree;
                if (!tree) {
                    // Fallback to old validation if no tree structure
                    const correctKeys = Object.keys(correctObj);
                    let allCorrect = true;
                    for (let key of correctKeys) {
                        if (normalizeFunc(userObj[key]) !== normalizeFunc(correctObj[key])) {
                            allCorrect = false;
                            break;
                        }
                    }
                    return allCorrect ? 1 : 0;
                }

                // Helper: Fill tree with user's answers
                const fillTreeWithUserAnswers = (node, answers) => {
                    const nodeCopy = { ...node };
                    if (nodeCopy.isInput && answers[nodeCopy.id]) {
                        nodeCopy.val = parseInt(answers[nodeCopy.id]);
                    }
                    if (nodeCopy.children) {
                        nodeCopy.children = nodeCopy.children.map(child =>
                            fillTreeWithUserAnswers(child, answers)
                        );
                    }
                    return nodeCopy;
                };

                // Helper: Validate that all nodes multiply correctly
                const validateAllNodes = (node) => {
                    if (node.children && node.children.length > 0) {
                        // Check if children multiply to parent
                        const product = node.children.reduce((acc, child) => acc * child.val, 1);
                        if (product !== node.val) return false;

                        // Recursively validate children
                        return node.children.every(child => validateAllNodes(child));
                    }
                    return true; // Leaf nodes are always valid
                };

                // Helper: Extract prime factors (leaf nodes)
                const extractPrimeFactors = (node) => {
                    const primes = [];
                    const traverse = (n) => {
                        if (!n.children || n.children.length === 0) {
                            primes.push(n.val);
                        } else {
                            n.children.forEach(traverse);
                        }
                    };
                    traverse(node);
                    return primes.sort((a, b) => a - b);
                };

                // Helper: Compare arrays ignoring order
                const arraysEqual = (arr1, arr2) => {
                    if (arr1.length !== arr2.length) return false;
                    const sorted1 = [...arr1].sort((a, b) => a - b);
                    const sorted2 = [...arr2].sort((a, b) => a - b);
                    return sorted1.every((val, idx) => val === sorted2[idx]);
                };

                // Build tree with user's values
                const userTree = fillTreeWithUserAnswers(tree, userObj);

                // Validate: All nodes multiply correctly
                const nodesValid = validateAllNodes(userTree);
                if (!nodesValid) return 0;

                // Validate: Prime factorization matches
                const userPrimes = extractPrimeFactors(userTree);
                const correctPrimes = extractPrimeFactors(tree);

                return arraysEqual(userPrimes, correctPrimes) ? 1 : 0;

            } catch (e) {
                console.log("Error validating factor tree: ", e);
                return 0;
            }
        }

        // Default: Try numeric comparison first (handles leading zeros like "07" vs "7")
        const givenNum = parseFloat(givenAnswer);
        const correctNum = parseFloat(correctAnswer);

        if (!isNaN(givenNum) && !isNaN(correctNum)) {
            // Numeric comparison with small tolerance for floating point errors
            return Math.abs(givenNum - correctNum) < 0.0001 ? 1 : 0;
        }

        // Fall back to string comparison: Ignore all whitespace for comparison to handle spacing variations (e.g. "1 x 1" vs "1x1")
        return givenAnswer.replace(/\s+/g, "") === correctAnswer.replace(/\s+/g, "") ? 1 : 0;
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
            // Accumulate timeTaken (ensure it's a number)
            if (typeof timeTaken === 'number') {
                result.summary.totalTime += timeTaken;
            }
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

        // Per-question report (Firebase doesn't allow undefined, use null instead)
        result.perQuestionReport.push({
            questionId: questionId ?? null,
            question: question ?? null,
            image: item.image ?? null,
            topic: topic ?? null,
            type: item.type ?? null,
            tree: item.tree ?? null,
            rows: item.rows ?? null, // Include rows for tableInput questions with images
            headers: item.headers ?? null, // Include headers for dynamic table rendering
            inputKeys: item.inputKeys ?? null, // Include inputKeys for dynamic column rendering
            correctAnswer: correctAnswer ?? null,
            userAnswer: givenAnswer || null,
            attempted: attempted ?? false,
            isCorrect: isCorrect ?? false,
            score: score ?? 0,
            timeTaken: typeof timeTaken === "number" ? timeTaken : null
        });

        // Time report
        result.timeReport.push({
            questionId,
            question,
            timeTaken: typeof timeTaken === "number" ? timeTaken : null
        });
    });

    // Step 2: Accuracy (based on total questions, not just attempted)
    if (result.summary.totalQuestions > 0) {
        result.summary.accuracyPercent = Math.round(
            (result.summary.correct / result.summary.totalQuestions) * 100
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
            if (totalTopicAttempts === 0) {
                t.improvementFeedback = "Start practicing questions in this topic to identify areas for improvement.";
            } else {
                t.improvementFeedback = "No major issues noticed in this topic so far. Keep it up!";
            }
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

    // Generate structured learning plan based on ALL topics
    // Include all topics because skipped questions don't show up in wrongCount
    // Only exclude topics where student got 100% correct (all questions attempted and correct)
    const topicsNeedingWork = Object.entries(result.topicFeedback)
        .filter(([topic, feedback]) => {
            const totalAttempted = feedback.correctCount + feedback.wrongCount;
            // Exclude only if: attempted questions exist AND all were correct AND no wrong answers
            const isPerfect = totalAttempted > 0 && feedback.wrongCount === 0 && feedback.correctCount === totalAttempted;
            return !isPerfect; // Include everything except perfect scores
        })
        .sort((a, b) => b[1].wrongCount - a[1].wrongCount); // Sort by most errors first

    result.learningPlan = topicsNeedingWork.map(([topic, feedback], index) => {
        const day = index + 1;

        // Generate specific learning activities based on topic
        let learnWithTutor = "";
        let selfLearn = "";

        // Customize based on topic name
        if (topic.toLowerCase().includes("counting")) {
            learnWithTutor = "Practice counting forwards and backwards with teacher using number line";
            selfLearn = "Complete counting worksheet (1-100) and practice skip counting by 2s, 5s, 10s";
        } else if (topic.toLowerCase().includes("before") || topic.toLowerCase().includes("after")) {
            learnWithTutor = "Use number line to find numbers before and after with guidance";
            selfLearn = "Practice 15 before/after questions daily using flashcards";
        } else if (topic.toLowerCase().includes("between")) {
            learnWithTutor = "Identify numbers between two given numbers with teacher support";
            selfLearn = "Solve 10 'between' problems using number chart";
        } else if (topic.toLowerCase().includes("pattern") || topic.toLowerCase().includes("sequence")) {
            learnWithTutor = "Identify and extend patterns with teacher explaining the rule";
            selfLearn = "Create your own number patterns and solve pattern worksheets";
        } else if (topic.toLowerCase().includes("addition") || topic.toLowerCase().includes("add")) {
            learnWithTutor = "Practice addition strategies with manipulatives and teacher guidance";
            selfLearn = "Complete 20 addition problems daily, check answers yourself";
        } else if (topic.toLowerCase().includes("subtraction") || topic.toLowerCase().includes("subtract")) {
            learnWithTutor = "Learn subtraction techniques using number line with teacher";
            selfLearn = "Practice 20 subtraction problems, use counters to verify";
        } else if (topic.toLowerCase().includes("multiplication") || topic.toLowerCase().includes("multiply")) {
            learnWithTutor = "Understand multiplication as repeated addition with teacher";
            selfLearn = "Memorize times tables and practice 15 multiplication facts daily";
        } else if (topic.toLowerCase().includes("division") || topic.toLowerCase().includes("divide")) {
            learnWithTutor = "Learn division concepts using grouping method with teacher";
            selfLearn = "Practice division facts and solve 15 division problems";
        } else if (topic.toLowerCase().includes("fraction")) {
            learnWithTutor = "Understand fractions using visual models with teacher support";
            selfLearn = "Draw fraction diagrams and practice comparing fractions";
        } else if (topic.toLowerCase().includes("decimal")) {
            learnWithTutor = "Learn place value of decimals with teacher using base-10 blocks";
            selfLearn = "Practice decimal operations and rounding exercises";
        } else if (topic.toLowerCase().includes("geometry") || topic.toLowerCase().includes("shape")) {
            learnWithTutor = "Identify and classify shapes with teacher using real objects";
            selfLearn = "Draw different shapes and find shapes in your environment";
        } else if (topic.toLowerCase().includes("measurement") || topic.toLowerCase().includes("measure")) {
            learnWithTutor = "Practice measuring length, weight, volume with teacher";
            selfLearn = "Measure 10 objects at home and record measurements";
        } else if (topic.toLowerCase().includes("time") || topic.toLowerCase().includes("clock")) {
            learnWithTutor = "Read analog and digital clocks with teacher guidance";
            selfLearn = "Practice telling time every hour and solve time word problems";
        } else if (topic.toLowerCase().includes("money")) {
            learnWithTutor = "Count coins and notes with teacher using real/play money";
            selfLearn = "Practice making change and solve money word problems";
        } else {
            // Generic fallback
            learnWithTutor = `Discuss ${topic} concepts with teacher and work through examples together`;
            selfLearn = `Practice ${topic} problems independently and review mistakes`;
        }

        return {
            day,
            skillCategory: topic,
            learnWithTutor,
            selfLearn
        };
    });

    return result;
}


export default analyzeResponses;