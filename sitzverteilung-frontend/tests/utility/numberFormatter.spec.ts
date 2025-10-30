import { describe, expect, test } from "vitest";

import { formatVisiblePrecision } from "../../src/utility/numberFormatter";

describe("numberFormatter tests", () => {
  test("formatVisiblePrecision", () => {
    const numbers = [
      1.5, 1.123999, 1.12229999, 1.1221, 1.1, 1.099997777, 1.09998,
    ];
    const expected = [
      "1,500",
      "1,123",
      "1,1222",
      "1,1221",
      "1,100",
      "1,09999",
      "1,09998",
    ];

    const result = formatVisiblePrecision(numbers);

    expect(result).toEqual(expected);
  });
});
