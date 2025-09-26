export type GroupIndex = number;

export enum UnionType {
  COMMITTEE,
  FRACTION,
}

export const UNION_TYPE_PREFIXES: Record<UnionType, string> = {
  [UnionType.FRACTION]: "FG: ",
  [UnionType.COMMITTEE]: "AG: ",
};

export interface Union {
  name: string;
  unionType: UnionType;
  groups: GroupIndex[];
}
