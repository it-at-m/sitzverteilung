export function numberFormatter(num: number): string {
  const formatter = new Intl.NumberFormat("de-DE", {
    useGrouping: true,
  });
  return formatter.format(num);
}

export function roundToExactDecimals(num: number, numDecimals: number) {
  const formatter = new Intl.NumberFormat("de-DE", {
    useGrouping: true,
    minimumFractionDigits: numDecimals,
    maximumFractionDigits: numDecimals,
  });
  return formatter.format(num);
}

/**
 * Formats an array of numbers to only display required decimals to differentiate between them
 * @param numbersToFormat numbers to format
 */
export function formatVisiblePrecision(numbersToFormat: number[]) {
  return numbersToFormat.map((num, index) => {
    const previous = numbersToFormat[index - 1];
    const next = numbersToFormat[index + 1];
    const diffPrecision = Math.max(
      getDiffPrecision(num, previous),
      getDiffPrecision(num, next)
    );
    const neededPrecision = Math.max(3, diffPrecision);
    const formatter = new Intl.NumberFormat("de-DE", {
      useGrouping: true,
      minimumFractionDigits: neededPrecision,
      maximumFractionDigits: neededPrecision,
      // @ts-expect-error newer API is not picked up by TS compiler, but available in browser
      roundingMode: "trunc",
    });
    return formatter.format(num);
  });
}

/**
 * Calculates the index for the decimal place where two numbers differ from each other
 * @param a number
 * @param b number
 */
function getDiffPrecision(a: number, b: number | undefined): number {
  if (b === undefined) return 0;
  const [aInt, aDec = ""] = a.toString().split(".");
  const [bInt, bDec = ""] = b.toString().split(".");
  if (aInt !== bInt) return 0;
  for (let i = 0; i < Math.max(aDec.length, bDec.length); i++) {
    if (aDec[i] !== bDec[i]) return i + 1;
  }
  return 0;
}
