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
    <td v-if="expectedSeats !== 0">
      <p class="font-weight-bold">
        Gesamtanzahl: {{ numberFormatter(totalSeats) }} von
        {{ displayVotesCorrectly }}
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
    <td v-if="expectedSeats === 0">
      <p class="font-weight-bold">Gesamtanzahl: {{ displayVotesCorrectly }}</p>
    </td>
    <td />
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/basedata/Group.ts";

import { computed, toRefs } from "vue";

import { useGroupStatistics } from "@/composables/useGroupStatistics";
import { numberFormatter } from "@/utility/numberFormatter";

const props = defineProps<{
  groups: Group[];
  limitGroups: number;
  expectedSeats: number;
}>();

const displayVotesCorrectly = computed(() => {
  if (props.expectedSeats === 0) {
    return totalSeats;
  } else {
    return props.expectedSeats;
  }
});

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
} = useGroupStatistics(groupsRef, limitGroupsRef, expectedSeatsRef);
</script>
