import type { BaseData } from "@/types/BaseData.ts";

import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useBaseDataStore = defineStore("basedata", () => {
  const baseDatas = ref<BaseData[]>([]);

  function addOrUpdateBaseData(baseData: BaseData) {
    const index = baseDatas.value.findIndex(
      (data) => data.name === baseData.name
    );
    if (index === -1) {
      baseDatas.value.push(baseData);
    } else {
      baseDatas.value[index] = baseData;
    }
  }

  function deleteBaseData(name: string) {
    baseDatas.value = baseDatas.value.filter(
      (baseData) => baseData.name !== name
    );
  }

  function deleteAllBaseData() {
    baseDatas.value = [];
  }

  return { baseDatas, addOrUpdateBaseData, deleteBaseData, deleteAllBaseData };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBaseDataStore, import.meta.hot));
}
