<template>
  <tr class="bg-grey-lighten-3">
    <td />
    <td>
      <v-text-field
        v-model="newGroup.name"
        ref="nameInputField"
        type="text"
        :rules="
          isEmpty
            ? []
            : [
                FieldValidationRules.Required,
                FieldValidationRules.IsNonExistent(groupNames),
              ]
        "
        hide-details="auto"
        validate-on="input"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown.enter="addGroupEnter"
        :disabled="disabled"
      />
    </td>
    <td>
      <v-text-field
        v-model.number="newGroup.committeeSeats"
        ref="committeeSeatsInputField"
        type="number"
        :rules="
          isEmpty
            ? []
            : [
                FieldValidationRules.Required,
                FieldValidationRules.Integer,
                FieldValidationRules.LargerThan(0),
                FieldValidationRules.LowerOrEqualThan(limitSeats),
              ]
        "
        min="0"
        :max="limitSeats"
        hide-details="auto"
        validate-on="input"
        @keydown="checkSeatField"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown.enter="addGroupEnter"
        :disabled="disabled"
      />
    </td>
    <td>
      <v-text-field
        v-model.number="newGroup.votes"
        ref="votesInputField"
        type="number"
        :rules="
          isEmpty
            ? []
            : [
                FieldValidationRules.Required,
                FieldValidationRules.Integer,
                FieldValidationRules.LargerThan(0),
                FieldValidationRules.LowerOrEqualThan(limitVotes),
              ]
        "
        min="0"
        :max="limitVotes"
        hide-details="auto"
        validate-on="input"
        @keydown="checkVoteField"
        variant="underlined"
        density="compact"
        class="py-3"
        @keydown.enter="addGroupEnter"
        :disabled="disabled"
      />
    </td>
    <td>
      <div class="d-flex justify-center">
        <v-btn
          @click="addGroup"
          :disabled="disabled || isEmpty || !isValid"
          :icon="mdiPlus"
          size="small"
          color="primary"
          flat
          aria-label="Hinzufügen"
        />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";
import type { VTextField } from "vuetify/components";

import { mdiPlus } from "@mdi/js";
import { computed, ref, useTemplateRef, watch } from "vue";

import { checkInputLength, checkNumberInput } from "@/utility/input";
import { FieldValidationRules } from "@/utility/rules";

const props = defineProps<{
  groupNames: string[];
  disabled: boolean;
  limitSeats: number;
  limitVotes: number;
}>();

const newGroup = ref<Group>(getEmptyGroup());

const nameInputField = useTemplateRef<VTextField>("nameInputField");
const committeeSeatsInputField = useTemplateRef<VTextField>(
  "committeeSeatsInputField"
);
const votesInputField = useTemplateRef<VTextField>("votesInputField");

const isValid = computed(
  () =>
    isEmpty.value ||
    (nameInputField.value?.isValid &&
      committeeSeatsInputField.value?.isValid &&
      votesInputField.value?.isValid)
);

const isEmpty = computed(
  () =>
    !newGroup.value.name &&
    !(newGroup.value.committeeSeats === 0 || !!newGroup.value.committeeSeats) &&
    !(newGroup.value.votes === 0 || !!newGroup.value.votes)
);
watch(isEmpty, (newValue) => {
  if (newValue) resetValidation();
});

const emit = defineEmits<{
  addGroup: [group: Group];
}>();

function addGroupEnter() {
  if (isValid.value) {
    nameInputField.value?.focus();
    addGroup();
  }
}
function addGroup() {
  if (isValid.value) {
    resetValidation();
    emit("addGroup", newGroup.value);
    newGroup.value = getEmptyGroup();
  }
}

const maxSeatsLength = computed(() => props.limitSeats.toString().length);
function checkSeatField(event: KeyboardEvent) {
  checkNumberInput(event);
  checkInputLength(
    newGroup.value.committeeSeats?.toString(),
    maxSeatsLength.value,
    event
  );
}

const maxVotesLength = computed(() => props.limitVotes.toString().length);
function checkVoteField(event: KeyboardEvent) {
  checkNumberInput(event);
  checkInputLength(
    newGroup.value.votes?.toString(),
    maxVotesLength.value,
    event
  );
}

function validateNameField() {
  nameInputField.value?.validate();
}
function resetValidation() {
  nameInputField.value?.resetValidation();
  committeeSeatsInputField.value?.resetValidation();
  votesInputField.value?.resetValidation();
}

watch(
  () => props.disabled,
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
