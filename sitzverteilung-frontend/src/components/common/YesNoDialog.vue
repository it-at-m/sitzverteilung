<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    width="800"
  >
    <v-card>
      <v-card-title>
        {{ dialogTitle }}
      </v-card-title>
      <v-card-text>
        {{ dialogText }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          id="yesnodialog-btn-no"
          variant="flat"
          @click="no"
        >
          {{ noText }}
        </v-btn>
        <v-btn
          id="yesnodialog-btn-yes"
          :color="yesColor"
          variant="flat"
          @click="yes"
        >
          {{ yesText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const {
  yesText = "Ja",
  yesColor = "primary",
  noText = "Nein",
} = defineProps<{
  modelValue: boolean;
  buttonText?: string;
  yesText?: string;
  yesColor?: string;
  noText?: string;
  dialogTitle: string;
  dialogText: string;
}>();

const emit = defineEmits<{
  no: [];
  yes: [];
}>();

function no(): void {
  emit("no");
}
function yes(): void {
  emit("yes");
}
</script>
