<template>
  <v-container class="px-0">
    <div class="bordered-table">
      <v-data-table
        :headers="headers"
        :items="mappedResult"
        hide-default-footer
        no-filter
        density="compact"
        no-data-text=""
        :items-per-page="-1"
        :sort-by="[
          { key: 'seatsOrVotes', order: 'desc' },
          { key: 'name', order: 'asc' },
        ]"
        multi-sort
      >
        <template v-slot:[`header.constellation`]="{ column }">
          <div class="d-flex align-center justify-space-between">
            <p>{{ column.title }}</p>
            <v-btn
              v-if="!methodToDisplay"
              :prepend-icon="mdiDownload"
              text="PDFs herunterladen"
              class="my-3"
              :disabled="!calculationResult"
              variant="flat"
              color="primary"
              @click="emit('clickedDownloadAllPdfs')"
            />
          </div>
        </template>
        <template
          v-for="method in methodsToDisplay"
          :key="method"
          v-slot:[`header.${method}Title`]="{ column }"
        >
          <v-tooltip
            text="Detaillierte Informationen anzeigen"
            :disabled="!mappedResult.length"
            location="top"
            v-if="!methodToDisplay"
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
          <template v-else>
            <span> {{ column.title }}</span>
          </template>
        </template>
        <template
          v-for="method in methodsToDisplay"
          :key="method"
          v-slot:[`header.${method}${ResultDataSuffix.validationSuffix}`]="{
            column,
          }"
        >
          <div class="d-flex flex-row justify-center align-center ga-2">
            <span
              :class="{
                'bg-error': mappedResult.length && !isMethodValid(method),
              }"
              class="px-2 py-1 rounded-sm"
            >
              {{ column.title }}
            </span>
            <v-icon
              v-if="mappedResult.length"
              :icon="isMethodValid(method) ? mdiCheck : mdiClose"
              :color="isMethodValid(method) ? 'success' : 'error'"
            />
          </div>
        </template>
        <template
          v-for="method in methodsToDisplay"
          :key="method"
          v-slot:[`item.${method}${ResultDataSuffix.staleSuffix}`]="{ item }"
        >
          <template v-if="item[`${method}${ResultDataSuffix.staleSuffix}`]">
            <v-tooltip v-if="!methodToDisplay">
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
            <template v-else>
              <span style="white-space: pre-line">
                {{ generateStaleText(item, method) }}
              </span>
            </template>
          </template>
        </template>
        <template
          v-for="method in methodsToDisplay"
          :key="method"
          v-slot:[`item.${method}${ResultDataSuffix.validationSuffix}`]="{
            item,
          }"
        >
          <template
            v-if="!item[`${method}${ResultDataSuffix.validationSuffix}`]"
          >
            <v-tooltip v-if="!methodToDisplay">
              <template v-slot:activator="{ props }">
                <div class="d-flex flex-row justify-center">
                  <v-icon
                    :icon="mdiClose"
                    color="error"
                    v-bind="props"
                  />
                </div>
              </template>
              <span style="white-space: pre-line">
                {{ generateValidationText(item, method) }}
              </span>
            </v-tooltip>
            <template v-else>
              <span style="white-space: pre-line">
                {{ generateValidationText(item, method) }}
              </span>
            </template>
          </template>
          <template v-else>
            <div class="d-flex flex-row justify-center">
              <v-icon
                :icon="mdiCheck"
                color="success"
              />
            </div>
          </template>
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

import {
  mdiCheck,
  mdiClose,
  mdiDownload,
  mdiHandBackRight,
  mdiInformation,
} from "@mdi/js";
import { computed } from "vue";

import {
  AVAILABLE_METHODS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";
import {
  mapCalculationResultToResultData,
  stripUnionPrefix,
} from "@/utility/resultMapping.ts";

const { calculationResult, methodToDisplay, showSeats } = defineProps<{
  calculationResult?: CalculationResult;
  methodToDisplay?: CalculationMethod;
  showSeats?: boolean;
}>();

const methodsToDisplay = computed(() =>
  methodToDisplay ? [methodToDisplay] : AVAILABLE_METHODS
);

const mappedResult = computed<ResultData[]>(() =>
  calculationResult
    ? mapCalculationResultToResultData(calculationResult)
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
    key: "constellation",
    sortable: false,
    children: [
      {
        title: "Name",
        key: "name",
        sort: (a: string, b: string) => {
          const strippedA = stripUnionPrefix(a);
          const strippedB = stripUnionPrefix(b);
          return strippedA.localeCompare(strippedB);
        },
      },
      {
        title: showSeats ? "Sitze" : "Stimmen",
        key: "seatsOrVotes",
      },
    ],
  },
  ...methodsToDisplay.value.map((method) => ({
    title: `${method}`,
    key: `${method}Title`,
    sortable: false,
    children: [
      {
        title: "Zulässigkeit",
        key: `${method}${ResultDataSuffix.validationSuffix}`,
        width: !methodToDisplay ? 150 : undefined,
        sortable: false,
      },
      {
        title: "Sitze",
        key: `${method}${ResultDataSuffix.seatsSuffix}`,
      },
      {
        title: "Patt",
        key: `${method}${ResultDataSuffix.staleSuffix}`,
        width: !methodToDisplay ? 50 : undefined,
        align: !methodToDisplay ? "center" : "left",
        sortable: false,
      },
    ],
  })),
  {
    title: "Proporz",
    key: "proportion",
    width: 100,
  },
]);

function generateStaleText(item: ResultData, method: CalculationMethod) {
  if (calculationResult !== undefined) {
    const staleInfo = calculationResult.methods[method]?.stale;

    if (staleInfo !== undefined && staleInfo.groupNames.includes(item.name)) {
      return `Anzahl betroffener Sitze: ${staleInfo.amountSeats}\nBeteiligt: ${staleInfo.groupNames.join(", ")}\nQuotient: ${staleInfo.ratio}`;
    }
  }
  return "";
}

function generateValidationText(
  item: ResultData,
  method: CalculationMethod
): string {
  const validationData =
    calculationResult?.methods[method]?.validation?.[item.name];
  if (!validationData) return "Keine Validierungsdaten vorhanden";

  const reasons = [
    ...(validationData.overRounding ? ["Überaufrundung"] : []),
    ...(validationData.lostSafeSeat ? ["Verlust letzter sicherer Sitz"] : []),
    ...((validationData.committeeInvalid?.length ?? 0) > 0
      ? [`Sicherer Sitz: ${validationData.committeeInvalid.join(", ")}`]
      : []),
  ];

  return `Nicht zulässig wegen:\n- ${reasons.join("\n- ")}`;
}

const emit = defineEmits<{
  clickedCalculationMethod: [calculationMethod: CalculationMethod];
  clickedDownloadAllPdfs: [];
}>();
</script>
