import type { BaseData } from "@/types/basedata/BaseData.ts";

import { computed, ref, useTemplateRef, watch } from "vue";

import BaseDataForm from "@/components/basedata/BaseDataForm.vue";
import { useTemplateDataStore } from "@/stores/templatedata.ts";

export function useTemplateData() {
  const store = useTemplateDataStore();
  const storedBaseData = computed(() => store.baseDatas);

  const selectedBaseData = ref<BaseData | null>(null);
  const baseDataNames = computed(() =>
    storedBaseData.value.map((baseData) => baseData.name)
  );

  const currentBaseData = ref<BaseData>(getEmptyBaseData());
  const isValid = ref(false);

  function updateIsValid(newIsValid: boolean) {
    isValid.value = newIsValid;
  }

  const isBaseDataSelected = computed(() => !!selectedBaseData.value);

  const dirty = computed(
    () =>
      isBaseDataSelected.value &&
      JSON.stringify(currentBaseData.value) !==
        JSON.stringify(selectedBaseData.value)
  );

  const isDataEntered = computed(
    () =>
      dirty.value ||
      (!isBaseDataSelected.value &&
        JSON.stringify(currentBaseData.value) !==
          JSON.stringify(getEmptyBaseData()))
  );

  function getEmptyBaseData(): BaseData {
    return {
      name: "",
      committeeSize: undefined,
      targetSize: undefined,
      groups: [],
      unions: [],
    };
  }

  const baseDataFormRef =
    useTemplateRef<typeof BaseDataForm>("baseDataFormRef");

  watch(selectedBaseData, (newBaseData) => {
    if (!newBaseData) {
      reset();
    } else {
      currentBaseData.value = JSON.parse(JSON.stringify(newBaseData));
    }
  });

  function reset() {
    baseDataFormRef.value?.reset();
    currentBaseData.value = getEmptyBaseData();
  }

  const areNecessaryFieldsEmpty = computed(() => {
    return !(
      currentBaseData.value.targetSize != null &&
      currentBaseData.value.targetSize > 0 &&
      currentBaseData.value.groups.length > 0
    );
  });

  return {
    storedBaseData,
    selectedBaseData,
    baseDataNames,
    currentBaseData,
    isValid,
    updateIsValid,
    isBaseDataSelected,
    dirty,
    isDataEntered,
    baseDataFormRef,
    reset,
    areNecessaryFieldsEmpty,
  };
}
