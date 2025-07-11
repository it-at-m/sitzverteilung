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
      dialog-title="Basisdaten löschen?"
      dialog-text="Wollen Sie die Basisdaten wirklich löschen?"
      yes-text="Löschen"
      no-text="Abbrechen"
      yes-color="red"
      @no="hideDeleteConfirmation"
      @yes="deleteSelectedBaseData"
    />
    <v-row>
      <v-col>
        <h1>Verwaltung der Basisdaten</h1>
      </v-col>
    </v-row>
    <v-toolbar class="my-6 py-2 px-3 bg-primary">
      <v-row>
        <v-col class="d-flex align-center">
          <base-data-autocomplete
            ref="baseDataAutocompleteRef"
            @update="updatedBaseDataSelection"
            :limit-name="LimitConfiguration.limitName"
            :base-data-list="storedBaseData"
          />
          <v-btn
            variant="flat"
            color="green"
            size="large"
            class="ml-5"
            :prepend-icon="mdiContentSave"
            :disabled="!isValid || (isBaseDataSelected && !dirty)"
            @click="saveBaseData"
            >{{ isBaseDataSelected ? "Aktualisieren" : "Anlegen" }}
          </v-btn>
          <v-btn
            variant="flat"
            color="red"
            size="large"
            class="ml-5"
            :prepend-icon="mdiDelete"
            :disabled="!isBaseDataSelected"
            @click="showDeleteConfirmation"
          >
            Löschen
          </v-btn>
          <v-btn
            variant="flat"
            color="blue"
            size="large"
            class="mx-5"
            :prepend-icon="mdiShare"
            :disabled="!isBaseDataSelected || dirty"
            @click="share"
          >
            Teilen
          </v-btn>
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
          :is-editing="isBaseDataSelected"
          :base-data-names="baseDataNames"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import type { BaseData } from "@/types/BaseData";

import { mdiContentSave, mdiDelete, mdiShare } from "@mdi/js";
import { useClipboard } from "@vueuse/core";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import BaseDataAutocomplete from "@/components/basedata/BaseDataAutocomplete.vue";
import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import YesNoDialog from "@/components/common/YesNoDialog.vue";
import { useSaveLeave } from "@/composables/useSaveLeave.ts";
import { STATUS_INDICATORS } from "@/constants.ts";
import { useBaseDataStore } from "@/stores/basedata.ts";
import { useSnackbarStore } from "@/stores/snackbar.ts";
import {
  writeToUrlParam,
  writeUrlParamToObject,
} from "@/utility/urlEncoder.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

const store = useBaseDataStore();
const snackbar = useSnackbarStore();

const storedBaseData = computed(() => store.baseDatas);

const dirty = computed(
  () =>
    isBaseDataSelected.value &&
    JSON.stringify(currentBaseData.value) !==
      JSON.stringify(selectedBaseData.value)
);
const isDataEntered = computed(
  () =>
    dirty.value ||
    (!isBaseDataSelected.value &&
      !dirty.value &&
      JSON.stringify(currentBaseData.value) !==
        JSON.stringify(getEmptyBaseData()))
);
const saveLeave = useSaveLeave(isDataEntered);

const baseDataNames = computed(() =>
  storedBaseData.value.map((baseData) => baseData.name)
);

const selectedBaseData = ref<BaseData>();
const isBaseDataSelected = computed(
  () =>
    !!selectedBaseData.value &&
    selectedBaseData.value.name !== "" &&
    baseDataNames.value.includes(selectedBaseData.value.name)
);

const currentBaseData = ref<BaseData>(getEmptyBaseData());

const isValid = ref(false);
function updateIsValid(newIsValid: boolean) {
  isValid.value = newIsValid;
}

function getEmptyBaseData(): BaseData {
  return {
    name: "",
    committeeSize: undefined,
    groups: [],
    unions: [],
  };
}

function saveBaseData() {
  if (currentBaseData.value) {
    const copy = JSON.parse(JSON.stringify(currentBaseData.value));
    if (isBaseDataSelected.value && selectedBaseData.value) {
      store.updateBaseData(selectedBaseData.value.name, copy);
      snackbar.showMessage({
        message: `Die Basisdaten '${copy.name}' wurden aktualisiert.`,
      });
      selectedBaseData.value = undefined;
    } else {
      store.addBaseData(copy);
      snackbar.showMessage({
        message: `Die Basisdaten '${copy.name}' wurden angelegt.`,
      });
      reset();
    }
  }
}

const baseDataFormRef = useTemplateRef("baseDataFormRef");
const isDeleteConfirmationShown = ref(false);
function showDeleteConfirmation() {
  isDeleteConfirmationShown.value = true;
}
function hideDeleteConfirmation() {
  isDeleteConfirmationShown.value = false;
}
function deleteSelectedBaseData() {
  hideDeleteConfirmation();
  if (isBaseDataSelected.value && selectedBaseData.value) {
    store.deleteBaseData(selectedBaseData.value.name);
    snackbar.showMessage({
      message: `Die Basisdaten '${selectedBaseData.value.name}' wurden gelöscht.`,
    });
    selectedBaseData.value = undefined;
  }
}

function updatedBaseDataSelection(baseData: BaseData) {
  selectedBaseData.value = baseData;
}

const baseDataAutocompleteRef = useTemplateRef<typeof BaseDataAutocomplete>(
  "baseDataAutocompleteRef"
);
watch(selectedBaseData, (newBaseData) => {
  if (newBaseData === undefined || newBaseData.name === "") {
    reset();
    return;
  }
  currentBaseData.value = JSON.parse(JSON.stringify(newBaseData));
});

function reset() {
  baseDataAutocompleteRef.value?.reset();
  baseDataFormRef.value?.reset();
  currentBaseData.value = getEmptyBaseData();
}

const { copy, isSupported } = useClipboard();
async function share() {
  if (isBaseDataSelected.value && selectedBaseData.value) {
    if (!isSupported.value) {
      snackbar.showMessage({
        message: `Das Kopieren in die Zwischenablage war nicht möglich.`,
        level: STATUS_INDICATORS.ERROR,
      });
      return;
    }

    try {
      const importParam = await writeToUrlParam<BaseData>(
        selectedBaseData.value,
        window.location.toString()
      );
      // Create shareable URL
      const shareUrl = router.resolve({
        path: route.path,
        query: { ...route.query, import: importParam },
      }).href;
      const fullShareUrl = `${window.location.origin}/${shareUrl}`;
      // Copy to clipboard
      await copy(fullShareUrl);
      snackbar.showMessage({
        message: `Die Basisdaten '${selectedBaseData.value.name}' wurden als Link in die Zwischenablage kopiert.`,
      });
    } catch {
      snackbar.showMessage({
        message: `Die Basisdaten '${selectedBaseData.value.name}' konnten nicht in einen Link umgewandelt werden.`,
      });
    }
  }
}

const route = useRoute();
const router = useRouter();
watch(
  () => route.query.import,
  async (newImport) => {
    const importParam = newImport?.toString() ?? "";
    if (importParam !== "") {
      try {
        const baseData = await writeUrlParamToObject<BaseData>(importParam);
        if (!isValidBaseData(baseData)) {
          snackbar.showMessage({
            message: "Die Basisdaten im Link sind ungültig.",
            level: STATUS_INDICATORS.ERROR,
          });
        } else {
          selectedBaseData.value = undefined;
          await nextTick(() => {
            currentBaseData.value = baseData;
          });
          snackbar.showMessage({
            message: `Die Basisdaten '${baseData.name}' wurden importiert. ACHTUNG: Erst beim Speichern werden diese permanent gespeichert.`,
          });
        }
      } catch {
        snackbar.showMessage({
          message: "Die Basisdaten im Link sind ungültig.",
          level: STATUS_INDICATORS.ERROR,
        });
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { import: _, ...nextQuery } = route.query;
    await router.replace({ path: route.path, query: nextQuery });
  },
  { immediate: true }
);

/* eslint-disable @typescript-eslint/no-explicit-any */
function isValidBaseData(x: any): x is BaseData {
  return (
    x &&
    typeof x.name === "string" &&
    typeof x.committeeSize === "number" &&
    Array.isArray(x.groups) &&
    Array.isArray(x.unions) &&
    x.groups.every((group: any) => group && typeof group.name === "string") &&
    x.unions.every((union: any) => union && Array.isArray(union.groups))
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
</script>
