import test from "node:test";
import assert from "node:assert/strict";
import { getConfig } from "../lib/config.js";

test("configuration defaults and explicit values", () => {
  assert.deepEqual(getConfig({}), { enableAuth: false });
  assert.deepEqual(getConfig({ ENABLE_AUTH: "TRUE" }), { enableAuth: true });
  assert.deepEqual(getConfig({ ENABLE_AUTH: "false" }), { enableAuth: false });
});
