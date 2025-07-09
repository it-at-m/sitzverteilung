export type GroupIndex = number;

export enum UnionType {
  COMMITTEE,
  FRACTION,
}

export interface Union {
  name: string;
  unionType: UnionType;
  groups: GroupIndex[];
}
