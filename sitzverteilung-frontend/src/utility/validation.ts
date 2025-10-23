import type { BaseData } from "@/types/basedata/BaseData.ts";

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
      (prefix) => !value.trim().startsWith(prefix.trim())
    ) ||
    "Fraktions- und Ausschussgemeinschaften müssen über die entsprechenden Schaltflächen gebildet werden.",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function isValidBaseData(x: any): x is BaseData {
  return (
    x &&
    typeof x.name === "string" &&
    typeof x.committeeSize === "number" &&
    Array.isArray(x.groups) &&
    Array.isArray(x.unions) &&
    x.groups.every((group: any) => group && typeof group.name === "string") &&
    x.unions.every((union: any) => union && Array.isArray(union.groups))
  );
}

export function isValidCalculationData(x: any): x is BaseData {
  return (
    isValidBaseData(x) &&
    typeof x.targetSize === "number" &&
    x.groups.length >= 2
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const LimitConfiguration = {
  limitName: 45,
  limitGroups: 30,
  limitVotes: 99_999_999,
  limitCommitteeSize: 999,
  limitURLEncoderSize: 8192,
} as const;
