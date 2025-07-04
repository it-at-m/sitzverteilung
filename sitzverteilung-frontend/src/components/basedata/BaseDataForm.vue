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
    <v-row>
      <v-col cols="6">
        <union-data-table
          ref="fractionsDataTableRef"
          v-model="fractions"
          :union-type="UnionType.FRACTION"
          :group-names="groupNames"
          :limit-name="limitName"
        />
      </v-col>
      <v-col cols="6">
        <union-data-table
          ref="committeesDataTableRef"
          v-model="committees"
          :union-type="UnionType.COMMITTEE"
          :group-names="groupNames"
          :limit-name="limitName"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";
import type { Union } from "@/types/Union.ts";
import type { VForm, VTextField } from "vuetify/components";

import { mdiAccountSwitch, mdiLabel } from "@mdi/js";
import { computed, toRef, useTemplateRef } from "vue";

import GroupDataTable from "@/components/basedata/groupdata/GroupDataTable.vue";
import UnionDataTable from "@/components/basedata/uniondata/UnionDataTable.vue";
import { useGroupStatistics } from "@/composables/useGroupStatistics";
import { UnionType } from "@/types/Union.ts";
import { preventTooLongInput } from "@/utility/input.ts";
import { FieldValidationRules } from "@/utility/rules";

const baseData = defineModel<BaseData>({ required: true });
const groups = computed(() => baseData.value.groups);
const groupNames = computed(() => groups.value.map((group) => group.name));

const fractions = computed({
  get() {
    return baseData.value.unions.filter(
      (union) => union.unionType == UnionType.FRACTION
    );
  },
  set(newFractions: Union[]) {
    baseData.value.unions = [...committees.value, ...newFractions];
  },
});
const committees = computed({
  get() {
    return baseData.value.unions.filter(
      (union) => union.unionType == UnionType.COMMITTEE
    );
  },
  set(newCommittees: Union[]) {
    baseData.value.unions = [...newCommittees, ...fractions.value];
  },
});

const {
  isEditing,
  limitName = 50,
  limitGroups = 18,
  limitVotes = 100_000_000,
  limitCommitteeSize = 999,
  baseDataNames = [],
} = defineProps<{
  limitName?: number;
  limitGroups?: number;
  limitVotes?: number;
  limitCommitteeSize?: number;
  baseDataNames?: string[];
  isEditing: boolean;
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

const fractionsDataTableRef = useTemplateRef<typeof UnionDataTable>(
  "fractionsDataTableRef"
);
const committeesDataTableRef = useTemplateRef<typeof UnionDataTable>(
  "committeesDataTableRef"
);

defineExpose({
  reset,
});
</script>
