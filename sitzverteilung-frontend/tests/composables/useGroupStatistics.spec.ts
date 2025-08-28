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

    const { amountOfGroups, totalSeats } = useGroupStatistics(
      groups,
      limitGroups,
      expectedSeats
    );

    expect(amountOfGroups.value).toBe(3);
    expect(totalSeats.value).toBe(60);
  });

  test.each([
    [getTestBaseData(), false, false, false],
    [getTestBaseDataEmptyGroups(), false, false, false],
    [getTestBaseDataTooManyGroups(), false, false, false],
    [getTestBaseDataTooManySeats(), false, true, false],
    [getTestBaseDataUndefinedTooManySeats(), false, true, false],
    [getTestBaseDataNotEnoughSeats(), false, false, true],
    [getTestBaseDataSeatsAreNull(), false, false, true],
  ])(
    "correctly calculates validation",
    (testBaseData, expectedTooManyGroups) => {
      const groups = ref(testBaseData.groups);
      const limitGroups = ref(10);
      const expectedSeats = ref(testBaseData.committeeSize);

      const { isTooManyGroups } = useGroupStatistics(
        groups,
        limitGroups,
        expectedSeats
      );

      expect(isTooManyGroups.value).toBe(expectedTooManyGroups);
    }
  );
});
