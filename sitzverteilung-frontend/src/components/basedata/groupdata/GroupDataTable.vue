<template>
  <v-data-table
    :headers="headers"
    :items="indexedGroups"
    hide-default-footer
    no-filter
    disable-sort
    density="compact"
    no-data-text="Es wurden noch keine Parteien/Gruppierungen hinzugefügt."
    show-select
    return-object
    v-model="selected"
    items-per-page="-1"
  >
    <template #top>
      <v-toolbar
        density="compact"
        flat
        class="px-2"
      >
        <template #prepend>
          <p class="text-h6 font-weight-bold">Parteien / Gruppierungen</p>
        </template>
        <template #append>
          <v-btn
            :disabled="isFractionDisabled"
            @click="createUnion(UnionType.FRACTION)"
            :prepend-icon="mdiPlus"
            variant="tonal"
            color="primary"
            size="small"
            class="mx-2"
            text="Fraktion anlegen"
          >
          </v-btn>
          <v-btn
            :disabled="isCommitteeDisabled"
            @click="createUnion(UnionType.COMMITTEE)"
            :prepend-icon="mdiPlus"
            variant="tonal"
            color="primary"
            size="small"
            class="mx-2"
            text="Ausschuss anlegen"
          />
          <v-btn
            :disabled="isDeletionDisabled"
            @click="deleteGroups"
            :prepend-icon="mdiDelete"
            variant="tonal"
            color="error"
            size="small"
            class="mx-2"
            text="Zeilen löschen"
          />
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

    <template #item="{ index, toggleSelect, internalItem }">
      <group-data-table-row
        :ref="groupDataTableRowsRef.set"
        v-model="groups[index]"
        :group-names="groupNames"
        :limit-name="limitName"
        :limit-seats="expectedSeats"
        :limit-votes="limitVotes"
        @edited-name="validateNameFields"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="selectedIndexes.includes(index)"
            @update:model-value="toggleSelect(internalItem, index)"
          />
        </template>
        <template #append>
          <div class="d-flex justify-center">
            <v-btn
              @click="deleteGroup(index)"
              :disabled="isSingleDeletionDisabled(index)"
              :icon="mdiDelete"
              size="small"
              color="red"
              variant="text"
              aria-label="Zeile löschen"
            />
          </div>
        </template>
      </group-data-table-row>
    </template>

    <template #body.append>
      <group-data-table-add-row
        :group-names="groupNames"
        :disabled="isGroupLimitReached"
        :limit-name="limitName"
        :limit-seats="expectedSeats"
        :limit-votes="limitVotes"
        @addGroup="addNewGroup"
        ref="groupDataTableAddRowRef"
      />
      <group-data-table-summary-row
        :groups="groups"
        :limit-groups="limitGroups"
        :expected-seats="expectedSeats"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { Group } from "@/types/Group";
import type { GroupIndex, Union } from "@/types/Union.ts";

import { mdiAccountGroup, mdiDelete, mdiPlus, mdiSeat, mdiVote } from "@mdi/js";
import { useDebounceFn, useTemplateRefsList } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";

import GroupDataTableAddRow from "@/components/basedata/groupdata/GroupDataTableAddRow.vue";
import GroupDataTableRow from "@/components/basedata/groupdata/GroupDataTableRow.vue";
import GroupDataTableSummaryRow from "@/components/basedata/groupdata/GroupDataTableSummaryRow.vue";
import { UnionType } from "@/types/Union.ts";

const headers = [
  { title: "Name der Partei/Gruppierung", key: "name", width: 400 },
  { title: "Anzahl der Sitze", key: "committeeSeats", width: 200 },
  { title: "Anzahl der Stimmen", key: "votes", width: 200 },
  { title: "Aktionen", key: "actions", align: "center", width: 100 },
] as const;

const props = defineProps<{
  expectedSeats: number;
  limitName: number;
  limitGroups: number;
  limitVotes: number;
  fractions: Union[];
  committees: Union[];
}>();

const groups = defineModel<Group[]>({ required: true });
const groupNames = computed(() => groups.value.map((group) => group.name));
const isGroupLimitReached = computed(
  () => groups.value.length >= Math.min(props.expectedSeats, props.limitGroups)
);
const unionGroups = computed(() => {
  const flattenedGroups = [...props.fractions, ...props.committees]
    .map((union) => union.groups)
    .flat();
  return [...new Set(flattenedGroups)];
});

function addNewGroup(group: Group) {
  groups.value.push(group);
}

const groupDataTableRowsRef = useTemplateRefsList<typeof GroupDataTableRow>();
const groupDataTableAddRowRef = useTemplateRef<typeof GroupDataTableAddRow>(
  "groupDataTableAddRowRef"
);

const validateNameFields = useDebounceFn(() => {
  groupDataTableRowsRef.value.forEach((rowRef) => rowRef.validateNameField());
  groupDataTableAddRowRef.value?.validateNameField();
}, 1000);

watch(
  () => props.expectedSeats,
  () => {
    validateSeatFields();
  }
);
const validateSeatFields = useDebounceFn(() => {
  groupDataTableRowsRef.value.forEach((rowRef) => rowRef.validateSeatField());
  groupDataTableAddRowRef.value?.validateSeatField();
}, 500);

const selected = ref<(Group & { index: number })[]>([]);
const selectedIndexes = computed(() =>
  selected.value.map((sel) => sel.index).sort()
);
const indexedGroups = computed(() =>
  groups.value.map((group, index) => ({
    index,
    ...group,
  }))
);

const isFractionDisabled = computed(() => {
  if (selectedIndexes.value.length < 2) return true;
  const search = JSON.stringify(selectedIndexes.value);
  const matchingFractions = props.fractions.filter(
    (union) => JSON.stringify(union.groups) === search
  );
  return matchingFractions.length > 0;
});
const isCommitteeDisabled = computed(() => {
  if (selectedIndexes.value.length < 2) return true;
  const search = JSON.stringify(selectedIndexes.value);
  const matchingCommittees = props.committees.filter(
    (union) => JSON.stringify(union.groups) === search
  );
  return matchingCommittees.length > 0;
});

function createUnion(type: UnionType) {
  emit("createUnion", selectedIndexes.value, type);
  selected.value = [];
}
const emit = defineEmits<{
  createUnion: [groups: GroupIndex[], type: UnionType];
  deletedGroup: [newGroupSize: number, removeList: GroupIndex[]];
}>();

const isDeletionDisabled = computed(
  () =>
    selected.value.length == 0 ||
    selectedIndexes.value.some((selected) =>
      unionGroups.value.includes(selected)
    )
);
function isSingleDeletionDisabled(groupIdx: GroupIndex) {
  return unionGroups.value.includes(groupIdx);
}
function deleteGroups() {
  const newElements = groups.value.filter(
    (_, index) => !selectedIndexes.value.includes(index)
  );
  emit("deletedGroup", newElements.length, selectedIndexes.value);
  groups.value = newElements;
  selected.value = [];
  validateNameFields();
}

function deleteGroup(index: number) {
  const newLength = groups.value.length - 1;
  emit("deletedGroup", newLength, [index]);
  groups.value.splice(index, 1);
  selected.value = [];
  validateNameFields();
}
</script>
