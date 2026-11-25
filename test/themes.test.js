import test from "node:test";
import assert from "node:assert/strict";
import { getTheme } from "../lib/themes.js";

test("theme selection accepts supported values and defaults to light", () => {
  assert.equal(getTheme("dark"), "dark");
  assert.equal(getTheme("light"), "light");
  assert.equal(getTheme(undefined), "light");
  assert.equal(getTheme("invalid"), "light");
});
