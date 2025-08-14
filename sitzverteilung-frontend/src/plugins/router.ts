import { createRouter, createWebHashHistory } from "vue-router";

import AboutView from "@/views/AboutView.vue";
import CalculationView from "@/views/CalculationView.vue";
import TemplateView from "@/views/TemplateView.vue";

export const enum RouteNames {
  ABOUT = "about",
  DATA = "data",
  CALCULATION = "calculation",
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
