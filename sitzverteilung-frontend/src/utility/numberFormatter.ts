const formatter = new Intl.NumberFormat("de-DE", {
  useGrouping: true,
});

export function numberFormatter(number: number): string {
  return formatter.format(number);
}
