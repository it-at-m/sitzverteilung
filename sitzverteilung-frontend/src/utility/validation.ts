export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
  MaxLength: (limit: number) => (value: string) =>
    value.length <= limit || `Die maximale Länge beträgt ${limit} Zeichen.`,
};

export const LimitConfiguration = {
  limitName: 45,
  limitGroups: 18,
  limitVotes: 99_999_999,
  limitCommitteeSize: 999,
} as const;
