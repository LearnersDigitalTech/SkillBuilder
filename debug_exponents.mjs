
import { generateExponentsGrade8 } from './src/questionBook/Grade8/grade8Generators.mjs';

console.log("Generating 10 Exponents questions:");
for (let i = 0; i < 10; i++) {
    const q = generateExponentsGrade8();
    console.log(JSON.stringify(q, null, 2));
}
