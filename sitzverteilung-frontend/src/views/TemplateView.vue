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
            <div class="pa-4 text-justify">
              <h2 class="mb-2">Information zur Vorlagenansicht</h2>
              <p class="mb-3">
                In dieser Ansicht wird die Verwaltung der Vorlagen geregelt,
                bestehend aus:
              </p>
              <ul class="pl-4 mb-3">
                <li>
                  Parteien / Gruppierungen / Einzelmitglieder und zugehörige
                  Informationen
                </li>
                <li>
                  Bilden von Fraktionsgemeinschaften und Ausschussgemeinschaften
                </li>
              </ul>

              <v-alert
                color="warning"
                :icon="mdiExclamation"
                title="Speicherung der Daten"
                text="Die angelegten Vorlagen werden nur im Browser gespeichert. Je nach Einstellung können dadurch nach dem Schließen des Browsers angelegte Daten verloren gehen. In solchen Fällen sollten die Vorlagen als Link (über die 'Teilen'-Funktion) extern abgelegt werden."
              />

              <h3 class="mt-4 mb-2">Vorlagenansicht</h3>
              <p class="mb-3">
                Neue Vorlagen können über das Ausfüllen des Formulars angelegt
                werden. Bereits angelegte Vorlagen lassen sich durch ein
                Drop-Down-Menü in die Übersicht übernehmen. Die ausgewählten
                Vorlagen lassen sich dann ändern, löschen und über einen Link
                teilen. Außerdem lässt sich auf Basis einer bestehenden Vorlage
                mit "Anlegen" auch eine neue Vorlage erzeugen.
              </p>

              <h3 class="mt-4 mb-2">Eingabebeschränkungen</h3>
              <p class="mb-3">
                Das Anlegen oder Ändern einer Vorlage ist nur dann möglich,
                wenn:
              </p>
              <ul class="pl-4 mb-3">
                <li>
                  Der Name der Vorlage sowie die Ausschussgröße eingegeben
                  wurden.
                </li>
                <li>
                  Mindestens eine Partei / Gruppierung / Einzelmitglied
                  vorhanden ist.
                </li>
              </ul>

              <p class="mb-3">
                Der Name ist auf
                {{ numberFormatter(LimitConfiguration.limitName) }} Zeichen
                beschränkt, die Größe des Hauptorgans sowie die Ausschussgröße
                auf
                {{ numberFormatter(LimitConfiguration.limitCommitteeSize) }}
                Sitze und die Stimmen auf
                {{ numberFormatter(LimitConfiguration.limitVotes) }} Stimmen.
                Ist eine Größe für das Hauptorgan angegeben, sind Sitze
                einzugeben. Andernfalls wird von Stimmen als Eingabe
                ausgegangen.
              </p>

              <p class="mb-3">
                Bei dem Namen der Parteien / Gruppierungen / Einzelmitglieder
                gilt ebenfalls ein Limit von
                {{ numberFormatter(LimitConfiguration.limitName) }} Zeichen.
                Zusätzlich muss die Anzahl der Sitze in der Tabelle erfasst
                werden. Die Angabe der Stimmen ist optional. Maximal können
                {{ numberFormatter(LimitConfiguration.limitGroups) }} Parteien /
                Gruppierungen / Einzelmitglieder angelegt werden.
              </p>

              <p class="mb-3">
                Bevor die Vorlage angelegt werden kann, muss die Gesamtanzahl
                der Sitze aller Parteien / Gruppierungen / Einzelmitglieder mit
                der Größe des Hauptorgans übereinstimmen.
              </p>
              <p class="mb-3">
                Gelöscht werden können die Parteien / Gruppierungen /
                Einzelmitglieder:
              </p>
              <ul class="pl-4 mb-3">
                <li>Entweder einzeln in der jeweiligen Zeile</li>
                <li>
                  Oder indem mehrere ausgewählt werden und auf Zeile bzw. Zeilen
                  löschen geklickt wird.
                </li>
              </ul>

              <h3 class="mt-4 mb-2">
                Fraktionsgemeinschaften und Ausschussgemeinschaften
              </h3>
              <p class="mb-3">
                Fraktionsgemeinschaften und Ausschussgemeinschaften werden
                separat unterhalb Parteien / Gruppierungen / Einzelmitglieder
                angezeigt. Sofern mindestens zwei Einträge ausgewählt wurden,
                lässt sich eine Fraktionsgemeinschaft oder eine
                Ausschussgemeinschaft bilden.
              </p>

              <p>
                Jede Partei / Gruppierung / Einzelmitglied kann nur Teil einer
                Fraktionsgemeinschaft bzw. einer Ausschussgemeinschaft sein. Es
                ist möglich, innerhalb der
                Fraktionsgemeinschaft-/Ausschussgemeinschaftstabelle
                hinzugefügte Parteien / Gruppierungen / Einzelmitglieder wieder
                zu entfernen. Diese lassen sich allerdings nicht wieder
                hinzufügen, es sei denn, es wird eine neue Fraktionsgemeinschaft
                oder eine neue Ausschussgemeinschaft angelegt.
              </p>
            </div>
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
          <v-btn
            variant="flat"
            color="blue"
            size="large"
            class="mx-5"
            :prepend-icon="mdiShare"
            :disabled="!selectedBaseData || dirty"
            @click="share"
            text="Teilen"
          />
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
  mdiExclamation,
  mdiShare,
} from "@mdi/js";
import { computed, ref } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import TemplateDataAutocomplete from "@/components/basedata/TemplateDataAutocomplete.vue";
import InfoDialog from "@/components/common/InfoDialog.vue";
import YesNoDialog from "@/components/common/YesNoDialog.vue";
import { useSaveLeave } from "@/composables/useSaveLeave.ts";
import { useShareData } from "@/composables/useShareData.ts";
import { useTemplateData } from "@/composables/useTemplateData.ts";
import { useSnackbarStore } from "@/stores/snackbar.ts";
import { useTemplateDataStore } from "@/stores/templatedata.ts";
import { numberFormatter } from "@/utility/numberFormatter.ts";
import { LimitConfiguration } from "@/utility/validation.ts";

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
