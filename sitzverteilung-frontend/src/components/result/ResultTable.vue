<template>
  <v-container class="px-0">
    <div class="result-table">
      <v-data-table
        :headers="headers"
        :items="mappedResult"
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
          v-slot:[`header.${method}Title`]="{ column }"
        >
          <v-tooltip
            text="Detaillierte Informationen anzeigen"
            :disabled="!mappedResult.length"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                :disabled="!mappedResult.length"
                @click="emit('clickedCalculationMethod', method)"
                :text="column.title"
                class="my-3"
                :prepend-icon="mdiInformation"
                variant="flat"
                color="primary"
                block
              />
            </template>
          </v-tooltip>
        </template>
        <template
          v-for="method in AVAILABLE_METHODS"
          :key="method"
          v-slot:[`item.${method}${ResultDataSuffix.validationSuffix}`]="{
            item,
          }"
        >
          <template
            v-if="!item[`${method}${ResultDataSuffix.validationSuffix}`]"
          >
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-icon
                  :icon="mdiClose"
                  color="error"
                  :size="18"
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
              :icon="mdiCheck"
              color="success"
              :size="18"
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

              <span style="white-space: pre-line">
                {{ generateStaleText(item, method) }}
              </span>
            </v-tooltip>
          </template>
        </template>
        <template
          v-for="method in AVAILABLE_METHODS"
          :key="method"
          v-slot:[`header.${method}${ResultDataSuffix.validationSuffix}`]
        >
          <div class="d-flex justify-center align-center ga-2">
            <span
              :class="{ 'bg-error': !isMethodValid(method) }"
              class="px-2 py-1 rounded-sm"
            >
              Zulässigkeit
            </span>
            <v-icon
              :icon="isMethodValid(method) ? mdiCheck : mdiClose"
              :color="isMethodValid(method) ? 'success' : 'error'"
              :size="18"
              aria-label="Zulässigkeit"
            />
          </div>
        </template>
      </v-data-table>
    </div>
    <v-row v-if="!mappedResult.length">
      <v-col>
        <v-alert
          text="Keine Berechnung möglich, da Daten unvollständig oder nicht valide sind."
          type="error"
          variant="tonal"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import { mdiCheck, mdiClose, mdiHandBackRight, mdiInformation } from "@mdi/js";
import { computed } from "vue";

import {
  AVAILABLE_METHODS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";
import { mapCalculationResultToResultData } from "@/utility/resultMapping.ts";

const props = defineProps<{
  calculationResult?: CalculationResult;
}>();

const mappedResult = computed<ResultData[]>(() =>
  props.calculationResult
    ? mapCalculationResultToResultData(props.calculationResult)
    : ([] as ResultData[])
);

function isMethodValid(method: CalculationMethod): boolean | null {
  if (mappedResult.value.length === 0) return null;
  return mappedResult.value.every((row) =>
    Boolean(row[`${method}${ResultDataSuffix.validationSuffix}`])
  );
}

const headers = computed(() => [
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
    ],
  },
  ...AVAILABLE_METHODS.map((method) => ({
    title: `${method}`,
    key: `${method}Title`,
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
      {
        title: "",
        key: `${method}${ResultDataSuffix.validationSuffix}`,
        width: 50,
      },
    ],
  })),
  {
    title: "Proporz",
    key: "proportion",
    width: 50,
  },
]);

function generateStaleText(item: ResultData, method: CalculationMethod) {
  if (props.calculationResult !== undefined) {
    const staleInfo = props.calculationResult.methods[method]?.stale;

    if (staleInfo !== undefined && staleInfo.groupNames.includes(item.name)) {
      return `Patt von ${staleInfo.amountSeats} Sitzen, zwischen: ${staleInfo.groupNames.join(", ")}\nProporz von ${staleInfo.ratio}`;
    }
  }
  return "";
}

function generateValidationText(
  item: ResultData,
  method: CalculationMethod
): string {
  const validationData =
    props.calculationResult?.methods[method]?.validation?.[item.name];
  if (!validationData) return "Keine Validierungsdaten vorhanden";

  const reasons = [
    ...(validationData.overRounding ? ["Überaufrundung"] : []),
    ...(validationData.lostSafeSeat ? ["Verlust letzter sicherer Sitz"] : []),
    ...((validationData.committeeInvalid?.length ?? 0) > 0
      ? [
          `Konstellation ungültig, wegen: ${validationData.committeeInvalid.join(", ")}`,
        ]
      : []),
  ];

  if (reasons.length === 0) {
    return "gültig";
  }

  return `Nicht zulässig wegen:\n- ${reasons.join("\n- ")}`;
}

const emit = defineEmits<{
  clickedCalculationMethod: [calculationMethod: CalculationMethod]; // named tuple syntax
  update: [value: string];
}>();
</script>
<style>
.result-table .v-data-table td:not(:last-child),
.result-table .v-data-table th {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
