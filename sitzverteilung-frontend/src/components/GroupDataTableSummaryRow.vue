<template>
  <tr class="bg-primary">
    <td />
    <td>
      <p class="font-weight-bold">Gesamtanzahl: {{ amountOfGroups }}<span :class="{ 'text-red': tooManyGroups }"> (max. {{ maxGroups }})</span></p>
    </td>
    <td>
      <p class="font-weight-bold">Gesamtanzahl: {{ groupSeatsSum }}</p>
    </td>
    <td />
    <td />
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";

import { computed } from "vue";

const props = defineProps<{
  groups: Group[];
  maxGroups: number;
}>();

const amountOfGroups = computed(() => props.groups.length);
const tooManyGroups = computed(() => amountOfGroups.value > props.maxGroups);

const groupSeatsSum = computed(() => {
  return props.groups.reduce(
    (sum, group) => sum + (group.committeeSeats ?? 0),
    0
  );
});
</script>
