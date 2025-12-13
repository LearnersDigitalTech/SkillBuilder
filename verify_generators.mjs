
import * as G7 from './src/questionBook/Grade7/grade7Generators.mjs';
import * as G8 from './src/questionBook/Grade8/grade8Generators.mjs';
import * as G9 from './src/questionBook/Grade9/grade9Generators.mjs';
import * as G10 from './src/questionBook/Grade10/grade10Generators.mjs';

const safeRun = (name, fn) => {
    try {
        fn();
        // console.log(`PASS: ${name}`);
    } catch (e) {
        console.error(`FAIL: ${name}`, e.message);
        if (e.message.includes("answerObj")) {
            console.error("!!! FOUND IT !!!");
            console.error(e);
        }
    }
};

const runAll = (label, module) => {
    console.log(`Verifying ${label}...`);
    Object.keys(module).forEach(key => {
        if (typeof module[key] === 'function') {
            safeRun(`${label}.${key}`, module[key]);
        }
    });
};

runAll("G7", G7);
runAll("G8", G8);
runAll("G9", G9);
runAll("G10", G10);
