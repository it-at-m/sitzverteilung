<template>
  <v-data-table
    :headers="headers"
    :items="groups"
    hide-default-footer
    hide-no-data
    no-filter
    disable-sort
    density="compact"
    show-select
    return-object
    v-model="selected"
  >
    <template #bottom>
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
        <v-icon :icon="mdiAccountGroup" class="mx-1" />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.committeeSeats="{ column }">
      <div class="d-flex">
        <v-icon :icon="mdiSeat" class="mx-1" />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.votes="{ column }">
      <div class="d-flex">
        <v-icon :icon="mdiVote" class="mx-1" />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #item.name="{ item }">
      <v-text-field
        v-model="item.name"
        type="text"
        :rules="[FieldValidationRules.Required]"
        validate-on="blur eager"
        hide-details
        single-line
        label="Name"
        variant="underlined"
        density="compact"
        class="py-3"
      />
    </template>

    <template #item.committeeSeats="{ item }">
      <v-text-field
          v-model.number="item.committeeSeats"
          type="number"
          :rules="[FieldValidationRules.Required, FieldValidationRules.Integer, FieldValidationRules.LargerThan(10)]"
          validate-on="blur eager"
          hide-details
          single-line
          label="Sitze"
          variant="underlined"
          density="compact"
          class="py-3"
      />
    </template>

    <template #item.votes="{ item }">
      <v-text-field
          v-model.number="item.votes"
          type="number"
          :rules="[FieldValidationRules.Required, FieldValidationRules.Integer]"
          validate-on="blur eager"
          hide-details
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

import { mdiDelete, mdiAccountGroup, mdiSeat, mdiVote, mdiPlus } from "@mdi/js";
import { computed, ref, watch } from "vue";

import { FieldValidationRules } from "@/rules.ts";

const headers = [
  { title: "Name", key: "name", width: 600 },
  { title: "Sitze" , key: "committeeSeats", width: 100 },
  { title: "Stimmen", key: "votes", width: 100 },
] as const;

const groups = defineModel<Group[]>({ required: true });

// const indexedGroups = computed({
//   get() {
//     return groups.value.map((group, index) => ({
//       index,
//       ...group
//     }));
//   },
//   set(newValue: (Group & {index: number})[]) {
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     groups.value = newValue.map(({index, ...group}) => group)
//   }
// });

const selected = ref<Group[]>([]);

const isDeletionPossible = computed(() => selected.value.length > 0);

function deleteGroups() {
  groups.value = groups.value.filter((group) => !selected.value.includes(group));
}

function addNewGroup() {
  groups.value.push(getEmptyGroup());
}

watch(groups, newValue => {
  if(newValue.length == 0) {
    groups.value = [
      getEmptyGroup()
    ]
  }
}, { immediate: true })

function getEmptyGroup(): Group {
  return {
    name: "",
    committeeSeats: 0,
    votes: 0
  }
}
</script>
