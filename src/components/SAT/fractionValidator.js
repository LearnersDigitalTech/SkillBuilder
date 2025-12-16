
export const validateFractionValue = (userVal, correctVal) => {
    // 1. Helper to parse value into number
    // Handles: "1/2", "3", "3.5", {num: 1, den: 2} (object from TableInput)

    const parseValue = (val) => {
        if (!val) return NaN;

        // Handle object {num, den}
        if (typeof val === 'object' && val !== null) {
            const n = parseFloat(val.num);
            const d = parseFloat(val.den);
            if (!isNaN(n) && !isNaN(d) && d !== 0) return n / d;
            return NaN;
        }

        const str = String(val).trim();

        // Handle Fraction String "1/2"
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 2) {
                const n = parseFloat(parts[0]);
                const d = parseFloat(parts[1]);
                if (!isNaN(n) && !isNaN(d) && d !== 0) return n / d;
            }
        }

        // Handle Decimal/Number
        return parseFloat(str);
    };

    const roundTo2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const uValRaw = parseValue(userVal);
    const cValRaw = parseValue(correctVal);

    if (isNaN(uValRaw) || isNaN(cValRaw)) {
        // Fallback to strict string equality if parsing fails
        // But for "all fractions", parsing shouldn't fail if they are valid numbers.
        // If correctVal is something non-numeric (like "Sunday"), we fall back.
        const uStr = typeof userVal === 'object' ? `${userVal.num}/${userVal.den}` : String(userVal).trim();
        const cStr = typeof correctVal === 'object' ? `${correctVal.num}/${correctVal.den}` : String(correctVal).trim();
        return uStr === cStr;
    }

    const uRounded = roundTo2(uValRaw);
    const cRounded = roundTo2(cValRaw);

    const diff = Math.abs(uRounded - cRounded);
    return diff <= 0.02;
};
