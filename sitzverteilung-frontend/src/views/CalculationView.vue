<template>
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
          <v-btn
            variant="flat"
            color="blue"
            size="large"
            class="mx-5"
            :prepend-icon="mdiShare"
            :disabled="!hasValidData"
            @click="share"
            text="Teilen"
          />
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row v-if="isDataEntered && selectedBaseData">
      <v-col>
        <v-alert
          text="Die ursprünglichen Daten aus der gewählten Vorlage wurden verändert."
          type="info"
          variant="tonal"
        />
      </v-col>
    </v-row>
    <base-data-form
      class="mt-5"
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
    <result-table :calculation-result="calculationResult" />
  </v-container>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import { mdiClose, mdiContentSaveEdit, mdiShare } from "@mdi/js";
import { useToggle } from "@vueuse/core";
import { computed } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import ResultTable from "@/components/result/ResultTable.vue";
import { useShareData } from "@/composables/useShareData.ts";
import { useTemplateData } from "@/composables/useTemplateData.ts";
import { calculate } from "@/utility/calculator.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

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
  isValidBaseData,
  currentBaseData,
  "Die Daten wurden erfolgreich aus dem Link übertragen."
);

const calculationResult = computed(() => {
  if (!hasValidData.value) {
    return undefined;
  }
  return calculate(currentBaseData.value);
});

const hasValidData = computed<boolean>(
  () => isAtLeastTwoGroups.value && isValid.value
);

/* eslint-disable @typescript-eslint/no-explicit-any */
function isValidBaseData(x: any): x is BaseData {
  return (
    x &&
    typeof x.name === "string" &&
    typeof x.committeeSize === "number" &&
    typeof x.targetSize === "number" &&
    Array.isArray(x.groups) &&
    Array.isArray(x.unions) &&
    x.groups.length >= 2 &&
    x.groups.every((group: any) => group && typeof group.name === "string") &&
    x.unions.every((union: any) => union && Array.isArray(union.groups))
  );
}

const isAtLeastTwoGroups = computed(
  () => currentBaseData.value.groups.length >= 2
);
</script>
