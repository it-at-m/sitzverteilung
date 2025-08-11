<template>
  <v-container>
    <yes-no-dialog
      :model-value="saveLeave.saveLeaveDialog.value"
      :dialog-title="saveLeave.saveLeaveDialogTitle.value"
      :dialog-text="'Die Änderungen werden nicht gespeichert. Wollen Sie die Seite wirklich verlassen?'"
      @no="saveLeave.cancel()"
      @yes="saveLeave.leave()"
    />
    <v-row>
      <v-col>
        <h1>Berechnung der Sitze</h1>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <base-data-autocomplete
            v-model="selectedBaseData"
            :limit-name="LimitConfiguration.limitName"
            :base-data-list="storedBaseData"
          />
          <v-btn
            @click="toggleExpansion"
            :color="isExpanded ? 'red' : 'green'"
            variant="flat"
            size="large"
            class="ml-5"
          >
            {{ isExpanded ? "Schließen" : "Öffnen" }} der Berechnungsdaten
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
    <base-data-form
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
      :is-base-data-view="false"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import { computed, ref, useTemplateRef, watch } from "vue";

import BaseDataAutocomplete from "@/components/basedata/BaseDataAutocomplete.vue";
import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import YesNoDialog from "@/components/common/YesNoDialog.vue";
import { useSaveLeave } from "@/composables/useSaveLeave.ts";
import { useBaseDataStore } from "@/stores/basedata.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

const store = useBaseDataStore();
const storedBaseData = computed(() => store.baseDatas);
const isExpanded = ref(false);

const selectedBaseData = ref<BaseData | null>();
const isBaseDataSelected = computed(() => !!selectedBaseData.value);

const dirty = computed(
  () =>
    isBaseDataSelected.value &&
    JSON.stringify(currentBaseData.value) !==
      JSON.stringify(selectedBaseData.value)
);
const isDataEntered = computed(
  () =>
    dirty.value ||
    (!isBaseDataSelected.value &&
      !dirty.value &&
      JSON.stringify(currentBaseData.value) !==
        JSON.stringify(getEmptyBaseData()))
);

const saveLeave = useSaveLeave(isDataEntered);

const baseDataNames = computed(() =>
  storedBaseData.value.map((baseData) => baseData.name)
);

const currentBaseData = ref<BaseData>(getEmptyBaseData());

const isValid = ref(false);
function updateIsValid(newIsValid: boolean) {
  isValid.value = newIsValid;
}
function toggleExpansion() {
  isExpanded.value = !isExpanded.value;
}

function getEmptyBaseData(): BaseData {
  return {
    name: "",
    committeeSize: undefined,
    groups: [],
    unions: [],
  };
}

const baseDataFormRef = useTemplateRef("baseDataFormRef");

watch(selectedBaseData, (newBaseData) => {
  if (!newBaseData) {
    reset();
  } else {
    currentBaseData.value = JSON.parse(JSON.stringify(newBaseData));
  }
});

function reset() {
  baseDataFormRef.value?.reset();
  currentBaseData.value = getEmptyBaseData();
}
</script>
