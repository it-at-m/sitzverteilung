<template>
  <v-form
    @update:modelValue="validChanged"
    ref="baseDataFormRef"
  >
    <v-row>
      <v-col>
        <v-text-field
          v-model.trim="baseData.name"
          :rules="[
            FieldValidationRules.Required,
            FieldValidationRules.IsUnique(comparedBaseDataNames),
          ]"
          hide-details="auto"
          validate-on="input"
          label="Name"
          @keydown="checkNameField"
          @paste="checkNameField"
          @drop.prevent
          :prepend-inner-icon="mdiLabel"
          glow
        />
      </v-col>
      <v-col>
        <v-number-input
          v-model.number="baseData.committeeSize"
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
          :limit-name="limitName"
          :limit-groups="limitGroups"
          :limit-votes="limitVotes"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";
import type { VForm, VTextField } from "vuetify/components";

import { mdiAccountSwitch, mdiLabel } from "@mdi/js";
import { computed, toRef, useTemplateRef } from "vue";

import GroupDataTable from "@/components/basedata/groupdata/GroupDataTable.vue";
import { useGroupStatistics } from "@/composables/useGroupStatistics";
import {
  FieldValidationRules,
  preventTooLongInput,
} from "@/utility/validation.ts";

const baseData = defineModel<BaseData>({ required: true });
const groups = computed(() => baseData.value.groups);

const {
  baseDataNames = [],
  isEditing,
  limitName,
  limitGroups,
  limitVotes,
  limitCommitteeSize,
} = defineProps<{
  limitName: number;
  limitGroups: number;
  limitVotes: number;
  limitCommitteeSize: number;
  isEditing: boolean;
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

function checkNameField(event: KeyboardEvent) {
  preventTooLongInput(baseData.value.name, limitName, event);
}

const comparedBaseDataNames = computed(() =>
  isEditing ? baseDataNames : [...baseDataNames, baseData.value.name]
);

const expectedSeats = computed(() => baseData.value.committeeSize ?? 0);
const limitGroupsRef = toRef(() => limitGroups);
const { isTooManyGroups, isSeatsTooLow, isSeatsTooHigh } = useGroupStatistics(
  groups,
  limitGroupsRef,
  expectedSeats
);

const baseDataFormRef = useTemplateRef<VForm>("baseDataFormRef");
function reset() {
  baseDataFormRef.value?.reset();
}

defineExpose({
  reset,
});
</script>
