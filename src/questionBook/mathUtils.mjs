
/**
 * Formats a linear expression given a list of terms.
 * Each term should be an object: { coeff: number, var: string }
 * Example: [{coeff: 1, var: 'x'}, {coeff: -2, var: 'y'}] -> "x - 2y"
 * 
 * Rules:
 * - 0 coefficient: Term is omitted.
 * - 1 coefficient: "1x" -> "x" (unless it's a constant without var).
 * - -1 coefficient: "-1x" -> "-x".
 * - Positive term (after first): prefixed with "+ ".
 * - Negative term (after first): prefixed with "- " (and absoluted).
 * - First term negative: "-2x".
 */
export const formatLinearExpression = (terms) => {
    let expression = "";
    let isFirst = true;

    for (const term of terms) {
        const coeff = term.coeff;
        const variable = term.var || ""; // Handle constants if var is empty

        if (coeff === 0) continue;

        let termStr = "";
        const absCoeff = Math.abs(coeff);

        // Determine operator/sign
        if (isFirst) {
            if (coeff < 0) expression += "-";
        } else {
            expression += coeff < 0 ? " - " : " + ";
        }

        // Determine value string
        if (variable) {
            // For variables, omit 1
            if (absCoeff !== 1) {
                termStr += absCoeff;
            }
            termStr += variable;
        } else {
            // Constant term
            termStr += absCoeff;
        }

        expression += termStr;
        isFirst = false;
    }

    if (expression === "") return "0"; // Fallback if all terms are 0

    return expression;
};
