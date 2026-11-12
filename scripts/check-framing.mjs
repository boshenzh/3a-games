import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gamesPath = path.join(root, "src/data/games.json");
const outPath = path.join(root, "src/generated/embed.json");

/**
 * Decide iframe vs new-tab from response headers only.
 * frame-ancestors in a meta tag is ignored by browsers, so it is not consulted.
 */
export function classifyHeaders(headers) {
  const xFrameOptions = headerValue(headers, "x-frame-options");
  const csp = headerValue(headers, "content-security-policy");
  const ancestors = frameAncestorSources(csp);
  const xfoBlocked = xFrameOptions ? xfoDenies(xFrameOptions) : false;
  const cspBlocked = ancestors.some((source) => !ancestorsAllowEmbedding(source));

  let mode = "iframe";
  let reason = "响应头没有 X-Frame-Options，CSP 也没有 frame-ancestors，可以放进 iframe。";
  if (xfoBlocked && cspBlocked) {
    mode = "external";
    reason = `X-Frame-Options 为 ${xFrameOptions}，且 CSP frame-ancestors（${ancestors.join(" | ")}）不允许本站嵌入。`;
  } else if (xfoBlocked) {
    mode = "external";
    reason = `X-Frame-Options 为 ${xFrameOptions}，浏览器会拒绝 iframe。`;
  } else if (cspBlocked) {
    mode = "external";
    reason = `CSP frame-ancestors 为 ${ancestors.join(" | ")}，没有把本站包含进去。`;
  }

  return {
    mode,
    reason,
    xFrameOptions,
    frameAncestors: ancestors.length ? ancestors.join(" | ") : null,
  };
}

function headerValue(headers, name) {
  const value = headers.get(name);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function xfoDenies(value) {
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .some((part) => part === "deny" || part === "sameorigin" || part.startsWith("allow-from"));
}

function frameAncestorSources(csp) {
  if (!csp) return [];
  const sources = [];
  const pattern = /frame-ancestors\s+([^;]+)/gi;
  for (const match of csp.matchAll(pattern)) {
    sources.push(match[1].trim());
  }
  return sources;
}

function ancestorsAllowEmbedding(source) {
  const tokens = source.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.some((token) => token === "*" || token === "https:" || token === "http:" || token === "https://*" || token === "http://*");
}

async function checkGame(game) {
  try {
    const response = await fetch(game.url, {
      method: "GET",
      redirect: "follow",
      headers: {
        accept: "text/html",
        "user-agent": "3A-mini-games framing-check",
      },
      signal: AbortSignal.timeout(25000),
    });
    await response.body?.cancel();
    const classified = classifyHeaders(response.headers);
    return {
      id: game.id,
      ...classified,
      status: response.status,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      id: game.id,
      mode: "iframe",
      reason: `检测请求失败（${error instanceof Error ? error.message : "未知错误"}）。播放页会先尝试 iframe，被拒绝时改为新标签。`,
      xFrameOptions: null,
      frameAncestors: null,
      status: 0,
      finalUrl: game.url,
    };
  }
}

async function main() {
  const games = JSON.parse(await readFile(gamesPath, "utf8"));
  const results = [];
  for (const game of games) {
    const result = await checkGame(game);
    results.push(result);
    console.log(`${result.mode.padEnd(8)} ${result.status} ${game.id} — ${result.reason}`);
  }
  const payload = {
    checkedAt: new Date().toISOString(),
    games: Object.fromEntries(
      results.map(({ id, ...rest }) => [id, rest]),
    ),
  };
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`wrote ${path.relative(root, outPath)}`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  await main();
}
