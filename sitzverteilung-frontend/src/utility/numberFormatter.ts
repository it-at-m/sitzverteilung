export function numberFormatter(number: number): string {
  const formatter = new Intl.NumberFormat("de-DE", {
    useGrouping: true,
  });
  return formatter.format(number);
}

/**
 * Formats an array of numbers to only display required decimals to differentiate between them
 * @param numbers numbers to format
 */
export function formatVisiblePrecision(numbers: number[]) {
    return numbers.map((number, index) => {
        const previous = numbers[index - 1];
        const next = numbers[index + 1];
        const diffPrecision = Math.max(
            getDiffPrecision(number, previous),
            getDiffPrecision(number, next)
        );
        const neededPrecision = Math.max(3, diffPrecision);
        const formatter = new Intl.NumberFormat("de-DE", {
            useGrouping: true,
            minimumFractionDigits: neededPrecision,
            maximumFractionDigits: neededPrecision,
            roundingMode: "trunc"
        });
        return formatter.format(number);
    });
}

/**
 * Calculates the index for the decimal place where two numbers differ from each other
 * @param a number
 * @param b number
 */
function getDiffPrecision(a: number, b: number): number {
    if (b === undefined) return 0;
    const [aInt, aDec = ""] = a.toString().split(".");
    const [bInt, bDec = ""] = b.toString().split(".");
    if (aInt !== bInt) return 0;
    for (let i = 0; i < Math.max(aDec.length, bDec.length); i++) {
        if (aDec[i] !== bDec[i]) return i + 1;
    }
    return 0;
}