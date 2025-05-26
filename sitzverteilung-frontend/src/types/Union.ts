export type GroupName = string;

export enum UnionType {
  COMMITTEE = "COMMITTEE",
  FRACTION = "FRACTION",
}

export interface Union {
  unionType: UnionType;
  groups: GroupName[];
}
