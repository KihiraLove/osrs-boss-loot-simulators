import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { itemImageUrl, parseNumber, probabilityText } from "../shared/ui.mjs";

test("item images resolve to root assets from the shared module", () => {
  for (const id of ["dom", "little-nightmare", "big-bones"]) {
    const url = itemImageUrl(id);
    assert.equal(url, new URL("../assets/items/" + id + ".png", import.meta.url).href);
    assert.deepEqual([...readFileSync(new URL(url)).subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});

test("numeric input parsing accepts whole counts within the limit", () => {
  for (const value of ["0", "1", "100", " 42 "]) {
    assert.equal(parseNumber({ value }, 100, "kills"), Number(value));
  }
});

test("numeric input parsing rejects empty, malformed and excessive values", () => {
  for (const value of ["", " ", "-1", "1.2", "01", "1e2", "Infinity", "NaN", "101", "9007199254740992"]) {
    assert.throws(() => parseNumber({ value }, 100, "kills"), RangeError, value);
  }
});

test("probability labels retain bounds and precision for rare drops", () => {
  assert.equal(probabilityText(0), "0%");
  assert.equal(probabilityText(1), "100%");
  assert.equal(probabilityText(.5), "50.00%");
  assert.equal(probabilityText(.001), "0.1000%");
  assert.equal(probabilityText(1e-10), "<0.000001%");
  assert.equal(probabilityText(1 - 1e-10), ">99.999999%");
});
