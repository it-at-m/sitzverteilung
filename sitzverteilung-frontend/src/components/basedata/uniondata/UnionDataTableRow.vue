<template>
  <tr>
    <td>
      <v-text-field
        v-model.trim="union.name"
        ref="nameInputField"
        :rules="[
          FieldValidationRules.Required,
          FieldValidationRules.IsUnique(unionNames),
        ]"
        hide-details="auto"
        validate-on="input"
        @input="editedName"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown="checkNameField"
        @paste="checkNameField"
        @drop.prevent
      />
    </td>
    <td>
      <v-chip-group column>
        <v-chip
          v-for="groupIdx in union.groups"
          :key="groupIdx"
          :text="groupNames[groupIdx]"
          variant="flat"
          :ripple="false"
        >
          <template #close>
            <v-icon
              :icon="mdiDelete"
              @click.stop="removeGroup(groupIdx)"
            />
          </template>
        </v-chip>
      </v-chip-group>
    </td>
    <td>
      <div class="d-flex justify-center">
        <v-btn
          @click="deleteUnion"
          :icon="mdiDelete"
          size="small"
          color="red"
          variant="text"
          aria-label="Zeile löschen"
        />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Union } from "@/types/Union.ts";
import type { VTextField } from "vuetify/components";

import { mdiDelete } from "@mdi/js";
import { useTemplateRef } from "vue";

import { preventTooLongInput } from "@/utility/input.ts";
import { FieldValidationRules } from "@/utility/rules";

const { unionNames, groupNames, limitName } = defineProps<{
  unionNames: string[];
  groupNames: string[];
  limitName: number;
}>();

const union = defineModel<Union>({ required: true });

const nameInputField = useTemplateRef<VTextField>("nameInputField");

const emit = defineEmits<{
  editedName: [];
  delete: [];
  removeGroup: [groupIdx: number];
}>();

function editedName() {
  emit("editedName");
}

function deleteUnion() {
  emit("delete");
}

function removeGroup(groupIdx: number) {
  emit("removeGroup", groupIdx);
}

function validateNameField() {
  nameInputField.value?.validate();
}

function checkNameField(event: KeyboardEvent) {
  preventTooLongInput(union.value.name, limitName, event);
}

function resetValidation() {
  nameInputField.value?.resetValidation();
}

defineExpose({
  validateNameField,
  resetValidation,
});
</script>
