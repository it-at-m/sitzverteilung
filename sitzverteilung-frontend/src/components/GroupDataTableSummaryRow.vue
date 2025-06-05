<template>
  <tr class="bg-primary">
    <td />
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ amountOfGroups
        }}<span :class="{ 'text-red': tooManyGroups }">
          (max. {{ expectedSeats }})</span
        >
      </p>
    </td>
    <td>
      <p class="font-weight-bold">
        Gesamtanzahl: {{ totalSeats }} von {{ expectedSeats }}
        <span
          v-if="seatsTooHigh"
          class="text-red"
          >(überschritten)</span
        ><span
          v-else-if="seatsTooLow"
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

import { computed } from "vue";

const props = defineProps<{
  groups: Group[];
  expectedSeats: number;
}>();

const amountOfGroups = computed(() => props.groups.length);
const tooManyGroups = computed(
  () => amountOfGroups.value > props.expectedSeats
);
const seatsTooHigh = computed(() => totalSeats.value > props.expectedSeats);
const seatsTooLow = computed(() => totalSeats.value < props.expectedSeats);

const totalSeats = computed(() => {
  return props.groups.reduce(
    (sum, group) => sum + (group.committeeSeats ? group.committeeSeats : 0),
    0
  );
});

const totalVotes = computed(() => {
  return props.groups.reduce((sum, group) => sum + (group.votes ?? 0), 0);
});
</script>
