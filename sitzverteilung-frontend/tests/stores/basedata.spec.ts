import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

import { useBaseDataStore } from "../../src/stores/basedata";
import { BaseData } from "../../src/types/BaseData";
import { getTestBaseData } from "../TestData";

describe("BaseData Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("Store is empty after initialization", () => {
    const store = useBaseDataStore();
    expect(store.baseDatas.length).toBe(0);
  });

  test("Add new BaseData", () => {
    // given
    const store = useBaseDataStore();
    const testData = getTestBaseData();

    // when
    store.addOrUpdateBaseData(testData);

    // then
    expect(store.baseDatas.length).toBe(1);
  });

  test("Update BaseData", () => {
    // given
    const store = useBaseDataStore();
    const testData = getTestBaseData();
    store.addOrUpdateBaseData(testData);
    const newTestData: BaseData = {
      ...testData,
      committeeSize: 20,
    };

    // when
    store.addOrUpdateBaseData(newTestData);

    // then
    expect(store.baseDatas.length).toBe(1);
    expect(store.baseDatas[0].committeeSize).toBe(newTestData.committeeSize);
  });

  test("Delete BaseData", () => {
    const store = useBaseDataStore();
    const testData = getTestBaseData();
    store.addOrUpdateBaseData(testData);
    const testData2: BaseData = {
      ...testData,
      name: "TestData 2",
    };
    store.addOrUpdateBaseData(testData2);

    // when
    store.deleteBaseData(testData.name);

    // then
    expect(store.baseDatas.length).toBe(1);
    expect(store.baseDatas[0].name).toBe(testData2.name);
  });

  test("Delete all BaseData", () => {
    // given
    const store = useBaseDataStore();
    const testData = getTestBaseData();
    store.addOrUpdateBaseData(testData);
    const testData2: BaseData = {
      ...testData,
      name: "TestData 2",
    };
    store.addOrUpdateBaseData(testData2);

    // when
    store.deleteAllBaseData();

    // then
    expect(store.baseDatas.length).toBe(0);
  });
});
