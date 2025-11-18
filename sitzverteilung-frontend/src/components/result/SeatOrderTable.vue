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
      <template v-slot:[`item.staleOrder`]="{ item }">
        <template v-if="item.minIndex !== item.maxIndex">
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
import type { DataTableHeader } from "vuetify/framework";

import { mdiHandBackRight } from "@mdi/js";
import { computed } from "vue";

import { mapSeatOrder } from "@/utility/resultMapping.ts";

const { seatOrder } = defineProps<{
  seatOrder?: CalculationSeatOrder;
}>();

const mappedSeatOrder = computed(() => {
  return mapSeatOrder(seatOrder, true);
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
