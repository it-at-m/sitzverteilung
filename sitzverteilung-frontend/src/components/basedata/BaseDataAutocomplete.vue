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
    label="Basisdaten wählen (optional)"
    hide-details
    :prepend-inner-icon="mdiFileDocumentMultiple"
    glow
    variant="outlined"
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
    <template #no-data> </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData.ts";
import type { VAutocomplete } from "vuetify/components";

import {
  mdiFileDocumentEdit,
  mdiFileDocumentMultiple,
  mdiFileDocumentPlus,
} from "@mdi/js";
import { computed, ref, useTemplateRef } from "vue";

const emit = defineEmits<{
  update: [baseData: BaseData];
}>();

const autocompleteRef = useTemplateRef<VAutocomplete>("autocompleteRef");

const props = defineProps<{
  baseDataList: BaseData[];
}>();

const searchText = ref("");
function updateSearchText(newSearchText: string) {
  searchText.value = newSearchText;
  if (!newSearchText || newSearchText.trim() == "") {
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
    name: searchText.value,
    committeeSize: undefined,
    unions: [],
    groups: [],
  });
  autocompleteRef.value?.reset();
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

function unfocus() {
  autocompleteRef.value?.blur();
}
</script>
