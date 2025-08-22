export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
  IsLimitReached: (limitname: number) => (value: string) =>
    (value !== null &&
      value !== undefined &&
      value.trim().length <= limitname) ||
    "Die maximale Länge beträgt 45 Zeichen.",
};

export const LimitConfiguration = {
  limitName: 45,
  limitGroups: 18,
  limitVotes: 99_999_999,
  limitCommitteeSize: 999,
} as const;
