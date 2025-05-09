<template>
  <v-app>
    <the-snackbar />

    <v-app-bar color="primary">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="() => toggleDrawer()" />
      </template>
      <v-app-bar-title>Sitzverteilung</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list class="pa-0">
        <v-list-item
          :prepend-icon="mdiHome"
          :to="{ name: ROUTES_HOME }"
          title="Startseite"
        />
      </v-list>
    </v-navigation-drawer>
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
import { mdiHome } from "@mdi/js";
import { useToggle } from "@vueuse/core";

import TheSnackbar from "@/components/TheSnackbar.vue";
import { ROUTES_HOME } from "@/constants";

const [drawer, toggleDrawer] = useToggle();
</script>
