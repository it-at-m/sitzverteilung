export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
};