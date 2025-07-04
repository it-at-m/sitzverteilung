export type GroupIndex = number;

export enum UnionType {
  COMMITTEE = "COMMITTEE",
  FRACTION = "FRACTION",
}

export interface Union {
  name: string;
  unionType: UnionType;
  groups: GroupIndex[];
}
