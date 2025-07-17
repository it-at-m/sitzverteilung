<template>
  <div>
    <v-btn
      @click="openDialog"
      :icon="mdiInformation"
      variant="text"
      aria-label="Informationen anzeigen"
    />
    <v-dialog
      v-model="isOpen"
      width="800"
      scrollable
    >
      <v-card>
        <v-card-text>
          <slot name="dialog-text" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="flat"
            @click="closeDialog"
          >
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { mdiInformation } from "@mdi/js";
import { ref } from "vue";

const isOpen = ref(false);

function openDialog() {
  isOpen.value = true;
}

function closeDialog() {
  isOpen.value = false;
}
</script>
