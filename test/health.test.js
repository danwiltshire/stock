import test from "node:test";
import assert from "node:assert/strict";
import { GET as live } from "../app/healthz/live/route.js";
import { GET as ready } from "../app/healthz/ready/route.js";

test("health endpoints respond without external dependencies or caching", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");
  for (const handler of [live, ready]) {
    const response = handler();
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "OK");
  }
  assert.equal(fetchMock.mock.calls.length, 0);
});
