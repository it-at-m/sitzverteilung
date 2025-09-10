<template>
  <tr>
    <td class="px-2">
      <slot name="prepend" />
    </td>
    <td>
      <v-text-field
        v-model.trim="group.name"
        ref="nameInputField"
        :rules="
          applyRules
            ? [
                FieldValidationRules.Required,
                FieldValidationRules.IsUnique(groupNames),
                FieldValidationRules.MaxLength(limitName),
              ]
            : []
        "
        hide-details="auto"
        validate-on="input"
        @input="editedName"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown.enter="hitEnter"
        :disabled="disabled"
      />
    </td>
    <td>
      <v-number-input
        v-model="group.seatsOrVotes"
        ref="seatsOrVotesInputField"
        :rules="applyRules ? [FieldValidationRules.Required] : []"
        :min="1"
        :max="limitSeats === 0 ? limitVotes : limitSeats"
        hide-details="auto"
        validate-on="input"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown.enter="hitEnter"
        :disabled="disabled"
      />
    </td>
    <td>
      <slot
        name="append"
        :is-action-disabled="isActionDisabled"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/basedata/Group.ts";
import type { VTextField } from "vuetify/components";

import { computed, nextTick, useTemplateRef, watch } from "vue";

import { FieldValidationRules } from "@/utility/validation.ts";

const {
  isValidatingOnEmpty = true,
  disabled = false,
  groupNames,
  limitSeats,
  limitName,
    limitVotes,
} = defineProps<{
  isValidatingOnEmpty?: boolean;
  disabled?: boolean;
  groupNames: string[];
  limitSeats: number;
  limitName: number;
  limitVotes: number;
}>();

const group = defineModel<Group>({ required: true });

const nameInputField = useTemplateRef<VTextField>("nameInputField");
const seatsOrVotesInputField = useTemplateRef<VTextField>(
  "seatsOrVotesInputField"
);

const isEmpty = computed(
  () => !(group.value.name || group.value.seatsOrVotes)
);

watch(
  () => [isEmpty.value, isValidatingOnEmpty],
  ([newEmpty, newIsValidatingOnEmpty]) => {
    if (!newIsValidatingOnEmpty && newEmpty) resetValidation();
  }
);

const isValid = computed(() =>
  Boolean(
    nameInputField.value?.isValid && seatsOrVotesInputField.value?.isValid
  )
);
const isActionDisabled = computed(
  () => disabled || isEmpty.value || !isValid.value
);

const emit = defineEmits(["hitEnter", "editedName"]);
function hitEnter() {
  if (!isActionDisabled.value) {
    emit("hitEnter");
  }
}
function editedName() {
  emit("editedName");
}

const applyRules = computed(() => {
  return isValidatingOnEmpty || !isEmpty.value;
});
watch(
  () => applyRules.value,
  () => {
    validate();
  }
);

function validateNameField() {
  nameInputField.value?.validate();
}

function validateSeatField() {
  seatsOrVotesInputField.value?.validate();
}

function validate() {
  // requires nextTick as dynamic update of rules will otherwise not be respected
  nextTick(() => {
    nameInputField.value?.validate(true);
    seatsOrVotesInputField.value?.validate(true);
  });
}

function resetValidation() {
  nameInputField.value?.resetValidation();
  seatsOrVotesInputField.value?.resetValidation();
}

function focusNameField() {
  nameInputField.value?.focus();
}

defineExpose({
  validateNameField,
  validateSeatField,
  resetValidation,
  focusNameField,
});
</script>
