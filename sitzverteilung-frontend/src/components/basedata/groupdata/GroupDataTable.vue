<template>
  <v-data-table
    :headers="headers as any"
    :items="indexedGroups"
    hide-default-footer
    no-filter
    disable-sort
    density="compact"
    no-data-text="Es wurden noch keine Parteien / Gruppierungen / Einzelmitglieder hinzugefügt."
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
          <p class="text-h6 font-weight-bold">
            Parteien / Gruppierungen / Einzelmitglieder
          </p>
        </template>
        <template #append>
          <v-tooltip
            v-if="isFractionDisabled"
            text="Zum Anlegen mind. 2 Parteien auswählen."
          >
            <template #activator="{ props }">
              <div v-bind="props"
                   tabindex="0
">
                <v-btn
                  :disabled="isFractionDisabled"
                  @click="createUnion(UnionType.FRACTION)"
                  :prepend-icon="mdiPlus"
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="mx-2"
                  text="Fraktionsgemeinschaft anlegen"
                />
              </div>
            </template>
          </v-tooltip>
          <v-btn
            v-else
            :disabled="isFractionDisabled"
            @click="createUnion(UnionType.FRACTION)"
            :prepend-icon="mdiPlus"
            variant="tonal"
            color="primary"
            size="small"
            class="mx-2"
            text="Fraktionsgemeinschaft anlegen"
          />
          <v-tooltip
            v-if="isCommitteeDisabled"
            text="Zum Anlegen mind. 2 Parteien auswählen."
          >
            <template #activator="{ props }">
              <div v-bind="props"
                  tabindex="0"
              >
                <v-btn
                  :disabled="isCommitteeDisabled"
                  @click="createUnion(UnionType.COMMITTEE)"
                  :prepend-icon="mdiPlus"
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="mx-2"
                  text="Ausschussgemeinschaft anlegen"
                />
              </div>
            </template>
          </v-tooltip>
          <v-btn
            v-else
            :disabled="isCommitteeDisabled"
            @click="createUnion(UnionType.COMMITTEE)"
            :prepend-icon="mdiPlus"
            variant="tonal"
            color="primary"
            size="small"
            class="mx-2"
            text="Ausschussgemeinschaft anlegen"
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
import type { Group } from "@/types/basedata/Group.ts";
import type { GroupIndex, Union } from "@/types/basedata/Union.ts";

import { mdiAccountGroup, mdiDelete, mdiPlus, mdiSeat, mdiVote } from "@mdi/js";
import { useDebounceFn, useTemplateRefsList } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";

import GroupDataTableAddRow from "@/components/basedata/groupdata/GroupDataTableAddRow.vue";
import GroupDataTableRow from "@/components/basedata/groupdata/GroupDataTableRow.vue";
import GroupDataTableSummaryRow from "@/components/basedata/groupdata/GroupDataTableSummaryRow.vue";
import { UnionType } from "@/types/basedata/Union.ts";
import { numberFormatter } from "@/utility/numberFormatter.ts";

const headers = computed(() => [
  {
    title: `Name der Partei / Gruppierung / Einzelmitglied (max. ${numberFormatter(props.limitName)} Zeichen)`,
    key: "name",
    width: 400,
  },
  {
    title: `Anzahl der Sitze (max. ${numberFormatter(props.expectedSeats)})`,
    key: "committeeSeats",
    width: 200,
  },
  {
    title: `Anzahl der Stimmen (optional, max. ${numberFormatter(props.limitVotes)})`,
    key: "votes",
    width: 200,
  },
  { title: "Aktionen", key: "actions", align: "center", width: 100 },
]);

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
function getUnionGroups(unions: Union[]) {
  const flattenedGroups = unions.map((union) => union.groups).flat();
  return [...new Set(flattenedGroups)];
}
const fractionGroups = computed(() => getUnionGroups(props.fractions));
const committeeGroups = computed(() => getUnionGroups(props.committees));
const unionGroups = computed(() =>
  getUnionGroups([...props.fractions, ...props.committees])
);

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

function isUnionDisabled(unions: Union[], groupIdxs: GroupIndex[]) {
  if (selectedIndexes.value.length < 2) return true;
  const search = JSON.stringify(selectedIndexes.value);
  const matchingCommittees = unions.filter(
    (union) => JSON.stringify(union.groups) === search
  );
  if (matchingCommittees.length > 0) return true;
  return selectedIndexes.value.some((selected) => groupIdxs.includes(selected));
}
const isFractionDisabled = computed(() =>
  isUnionDisabled(props.fractions, fractionGroups.value)
);
const isCommitteeDisabled = computed(() =>
  isUnionDisabled(props.committees, committeeGroups.value)
);

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
