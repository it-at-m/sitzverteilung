<template>
  <tr class="bg-primary">
    <td />
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ numberFormatter(amountOfGroups)
        }}<span :class="{ 'text-red': isTooManyGroups }">
          (max. {{ numberFormatter(maximumGroups) }})</span
        >
      </p>
    </td>
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ numberFormatter(totalSeats) }} von
        {{ numberFormatter(expectedSeats) }}
        <span
          v-if="isSeatsTooHigh"
          class="text-red"
          >(überschritten)</span
        ><span
          v-else-if="isSeatsTooLow"
          class="text-red"
          >(fehlend)</span
        >
      </p>
    </td>
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ numberFormatter(totalVotes) }}
      </p>
    </td>
    <td />
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/basedata/Group.ts";

import { toRefs } from "vue";

import { useGroupStatistics } from "@/composables/useGroupStatistics";
import { numberFormatter } from "@/utility/numberFormatter";

const props = defineProps<{
  groups: Group[];
  limitGroups: number;
  expectedSeats: number;
}>();

const {
  groups: groupsRef,
  limitGroups: limitGroupsRef,
  expectedSeats: expectedSeatsRef,
} = toRefs(props);

const {
  amountOfGroups,
  maximumGroups,
  isTooManyGroups,
  isSeatsTooHigh,
  isSeatsTooLow,
  totalSeats,
  totalVotes,
} = useGroupStatistics(groupsRef, limitGroupsRef, expectedSeatsRef);
</script>
