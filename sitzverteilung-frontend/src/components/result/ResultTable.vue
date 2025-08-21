<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>{{ detailTitle }}</v-card-title>
      <v-card-text>
        <p>Detailinformationen zu: {{ detailInfo }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="dialog = false">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
    <v-toolbar flat>
      <v-toolbar-title>Detailansicht zu:</v-toolbar-title>
      <v-btn
          variant="outlined"
          class="mx-2"
          @click="goToDetail('Hare/Niemeyer')">Hare/Niemayer</v-btn>
      <v-btn
          variant="outlined"
          class="mx-2"
          @click="goToDetail('SanteLague/Schepers')">Sainte-Lague/Schepers</v-btn>
      <v-btn
          variant="outlined"
          class="mx-2"
          @click="goToDetail('DHondt')">D'Hondt</v-btn>
    </v-toolbar>
  <v-data-table
      :headers="headers as any"
      :items="results"
      hide-default-footer
      no-filter
      disable-sort
      density="compact"
      :no-data-text="`Keine Berechnungsdaten vorhanden.`"
      items-per-page="-1"
  >
    <template #header.name="{ column }">
      <div class="d-flex">
        <p>{{ column.title }}</p>
      </div>
    </template>

    <template #header.groups="{ column }">
      <div class="d-flex">
        <p>{{ column.title }}</p>
      </div>
    </template>
  </v-data-table>
</template>
<script setup lang="ts">
import {computed, ref} from "vue";

const headers = computed(() => [
  {
    title: `Zusammensetzung`,
    width: 250,
    children: [
      {
        title: `Partei/Wählergruppe`,
        key: "name",
        width: 200,
      },
      {
        title: `Sitze`,
        key: "committeeSeats",
        width: 50,
      },
    ]
  },
  {
    title: `Zulässigkeit des Verfahrens`,
    width: 250,
    children: [
      {
        title: `Ausschuss`,
        key: "name",
        width: 50,
      },
      {
        title: `Quotenkriterium`,
        key: "committeeSeats",
        width: 50,
      },
      {
        title: `H/N`,
        key: "votes",
        width: 50,
      },
      {
        title: `SL/S`,
        key: "votes",
        width: 50,
      },
      {
        title: `d/H`,
        key: "votes",
        width: 50,
      },
    ]
  },
  {
    title: `Ergebnisse`,
    width: 250,
    children: [
      {
        title: `Hare/Niemeyer`,
        key: "name",
        width: 200,
      },
      {
        title: `Sainte-Lague/Schepers`,
        key: "committeeSeats",
        width: 50,
      },
      {
        title: `D'Hondt`,
        key: "votes",
        width: 50,
      },
    ]
  },
  {
    title: `Pattauflösung/Dokumentation`,
    width: 50,
    children: [
      {
        title:``,
        key: "votes",
        width: 200,
      }
    ],
  },
]);

const results = [
  {
    party: 'Beispielpartei',
    seats: 5,
    committee: 100,
    quota: 2,
    hN: 30,
    sls: 20,
    dH: 15,
    hareNiemeyer: 10,
    sainteLague: 5,
    dHondt: 8,
    documentation: "JustALittleTestNothingToWorryAbout"
  },
];

const dialog = ref(false);
const detailTitle = ref('');
const detailInfo = ref('');

function goToDetail(selectedCalculationMethod: string) {
  detailTitle.value = selectedCalculationMethod;
  dialog.value = true;
}
</script>