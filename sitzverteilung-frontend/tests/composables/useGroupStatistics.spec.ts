import { ref } from "vue";
import { useGroupStatistics } from "../../src/composables/useGroupStatistics";
import { describe, expect, it } from "vitest";
import { getTestBaseData } from "../TestData";

describe("useGroupStatistics composable", () => {
    it("correctly calculates statistics", () => {
        const testBaseData = getTestBaseData();
        const groups = ref(testBaseData.groups);
        const expectedSeats = ref(testBaseData.committeeSize);

        const { amountOfGroups, totalSeats, totalVotes } = useGroupStatistics(groups, expectedSeats);

        expect(amountOfGroups.value).toBe(3);
        expect(totalSeats.value).toBe(60);
        expect(totalVotes.value).toBe(350);
    });

    it("correctly calculates validation", () => {
        const testBaseData = getTestBaseData();
        const groups = ref(testBaseData.groups);
        const expectedSeats = ref(testBaseData.committeeSize);

        const { isTooManyGroups, isSeatsTooLow, isSeatsTooHigh } = useGroupStatistics(groups, expectedSeats);

        expect(isTooManyGroups.value).toBe(false);
        expect(isSeatsTooLow.value).toBe(false);
        expect(isSeatsTooHigh.value).toBe(true);
    });
});