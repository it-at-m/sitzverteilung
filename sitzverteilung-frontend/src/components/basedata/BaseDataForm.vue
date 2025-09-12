<template>
  <v-form
    @update:modelValue="validChanged"
    ref="baseDataFormRef"
  >
    <v-row>
      <v-col v-if="showNameColumn">
        <v-text-field
          v-model.trim="baseData.name"
          :rules="[
            FieldValidationRules.Required,
            FieldValidationRules.IsUnique(comparedBaseDataNames),
            FieldValidationRules.MaxLength(limitName),
          ]"
          hide-details="auto"
          validate-on="input"
          :label="`Name (max. ${limitName} Zeichen)`"
          :prepend-inner-icon="mdiLabel"
          glow
        />
      </v-col>
      <v-col>
        <v-number-input
          v-model="baseData.committeeSize"
          :rules="[FieldValidationRules.Required]"
          :min="1"
          :max="limitCommitteeSize"
          hide-details="auto"
          validate-on="input"
          :error-messages="seatFieldValidationError"
          :label="`Größe des Hauptorgans (max. ${limitCommitteeSize})`"
          :prepend-inner-icon="mdiAccountSwitch"
          glow
        />
      </v-col>
      <v-col>
        <v-number-input
          v-model="baseData.targetSize"
          :rules="[FieldValidationRules.Required]"
          :min="1"
          :max="limitCommitteeSize"
          hide-details="auto"
          validate-on="input"
          :label="`Ausschussgröße (max. ${limitCommitteeSize})`"
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
          :fractions="fractions"
          :committees="committees"
          @create-union="createUnion"
          @deleted-group="deletedGroup"
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
import type { BaseData } from "@/types/basedata/BaseData.ts";
import type { GroupIndex, Union } from "@/types/basedata/Union.ts";
import type { VForm, VTextField } from "vuetify/components";

import { mdiAccountSwitch, mdiLabel } from "@mdi/js";
import { computed, toRef, useTemplateRef } from "vue";

import GroupDataTable from "@/components/basedata/groupdata/GroupDataTable.vue";
import UnionDataTable from "@/components/basedata/uniondata/UnionDataTable.vue";
import { useGroupStatistics } from "@/composables/useGroupStatistics";
import { UnionType } from "@/types/basedata/Union.ts";
import { FieldValidationRules } from "@/utility/validation.ts";

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
  baseDataNames = [],
  selectedBaseDataName,
  limitName,
  limitGroups,
  limitVotes,
  limitCommitteeSize,
} = defineProps<{
  limitName: number;
  limitGroups: number;
  limitVotes: number;
  limitCommitteeSize: number;
  selectedBaseDataName?: string | null;
  baseDataNames?: string[];
  showNameColumn: boolean;
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
    return "Die Anzahl an Parteien / Gruppierungen / Einzelmitglieder übersteigt den angegebenen Wert.";
  return "";
});

const comparedBaseDataNames = computed(() => {
  let relevantBaseDataNames = baseDataNames;
  if (selectedBaseDataName) {
    relevantBaseDataNames = relevantBaseDataNames.filter(
      (name) => name !== selectedBaseDataName
    );
  }
  return [...relevantBaseDataNames, baseData.value.name];
});

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

function createUnion(groupIdx: GroupIndex[], type: UnionType) {
  if (type === UnionType.FRACTION) {
    fractionsDataTableRef.value?.addUnion(groupIdx);
  } else if (type === UnionType.COMMITTEE) {
    committeesDataTableRef.value?.addUnion(groupIdx);
  }
}

function deletedGroup(newLength: number, removeList: GroupIndex[]) {
  fractionsDataTableRef.value?.updateGroupReferencesOnRemoval(
    newLength,
    removeList
  );
  committeesDataTableRef.value?.updateGroupReferencesOnRemoval(
    newLength,
    removeList
  );
}

defineExpose({
  reset,
});
</script>
