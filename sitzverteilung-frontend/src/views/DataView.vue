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
            :base-data-list="storedBaseData"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSave"
            :disabled="!isValid || !dirty"
            @click="saveBaseData"
            >{{ isBaseDataSelected ? "Aktualisieren" : "Anlegen" }}
          </v-btn>
          <v-btn
            variant="flat"
            color="red"
            size="large"
            class="mx-5"
            :prepend-icon="mdiDelete"
            :disabled="!isBaseDataSelected"
            @click="deleteSelectedBaseData"
          >
            Löschen
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row>
      <v-col>
        <base-data-form
          ref="baseDataFormRef"
          v-model="currentBaseData"
          @valid-changed="updateIsValid"
          :base-data-names="baseDataNames"
          :is-editing="isBaseDataSelected"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";

import { mdiContentSave, mdiDelete } from "@mdi/js";
import { computed, ref, toRaw, useTemplateRef, watch } from "vue";

import BaseDataAutocomplete from "@/components/basedata/BaseDataAutocomplete.vue";
import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import { useBaseDataStore } from "@/stores/basedata.ts";

const store = useBaseDataStore();

const storedBaseData = computed(() => store.baseDatas);

const dirty = computed(
  () =>
    isBaseDataSelected.value &&
    JSON.stringify(currentBaseData.value) !==
      JSON.stringify(selectedBaseData.value)
);

const baseDataNames = computed(() =>
  storedBaseData.value.map((baseData) => baseData.name)
);

const selectedBaseData = ref<BaseData>();
const isBaseDataSelected = computed(
  () =>
    !!selectedBaseData.value &&
    selectedBaseData.value.name !== "" &&
    baseDataNames.value.includes(selectedBaseData.value.name)
);

const currentBaseData = ref<BaseData>(getEmptyBaseData());

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

function saveBaseData() {
  if (currentBaseData.value) {
    const copy = structuredClone(toRaw(currentBaseData.value));
    if (isBaseDataSelected.value && selectedBaseData.value) {
      store.updateBaseData(selectedBaseData.value.name, copy);
      selectedBaseData.value = undefined;
    } else {
      store.addBaseData(copy);
      reset();
    }
  }
}

const baseDataFormRef = useTemplateRef("baseDataFormRef");
function deleteSelectedBaseData() {
  if (isBaseDataSelected.value && selectedBaseData.value) {
    store.deleteBaseData(selectedBaseData.value.name);
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
  if (newBaseData === undefined || newBaseData.name === "") {
    reset();
    return;
  }
  currentBaseData.value = structuredClone(toRaw(newBaseData));
});

function reset() {
  baseDataAutocompleteRef.value?.reset();
  baseDataFormRef.value?.reset();
  currentBaseData.value = getEmptyBaseData();
}
</script>
