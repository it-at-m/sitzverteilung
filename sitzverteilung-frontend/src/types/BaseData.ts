import type { Group } from "@/types/Group.ts";
import type { Union } from "@/types/Union.ts";

export interface BaseData {
  name: string;
  committeeSize: number;
  groups: Set<Group>;
  unions: Set<Union>;
}
