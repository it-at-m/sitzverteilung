import { describe, expect, test } from "vitest";

import { BaseData } from "../../src/types/basedata/BaseData";
import {
  writeToUrlParam,
  writeUrlParamToObject,
} from "../../src/utility/urlEncoder";
import { LimitConfiguration } from "../../src/utility/validation";
import {
  getTestBaseDataInputLimit,
  getTestBaseDataInputTooLarge,
  getTestBaseDataWithUnion,
} from "../TestData";

import "blob-polyfill";

describe("urlEncoder tests", () => {
  const url = "https://sitzverteilung.oss.muenchen.de/#/data?import=";

  test("No data lost", async () => {
    // given
    const baseData = getTestBaseDataWithUnion();

    // when
    const urlParam = await writeToUrlParam<BaseData>(baseData, url);
    const object = await writeUrlParamToObject<BaseData>(urlParam);

    // then
    expect(JSON.stringify(object)).toEqual(JSON.stringify(baseData));
  });

  test(`conforms to maximum url length of ${LimitConfiguration.limitURLEncoderSize}`, async () => {
    // given
    const baseData = getTestBaseDataInputLimit();

    // when
    const urlParam = await writeToUrlParam<BaseData>(baseData, url);
    const length = `${url}${urlParam}`.length;

    // then
    expect(length).toBeLessThanOrEqual(LimitConfiguration.limitURLEncoderSize);
  });

  test("throws error when input too large", async () => {
    // given
    const baseData = getTestBaseDataInputTooLarge();

    // when
    const executable = async () => {
      await writeToUrlParam<BaseData>(baseData, url);
    };

    // then
    await expect(executable).rejects.toThrowError();
  });
});
