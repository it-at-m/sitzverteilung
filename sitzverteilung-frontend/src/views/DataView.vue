<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col cols="3">
          <base-data-autocomplete
            @update="updatedBaseDataSelection"
            :base-data-list="baseDataList"
          />
        </v-col>
      </v-row>
    </v-toolbar>
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

import BaseDataAutocomplete from "@/components/basedata/BaseDataAutocomplete.vue";
import BaseDataForm from "@/components/basedata/BaseDataForm.vue";

const baseData = ref<BaseData>(getEmptyBaseData());
const isValid = ref(false);
const baseDataList: [BaseData] = [
  {
    name: "Testbasisdaten",
    committeeSize: 100,
    groups: [],
    unions: [],
  },
];

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

function updatedBaseDataSelection(baseData: BaseData) {
  console.log(baseData);
}

// mimics already existing names until bound to Pinia store
const baseDataNames = ref(["Test"]);
</script>
