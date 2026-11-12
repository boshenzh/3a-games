import { processSubmission } from "./submit-core.ts";

const MAX_BODY_BYTES = 16_000;

/**
 * Node.js runtime entry for Vercel.
 * `/api/*.ts` is a Node function. The default export is the Web `fetch`
 * handler documented for that runtime (not Edge, not a `(req, res)` server).
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ ok: false, error: "只接受 POST。" }, { status: 405 });
    }

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return Response.json({ ok: false, error: "内容太长了。", field: "form" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = raw.trim() ? JSON.parse(raw) : {};
    } catch {
      return Response.json({ ok: false, error: "正文不是有效的 JSON。", field: "form" }, { status: 400 });
    }

    const result = await processSubmission({
      body,
      ip: clientIp(request),
      webhookUrl: process.env.SUBMIT_WEBHOOK_URL,
    });
    return Response.json(result.body, { status: result.status });
  },
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
