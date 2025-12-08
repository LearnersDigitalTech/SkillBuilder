
import { generateComparingQuantities } from './src/questionBook/Grade8/grade8Generators.mjs';

console.log("Generating 10 Comparing Quantities questions:");
for (let i = 0; i < 10; i++) {
    const q = generateComparingQuantities();
    console.log(JSON.stringify(q, null, 2));
}
