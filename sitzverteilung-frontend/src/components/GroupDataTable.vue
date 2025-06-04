<template>
  <v-data-table
    :headers="headers"
    :items="indexedGroups"
    hide-default-footer
    hide-no-data
    no-filter
    disable-sort
    density="compact"
    show-select
    return-object
    v-model="selected"
  >
    <template #top>
      <v-toolbar
        density="compact"
        flat
        class="px-2"
      >
        <template #prepend>
          <v-btn
            :disabled="!isDeletionPossible"
            @click="deleteGroups"
            :prepend-icon="mdiDelete"
            variant="tonal"
            color="error"
            size="small"
            class="mx-2"
          >
            {{ selected.length > 1 ? "Zeilen" : "Zeile" }} löschen
          </v-btn>
        </template>
      </v-toolbar>
    </template>

    <template #header.name="{ column }">
      <div class="d-flex">
        <v-icon
          :icon="mdiAccountGroup"
          class="mx-1"
        />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.committeeSeats="{ column }">
      <div class="d-flex">
        <v-icon
          :icon="mdiSeat"
          class="mx-1"
        />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.votes="{ column }">
      <div class="d-flex">
        <v-icon
          :icon="mdiVote"
          class="mx-1"
        />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #item.name="{ index }">
      <v-text-field
        v-model="groups[index].name"
        type="text"
        :rules="[
          FieldValidationRules.Required,
          FieldValidationRules.IsUnique(groupNames),
        ]"
        :ref="nameFieldsRef.set"
        @keyup="validateNameFields"
        hide-details="auto"
        validate-on="invalid-input"
        variant="underlined"
        density="compact"
        class="py-3"
      />
    </template>

    <template #item.committeeSeats="{ index }">
      <v-text-field
        v-model.number="groups[index].committeeSeats"
        type="number"
        :rules="[
          FieldValidationRules.Required,
          FieldValidationRules.Integer,
          FieldValidationRules.LargerThan(0),
        ]"
        hide-details="auto"
        validate-on="invalid-input"
        @keydown="checkNumberInput"
        variant="underlined"
        density="compact"
        class="py-3"
      />
    </template>

    <template #item.votes="{ index }">
      <v-text-field
        v-model.number="groups[index].votes"
        type="number"
        :rules="[
          FieldValidationRules.Required,
          FieldValidationRules.Integer,
          FieldValidationRules.LargerThan(0),
        ]"
        hide-details="auto"
        validate-on="invalid-input"
        @keydown="checkNumberInput"
        variant="underlined"
        density="compact"
        class="py-3"
      />
    </template>

    <template #item.actions="{ index }">
      <div class="d-flex justify-center">
        <v-btn
          @click="deleteGroup(index)"
          :icon="mdiDelete"
          size="small"
          color="red"
          variant="text"
          aria-label="Zeile löschen"
        />
      </div>
    </template>

    <template #body.append>
      <group-data-table-add-row
        :group-names="groupNames"
        :disabled="limitReached"
        @addGroup="addNewGroup"
        ref="groupDataTableAddRowRef"
      />
      <group-data-table-summary-row :groups="groups" :max-groups="maxGroups"/>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";
import type { VTextField } from "vuetify/components";

import { mdiAccountGroup, mdiDelete, mdiSeat, mdiVote } from "@mdi/js";
import { useDebounceFn, useTemplateRefsList } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";

import GroupDataTableAddRow from "@/components/GroupDataTableAddRow.vue";
import GroupDataTableSummaryRow from "@/components/GroupDataTableSummaryRow.vue";
import { checkNumberInput } from "@/utility/input";
import { FieldValidationRules } from "@/utility/rules";

const headers = [
  { title: "Name der Partei/Gruppierung", key: "name", width: 300 },
  { title: "Anzahl der Sitze", key: "committeeSeats", width: 250 },
  { title: "Anzahl der Stimmen", key: "votes", width: 250 },
  { title: "Aktionen", key: "actions", align: "center", width: 100 },
] as const;

const props = defineProps<{
  maxGroups: number
}>();

const groups = defineModel<Group[]>({ required: true });
const groupNames = computed(() => groups.value.map((group) => group.name));
const limitReached = computed(() => groups.value.length >= props.maxGroups);

function addNewGroup(group: Group) {
  groups.value.push(group);
}

const nameFieldsRef = useTemplateRefsList<VTextField>();
const groupDataTableAddRowRef = useTemplateRef<{
  validateNameField: () => void;
}>("groupDataTableAddRowRef");
const validateNameFields = useDebounceFn(() => {
  nameFieldsRef.value.forEach((field) => field.validate());
  groupDataTableAddRowRef.value?.validateNameField();
}, 1000);

const selected = ref<(Group & { index: number })[]>([]);
const selectedIndexes = computed(() => selected.value.map((sel) => sel.index));
const indexedGroups = computed(() =>
  groups.value.map((group, index) => ({
    index,
    ...group,
  }))
);
const isDeletionPossible = computed(() => selected.value.length > 0);
function deleteGroups() {
  groups.value = groups.value.filter(
    (_, index) => !selectedIndexes.value.includes(index)
  );
  selected.value = [];
  validateNameFields();
}

function deleteGroup(index: number) {
  groups.value.splice(index, 1);
  validateNameFields();
}
</script>
