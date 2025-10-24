<template>
  <detail-dialog
    v-model="showDetailDialog"
    v-if="detailDialogMethod"
    :calculation-method="detailDialogMethod"
    :calculation-result="calculationResult"
  />
  <v-container>
    <v-row>
      <v-col>
        <h1>Berechnung der Sitze</h1>
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
            @click="toggleExpansion()"
            :color="isExpanded ? 'red' : 'green'"
            variant="flat"
            size="large"
            class="ml-5"
            :prepend-icon="isExpanded ? mdiClose : mdiContentSaveEdit"
            :text="isExpanded ? 'Schließen' : 'Ändern'"
          />
          <v-tooltip
            text="Eingegebene Daten teilen"
            :disabled="!hasValidData"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                color="blue"
                size="large"
                class="mx-5"
                :prepend-icon="mdiShare"
                :disabled="!hasValidData"
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
      @clicked-calculation-method="(method) => openDetailDialog(method)"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import { mdiClose, mdiContentSaveEdit, mdiShare } from "@mdi/js";
import { useToggle } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import DetailDialog from "@/components/result/DetailDialog.vue";
import ResultTable from "@/components/result/ResultTable.vue";
import { useShareData } from "@/composables/useShareData.ts";
import { useTemplateData } from "@/composables/useTemplateData.ts";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import { calculate } from "@/utility/calculator.ts";
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
  baseDataFormRef,
  isValid,
} = useTemplateData();

const { share } = useShareData<BaseData>(
  false,
  currentBaseData,
  isValidCalculationData,
  currentBaseData,
  "Die Daten wurden erfolgreich aus dem Link übertragen."
);

let expandTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  isValid,
  () => {
    if (isExpanded.value) return;

    if (expandTimer) clearTimeout(expandTimer);
    expandTimer = setTimeout(() => {
      if (
        !isExpanded.value &&
        !isValid.value &&
        currentBaseData.value.groups.length < 2
      ) {
        toggleExpansion();
      }
    }, 100);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (expandTimer) clearTimeout(expandTimer);
});

const calculationResult = computed(() => {
  if (!hasValidData.value) {
    return undefined;
  }
  return calculate(currentBaseData.value);
});

const hasValidData = computed<boolean>(
  () => isAtLeastTwoGroups.value && isValid.value
);

const isAtLeastTwoGroups = computed(
  () => currentBaseData.value.groups.length >= 2
);

const showDetailDialog = ref(false);
const detailDialogMethod = ref<CalculationMethod | null>(null);

async function openDetailDialog(calculationMethod: CalculationMethod) {
  detailDialogMethod.value = calculationMethod;
  showDetailDialog.value = true;
}
watch(showDetailDialog, (isShown) => {
  if (!isShown) {
    detailDialogMethod.value = null;
  }
});
</script>
