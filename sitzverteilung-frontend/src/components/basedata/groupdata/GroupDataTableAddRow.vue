<template>
  <group-data-table-row
    ref="groupDataTableRowRef"
    v-model="newGroup"
    :group-names="allGroupNames"
    :is-validating-on-empty="false"
    :disabled="disabled"
    :limit-name="limitName"
    :limit-seats="limitSeats"
    :limit-votes="limitVotes"
    @hit-enter="addGroupEnter"
    class="bg-grey-lighten-3"
  >
    <template #append="{ isActionDisabled }">
      <div class="d-flex justify-center">
        <v-btn
          @click="addGroup"
          :disabled="isActionDisabled"
          :icon="mdiPlus"
          size="small"
          color="primary"
          flat
          aria-label="Hinzufügen"
        />
      </div>
    </template>
  </group-data-table-row>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";

import { mdiPlus } from "@mdi/js";
import { computed, ref, useTemplateRef, watch } from "vue";

import GroupDataTableRow from "@/components/basedata/groupdata/GroupDataTableRow.vue";

const groupDataTableRowRef = useTemplateRef<typeof GroupDataTableRow>(
  "groupDataTableRowRef"
);

const {
  disabled = false,
  groupNames,
  limitName,
  limitSeats,
  limitVotes,
} = defineProps<{
  disabled?: boolean;
  groupNames: string[];
  limitName: number;
  limitSeats: number;
  limitVotes: number;
}>();

const newGroup = ref<Group>(getEmptyGroup());

const allGroupNames = computed(() => {
  return [...groupNames, newGroup.value.name];
});

const emit = defineEmits<{
  addGroup: [group: Group];
}>();

function addGroupEnter() {
  groupDataTableRowRef.value?.focusNameField();
  addGroup();
}
function addGroup() {
  resetValidation();
  emit("addGroup", newGroup.value);
  newGroup.value = getEmptyGroup();
}

function validateNameField() {
  groupDataTableRowRef.value?.validateNameField();
}

function validateSeatField() {
  groupDataTableRowRef.value?.validateSeatField();
}

function resetValidation() {
  groupDataTableRowRef.value?.resetValidation();
}

watch(
  () => disabled,
  (isDisabled) => {
    if (isDisabled) {
      newGroup.value = getEmptyGroup();
      resetValidation();
    }
  }
);

defineExpose({
  validateNameField,
  validateSeatField,
});

function getEmptyGroup(): Group {
  return {
    name: "",
    committeeSeats: undefined,
    votes: undefined,
  };
}
</script>
