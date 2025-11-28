<template>
  <v-dialog
    v-model="isDialogShown"
    width="auto"
    scrollable
  >
    <v-card
      :title="`Detaillierte Informationen zum ${calculationMethod}-Verfahren`"
      :prepend-icon="mdiInformation"
    >
      <v-card-text>
        <p>
          Größe des Hauptorgans: <b>{{ committeeSize ?? "keine Angabe" }}</b>
        </p>
        <p>
          Größe des Ausschusses: <b>{{ targetSize ?? "keine Angabe" }}</b>
        </p>
        <result-table
          class="my-2"
          :calculation-result="calculationResult"
          :method-to-display="calculationMethod"
        />
        <p class="mb-3">
          <b
            >Sitzreihung
            {{
              calculationMethod === CalculationMethod.HARE_NIEMEYER
                ? `(nach ${CalculationMethod.D_HONDT}-Verfahren)`
                : ""
            }}</b
          >
        </p>
        <v-alert
          v-if="calculationResult?.methods[calculationMethod]?.stale"
          text="Aufgrund eines Patts bei der Sitzverteilung enthält die Sitzreihung nicht die vollständige Anzahl an Sitzen entsprechend der eingegebenen Ausschussgröße."
          type="info"
          variant="tonal"
        />
        <seat-order-table
          class="my-2"
          :seats="calculationResult?.seats"
          :seat-order="calculationResult?.methods[calculationMethod]?.order"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :prepend-icon="mdiDownload"
          text="PDF herunterladen"
          :disabled="!calculationResult"
          @click="
            generatePDF(
              targetSize,
              committeeSize,
              calculationResult!,
              calculationMethod
            )
          "
        />
        <v-btn
          text="Schließen"
          @click="isDialogShown = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";

import { mdiDownload, mdiInformation } from "@mdi/js";

import ResultTable from "@/components/result/ResultTable.vue";
import SeatOrderTable from "@/components/result/SeatOrderTable.vue";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import { generatePDF } from "@/utility/pdfGeneration.ts";

const isDialogShown = defineModel<boolean>({ required: true });
defineProps<{
  calculationMethod: CalculationMethod;
  targetSize?: number;
  committeeSize?: number;
  calculationResult?: CalculationResult;
}>();
</script>
