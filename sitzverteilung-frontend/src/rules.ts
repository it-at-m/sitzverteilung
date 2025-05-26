export const FieldValidationRules = {
  Required: (value: string) => !!value || "Der Name muss ausgefüllt werden.",
  Integer: (value: string) => Number.isInteger(value) || "Das Feld darf nur eine Ganzzahl enthalten.",
  LargerThan: (num: number) => (value: string) => parseInt(value) > num || `Der Wert muss größer als ${num} sein.`
};
