import { describe, expect, test } from "vitest";
import { ref } from "vue";

import { useGroupStatistics } from "../../src/composables/useGroupStatistics";
import {
  getTestBaseData,
  getTestBaseDataEmptyGroups,
  getTestBaseDataNotEnoughSeats,
  getTestBaseDataSeatsAreNull,
  getTestBaseDataTooManyGroups,
  getTestBaseDataTooManySeats,
  getTestBaseDataUndefinedTooManySeats,
} from "../TestData";

describe("useGroupStatistics composable", () => {
  test("correctly calculates statistics", () => {
    const testBaseData = getTestBaseData();
    const groups = ref(testBaseData.groups);
    const expectedSeats = ref(testBaseData.committeeSize);
    const limitGroups = ref(10);

    const { amountOfGroups, totalSeatsOrVotes } = useGroupStatistics(
      groups,
      limitGroups,
      expectedSeats
    );

    expect(amountOfGroups.value).toBe(3);
    expect(totalSeatsOrVotes.value).toBe(60);
  });

  test.each([
    [getTestBaseData(), false, false, false],
    [getTestBaseDataEmptyGroups(), false, false, false],
    [getTestBaseDataTooManyGroups(), true, false, false],
    [getTestBaseDataTooManySeats(), false, true, false],
    [getTestBaseDataUndefinedTooManySeats(), false, true, false],
    [getTestBaseDataNotEnoughSeats(), false, false, true],
    [getTestBaseDataSeatsAreNull(), false, false, true],
  ])(
    "correctly calculates validation",
      (testBaseData, expectedTooManyGroups, expectedSeatsTooHigh, expectedSeatsTooLow) => {
      const groups = ref(testBaseData.groups);
      const limitGroups = ref(10);
      const expectedSeats = ref(testBaseData.committeeSize);

        const { isTooManyGroups, isSeatsTooHigh, isSeatsTooLow } = useGroupStatistics(
        groups,
        limitGroups,
        expectedSeats
      );

      expect(isTooManyGroups.value).toBe(expectedTooManyGroups);
      expect(isSeatsTooHigh.value).toBe(expectedSeatsTooHigh);
      expect(isSeatsTooLow.value).toBe(expectedSeatsTooLow);
    }
  );
});
