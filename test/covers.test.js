import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/covers/[isbn]/route.js";

const context = (isbn) => ({ params: Promise.resolve({ isbn }) });

test("known covers return an image with a reusable browser cache", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    new Response("cover", { headers: { "Content-Type": "image/jpeg" } }),
  );
  const response = await GET(new Request("http://localhost/covers/9781942788294"), context("9781942788294"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.equal(response.headers.get("cache-control"), "public, max-age=86400");
  assert.equal(await response.text(), "cover");
  assert.equal(fetchMock.mock.calls.length, 1);
});

test("unknown covers do not trigger upstream requests", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");
  const response = await GET(new Request("http://localhost/covers/invalid"), context("invalid"));
  assert.equal(response.status, 404);
  assert.equal(fetchMock.mock.calls.length, 0);
});

test("upstream failures are not cached as covers", async (t) => {
  t.mock.method(console, "error", () => {});
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
  let response = await GET(new Request("http://localhost/covers/9781942788294"), context("9781942788294"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("cache-control"), "no-store");

  fetchMock.mock.mockImplementation(async () => new Response("not an image", { headers: { "Content-Type": "text/html" } }));
  response = await GET(new Request("http://localhost/covers/9781942788294"), context("9781942788294"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("cache-control"), "no-store");

  fetchMock.mock.mockImplementation(async () => new Response("<svg/>", { headers: { "Content-Type": "image/svg+xml" } }));
  response = await GET(new Request("http://localhost/covers/9781942788294"), context("9781942788294"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
