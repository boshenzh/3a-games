import type { IncomingMessage, ServerResponse } from "node:http";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 16_000;
const hits = new Map<string, number[]>();

export type Submission = {
  name: string;
  url: string;
  description: string;
  creator: string;
  screenshotUrl: string;
};

export type ProcessResult = {
  status: number;
  body: Record<string, unknown>;
};

export function resetRateLimit(): void {
  hits.clear();
}

export function allowRequest(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export function validateSubmission(input: unknown): { ok: true; value: Submission } | { ok: false; error: string; field: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "请求正文需要是 JSON 对象。", field: "form" };
  }
  const record = input as Record<string, unknown>;
  if (typeof record.company === "string" && record.company.trim()) {
    return { ok: true, value: { name: "", url: "", description: "", creator: "", screenshotUrl: "" } };
  }

  const name = clean(record.name, 60);
  const url = clean(record.url, 400);
  const description = clean(record.description, 400);
  const creator = clean(record.creator, 80);
  const screenshotUrl = clean(record.screenshotUrl, 400);

  if (!name) return { ok: false, error: "请填写游戏名称。", field: "name" };
  if (!url) return { ok: false, error: "请填写游戏地址。", field: "url" };
  if (!isHttpUrl(url)) return { ok: false, error: "游戏地址需要以 http:// 或 https:// 开头。", field: "url" };
  if (!description) return { ok: false, error: "请用一两句话介绍这款游戏。", field: "description" };
  if (screenshotUrl && !isHttpUrl(screenshotUrl)) {
    return { ok: false, error: "截图地址需要以 http:// 或 https:// 开头。", field: "screenshotUrl" };
  }

  return { ok: true, value: { name, url, description, creator, screenshotUrl } };
}

export async function processSubmission(options: {
  body: unknown;
  ip: string;
  webhookUrl: string | undefined;
  fetchImpl?: typeof fetch;
  now?: number;
}): Promise<ProcessResult> {
  const honeypot = isHoneypot(options.body);
  const validated = validateSubmission(options.body);
  if (!validated.ok) {
    return { status: 400, body: { ok: false, error: validated.error, field: validated.field } };
  }
  if (honeypot) {
    return { status: 200, body: { ok: true, mode: "ignored" } };
  }
  if (!allowRequest(options.ip || "unknown", options.now ?? Date.now())) {
    return { status: 429, body: { ok: false, error: "提交太频繁，请十分钟后再试。" } };
  }

  const webhook = options.webhookUrl?.trim();
  if (!webhook) {
    return { status: 200, body: { ok: true, mode: "mailto" } };
  }

  const payload = {
    source: "3a-mini-games",
    siteName: "3A 小游戏",
    submittedAt: new Date(options.now ?? Date.now()).toISOString(),
    name: validated.value.name,
    url: validated.value.url,
    description: validated.value.description,
    creator: validated.value.creator || null,
    screenshotUrl: validated.value.screenshotUrl || null,
  };

  try {
    const response = await (options.fetchImpl ?? fetch)(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return { status: 502, body: { ok: false, error: "接收端没有接受这次投稿，请稍后再试。" } };
    }
    return { status: 200, body: { ok: true, mode: "webhook" } };
  } catch {
    return { status: 502, body: { ok: false, error: "没有连上接收端，请稍后再试。" } };
  }
}

export async function handleHttp(req: IncomingMessage, res: ServerResponse, webhookUrl: string | undefined): Promise<void> {
  if (req.method !== "POST") {
    send(res, 405, { ok: false, error: "只接受 POST。" });
    return;
  }
  try {
    const body = await readBody(req);
    const result = await processSubmission({
      body,
      ip: clientIp(req),
      webhookUrl,
    });
    send(res, result.status, result.body);
  } catch (error) {
    const message = error instanceof Error && error.message === "too-large"
      ? "内容太长了。"
      : "正文不是有效的 JSON。";
    send(res, 400, { ok: false, error: message, field: "form" });
  }
}

function send(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (raw) return raw.split(",")[0]?.trim() || "unknown";
  return req.socket.remoteAddress || "unknown";
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) return JSON.parse(req.body);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("too-large");
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  return JSON.parse(text);
}

function isHoneypot(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const company = (input as Record<string, unknown>).company;
  return typeof company === "string" && company.trim().length > 0;
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
