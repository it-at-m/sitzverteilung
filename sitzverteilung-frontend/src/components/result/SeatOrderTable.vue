<template>
  <div class="bordered-table">
    <v-data-table
        :headers="headers"
        :items="mappedSeatOrder"
        no-filter
        hide-default-footer
        disable-sort
        density="compact"
        no-data-text="Es konnte kein Sitz eindeutig vergeben werden."
        :items-per-page="-1"
    />
  </div>
</template>

<script setup lang="ts">
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import { computed } from "vue";
import {formatVisiblePrecision} from "@/utility/numberFormatter.ts";

const { seatOrder } = defineProps<{
  seatOrder?: CalculationSeatOrder;
}>();

const mappedSeatOrder = computed(() => {
  const formattedRatios = formatVisiblePrecision(seatOrder.map(order => order.value));
  return seatOrder?.map((order, index) => {
    return {
      seatNumber: index + 1,
      name: order.groupName,
      ratio: formattedRatios[index]
    }
  });
});

const headers = [
  {
    title: "Sitznummer",
    key: "seatNumber",
    width: 100
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Quotient",
    key: "ratio",
  },
];
</script>