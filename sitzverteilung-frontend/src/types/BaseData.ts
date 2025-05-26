import type { Group } from "@/types/Group";
import type { Union } from "@/types/Union";

export interface BaseData {
  name: string;
  committeeSize: number;
  groups: Group[];
  unions: Union[];
}
