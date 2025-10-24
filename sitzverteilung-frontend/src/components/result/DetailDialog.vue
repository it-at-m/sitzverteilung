<template>
  <v-dialog
    v-model="isDialogShown"
    max-width="1200"
  >
    <v-card
      :title="`Detaillierte Informationen zum ${calculationMethod}-Verfahren`"
    >
      <v-card-text>
        <result-table
          class="mt-2"
          :calculation-result="calculationResult"
          :method-to-display="calculationMethod"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text="Schließen"
          @click="isDialogShown = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";

import ResultTable from "@/components/result/ResultTable.vue";

const isDialogShown = defineModel<boolean>({ required: true });
const { calculationMethod } = defineProps<{
  calculationMethod: CalculationMethod;
  calculationResult?: CalculationResult;
}>();
</script>
