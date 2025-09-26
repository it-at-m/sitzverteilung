<template>
  <tr>
    <td>
      <v-text-field
        v-model.trim="union.name"
        ref="nameInputField"
        :rules="[
          FieldValidationRules.Required,
          FieldValidationRules.IsUnique(unionNames),
          FieldValidationRules.MaxLength(limitName),
        ]"
        hide-details="auto"
        validate-on="input"
        :error-messages="unionConstellationValidationError"
        :prefix="UNION_TYPE_PREFIXES[unionType]"
        @input="editedName"
        variant="underlined"
        density="compact"
        class="py-3"
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
          label
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
import type { Union } from "@/types/basedata/Union.ts";
import type { VTextField } from "vuetify/components";

import { mdiDelete } from "@mdi/js";
import { computed, useTemplateRef } from "vue";

import { UNION_TYPE_PREFIXES, UnionType } from "@/types/basedata/Union.ts";
import { FieldValidationRules } from "@/utility/validation.ts";

const { unions, groupNames, limitName } = defineProps<{
  unions: Union[];
  unionType: UnionType;
  groupNames: string[];
  limitName: number;
}>();
const unionNames = computed(() => unions.map((union) => union.name));

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

function focusNameField() {
  nameInputField.value?.focus();
}

const isUniqueConstellation = computed(() => {
  const search = JSON.stringify(union.value.groups);

  const matchingUnions = unions.filter(
    (union) => JSON.stringify(union.groups) === search
  );

  return matchingUnions.length < 2;
});

const unionConstellationValidationError = computed(() => {
  return !isUniqueConstellation.value
    ? "Es existiert bereits ein Eintrag mit identischer Konstellation."
    : "";
});

function resetValidation() {
  nameInputField.value?.resetValidation();
}

defineExpose({
  validateNameField,
  focusNameField,
  resetValidation,
});
</script>
