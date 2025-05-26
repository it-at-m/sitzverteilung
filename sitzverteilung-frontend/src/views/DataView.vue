<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <group-data-table v-model="groups" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { Group } from "@/types/Group.ts";

import { ref } from "vue";

import GroupDataTable from "@/components/GroupDataTable.vue";

const groups = ref<Group[]>([]);
</script>
