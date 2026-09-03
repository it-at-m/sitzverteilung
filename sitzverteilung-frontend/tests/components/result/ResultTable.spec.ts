import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import type { CalculationResult } from "../../../src/types/calculation/internal/CalculationResult";

import ResultTable from "../../../src/components/result/ResultTable.vue";
import vuetify from "../../../src/plugins/vuetify";
import { CalculationMethod } from "../../../src/types/calculation/CalculationMethod";

function buildCalculationResult(overRounding: boolean): CalculationResult {
  return {
    proportions: {
      "AG: Committee": 3.675,
    },
    seats: {
      "AG: Committee": 21,
    },
    methods: {
      [CalculationMethod.D_HONDT]: {
        distribution: {
          "AG: Committee": 4,
        },
        order: [],
        validation: {
          "AG: Committee": {
            overRounding,
            lostSafeSeat: false,
            committeeInvalid: [],
            overRoundingWithoutCommittees: {
              "Group 3": true,
            },
          },
        },
      },
    },
  };
}

describe("ResultTable", () => {
  test("shows the party-specific committee-free over-rounding message", async () => {
    const wrapper = mount(ResultTable, {
      props: {
        calculationResult: buildCalculationResult(false),
        methodToDisplay: CalculationMethod.D_HONDT,
      },
      global: {
        plugins: [vuetify],
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Überaufrundung ohne AG: Group 3");
  });

  test("suppresses the party-specific message when overall over-rounding exists", async () => {
    const wrapper = mount(ResultTable, {
      props: {
        calculationResult: buildCalculationResult(true),
        methodToDisplay: CalculationMethod.D_HONDT,
      },
      global: {
        plugins: [vuetify],
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Überaufrundung");
    expect(wrapper.text()).not.toContain("Überaufrundung ohne AG:");
  });
});
