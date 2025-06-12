<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model.number="baseData.name"
          type="text"
          :rules="[
            FieldValidationRules.Required,
            FieldValidationRules.IsUnique(newBaseDataNames),
          ]"
          hide-details="auto"
          validate-on="input"
          label="Name"
          :prepend-inner-icon="mdiLabel"
          glow
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model.number="baseData.committeeSize"
          type="text"
          :rules="[
            FieldValidationRules.Required,
            FieldValidationRules.Integer,
            FieldValidationRules.LargerThan(0),
            FieldValidationRules.LowerOrEqualThan(limitCommitteeSize),
          ]"
          hide-details="auto"
          validate-on="input"
          :error-messages="seatFieldValidationError"
          label="Größe des Hauptorgans"
          :prepend-inner-icon="mdiAccountSwitch"
          @keydown="checkCommitteeSizeField"
          glow
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <group-data-table
          v-model="baseData.groups"
          :expected-seats="expectedSeats"
          :limit-votes="limitVotes"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData.ts";

import { mdiAccountSwitch, mdiLabel } from "@mdi/js";
import { computed, toRef } from "vue";

import GroupDataTable from "@/components/basedata/groupdata/GroupDataTable.vue";
import { useGroupStatistics } from "@/composables/useGroupStatistics.ts";
import {
  preventNonNumericInput,
  preventTooLongInput,
} from "@/utility/input.ts";
import { FieldValidationRules } from "@/utility/rules.ts";

const baseData = defineModel<BaseData>({ required: true });
const groups = toRef(baseData.value.groups);

const {
  limitVotes = 100_000_000,
  limitCommitteeSize = 999,
  baseDataNames = [],
} = defineProps<{
  limitVotes?: number;
  limitCommitteeSize?: number;
  baseDataNames?: string[];
}>();

const maxCommitteeSizeLength = computed(
  () => limitCommitteeSize.toString().length
);
function checkCommitteeSizeField(event: KeyboardEvent) {
  preventNonNumericInput(event);
  preventTooLongInput(
    baseData.value.committeeSize?.toString() ?? "",
    maxCommitteeSizeLength.value,
    event
  );
}

const seatFieldValidationError = computed(() => {
  if (isSeatsTooLow.value)
    return "Die Gesamtsumme der Sitze unterschreitet den angegebenen Wert.";
  if (isSeatsTooHigh.value)
    return "Die Gesamtsumme der Sitze überschreitet den angegebenen Wert.";
  if (isTooManyGroups.value)
    return "Die Anzahl an Parteien/Gruppierungen übersteigt den angegebenen Wert.";
  return "";
});

const newBaseDataNames = computed(() => [
  ...baseDataNames,
  baseData.value.name,
]);

const expectedSeats = computed(() =>
  !(baseData.value.committeeSize === 0 || !!baseData.value.committeeSize)
    ? 0
    : baseData.value.committeeSize
);
const { isTooManyGroups, isSeatsTooLow, isSeatsTooHigh } = useGroupStatistics(
  groups,
  expectedSeats
);
</script>
