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
    <v-row
      align="center"
      class="d-flex"
    >
      <v-col class="d-flex align-center">
        <h1 class="mr-2">Verwaltung der Basisdaten</h1>
        <info-dialog>
          <template #dialog-text>
            <div class="dialog-text pa-4">
              <h3 class="mb-2">Information zur Basisdatenübersicht</h3>
              <p class="mb-3">
                In dieser Ansicht wird die Verwaltung der Basisdaten geregelt,
                bestehend aus:
              </p>
              <ul class="pl-4 mb-3">
                <li>Verwaltung der Basisdatenübersicht</li>
                <li>Parteien und Gruppierungen</li>
                <li>Fraktionen und Ausschüsse</li>
              </ul>

              <h4 class="mt-4 mb-2">Basisdatenübersicht</h4>
              <p class="mb-3">
                Bei der Verwaltung der Basisdatenübersicht lassen sich bereits
                angelegte Basisdaten durch ein Drop-Down-Menü in die Übersicht
                übernehmen. Eingefügte Basisdaten lassen sich hier anlegen,
                löschen und über einen Link teilen.
              </p>

              <h4 class="mt-4 mb-2">Eingabebeschränkungen</h4>
              <p class="mb-3">
                Ein Anlegen neuer Daten ist nur dann möglich, wenn:
              </p>
              <ul class="pl-4 mb-3">
                <li>
                  Der Name des Basisdatensatzes und die Größe des Hauptorgans
                  eingegeben wurden.
                </li>
                <li>Mindestens eine Partei vorhanden ist.</li>
              </ul>

              <p class="mb-3">
                Der Name ist auf 50 Zeichen beschränkt, die Größe des
                Hauptorgans auf
                {{ formattedCommitteeSize }}
                Sitze und die Stimmen auf
                {{ formattedVotesLimit }}
                Stimmen.
              </p>

              <p class="mb-3">
                Bei dem Namen der Parteien und Gruppierungen gilt ebenfalls ein
                Limit von {{ LimitConfiguration.limitName }} Zeichen. Zusätzlich
                bietet die Tabelle an, die Anzahl der Sitze und der Stimmen zu
                erfassen. Maximal können
                {{ LimitConfiguration.limitGroups }} Parteien angelegt werden.
              </p>

              <p class="mb-3">
                Bevor der Basisdatensatz angelegt werden kann, muss die Anzahl
                der Sitze aller Parteien addiert mit der Größe des Hauptorgans
                übereinstimmen. Gelöscht werden können die Parteien und
                Gruppierungen:
              </p>
              <ul class="pl-4 mb-3">
                <li>Entweder einzeln in der jeweiligen Zeile</li>
                <li>
                  Oder indem mehrere ausgewählt werden und auf Zeile bzw. Zeilen
                  löschen geklickt wird.
                </li>
              </ul>

              <h4 class="mt-4 mb-2">Fraktionen und Ausschüsse</h4>
              <p class="mb-3">
                Fraktionen und Ausschüsse werden separat unter
                Parteien/Gruppierungen angezeigt. Sofern mindestens zwei
                Parteien oder Gruppierungen ausgewählt wurden, lassen diese sich
                in eine Fraktion oder einen Ausschuss zusammenfassen.
              </p>

              <p class="mb-3">
                Jede Partei/Gruppierung kann nur Teil einer Fraktion bzw. eines
                Ausschusses sein. Es ist möglich, innerhalb der
                Fraktions-/Ausschusstabelle Parteien oder Gruppierungen wieder
                zu entfernen. Diese lassen sich allerdings nicht wieder
                hinzufügen, es sei denn, es wird eine neue Fraktion/ein neuer
                Ausschuss angelegt.
              </p>
            </div>
          </template>
        </info-dialog>
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
import InfoDialog from "@/components/common/InfoDialog.vue";
import YesNoDialog from "@/components/common/YesNoDialog.vue";
import { useSaveLeave } from "@/composables/useSaveLeave.ts";
import { STATUS_INDICATORS } from "@/constants.ts";
import { useBaseDataStore } from "@/stores/basedata.ts";
import { useSnackbarStore } from "@/stores/snackbar.ts";
import { numberFormatter } from "@/utility/numberFormatter.ts";
import {
  writeToUrlParam,
  writeUrlParamToObject,
} from "@/utility/urlEncoder.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

const store = useBaseDataStore();
const snackbar = useSnackbarStore();

const storedBaseData = computed(() => store.baseDatas);
const formattedCommitteeSize = numberFormatter(
  LimitConfiguration.limitCommitteeSize
);
const formattedVotesLimit = numberFormatter(LimitConfiguration.limitVotes);

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
