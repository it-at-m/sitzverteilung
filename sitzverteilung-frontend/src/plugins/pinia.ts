// Utilities
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(
  createPersistedState({
    auto: true,
    key: (id) => `sitzverteilung-${id}`,
  })
);

export default pinia;
