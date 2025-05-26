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
            @click="addNewGroup"
            :prepend-icon="mdiPlus"
            variant="tonal"
            color="primary"
            size="small"
            class="mr-1"
          >
            Zeile hinzufügen
          </v-btn>
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
        hide-details="auto"
        validate-on="invalid-input"
        single-line
        label="Name"
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
          FieldValidationRules.Integer,
          FieldValidationRules.LargerThan(0),
        ]"
        hide-details="auto"
        validate-on="invalid-input"
        @keydown="checkNumberInput"
        single-line
        label="Sitze"
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
          FieldValidationRules.Integer,
          FieldValidationRules.LargerThan(0),
        ]"
        hide-details="auto"
        validate-on="invalid-input"
        @keydown="checkNumberInput"
        single-line
        label="Stimmen"
        variant="underlined"
        density="compact"
        class="py-3"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";

import { mdiAccountGroup, mdiDelete, mdiPlus, mdiSeat, mdiVote } from "@mdi/js";
import { computed, ref, watch } from "vue";

import { FieldValidationRules } from "@/rules.ts";

const headers = [
  { title: "Name der Partei/Gruppierung", key: "name", width: 300 },
  { title: "Sitze", key: "committeeSeats", width: 250 },
  { title: "Stimmen", key: "votes", width: 250 },
] as const;

const groups = defineModel<Group[]>({ required: true });
const groupNames = computed(() => groups.value.map((group) => group.name));

const indexedGroups = computed(() =>
  groups.value.map((group, index) => ({
    index,
    ...group,
  }))
);

const selected = ref<(Group & { index: number })[]>([]);
const selectedIndexes = computed(() => selected.value.map((sel) => sel.index));

const isDeletionPossible = computed(() => selected.value.length > 0);

function deleteGroups() {
  groups.value = groups.value.filter(
    (_, index) => !selectedIndexes.value.includes(index)
  );
  selected.value = [];
}

function addNewGroup() {
  groups.value.push(getEmptyGroup());
}

watch(
  groups,
  (newValue) => {
    if (newValue.length == 0) {
      groups.value = [getEmptyGroup()];
    }
  },
  { immediate: true }
);

function getEmptyGroup(): Group {
  return {
    name: "",
    committeeSeats: 0,
    votes: 0,
  };
}

function checkNumberInput(event: KeyboardEvent) {
  if (event.ctrlKey || event.altKey || event.key.length !== 1) {
    return;
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}
</script>
