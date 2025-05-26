<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <group-data-table v-model="testGroups" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { Group } from "@/types/Group.ts";

import GroupDataTable from "@/components/GroupDataTable.vue";
import { ref } from "vue";

const testGroups = ref<Group[]>([
  {
    name: "Test",
    committeeSeats: 30,
    votes: 20,
  },
  {
    name: "Test 2",
    committeeSeats: 20,
    votes: 50,
  },
]);
</script>
