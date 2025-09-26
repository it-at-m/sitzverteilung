import { describe, expect, test } from "vitest";

import { FieldValidationRules } from "../../src/utility/validation";

describe("FieldValidationRules tests", () => {
  test("Required positive", () => {
    // given
    const unitUnderTest = "Hello";

    // when
    const result = FieldValidationRules.Required(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("Required negative", () => {
    // given
    const unitUnderTest = "";

    // when
    const result = FieldValidationRules.Required(unitUnderTest);

    // then
    expect(result).toEqual("Das Feld ist ein Pflichtfeld.");
  });

  test("IsUnique positive", () => {
    // given
    const unitUnderTest = "Hello";
    const array = ["Hello", "Goodbye"];
    const validationRule = FieldValidationRules.IsUnique(array);

    // when
    const result = validationRule(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("IsUnique negative", () => {
    // given
    const unitUnderTest = "Hello";
    const array = ["Hello", "Hello", "Goodbye"];
    const validationRule = FieldValidationRules.IsUnique(array);

    // when
    const result = validationRule(unitUnderTest);

    // then
    expect(result).toEqual("Es gibt andere Einträge mit identischem Wert.");
  });

  test("IsNotUnionName positive", () => {
    // given
    const unitUnderTest = "Hello";

    // when
    const result = FieldValidationRules.IsNotUnionName(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("IsNotUnionName negative", () => {
    // given
    const unitUnderTest = "AG: Hello";

    // when
    const result = FieldValidationRules.IsNotUnionName(unitUnderTest);

    // then
    expect(result).toEqual(
      "Fraktions- und Ausschussgemeinschaften müssen über die entsprechenden Schaltflächen gebildet werden."
    );
  });
});
