<template>
  <tr class="bg-primary">
    <td />
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ amountOfGroups
        }}<span :class="{ 'text-red': isTooManyGroups }">
          (max. {{ expectedSeats }})</span
        >
      </p>
    </td>
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ totalSeats }} von {{ expectedSeats }}
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
      <p class="font-weight-bold">Gesamtanzahl: {{ totalVotes }}</p>
    </td>
    <td />
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";

import { toRefs } from "vue";

import { useGroupStatistics } from "@/composables/useGroupStatistics";

const props = defineProps<{
  groups: Group[];
  expectedSeats: number;
}>();

const { groups, expectedSeats } = toRefs(props);

const {
  amountOfGroups,
  isTooManyGroups,
  isSeatsTooHigh,
  isSeatsTooLow,
  totalSeats,
  totalVotes,
} = useGroupStatistics(groups, expectedSeats);
</script>
