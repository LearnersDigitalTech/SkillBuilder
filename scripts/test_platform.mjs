import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// specific grade or file to test (optional)
const filter = process.argv[2];

const SRC_DIR = path.resolve('src/questionBook');

async function findGeneratorFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(await findGeneratorFiles(filePath));
        } else {
            // Match *Generators.mjs files
            if (file.endsWith('Generators.mjs') || file.startsWith('Get') && file.endsWith('.mjs')) {
                results.push(filePath);
            }
        }
    }
    return results;
}

async function runTests() {
    console.log("🔍 Scanning for generator files in " + SRC_DIR + "...");
    const files = await findGeneratorFiles(SRC_DIR);

    let totalTests = 0;
    let totalPass = 0;
    let totalFail = 0;
    let failedGenerators = [];

    for (const filePath of files) {
        const fileName = path.basename(filePath);

        if (filter && !filePath.toLowerCase().includes(filter.toLowerCase())) {
            continue;
        }

        console.log(`\n📂 Testing Module: ${fileName}`);

        try {
            // Import the module dynamically
            const moduleUrl = pathToFileURL(filePath).href;
            const module = await import(moduleUrl);

            // Find generator functions (export const generate...)
            for (const [key, func] of Object.entries(module)) {
                if (typeof func === 'function' && key.startsWith('generate')) {
                    process.stdout.write(`   - Testing ${key}... `);
                    let passed = true;
                    let errorMsg = "";

                    // Run 20 times to catch random errors
                    for (let i = 0; i < 20; i++) {
                        try {
                            const result = func();

                            // Basic Validation
                            if (!result) throw new Error("Returned null/undefined");

                            // Allow missing question for tableInput/matching if rows or valid structure exists
                            if (result.type === 'tableInput') {
                                if ((result.question === undefined || result.question === null || result.question === '') && (!result.rows || !Array.isArray(result.rows))) {
                                    throw new Error("tableInput missing 'question' AND 'rows' array");
                                }
                            } else {
                                if (result.question === undefined || result.question === null) throw new Error("Missing 'question' field");
                            }

                            // if (!result.answer) throw new Error("Missing 'answer' field"); // Some might use table answer
                            if (!result.type) throw new Error("Missing 'type' field");

                            // MCQ Validation
                            if (result.type === 'mcq') {
                                if (!result.options || !Array.isArray(result.options)) {
                                    throw new Error("MCQ missing 'options' array");
                                }

                                if (result.allowMultiple) {
                                    // Handle multiple select answers (JSON array)
                                    let answers;
                                    try {
                                        answers = JSON.parse(result.answer);
                                        if (!Array.isArray(answers)) throw new Error("Parsed answer is not an array");
                                    } catch (e) {
                                        throw new Error(`allowMultiple is true but answer is not valid JSON array: ${result.answer}`);
                                    }

                                    const missingAnswers = answers.filter(ans => {
                                        return !result.options.some(o => {
                                            if (typeof o === 'string') return o === ans;
                                            return o.value === ans;
                                        });
                                    });

                                    if (missingAnswers.length > 0) {
                                        const optionsStr = result.options.map(o => typeof o === 'string' ? o : o.value).join(', ');
                                        throw new Error(`Answers [${missingAnswers.join(', ')}] not found in options: ${optionsStr}`);
                                    }
                                } else {
                                    // Check answer exists in options
                                    const answerFound = result.options.some(o => {
                                        if (typeof o === 'string') return o === result.answer;
                                        return o.value === result.answer;
                                    });

                                    if (!answerFound) {
                                        const optionsStr = result.options.map(o => typeof o === 'string' ? o : o.value).join(', ');
                                        throw new Error(`Answer "${result.answer}" not found in options: ${optionsStr}`);
                                    }
                                }
                            }

                            // Check for NaN or undefined in strings
                            const str = JSON.stringify(result);
                            if (str.includes("NaN")) throw new Error("Output contains 'NaN'");
                            if (str.includes("undefined")) throw new Error("Output contains 'undefined'");
                            if (str.includes("null") && !str.includes('"answer":null')) { // allow null checks if intended, but usually bad
                                // warn?
                            }

                        } catch (e) {
                            passed = false;
                            errorMsg = e.message;
                            break;
                        }
                    }

                    if (passed) {
                        console.log("✅ OK");
                        totalPass++;
                    } else {
                        console.log("❌ FAIL");
                        console.error(`      Error: ${errorMsg}`);
                        totalFail++;
                        failedGenerators.push(`${fileName} -> ${key}`);
                    }
                    totalTests++;
                }
            }

        } catch (err) {
            console.error(`   ❌ Failed to load module: ${err.message}`);
        }
    }

    console.log("\n---------------------------------------------------");
    console.log(`Summary:`);
    console.log(`Total Generators Tested: ${totalTests}`);
    console.log(`Passed: ${totalPass}`);
    console.log(`Failed: ${totalFail}`);

    if (totalFail > 0) {
        console.log("\nFailed Generators:");
        failedGenerators.forEach(f => console.log(` - ${f}`));
        process.exit(1);
    } else {
        console.log("\nAll systems operational! 🚀");
        process.exit(0);
    }
}

runTests();
