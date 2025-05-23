<template>
  <v-navigation-drawer
    expand-on-hover
    width="120"
    color="primary"
    v-if="!mobile"
  >
    <v-list>
      <v-list-item>
        <template #prepend>
          <v-avatar
            size="85"
          >
            <v-img src="@/assets/logo.png" />
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list
      density="compact"
      nav
    >
      <v-list-item
        v-for="(navigationItem, index) in navigationItems"
        :key="index"
      >
        <div class="d-flex flex-column align-center">
          <v-btn
            :icon="navigationItem.icon"
            text
            flat
            color="primary"
            :to="{ name: navigationItem.routeName }"
          />
          <p>{{ navigationItem.text }}</p>
        </div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-bottom-navigation
    v-else
    grow
    bg-color="primary"
  >
    <v-btn
      v-for="(navigationItem, index) in navigationItems"
      :key="index"
      :prepend-icon="navigationItem.icon"
      :to="{ name: navigationItem.routeName }"
      :text="navigationItem.text"
    />
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import type { NavigationItem } from "@/types/NavigationItem.ts";

import { mdiDatabase, mdiInformation } from "@mdi/js";
import { useDisplay } from "vuetify";

import { RouteNames } from "@/plugins/router.ts";

const { mobile } = useDisplay();

const navigationItems: NavigationItem[] = [
  {
    text: "Basisdaten",
    routeName: RouteNames.DATA,
    icon: mdiDatabase,
  },
  {
    text: "Über",
    routeName: RouteNames.ABOUT,
    icon: mdiInformation,
  },
];
</script>
