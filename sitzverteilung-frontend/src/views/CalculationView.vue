<template>
  <v-container>
    <detail-dialog
      v-model="showDetailDialog"
      v-if="detailDialogMethod"
      :calculation-method="detailDialogMethod"
      :calculation-result="calculationResult"
      :target-size="currentBaseData.targetSize"
      :committee-size="currentBaseData.committeeSize"
    />
    <v-row>
      <v-col class="d-flex align-center">
        <h1 class="mr-5">Berechnung der Sitze</h1>
        <info-dialog>
          <template #dialog-text>
            <markdown-renderer markdown-file-name="instruction_calculation" />
          </template>
        </info-dialog>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <template-data-autocomplete
            v-model="selectedBaseData"
            :limit-name="LimitConfiguration.limitName"
            :base-data-list="storedBaseData"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSave"
            :disabled="!isExpanded || !isValid"
            @click="createBaseData"
            text="Anlegen"
          />
          <v-btn
            @click="toggleExpansion()"
            :color="isExpanded ? 'red-darken-2' : 'green-darken-3'"
            variant="flat"
            size="large"
            class="ml-5"
            :prepend-icon="isExpanded ? mdiClose : mdiContentSaveEdit"
            :text="isExpanded ? 'Schließen' : 'Ändern'"
          />
          <v-tooltip
            text="Eingegebene Daten teilen"
            :disabled="!hasValidCalculationData"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                color="light-blue-darken-3"
                size="large"
                class="mx-5"
                :prepend-icon="mdiShare"
                :disabled="!hasValidCalculationData"
                @click="share"
                text="Teilen"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row v-if="isDataEntered && selectedBaseData">
      <v-col>
        <v-alert
          text="Die ursprünglichen Daten aus der gewählten Vorlage wurden verändert. Die Berechnung und das Teilen per Link basiert auf den geänderten Daten."
          type="info"
          variant="tonal"
        />
      </v-col>
    </v-row>
    <base-data-form
      class="mt-3"
      v-show="isExpanded"
      ref="baseDataFormRef"
      v-model="currentBaseData"
      @valid-changed="updateIsValid"
      :limit-name="LimitConfiguration.limitName"
      :limit-groups="LimitConfiguration.limitGroups"
      :limit-committee-size="LimitConfiguration.limitCommitteeSize"
      :limit-votes="LimitConfiguration.limitVotes"
      :selected-base-data-name="selectedBaseData?.name"
      :base-data-names="baseDataNames"
      :show-name-column="false"
      are-fields-required
    />
    <result-table
      class="mt-2"
      :calculation-result="calculationResult"
      :show-seats="isCommitteeSizeEntered"
      @clicked-calculation-method="openDetailDialog"
      @clicked-download-result-pdf="downloadResultPdf"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveEdit,
  mdiShare,
} from "@mdi/js";
import { useToggle } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import InfoDialog from "@/components/common/InfoDialog.vue";
import MarkdownRenderer from "@/components/common/MarkdownRenderer.vue";
import DetailDialog from "@/components/result/DetailDialog.vue";
import ResultTable from "@/components/result/ResultTable.vue";
import { useShareData } from "@/composables/useShareData.ts";
import { useTemplateData } from "@/composables/useTemplateData.ts";
import { useTemplateDataStore } from "@/stores/templatedata.ts";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import { calculate } from "@/utility/calculator.ts";
import { generateCalculationViewPDF } from "@/utility/pdfGeneration.ts";
import {
  isValidCalculationData,
  LimitConfiguration,
} from "@/utility/validation.ts";

const [isExpanded, toggleExpansion] = useToggle();

const {
  storedBaseData,
  selectedBaseData,
  baseDataNames,
  currentBaseData,
  updateIsValid,
  isDataEntered,
  isValid,
  baseDataFormRef,
} = useTemplateData();

const { share } = useShareData<BaseData>(
  false,
  currentBaseData,
  isValidCalculationData,
  currentBaseData,
  "Die Daten wurden erfolgreich aus dem Link übertragen."
);

const isAtLeastTwoGroups = computed(
  () => (currentBaseData.value?.groups?.length ?? 0) >= 2
);

const hasValidCalculationData = computed(() => {
  return (
    isValid.value &&
    isAtLeastTwoGroups.value &&
    !!currentBaseData.value.targetSize
  );
});

const calculationResult = computed(() => {
  if (!hasValidCalculationData.value) {
    return undefined;
  }
  return calculate(currentBaseData.value);
});

const isCommitteeSizeEntered = computed(
  () => !!currentBaseData.value.committeeSize
);

onMounted(() => {
  baseDataFormRef?.value?.validateAllInputs();
});

watch(hasValidCalculationData, (isCalculationValid) => {
  if (isValid.value !== null && !isCalculationValid) {
    if (!isExpanded.value) {
      toggleExpansion();
    }
    nextTick(() => {
      baseDataFormRef?.value?.validateAllInputs();
    });
  }
});

const showDetailDialog = ref(false);
const detailDialogMethod = ref<CalculationMethod | null>(null);

function openDetailDialog(calculationMethod: CalculationMethod) {
  detailDialogMethod.value = calculationMethod;
  showDetailDialog.value = true;
}
watch(showDetailDialog, (isShown) => {
  if (!isShown) {
    detailDialogMethod.value = null;
  }
});

function downloadResultPdf() {
  if (calculationResult.value) {
    generateCalculationViewPDF(
      currentBaseData.value.targetSize,
      currentBaseData.value.committeeSize,
      calculationResult.value
    );
  }
}

const store = useTemplateDataStore();

function createBaseData() {
  if (!currentBaseData.value) {
    return;
  }

  const originalName = currentBaseData.value.name;
  const existingNames = new Set(
    storedBaseData.value.map((baseData) => baseData.name)
  );

  let copyNumber = 1;
  let copyName = `${originalName} (Kopie)`;

  while (existingNames.has(copyName)) {
    copyNumber++;
    copyName = `${originalName} (Kopie ${copyNumber})`;
  }

  const copy: BaseData = JSON.parse(
    JSON.stringify({
      ...currentBaseData.value,
      name: copyName,
    })
  );

  store.addBaseData(copy);
  selectedBaseData.value = copy;
}
</script>
