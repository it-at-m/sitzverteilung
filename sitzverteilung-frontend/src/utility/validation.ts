export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
};

export const LimitConfiguration = {
  limitName: 50,
  limitGroups: 18,
  limitVotes: 100_000_000,
  limitCommitteeSize: 999,
};
