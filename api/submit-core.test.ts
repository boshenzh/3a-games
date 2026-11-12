import assert from "node:assert/strict";
import test from "node:test";
import { processSubmission, resetRateLimit, validateSubmission } from "./submit-core.ts";

const valid = {
  name: "海岸骑行",
  url: "https://example.com/pelican",
  description: "一只鹈鹕骑自行车。",
  creator: "",
  screenshotUrl: "",
};

test("rejects a missing name and a non-http url", () => {
  assert.equal(validateSubmission({ ...valid, name: "  " }).ok, false);
  assert.equal(validateSubmission({ ...valid, url: "javascript:alert(1)" }).ok, false);
  assert.equal(validateSubmission({ ...valid, screenshotUrl: "not a url" }).ok, false);
});

test("accepts a complete submission", () => {
  const result = validateSubmission(valid);
  assert.equal(result.ok, true);
});

test("without a webhook, nothing is stored and the client should use mailto", async () => {
  resetRateLimit();
  let called = false;
  const result = await processSubmission({
    body: valid,
    ip: "mailto-test",
    webhookUrl: undefined,
    fetchImpl: async () => {
      called = true;
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "mailto");
  assert.equal(called, false);
});

test("posts JSON to the webhook when it is set", async () => {
  resetRateLimit();
  let received = "";
  const result = await processSubmission({
    body: { ...valid, creator: "ada", screenshotUrl: "https://example.com/shot.jpg" },
    ip: "webhook-test",
    webhookUrl: "https://hooks.example/submit",
    now: Date.parse("2026-11-12T00:00:00Z"),
    fetchImpl: async (_url, init) => {
      received = String(init?.body ?? "");
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(result.body.mode, "webhook");
  const payload = JSON.parse(received) as { name: string; creator: string; siteName: string };
  assert.equal(payload.name, "海岸骑行");
  assert.equal(payload.creator, "ada");
  assert.equal(payload.siteName, "3A 小游戏");
});

test("a failed webhook is an error and a honeypot is dropped", async () => {
  resetRateLimit();
  const failed = await processSubmission({
    body: valid,
    ip: "fail-test",
    webhookUrl: "https://hooks.example/submit",
    fetchImpl: async () => new Response("no", { status: 500 }),
  });
  assert.equal(failed.status, 502);

  let called = false;
  const ignored = await processSubmission({
    body: { ...valid, company: "filled by a bot" },
    ip: "bot-test",
    webhookUrl: "https://hooks.example/submit",
    fetchImpl: async () => {
      called = true;
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(ignored.body.mode, "ignored");
  assert.equal(called, false);
});

test("the sixth submission from one address is rate limited", async () => {
  resetRateLimit();
  const ip = "rate-test";
  for (let i = 0; i < 5; i += 1) {
    const result = await processSubmission({ body: valid, ip, webhookUrl: undefined });
    assert.equal(result.status, 200);
  }
  const blocked = await processSubmission({ body: valid, ip, webhookUrl: undefined });
  assert.equal(blocked.status, 429);
});
