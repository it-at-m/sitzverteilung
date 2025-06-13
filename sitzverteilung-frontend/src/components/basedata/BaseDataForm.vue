<template>
  <v-form @update:modelValue="validChanged">
    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            v-model="baseData.name"
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
          <v-number-input
            v-model.number="baseData.committeeSize"
            type="text"
            :rules="[FieldValidationRules.Required]"
            :min="1"
            :max="limitCommitteeSize"
            hide-details="auto"
            validate-on="input"
            :error-messages="seatFieldValidationError"
            label="Größe des Hauptorgans"
            :prepend-inner-icon="mdiAccountSwitch"
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
  </v-form>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";

import { mdiAccountSwitch, mdiLabel } from "@mdi/js";
import { computed, toRef } from "vue";

import GroupDataTable from "@/components/basedata/groupdata/GroupDataTable.vue";
import { useGroupStatistics } from "@/composables/useGroupStatistics";
import { FieldValidationRules } from "@/utility/rules";

const baseData = defineModel<BaseData>({ required: true });
const groups = toRef(baseData.value, "groups");

const {
  limitVotes = 100_000_000,
  limitCommitteeSize = 999,
  baseDataNames = [],
} = defineProps<{
  limitVotes?: number;
  limitCommitteeSize?: number;
  baseDataNames?: string[];
}>();

const emit = defineEmits<{
  "valid-changed": [isValid: boolean];
}>();
function validChanged(valid: boolean | null) {
  emit("valid-changed", !!valid);
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

const expectedSeats = computed(() => baseData.value.committeeSize ?? 0);
const { isTooManyGroups, isSeatsTooLow, isSeatsTooHigh } = useGroupStatistics(
  groups,
  expectedSeats
);
</script>
