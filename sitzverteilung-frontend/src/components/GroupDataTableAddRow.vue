<template>
  <group-data-table-row ref="groupDataTableRowRef" v-model="newGroup" :group-names="groupNames" :is-validating-on-empty="false" :disabled="disabled" :limit-seats="limitSeats" :limit-votes="limitVotes" @hit-enter="addGroupEnter" v-slot="slotProps">
    <td>
      <div class="d-flex justify-center">
        <v-btn
            @click="addGroup"
            :disabled="slotProps.isActionDisabled"
            :icon="mdiPlus"
            size="small"
            color="primary"
            flat
            aria-label="Hinzufügen"
        />
      </div>
    </td>
  </group-data-table-row>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";

import { mdiPlus } from "@mdi/js";
import { ref, useTemplateRef, watch } from "vue";

import GroupDataTableRow from "@/components/GroupDataTableRow.vue";

const groupDataTableRowRef = useTemplateRef("groupDataTableRowRef")

const { disabled = false, groupNames, limitSeats, limitVotes } = defineProps<{
  disabled?: boolean;
  groupNames: string[];
  limitSeats: number;
  limitVotes: number;
}>();

const newGroup = ref<Group>(getEmptyGroup());

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
});

function getEmptyGroup(): Group {
  return {
    name: "",
    committeeSeats: undefined,
    votes: undefined,
  };
}
</script>
