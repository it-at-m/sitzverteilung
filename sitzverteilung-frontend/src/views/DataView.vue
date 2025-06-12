<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <base-data-form
          v-model="baseData"
          :base-data-names="baseDataNames"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/BaseData.ts";

import { ref } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";

const baseData = ref<BaseData>(getEmptyBaseData());

function getEmptyBaseData(): BaseData {
  return {
    name: "",
    committeeSize: undefined,
    groups: [],
    unions: [],
  };
}

const baseDataNames = ref(["Test"]);
</script>
