<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>{{ detailTitle }}</v-card-title>
      <v-card-text>
        <p>Detailinformationen {{ detailInfo }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          @click="dialog = false"
          >Schließen</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-toolbar flat>
    <v-toolbar-title>Detailansicht zu:</v-toolbar-title>
    <v-btn
      variant="outlined"
      class="mx-2"
      @click="goToDetail('Hare/Niemeyer')"
      >Hare/Niemeyer</v-btn
    >
    <v-btn
      variant="outlined"
      class="mx-2"
      @click="goToDetail('Sainte-Laguë/Schepers')"
      >Sainte-Laguë/Schepers</v-btn
    >
    <v-btn
      variant="outlined"
      class="mx-2"
      @click="goToDetail(`D'Hondt`)"
      >D'Hondt</v-btn
    >
  </v-toolbar>
  <v-data-table
    :headers="headers"
    :items="results"
    hide-default-footer
    density="compact"
    no-data-text="Keine Berechnungsdaten vorhanden."
    :items-per-page="-1"
  >
  </v-data-table>
</template>
<script setup lang="ts">
import { ref } from "vue";

const headers = [
  {
    title: "Zusammensetzung",
    width: 250,
    children: [
      {
        title: "Name",
        key: "name",
        width: 200,
      },
      {
        title: "Sitze",
        key: "seatsOrVotes",
        width: 50,
      },
    ],
  },
  {
    title: "Zulässigkeit",
    width: 250,
    children: [
      {
        title: "Proporz",
        key: "committee",
        width: 50,
      },
      {
        title: "Quotenkriterium",
        key: "quota",
        width: 50,
      },
      {
        title: "H/N",
        key: "hN",
        width: 50,
      },
      {
        title: "SL/S",
        key: "sls",
        width: 50,
      },
      {
        title: "d/H",
        key: "dH",
        width: 50,
      },
    ],
  },
  {
    title: "Ergebnisse",
    width: 250,
    children: [
      {
        title: "Hare/Niemeyer",
        key: "hareNiemeyer",
        width: 200,
        children: [
          {
            title: "Sitze",
            key: "hareSeats",
            width: 50,
          },
          {
            title: "Patt",
            key: "harePatt",
            width: 50,
          },
        ],
      },
      {
        title: "Sainte-Laguë/Schepers",
        key: "sainteLague",
        width: 50,
        children: [
          {
            title: "Sitze",
            key: "sainteSeats",
            width: 50,
          },
          {
            title: "Patt",
            key: "saintePatt",
            width: 50,
          },
        ],
      },
      {
        title: "D'Hondt",
        key: "dHondt",
        width: 50,
        children: [
          {
            title: "Sitze",
            key: "dHSeats",
            width: 50,
          },
          {
            title: "Patt",
            key: "dHPatt",
            width: 50,
          },
        ],
      },
    ],
  },
  {
    title: "Dokumentation",
    width: 50,
    children: [
      {
        key: "documentation",
        width: 200,
      },
    ],
  },
];

const results = ref<unknown[]>([]);
const dialog = ref(false);
const detailTitle = ref("");

// Placeholder for future content, currently unused
const detailInfo = ref<string>("");

function goToDetail(
  selectedCalculationMethod:
    | "Hare/Niemeyer"
    | "Sainte-Laguë/Schepers"
    | "D'Hondt"
) {
  detailTitle.value = selectedCalculationMethod;
  dialog.value = true;
}
</script>
