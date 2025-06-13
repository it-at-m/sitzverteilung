import { describe, expect, test } from "vitest";
import { ref } from "vue";

import { useGroupStatistics } from "../../src/composables/useGroupStatistics";
import {
  getTestBaseData,
  getTestBaseDataEmptyGroups,
  getTestBaseDataNotEnoughSeats,
  getTestBaseDataTooManyGroups,
  getTestBaseDataTooManySeats,
  getTestBaseDataUndefinedTooManySeats,
} from "../TestData";

describe("useGroupStatistics composable", () => {
  test("correctly calculates statistics", () => {
    const testBaseData = getTestBaseData();
    const groups = ref(testBaseData.groups);
    const expectedSeats = ref(testBaseData.committeeSize);

    const { amountOfGroups, totalSeats, totalVotes } = useGroupStatistics(
      groups,
      expectedSeats
    );

    expect(amountOfGroups.value).toBe(3);
    expect(totalSeats.value).toBe(60);
    expect(totalVotes.value).toBe(350);
  });

  test.each([
    [getTestBaseData(), false, false, false],
    [getTestBaseDataEmptyGroups(), false, false, false],
    [getTestBaseDataTooManyGroups(), true, false, false],
    [getTestBaseDataTooManySeats(), false, true, false],
    [getTestBaseDataUndefinedTooManySeats(), true, true, false],
    [getTestBaseDataNotEnoughSeats(), false, false, true],
  ])(
    "correctly calculates validation",
    (
      testBaseData,
      expectedTooManyGroups,
      expectedSeatsTooHigh,
      expectedSeatsTooLow
    ) => {
      const groups = ref(testBaseData.groups);
      const expectedSeats = ref(testBaseData.committeeSize);

      const { isTooManyGroups, isSeatsTooLow, isSeatsTooHigh } =
        useGroupStatistics(groups, expectedSeats);

      expect(isTooManyGroups.value).toBe(expectedTooManyGroups);
      expect(isSeatsTooHigh.value).toBe(expectedSeatsTooHigh);
      expect(isSeatsTooLow.value).toBe(expectedSeatsTooLow);
    }
  );
});
