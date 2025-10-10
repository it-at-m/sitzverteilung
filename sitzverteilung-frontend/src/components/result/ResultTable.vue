<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>{{ detailTitle }}</v-card-title>
      <v-card-text>
        <p>Detailinformationen {{ detailInfo }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          @click="dialog = false"
          text="Schließen"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-toolbar flat>
    <v-toolbar-title>Detailansicht zu:</v-toolbar-title>
    <v-btn
      v-for="method in AVAILABLE_METHODS"
      :key="method"
      variant="outlined"
      class="mx-2"
      @click="goToDetail(method)"
      :text="method"
      :disabled="!hasValidData"
    />
  </v-toolbar>
  <v-data-table
    :headers="headers"
    :items="calculationResults"
    hide-default-footer
    no-filter
    disable-sort
    density="compact"
    no-data-text=""
    :items-per-page="-1"
  />
  <v-row v-if="!hasValidData">
    <v-col>
      <v-alert
        text="Keine Berechnung möglich, da Daten unvollständig oder nicht valide sind."
        type="error"
        variant="tonal"
      />
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import { ref } from "vue";

import {
  AVAILABLE_METHODS,
  CALCULATION_METHOD_SHORT_FORMS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";

defineProps<{
  hasValidData: boolean;
  currentBaseData: BaseData;
}>();
const calculationResults = defineModel<ResultData[]>({ required: true });

const headers = [
  {
    title: "Zusammensetzung",
    children: [
      {
        title: "Name",
        key: "name",
        width: 200,
      },
      {
        title: "Sitze",
        key: "seatsOrVotes",
        width: 50,
      },
      {
        title: "Proporz",
        key: "proportion",
        width: 50,
      },
    ],
  },
  {
    title: "Zulässigkeit",
    children: getValidationColumns(),
  },
  {
    title: "Ergebnisse",
    children: getResultColumns(),
  },
  {
    title: "Dokumentation",
    width: 200,
    key: "documentation",
  },
];

function getResultColumns() {
  return AVAILABLE_METHODS.map((method) => {
    return {
      title: CALCULATION_METHOD_SHORT_FORMS[method],
      key: method,
      children: [
        {
          title: "Sitze",
          key: `${method}` + ResultDataSuffix.seatsSuffix,
          width: 50,
        },
        {
          title: "Patt",
          key: `${method}` + ResultDataSuffix.staleSuffix,
          width: 50,
        },
      ],
    };
  });
}

function getValidationColumns() {
  return AVAILABLE_METHODS.map((method) => {
    return {
      title: CALCULATION_METHOD_SHORT_FORMS[method],
      key: `${method}` + ResultDataSuffix.validationSuffix,
      width: 60,
    };
  });
}

const dialog = ref(false);
const detailTitle = ref("");

// Placeholder for future content, currently unused
const detailInfo = ref<string>("");

function goToDetail(selectedCalculationMethod: CalculationMethod) {
  detailTitle.value = selectedCalculationMethod;
  dialog.value = true;
}
</script>
