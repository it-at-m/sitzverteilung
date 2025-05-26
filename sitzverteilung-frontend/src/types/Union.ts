type GroupName = string;

export enum UnionType {
  COMMITTEE, FRACTION
}

export interface Union {
  unionType: UnionType;
  groups: Set<GroupName>;
}
