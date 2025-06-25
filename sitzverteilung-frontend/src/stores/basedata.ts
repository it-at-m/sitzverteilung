import type { BaseData } from "@/types/BaseData";

import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

export const useBaseDataStore = defineStore("basedata", () => {
  const internalBaseDatas = ref<BaseData[]>([
    {
      name: "Testbasisdaten",
      committeeSize: 100,
      groups: [
        {
          name: "Testpartei",
          committeeSeats: 80,
          votes: 1231,
        },
        {
          name: "Toastpartei",
          committeeSeats: 20,
          votes: 124141,
        },
      ],
      unions: [],
    },
  ]);
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
  import.meta.hot.accept(acceptHMRUpdate(useBaseDataStore, import.meta.hot));
}
