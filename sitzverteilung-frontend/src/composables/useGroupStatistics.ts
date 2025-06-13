import type { Group } from "@/types/Group";
import type { Ref } from "vue";

import { computed } from "vue";

export const useGroupStatistics = (
  groups: Ref<Group[]>,
  expectedSeats: Ref<number>
) => {
  // statistics
  const amountOfGroups = computed(() => groups.value.length);
  const totalSeats = computed(() => {
    return groups.value.reduce(
      (sum, group) => sum + (group.committeeSeats ? group.committeeSeats : 0),
      0
    );
  });
  const totalVotes = computed(() => {
    return groups.value.reduce((sum, group) => sum + (group.votes ?? 0), 0);
  });

  // validations
  const isTooManyGroups = computed(
    () => amountOfGroups.value > expectedSeats.value
  );
  const isSeatsTooHigh = computed(() => totalSeats.value > expectedSeats.value);
  const isSeatsTooLow = computed(() => totalSeats.value < expectedSeats.value);

  return {
    amountOfGroups,
    isTooManyGroups,
    isSeatsTooHigh,
    isSeatsTooLow,
    totalSeats,
    totalVotes,
  };
};
