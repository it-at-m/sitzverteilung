import type { Ref } from "vue";

import { useClipboard } from "@vueuse/core";
import { nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { STATUS_INDICATORS } from "@/constants.ts";
import { useSnackbarStore } from "@/stores/snackbar.ts";
import {
  writeToUrlParam,
  writeUrlParamToObject,
} from "@/utility/urlEncoder.ts";

export function useShareData<T>(
  resetSelectedData: boolean,
  selectedData: Ref<T | null>,
  isValid: (data: T) => boolean,
  importTarget: Ref<T | null>,
  importMessage: string
) {
  const { copy, isSupported } = useClipboard();
  const route = useRoute();
  const router = useRouter();
  const snackbar = useSnackbarStore();

  const share = async (): Promise<void> => {
    if (selectedData.value) {
      if (!isSupported.value) {
        snackbar.showMessage({
          message: "Das Kopieren in die Zwischenablage war nicht möglich.",
          level: STATUS_INDICATORS.ERROR,
        });
        return;
      }

      try {
        const importParam = await writeToUrlParam<T>(
          selectedData.value,
          window.location.toString()
        );

        const shareUrl = router.resolve({
          path: route.path,
          query: { ...route.query, import: importParam },
        }).href;
        const fullShareUrl = new URL(
          shareUrl,
          window.location.origin
        ).toString();

        await copy(fullShareUrl);
        snackbar.showMessage({
          message: "Die Daten wurden als Link in die Zwischenablage kopiert.",
        });
      } catch {
        snackbar.showMessage({
          message: "Die Daten konnten nicht in einen Link umgewandelt werden.",
        });
      }
    }
  };

  watch(
    () => route.query.import,
    async (newImport) => {
      const importParam = newImport?.toString() ?? "";
      if (importParam) {
        try {
          const data = await writeUrlParamToObject<T>(importParam);
          if (!isValid(data)) {
            snackbar.showMessage({
              message: "Die Daten im Link sind ungültig.",
              level: STATUS_INDICATORS.ERROR,
            });
          } else {
            if (resetSelectedData) {
              selectedData.value = null;
            }
            await nextTick(() => {
              importTarget.value = data;
            });
            snackbar.showMessage({
              message: importMessage,
            });
          }
        } catch {
          snackbar.showMessage({
            message: "Die Daten im Link sind ungültig.",
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

  return { share };
}
