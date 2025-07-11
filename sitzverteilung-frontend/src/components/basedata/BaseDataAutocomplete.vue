<template>
  <v-autocomplete
    ref="autocompleteRef"
    :items="baseDataList"
    item-title="name"
    item-value="name"
    return-object
    persistent-clear
    clearable
    auto-select-first
    @update:search="updateSearchText"
    @update:model-value="updateSelection"
    @keydown.enter="hitEnter"
    @click:clear.stop="clickClear"
    :maxlength="limitName"
    label="Basisdaten wählen (optional)"
    hide-details
    single-line
    :prepend-inner-icon="mdiFileDocumentMultiple"
    glow
    variant="outlined"
    density="comfortable"
    autocomplete="off"
  >
    <template #item="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon :icon="mdiFileDocumentEdit" />
        </template>
      </v-list-item>
    </template>
    <template
      #append-item
      v-if="searchText && !isAlreadyExistent"
    >
      <v-list-item @click="createNewBaseDataByName">
        <template #prepend>
          <v-icon :icon="mdiFileDocumentPlus" />
        </template>
        <v-list-item-title>
          Basisdaten '{{ searchText }}' anlegen
        </v-list-item-title>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item v-if="isBaseDataListEmpty && !searchText">
        <template #prepend>
          <v-icon :icon="mdiInformation" />
        </template>
        <v-list-item-title> Name eingeben zum Anlegen </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData.ts";
import type { VAutocomplete } from "vuetify/components";

import {
  mdiFileDocumentEdit,
  mdiFileDocumentMultiple,
  mdiFileDocumentPlus,
  mdiInformation,
} from "@mdi/js";
import { computed, ref, useTemplateRef } from "vue";

const emit = defineEmits<{
  update: [baseData: BaseData];
}>();

const autocompleteRef = useTemplateRef<VAutocomplete>("autocompleteRef");

const props = defineProps<{
  baseDataList: BaseData[];
  limitName: number;
}>();

const searchText = ref("");
function updateSearchText(newSearchText: string) {
  searchText.value = newSearchText;
  if (!newSearchText?.trim()) {
    itemSelected.value = false;
  }
}

const itemSelected = ref(false);
function updateSelection(selectedItem: BaseData | null) {
  if (selectedItem) {
    itemSelected.value = true;
    emit("update", selectedItem);
  }
}

const isBaseDataListEmpty = computed(() => props.baseDataList.length === 0);
const baseDataNames = computed(() =>
  props.baseDataList.map((baseData) => baseData.name)
);
const isAlreadyExistent = computed(() =>
  baseDataNames.value.includes(searchText.value.trim())
);

function clickClear() {
  createNewEmptyBaseData();
  itemSelected.value = false;
}

function createNewBaseDataByName() {
  emit("update", {
    name: searchText.value.trim(),
    committeeSize: undefined,
    unions: [],
    groups: [],
  });
  reset();
  unfocus();
}

function hitEnter() {
  if (!itemSelected.value) {
    createNewBaseDataByName();
  }
}

function createNewEmptyBaseData() {
  emit("update", {
    name: "",
    committeeSize: undefined,
    unions: [],
    groups: [],
  });
}

function reset() {
  autocompleteRef.value?.reset();
}

function unfocus() {
  autocompleteRef.value?.blur();
}

defineExpose({
  reset,
});
</script>
