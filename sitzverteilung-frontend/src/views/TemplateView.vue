<template>
  <v-container>
    <!-- SaveLeave dialog -->
    <yes-no-dialog
      :model-value="saveLeave.saveLeaveDialog.value"
      :dialog-title="saveLeave.saveLeaveDialogTitle.value"
      :dialog-text="saveLeave.saveLeaveDialogText.value"
      @no="saveLeave.cancel()"
      @yes="saveLeave.leave()"
    />
    <!-- Delete dialog -->
    <yes-no-dialog
      :model-value="isDeleteConfirmationShown"
      dialog-title="Vorlage löschen?"
      :dialog-text="`Wollen Sie die Vorlage '${selectedBaseData?.name ?? ''}' wirklich löschen?`"
      yes-text="Löschen"
      no-text="Abbrechen"
      yes-color="red"
      @no="hideDeleteConfirmation"
      @yes="deleteSelectedBaseData"
    />
    <v-row>
      <v-col class="d-flex align-center">
        <h1 class="mr-5">Verwaltung der Vorlagen</h1>
        <info-dialog>
          <template #dialog-text>
            <markdown-renderer markdown-file-name="instruction_templates" />
          </template>
        </info-dialog>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <template-data-autocomplete
            v-model="selectedBaseData"
            :limit-name="LimitConfiguration.limitName"
            :base-data-list="storedBaseData"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSave"
            :disabled="
              !isValid ||
              (selectedBaseData && !dirty) ||
              basedataNameIsNotChanged
            "
            @click="createBaseData"
            text="Anlegen"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSaveEdit"
            :disabled="!selectedBaseData || !isValid || !dirty"
            @click="updateBaseData"
            text="Ändern"
          />
          <v-btn
            variant="flat"
            color="red"
            size="large"
            class="ml-5"
            :prepend-icon="mdiDelete"
            :disabled="!selectedBaseData"
            @click="showDeleteConfirmation"
            text="Löschen"
          />
          <v-tooltip
            text="Ausgewählte Vorlage teilen"
            :disabled="!selectedBaseData || dirty"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="flat"
                color="blue"
                size="large"
                class="mx-5"
                :prepend-icon="mdiShare"
                :disabled="!selectedBaseData || dirty"
                @click="share"
                text="Teilen"
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-toolbar>
    <v-row>
      <v-col>
        <base-data-form
          ref="baseDataFormRef"
          v-model="currentBaseData"
          @valid-changed="updateIsValid"
          :limit-name="LimitConfiguration.limitName"
          :limit-groups="LimitConfiguration.limitGroups"
          :limit-committee-size="LimitConfiguration.limitCommitteeSize"
          :limit-votes="LimitConfiguration.limitVotes"
          :selected-base-data-name="selectedBaseData?.name"
          :base-data-names="baseDataNames"
          :show-name-column="true"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/basedata/BaseData.ts";

import {
  mdiContentSave,
  mdiContentSaveEdit,
  mdiDelete,
  mdiShare,
} from "@mdi/js";
import { computed, ref } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import InfoDialog from "@/components/common/InfoDialog.vue";
import MarkdownRenderer from "@/components/common/MarkdownRenderer.vue";
import YesNoDialog from "@/components/common/YesNoDialog.vue";
import { useSaveLeave } from "@/composables/useSaveLeave.ts";
import { useShareData } from "@/composables/useShareData.ts";
import { useTemplateData } from "@/composables/useTemplateData.ts";
import { useSnackbarStore } from "@/stores/snackbar.ts";
import { useTemplateDataStore } from "@/stores/templatedata.ts";
import { isValidBaseData, LimitConfiguration } from "@/utility/validation.ts";

const store = useTemplateDataStore();
const snackbar = useSnackbarStore();

const {
  storedBaseData,
  selectedBaseData,
  baseDataNames,
  currentBaseData,
  updateIsValid,
  isDataEntered,
  baseDataFormRef,
  dirty,
  isValid,
} = useTemplateData();

const basedataNameIsNotChanged = computed(
  () => currentBaseData.value?.name === selectedBaseData.value?.name
);
const saveLeave = useSaveLeave(isDataEntered);

function updateBaseData() {
  if (currentBaseData.value && selectedBaseData.value) {
    const copy = JSON.parse(JSON.stringify(currentBaseData.value));
    store.updateBaseData(selectedBaseData.value.name, copy);
    snackbar.showMessage({
      message: `Die Vorlage '${selectedBaseData.value.name}' wurde aktualisiert.`,
    });
    selectedBaseData.value = copy;
  }
}

function createBaseData() {
  if (currentBaseData.value) {
    const copy = JSON.parse(JSON.stringify(currentBaseData.value));
    store.addBaseData(copy);
    snackbar.showMessage({
      message: `Die Vorlage '${copy.name}' wurde angelegt.`,
    });
    selectedBaseData.value = copy;
  }
}

const isDeleteConfirmationShown = ref(false);
function showDeleteConfirmation() {
  isDeleteConfirmationShown.value = true;
}
function hideDeleteConfirmation() {
  isDeleteConfirmationShown.value = false;
}
function deleteSelectedBaseData() {
  hideDeleteConfirmation();
  if (selectedBaseData.value) {
    store.deleteBaseData(selectedBaseData.value.name);
    snackbar.showMessage({
      message: `Die Vorlage '${selectedBaseData.value.name}' wurde gelöscht.`,
    });
    selectedBaseData.value = null;
  }
}

const { share } = useShareData<BaseData>(
  true,
  selectedBaseData,
  isValidBaseData,
  currentBaseData,
  "Die Daten wurden aus dem Link übertragen. ACHTUNG: Erst nach dem Klick auf 'Anlegen' werden diese permanent gespeichert."
);
</script>
