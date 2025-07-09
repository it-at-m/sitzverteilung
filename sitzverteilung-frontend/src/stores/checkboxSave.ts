import { defineStore } from "pinia";
import { ref } from "vue";

export const useCheckboxStore = defineStore("checkboxes", () => {
  const selectedIndices = ref<number[]>([]);

  return {
    selectedIndices,
  };
});
