import { useRegisterSW } from "virtual:pwa-register/vue";

export const usePWA = () => {
  useRegisterSW({
    immediate: true,
  });
};
