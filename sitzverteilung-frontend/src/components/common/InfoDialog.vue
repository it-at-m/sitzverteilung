<template>
  <v-dialog
      :model-value="modelValue"
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
            @click="back"
        >
          {{ backText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const {
  backText = "Zurück zur Seite",
} = defineProps<{
  modelValue: boolean;
  backText?: string;
  dialogTitle: string;
}>();

const emit = defineEmits<{
  back: [];
}>();

function back(): void {
  emit("back");
}
</script>