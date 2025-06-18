<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <base-data-autocomplete
            ref="baseDataAutocompleteRef"
            @update="updatedBaseDataSelection"
            :base-data-list="storedBaseDatas"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSave"
            :disabled="!isValid"
            >Speichern</v-btn
          >
          <v-btn
            variant="flat"
            color="red"
            size="large"
            class="mx-5"
            :prepend-icon="mdiDelete"
            :disabled="!isBaseDataSelected"
            @click="deleteSelectedBaseData"
            >Löschen</v-btn
          >
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row>
      <v-col>
        <base-data-form
          v-model="currentBaseData"
          @valid-changed="updateIsValid"
          :base-data-names="baseDataNames"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";

import { mdiContentSave, mdiDelete } from "@mdi/js";
import { computed, ref, useTemplateRef, watch } from "vue";

import BaseDataAutocomplete from "@/components/basedata/BaseDataAutocomplete.vue";
import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import { useBaseDataStore } from "@/stores/basedata.ts";

const { baseDatas: storedBaseDatas, deleteBaseData } = useBaseDataStore();
const baseDataNames = computed(() =>
  storedBaseDatas.map((baseData) => baseData.name)
);

const selectedBaseData = ref<BaseData>();
const isBaseDataSelected = computed(
  () =>
    !!selectedBaseData.value &&
    selectedBaseData.value.name !== "" &&
    baseDataNames.value.includes(selectedBaseData.value.name)
);

const currentBaseData = ref<BaseData | undefined>(getEmptyBaseData());

const isValid = ref(false);
function updateIsValid(newIsValid: boolean) {
  isValid.value = newIsValid;
}

function getEmptyBaseData(): BaseData {
  return {
    name: "",
    committeeSize: undefined,
    groups: [],
    unions: [],
  };
}

function deleteSelectedBaseData() {
  if (isBaseDataSelected.value && selectedBaseData.value) {
    deleteBaseData(selectedBaseData.value.name);
    selectedBaseData.value = undefined;
  }
}

function updatedBaseDataSelection(baseData: BaseData) {
  selectedBaseData.value = baseData;
}

const baseDataAutocompleteRef = useTemplateRef<typeof BaseDataAutocomplete>(
  "baseDataAutocompleteRef"
);
watch(selectedBaseData, (newBaseData) => {
  if (newBaseData === undefined) {
    currentBaseData.value = getEmptyBaseData();
    baseDataAutocompleteRef.value?.reset();
    return;
  }
  currentBaseData.value = JSON.parse(JSON.stringify(newBaseData));
});
</script>
