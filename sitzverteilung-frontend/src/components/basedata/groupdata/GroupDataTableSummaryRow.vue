<template>
  <tr class="bg-primary">
    <td />
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ numberFormatter(amountOfGroups)
        }}<span :class="{ 'text-red': isTooManyGroups }">
          (max. {{ numberFormatter(expectedSeats) }})</span
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
import type { Group } from "@/types/Group";

import { toRefs } from "vue";

import { numberFormatter } from "@/composables/numberFormatter";
import { useGroupStatistics } from "@/composables/useGroupStatistics";

const props = defineProps<{
  groups: Group[];
  expectedSeats: number;
}>();

const { groups: groupsRef, expectedSeats: expectedSeatsRef } = toRefs(props);

const {
  amountOfGroups,
  isTooManyGroups,
  isSeatsTooHigh,
  isSeatsTooLow,
  totalSeats,
  totalVotes,
} = useGroupStatistics(groupsRef, expectedSeatsRef);
</script>
