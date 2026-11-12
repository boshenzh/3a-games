import assert from "node:assert/strict";
import test from "node:test";
import { classifyHeaders } from "./check-framing.mjs";

test("missing frame headers allow an iframe", () => {
  assert.equal(classifyHeaders(new Headers()).mode, "iframe");
});

test("X-Frame-Options DENY and SAMEORIGIN refuse framing", () => {
  assert.equal(classifyHeaders(new Headers({ "x-frame-options": "DENY" })).mode, "external");
  assert.equal(classifyHeaders(new Headers({ "x-frame-options": "SAMEORIGIN" })).mode, "external");
  assert.equal(classifyHeaders(new Headers({ "x-frame-options": "ALLOW-FROM https://example.com" })).mode, "external");
});

test("frame-ancestors none or self refuses framing", () => {
  assert.equal(
    classifyHeaders(new Headers({ "content-security-policy": "default-src 'self'; frame-ancestors 'none'" })).mode,
    "external",
  );
  assert.equal(
    classifyHeaders(new Headers({ "content-security-policy": "frame-ancestors 'self'" })).mode,
    "external",
  );
});

test("frame-ancestors * still allows an iframe", () => {
  assert.equal(
    classifyHeaders(new Headers({ "content-security-policy": "frame-ancestors *" })).mode,
    "iframe",
  );
});
