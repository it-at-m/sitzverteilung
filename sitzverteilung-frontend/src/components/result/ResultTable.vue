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
      :disabled="!calculationResults.length"
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
  >
    <template
      v-for="method in AVAILABLE_METHODS"
      :key="method"
      v-slot:[`item.${method}${ResultDataSuffix.validationSuffix}`]="{ item }"
    >
      <template v-if="!item[`${method}${ResultDataSuffix.validationSuffix}`]">
        <v-tooltip>
          <template v-slot:activator="{ props }">
            <v-icon
              color="red"
              :icon="mdiClose"
              v-bind="props"
            />
          </template>
          <span style="white-space: pre-line">
            {{ generateValidationText(item, method) }}
          </span>
        </v-tooltip>
      </template>
      <template v-else>
        <v-icon
          color="green"
          :icon="mdiCheck"
        />
      </template>
    </template>
    <template
      v-for="method in AVAILABLE_METHODS"
      :key="method"
      v-slot:[`item.${method}${ResultDataSuffix.staleSuffix}`]="{ item }"
    >
      <template v-if="item[`${method}${ResultDataSuffix.staleSuffix}`]">
        <v-tooltip>
          <template v-slot:activator="{ props }">
            <v-icon
              :icon="mdiHandBackRight"
              v-bind="props"
            />
          </template>
          <span>{{ generateStaleText(item, method) }}</span>
        </v-tooltip>
      </template>
    </template>
  </v-data-table>
  <v-row v-if="!calculationResults.length">
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
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import { mdiCheck, mdiClose, mdiHandBackRight } from "@mdi/js";
import { computed, ref } from "vue";

import {
  AVAILABLE_METHODS,
  CALCULATION_METHOD_SHORT_FORMS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";
import { mapCalculationResultToResultData } from "@/utility/resultMapping.ts";

const props = defineProps<{
  unmappedResults: CalculationResult;
}>();

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
    children: AVAILABLE_METHODS.map((method) => ({
      title: CALCULATION_METHOD_SHORT_FORMS[method],
      key: `${method}${ResultDataSuffix.validationSuffix}`,
    })),
  },
  {
    title: "Ergebnisse",
    children: AVAILABLE_METHODS.map((method) => ({
      title: CALCULATION_METHOD_SHORT_FORMS[method],
      children: [
        {
          title: "Sitze",
          key: `${method}${ResultDataSuffix.seatsSuffix}`,
          width: 50,
        },
        {
          title: "Patt",
          key: `${method}${ResultDataSuffix.staleSuffix}`,
          width: 50,
        },
      ],
    })),
  },
  {
    title: "Dokumentation",
    width: 200,
    key: "documentation",
  },
];

const calculationResults = computed(() => {
  if (!props.unmappedResults) {
    return [];
  }
  return mapCalculationResultToResultData(props.unmappedResults);
});

const dialog = ref(false);
const detailTitle = ref("");

// Placeholder for future content, currently unused
const detailInfo = ref<string>("");

function goToDetail(selectedCalculationMethod: CalculationMethod) {
  detailTitle.value = selectedCalculationMethod;
  dialog.value = true;
}

function generateStaleText(item: ResultData, method: CalculationMethod) {
  const staleInfo = props.unmappedResults.methods[method]?.stale;

  if (staleInfo !== undefined) {
    if (staleInfo.groupNames.includes(item.name)) {
      return "Patt zwischen: " + staleInfo.groupNames.join(", ");
    }
  }
}

function generateValidationText(
  item: ResultData,
  method: CalculationMethod
): string {
  const validationData =
    props.unmappedResults?.methods[method]?.validation?.[item.name];
  if (!validationData) return "Keine Validierungsdaten vorhanden";

  const reasons = [
    ...(validationData.overRounding ? ["Überaufrundung"] : []),
    ...(validationData.lostSafeSeat ? ["Verlust letzter sicheren Sitzes"] : []),
    ...((validationData.committeeInvalid?.length ?? 0) > 0
      ? [
          `Konstellation ungültig, wegen: ${validationData.committeeInvalid.join(", ")}`,
        ]
      : []),
  ];

  return `Nicht zulässig wegen:\n- ${reasons.join("\n- ")}`;
}
</script>
