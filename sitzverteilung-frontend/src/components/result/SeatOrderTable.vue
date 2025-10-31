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
    >
      <template v-slot:[`item.staleOrder`]="{ index }">
        <template
          v-if="
            mappedSeatOrder[index]?.minIndex !==
            mappedSeatOrder[index]?.maxIndex
          "
        >
          <v-icon :icon="mdiHandBackRight" />
        </template>
      </template>
      <template v-slot:[`item.name`]="{ value }">
        <span style="white-space: pre-line">
          {{ value }}
        </span>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { SeatOrder } from "@/types/calculation/ui/MergedSeatOrder.ts";
import type { DataTableHeader } from "vuetify/framework";

import { mdiHandBackRight } from "@mdi/js";
import { computed } from "vue";

import { formatVisiblePrecision } from "@/utility/numberFormatter.ts";
import { mapToMergedSeatOrders } from "@/utility/resultMapping.ts";

const { seatOrder } = defineProps<{
  seatOrder?: CalculationSeatOrder;
}>();

const mappedSeatOrder = computed(() => {
  if (!seatOrder) {
    return [];
  }
  const formattedRatios = formatVisiblePrecision(
    seatOrder.map((order) => order.value)
  );
  const formattedSeatOrders = seatOrder?.map((order, index) => {
    return {
      seatNumber: index + 1,
      name: order.groupName,
      ratio: formattedRatios[index],
    } as SeatOrder;
  });
  return mapToMergedSeatOrders(formattedSeatOrders);
});

const headers: DataTableHeader[] = [
  {
    title: "Sitznummer(n)",
    key: "seatNumber",
    width: 100,
    align: "center",
  },
  {
    title: "Patt",
    key: "staleOrder",
    width: 50,
    align: "center",
  },
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Quotient",
    key: "ratio",
    width: 100,
  },
];
</script>
