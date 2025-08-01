import type { Group } from "@/types/basedata/Group.ts";
import type { Union } from "@/types/basedata/Union.ts";

export interface BaseData {
  name: string;
  committeeSize?: number;
  groups: Group[];
  unions: Union[];
}
