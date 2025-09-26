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
    />
  </v-toolbar>
  <v-data-table
    :headers="headers"
    :items="results"
    hide-default-footer
    no-filter
    disable-sort
    density="compact"
    no-data-text="Keine Berechnungsdaten vorhanden."
    :items-per-page="-1"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";

import {
  AVAILABLE_METHODS,
  CALCULATION_METHOD_SHORT_FORMS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";

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
          key: `${method}-seats`,
          width: 50,
        },
        {
          title: "Patt",
          key: `${method}-stale`,
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
      key: `${method}-validation`,
      width: 60,
    };
  });
}

const results = ref<unknown[]>([]);
const dialog = ref(false);
const detailTitle = ref("");

// Placeholder for future content, currently unused
const detailInfo = ref<string>("");

function goToDetail(selectedCalculationMethod: CalculationMethod) {
  detailTitle.value = selectedCalculationMethod;
  dialog.value = true;
}
</script>
