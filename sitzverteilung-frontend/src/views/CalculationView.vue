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
            :prepend-icon="isExpanded ? mdiClose : mdiContentSaveEdit"
          >
            {{ isExpanded ? "Schließen" : "Ändern" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row
        v-if="isDataEntered"
    >
      <v-col>
        <v-alert
          text="Die ursprünglichen Daten aus der gewählten Vorlage wurden verändert."
          type="info"
          variant="tonal"
        />
      </v-col>
    </v-row>
    <base-data-form
      class="mt-5"
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
      :show-name-column="true"
    />
  </v-container>
</template>

<script setup lang="ts">
import { mdiClose, mdiContentSaveEdit } from "@mdi/js";
import { useToggle } from "@vueuse/core";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import { useTemplateData } from "@/composables/useTemplateData.ts";
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
} = useTemplateData();
</script>
