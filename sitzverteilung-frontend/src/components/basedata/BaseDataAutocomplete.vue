<template>
  <v-autocomplete
    v-model="selectedBaseData"
    :items="baseDataList"
    item-title="name"
    item-value="name"
    return-object
    persistent-clear
    clearable
    auto-select-first
    :maxlength="limitName"
    label="Basisdaten wählen (optional)"
    hide-details
    single-line
    :prepend-inner-icon="mdiFileDocumentMultiple"
    glow
    variant="outlined"
    density="comfortable"
    autocomplete="off"
    no-data-text="Keine passenden Basisdaten gefunden"
  >
    <template #item="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon :icon="mdiFileDocumentMultiple" />
        </template>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item>
        <template #prepend>
          <v-icon :icon="mdiInformation" />
        </template>
        <v-list-item-title
          >Keine passenden Basisdaten gefunden.</v-list-item-title
        >
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData.ts";
import type { VAutocomplete } from "vuetify/components";

import { mdiFileDocumentMultiple, mdiInformation } from "@mdi/js";

const selectedBaseData = defineModel<BaseData | null>();

defineProps<{
  baseDataList: BaseData[];
  limitName: number;
}>();
</script>
