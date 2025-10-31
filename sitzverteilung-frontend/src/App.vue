<template>
  <v-app>
    <the-snackbar />
    <the-navigation />
    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import TheNavigation from "@/components/TheNavigation.vue";
import TheSnackbar from "@/components/TheSnackbar.vue";
import { usePWA } from "@/composables/usePWA";

usePWA();
</script>

<style>
.bordered-table .v-data-table td:not(:last-child),
.bordered-table .v-data-table th {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
