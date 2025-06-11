export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  Integer: (value: number) =>
    Number.isInteger(value) || "Das Feld muss eine Ganzzahl enthalten.",
  LargerThan: (num: number) => (value: number) =>
    value > num || `Der Wert muss größer als ${num} sein.`,
  LowerOrEqualThan: (num: number) => (value: number) =>
    value <= num || `Der Wert darf maximal ${num} sein.`,
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val === value).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert."
};
