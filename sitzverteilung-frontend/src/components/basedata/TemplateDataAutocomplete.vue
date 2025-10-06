<template>
  <v-autocomplete
    v-model="selectedBaseData"
    :items="sortedBaseDataList"
    item-title="name"
    item-value="name"
    return-object
    persistent-clear
    clearable
    auto-select-first
    :maxlength="limitName"
    label="Vorlage wählen (optional)"
    hide-details
    single-line
    :prepend-inner-icon="mdiFileDocumentMultiple"
    glow
    variant="outlined"
    density="comfortable"
    autocomplete="off"
    no-data-text="Keine passende Vorlage gefunden"
  >
    <template #item="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon :icon="mdiFileDocument" />
        </template>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item>
        <template #prepend>
          <v-icon :icon="mdiInformation" />
        </template>
        <v-list-item-title>Keine passende Vorlage gefunden.</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import {
  mdiFileDocument,
  mdiFileDocumentMultiple,
  mdiInformation,
} from "@mdi/js";
import { computed } from "vue";

const selectedBaseData = defineModel<BaseData | null>();

const props = defineProps<{
  baseDataList: BaseData[];
  limitName: number;
}>();

const sortedBaseDataList = computed(() =>
  [...props.baseDataList].sort((a: BaseData, b: BaseData) =>
    a.name.localeCompare(b.name)
  )
);
</script>
