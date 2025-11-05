<template>
  <v-data-table
    :headers="headers as any"
    :items="unions"
    hide-default-footer
    no-filter
    disable-sort
    density="compact"
    :no-data-text="`Es wurden noch keine ${dataTableTitle} hinzugefügt.`"
    items-per-page="-1"
  >
    <template #top>
      <v-toolbar
        density="compact"
        flat
        class="px-2"
      >
        <template #prepend>
          <p class="text-h6 font-weight-bold">{{ dataTableTitle }}</p>
        </template>
      </v-toolbar>
    </template>

    <template #header.name="{ column }">
      <div class="d-flex">
        <v-icon
          :icon="mdiLabel"
          class="mx-1"
        />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.groups="{ column }">
      <div class="d-flex">
        <v-icon
          :icon="mdiAccountGroup"
          class="mx-1"
        />
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #item="{ index }">
      <union-data-table-row
        v-if="unions[index]"
        v-model="unions[index]"
        :ref="unionDataTableRowsRef.set"
        :unions="unions"
        :union-type="unionType"
        :group-names="groupNames"
        :limit-name="limitName"
        @edited-name="validateNameFields"
        @delete="deleteUnion(index)"
        @remove-group="(groupIdx) => removeGroup(index, groupIdx)"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { GroupIndex, Union } from "@/types/basedata/Union.ts";

import { mdiAccountGroup, mdiLabel } from "@mdi/js";
import { useDebounceFn, useTemplateRefsList } from "@vueuse/core";
import { computed, nextTick } from "vue";

import UnionDataTableRow from "@/components/basedata/uniondata/UnionDataTableRow.vue";
import { UnionType } from "@/types/basedata/Union.ts";

const headers = computed(() => [
  {
    title: "Name",
    key: "name",
    width: 200,
  },
  {
    title: "Parteien / Gruppierungen / Einzelmitglieder",
    key: "groups",
    width: 250,
  },
  { title: "Aktionen", key: "actions", align: "center", width: 100 },
]);
const dataTableTitle = computed(() =>
  props.unionType == UnionType.FRACTION
    ? "Fraktionsgemeinschaften"
    : "Ausschussgemeinschaften"
);

const props = defineProps<{
  groupNames: string[];
  unionType: UnionType;
  limitName: number;
}>();

const unions = defineModel<Union[]>({ required: true });

const unionDataTableRowsRef = useTemplateRefsList<typeof UnionDataTableRow>();

const validateNameFields = useDebounceFn(() => {
  unionDataTableRowsRef.value.forEach((rowRef) => rowRef.validateNameField());
}, 1000);

function addUnion(selectedIndexes: GroupIndex[]) {
  const sorted = selectedIndexes.sort();
  const newUnion: Union = {
    name: "",
    unionType: props.unionType,
    groups: sorted,
  };
  unions.value = [...unions.value, newUnion];
  nextTick(() => {
    unionDataTableRowsRef.value?.at(-1)?.focusNameField();
  });
}

function deleteUnion(idx: number) {
  unions.value = unions.value.filter((_, index) => index !== idx);
}

function removeGroup(unionIdx: number, groupIdx: GroupIndex) {
  const union = unions.value[unionIdx];
  if (union) {
    const remainingGroups = union.groups.filter((group) => group !== groupIdx);
    if (remainingGroups.length < 2) {
      deleteUnion(unionIdx);
    } else {
      union.groups = remainingGroups;
      unions.value[unionIdx] = union;
    }
  }
}

function updateGroupReferencesOnRemoval(
  newGroupSize: number,
  removeList: GroupIndex[]
) {
  const sortedRemoveList = removeList.sort((a, b) => b - a);
  unions.value.forEach((union) => {
    union.groups = union.groups
      .map((groupIdx) =>
        sortedRemoveList.reduce((a, rem) => (a > rem ? a - 1 : a), groupIdx)
      )
      .filter((groupIdx) => groupIdx >= 0 && groupIdx < newGroupSize);
  });
}

defineExpose({
  addUnion,
  updateGroupReferencesOnRemoval,
});
</script>
