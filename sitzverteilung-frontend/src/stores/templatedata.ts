import type { BaseData } from "@/types/basedata/BaseData.ts";

import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

export const useTemplateDataStore = defineStore("template-data", () => {
  const internalBaseDatas = ref<BaseData[]>([]);
  const baseDatas = computed(() => internalBaseDatas.value);

  function addBaseData(baseData: BaseData) {
    const index = internalBaseDatas.value.findIndex(
      (data) => data.name === baseData.name
    );
    if (index === -1) {
      internalBaseDatas.value.push(baseData);
    }
  }

  function updateBaseData(name: string, baseData: BaseData) {
    const index = internalBaseDatas.value.findIndex(
      (data) => data.name === name
    );
    if (index !== -1) {
      internalBaseDatas.value[index] = baseData;
    }
  }

  function deleteBaseData(name: string) {
    internalBaseDatas.value = internalBaseDatas.value.filter(
      (baseData) => baseData.name !== name
    );
  }

  function deleteAllBaseData() {
    internalBaseDatas.value = [];
  }

  return {
    internalBaseDatas,
    baseDatas,
    addBaseData,
    updateBaseData,
    deleteBaseData,
    deleteAllBaseData,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useTemplateDataStore, import.meta.hot)
  );
}
