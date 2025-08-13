<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Berechnung der Sitze</h1>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <template-data-autocomplete
            v-model="selectedBaseData"
            :limit-name="LimitConfiguration.limitName"
            :base-data-list="storedBaseData"
          />
          <v-btn
            @click="toggleExpansion()"
            :color="isExpanded ? 'red' : 'green'"
            variant="flat"
            size="large"
            class="ml-5"
          >
            {{ isExpanded ? "Schließen" : "Bearbeiten" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
    <v-alert
      v-if="isDataEntered"
      text="Die Daten wurden bearbeitet."
      type="info"
      variant="tonal"
    ></v-alert>
    <div style="height: 20px"></div>
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
import { useToggle } from "@vueuse/core";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import { useDataInputChecks } from "@/composables/useDataInputChecks.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

const [isExpanded, toggleExpansion] = useToggle();

const {
  storedBaseData,
  selectedBaseData,
  baseDataNames,
  currentBaseData,
  updateIsValid,
  isDataEntered,
  baseDataFormRef,
} = useDataInputChecks();
</script>
