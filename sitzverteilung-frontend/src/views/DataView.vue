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
          @valid-changed="updateIsValid"
          :base-data-names="baseDataNames"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";

import { ref } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";

const baseData = ref<BaseData>(getEmptyBaseData());
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

// mimics already existing names until bound to Pinia store
const baseDataNames = ref(["Test"]);
</script>
