<template>
  <v-dialog
    v-model="isDialogShown"
    transition="dialog-bottom-transition"
    fullscreen
  >
    <v-card>
      <v-toolbar>
        <v-btn
          :icon="mdiClose"
          @click="isDialogShown = false"
        />

        <v-toolbar-title>
          Detaillierte Informationen zum {{ calculationMethod }}-Verfahren
        </v-toolbar-title>
      </v-toolbar>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

import { mdiClose } from "@mdi/js";

const isDialogShown = defineModel<boolean>({ required: true });
const { calculationMethod } = defineProps<{
  calculationMethod: CalculationMethod;
}>();
</script>
