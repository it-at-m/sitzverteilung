import { describe, expect, test } from "vitest";

import { FieldValidationRules } from "../../src/utility/rules";

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

  test("Integer positive", () => {
    // given
    const unitUnderTest = 5;

    // when
    const result = FieldValidationRules.Integer(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("Integer negative", () => {
    // given
    const unitUnderTest = 5.3;

    // when
    const result = FieldValidationRules.Integer(unitUnderTest);

    // then
    expect(result).toEqual("Das Feld muss eine Ganzzahl enthalten.");
  });

  test("LargerThan positive", () => {
    // given
    const unitUnderTest = 5;

    // when
    const result = FieldValidationRules.LargerThan(4)(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("LargerThan negative", () => {
    // given
    const unitUnderTest = 3;
    const threshold = 4;
    const validationRule = FieldValidationRules.LargerThan(threshold);

    // when
    const result = validationRule(unitUnderTest);

    // then
    expect(result).toBe(`Der Wert muss größer als ${threshold} sein.`);
  });

  test("LowerOrEqualThan positive", () => {
    // given
    const unitUnderTest = 4;
    const threshold = 4;
    const validationRule = FieldValidationRules.LowerOrEqualThan(threshold);

    // when
    const result = validationRule(unitUnderTest);

    // then
    expect(result).toBe(true);
  });

  test("LowerOrEqualThan negative", () => {
    // given
    const unitUnderTest = 4;
    const threshold = 3;
    const validationRule = FieldValidationRules.LowerOrEqualThan(threshold);

    // when
    const result = validationRule(unitUnderTest);

    // then
    expect(result).toBe(`Der Wert darf maximal ${threshold} sein.`);
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
});
