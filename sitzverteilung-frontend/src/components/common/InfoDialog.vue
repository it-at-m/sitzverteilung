<template>
  <div>
    <v-btn
      @click="openDialog"
      :icon="mdiInformation"
      size="20"
    />
    <v-dialog
      v-model="isOpen"
      persistent
      width="800"
    >
      <v-card>
        <v-card-text class="dialog-text">
          <slot name="dialog-text" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            id="infodialog-btn-back"
            variant="flat"
            @click="closeDialog"
          >
            Zurück zur Seite
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { mdiInformation } from "@mdi/js";
import { defineEmits, ref } from "vue";

const emit = defineEmits<{
  close: [];
}>();

const isOpen = ref(false);

function openDialog() {
  isOpen.value = true;
}

function closeDialog() {
  isOpen.value = false;
  emit("close");
}
</script>
