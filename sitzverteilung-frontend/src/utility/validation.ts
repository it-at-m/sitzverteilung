import { UNION_TYPE_PREFIXES } from "@/types/basedata/Union.ts";

export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
  MaxLength: (limit: number) => (value: string) =>
    value.length <= limit || `Die maximale Länge beträgt ${limit} Zeichen.`,
  IsNotUnionName: (value: string) =>
    Object.values(UNION_TYPE_PREFIXES).every(
      (prefix) => !value.startsWith(prefix.trim())
    ) ||
    "Fraktions- und Ausschussgemeinschaften müssen über die entsprechenden Schaltflächen gebildet werden.",
};

export const LimitConfiguration = {
  limitName: 45,
  limitGroups: 30,
  limitVotes: 99_999_999,
  limitCommitteeSize: 999,
  limitURLEncoderSize: 8192,
} as const;
