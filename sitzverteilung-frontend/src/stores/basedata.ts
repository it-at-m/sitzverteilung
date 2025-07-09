import type { BaseData } from "@/types/BaseData";

import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

import { UnionType } from "@/types/Union.ts";

export const useBaseDataStore = defineStore("basedata", () => {
  const internalBaseDatas = ref<BaseData[]>([
    {
      name: "Test Basedata",
      committeeSize: 350,
      groups: [
        {
          name: "Testpartei 1",
          committeeSeats: 200,
          votes: 100,
        },
        {
          name: "Testpartei 2",
          committeeSeats: 100,
          votes: 50,
        },
        {
          name: "Testpartei 3",
          committeeSeats: 50,
          votes: 10,
        },
      ],
      unions: [
        {
          name: "Testfraktion",
          unionType: UnionType.FRACTION,
          groups: [0, 1, 2],
        },
        {
          name: "Testfraktion 2",
          unionType: UnionType.FRACTION,
          groups: [0, 1, 2],
        },
        {
          name: "Testausschuss 1",
          unionType: UnionType.COMMITTEE,
          groups: [0, 2],
        },
        {
          name: "Testausschuss 2",
          unionType: UnionType.COMMITTEE,
          groups: [1, 2],
        },
      ],
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
