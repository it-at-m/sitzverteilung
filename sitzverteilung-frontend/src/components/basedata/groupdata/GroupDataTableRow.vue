<template>
  <tr>
    <td class="px-2">
      <slot name="prepend" />
    </td>
    <td>
      <v-text-field
        v-model="group.name"
        ref="nameInputField"
        type="text"
        :rules="
          applyRules
            ? [
                FieldValidationRules.Required,
                FieldValidationRules.IsUnique(groupNames),
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
        v-model.number="group.committeeSeats"
        ref="committeeSeatsInputField"
        type="text"
        :rules="applyRules ? [FieldValidationRules.Required] : []"
        :min="1"
        :max="limitSeats"
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
      <v-number-input
        v-model.number="group.votes"
        ref="votesInputField"
        type="text"
        :rules="applyRules ? [FieldValidationRules.Required] : []"
        :min="1"
        :max="limitVotes"
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
import type { Group } from "@/types/Group";
import type { VTextField } from "vuetify/components";

import { computed, nextTick, useTemplateRef, watch } from "vue";

import { FieldValidationRules } from "@/utility/rules";

const {
  isValidatingOnEmpty = true,
  disabled = false,
  groupNames,
  limitSeats,
  limitVotes,
} = defineProps<{
  isValidatingOnEmpty?: boolean;
  disabled?: boolean;
  groupNames: string[];
  limitSeats: number;
  limitVotes: number;
}>();

const group = defineModel<Group>({ required: true });

const nameInputField = useTemplateRef<VTextField>("nameInputField");
const committeeSeatsInputField = useTemplateRef<VTextField>(
  "committeeSeatsInputField"
);
const votesInputField = useTemplateRef<VTextField>("votesInputField");

const isEmpty = computed(
  () => !(group.value.name || group.value.committeeSeats || group.value.votes)
);

watch(
  () => [isEmpty.value, isValidatingOnEmpty],
  ([newEmpty, newIsValidatingOnEmpty]) => {
    if (!newIsValidatingOnEmpty && newEmpty) resetValidation();
  }
);

const isValid = computed(() =>
  Boolean(
    nameInputField.value?.isValid &&
      committeeSeatsInputField.value?.isValid &&
      votesInputField.value?.isValid
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
  committeeSeatsInputField.value?.validate();
}

function validate() {
  // requires nextTick as dynamic update of rules will otherwise not be respected
  nextTick(() => {
    nameInputField.value?.validate(true);
    committeeSeatsInputField.value?.validate(true);
    votesInputField.value?.validate(true);
  });
}

function resetValidation() {
  nameInputField.value?.resetValidation();
  committeeSeatsInputField.value?.resetValidation();
  votesInputField.value?.resetValidation();
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
