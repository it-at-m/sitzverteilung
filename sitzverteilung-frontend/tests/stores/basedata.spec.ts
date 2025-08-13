import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

import { useTemplateDataStore } from "../../src/stores/templatedata";
import { BaseData } from "../../src/types/basedata/BaseData";
import { getTestBaseData } from "../TestData";

describe("BaseData Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("Store is empty after initialization", () => {
    const store = useTemplateDataStore();
    expect(store.baseDatas.length).toBe(0);
  });

  test("Add new BaseData", () => {
    // given
    const store = useTemplateDataStore();
    const testData = getTestBaseData();

    // when
    store.addBaseData(testData);

    // then
    expect(store.baseDatas.length).toBe(1);
    expect(store.baseDatas[0]).toEqual(testData);
  });

  test("Update BaseData", () => {
    // given
    const store = useTemplateDataStore();
    const testData = getTestBaseData();
    store.addBaseData(testData);
    const newTestData: BaseData = {
      ...testData,
      committeeSize: 20,
    };

    // when
    store.updateBaseData(testData.name, newTestData);

    // then
    expect(store.baseDatas.length).toBe(1);
    expect(store.baseDatas[0]).toEqual(newTestData);
  });

  test("Delete BaseData", () => {
    const store = useTemplateDataStore();
    const testData = getTestBaseData();
    store.addBaseData(testData);
    const testData2: BaseData = {
      ...testData,
      name: "TestData 2",
    };
    store.addBaseData(testData2);

    // when
    store.deleteBaseData(testData.name);

    // then
    expect(store.baseDatas.length).toBe(1);
    expect(store.baseDatas[0]).toEqual(testData2);
  });

  test("Delete all BaseData", () => {
    // given
    const store = useTemplateDataStore();
    const testData = getTestBaseData();
    store.addBaseData(testData);
    const testData2: BaseData = {
      ...testData,
      name: "TestData 2",
    };
    store.addBaseData(testData2);

    // when
    store.deleteAllBaseData();

    // then
    expect(store.baseDatas.length).toBe(0);
  });
});
