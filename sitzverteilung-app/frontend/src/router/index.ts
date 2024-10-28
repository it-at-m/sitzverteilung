// Composables
import { createRouter, createWebHistory } from "vue-router";

import {ROUTES_BASISDATEN, ROUTES_BERECHNUNG, ROUTES_HOME} from "@/Constants";
import BasisdatenView from "@/views/BasisdatenView.vue";
import BerechnungView from "@/views/BerechnungView.vue";
import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: ROUTES_HOME,
    component: HomeView,
    meta: {},
  },
  {
    path: "/basisdaten",
    name: ROUTES_BASISDATEN,
    component: BasisdatenView,
  },
  {
    path: "/berechnung",
    name: ROUTES_BERECHNUNG,
    component: BerechnungView,
  },
  { path: "/:catchAll(.*)*", redirect: "/" }, // CatchAll route
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
