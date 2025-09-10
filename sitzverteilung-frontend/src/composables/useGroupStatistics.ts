import type { Group } from "@/types/basedata/Group.ts";
import type { Ref } from "vue";

import { computed } from "vue";

export const useGroupStatistics = (
  groups: Ref<Group[]>,
  limitGroups: Ref<number>,
  expectedSeats: Ref<number>
) => {
  // statistics
  const amountOfGroups = computed(() => groups.value.length);
  const totalSeatsOrVotes = computed(() => {
    return groups.value.reduce(
      (sum, group) => sum + (group.seatsOrVotes ?? 0),
      0
    );
  });

  // validations
  const safeExpectedSeats = computed(() => expectedSeats.value ?? 0);
  const maximumGroups = computed(() => {
    if (safeExpectedSeats.value !== 0) {
      return Math.min(limitGroups.value, safeExpectedSeats.value);
    } else {
      return limitGroups.value;
    }
  });
  const isTooManyGroups = computed(
    () => amountOfGroups.value > maximumGroups.value
  );
  const isSeatsTooHigh = computed(
    () => totalSeatsOrVotes.value > safeExpectedSeats.value
  );
  const isSeatsTooLow = computed(
    () => totalSeatsOrVotes.value < safeExpectedSeats.value
  );

  return {
    amountOfGroups,
    maximumGroups,
    isTooManyGroups,
    isSeatsTooHigh,
    isSeatsTooLow,
    totalSeatsOrVotes,
  };
};
