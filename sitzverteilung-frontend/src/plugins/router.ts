import { createRouter, createWebHashHistory } from "vue-router";

import AboutView from "@/views/AboutView.vue";
import CalculationView from "@/views/CalculationView.vue";
import ImpressView from "@/views/ImpressView.vue";
import TemplateView from "@/views/TemplateView.vue";

export const enum RouteNames {
  ABOUT = "about",
  DATA = "data",
  CALCULATION = "calculation",
  IMPRESS = "impress",
}

const routes = [
  {
    path: "/data",
    name: RouteNames.DATA,
    component: TemplateView,
  },
  {
    path: "/about",
    name: RouteNames.ABOUT,
    component: AboutView,
    meta: {},
  },
  {
    path: "/calculation",
    name: RouteNames.CALCULATION,
    component: CalculationView,
    meta: {},
  },
  {
    path: "/impress",
    name: RouteNames.IMPRESS,
    component: ImpressView,
    meta: {},
  },
  { path: "/:catchAll(.*)*", redirect: "/data" }, // CatchAll route
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      left: 0,
    };
  },
});

export default router;
