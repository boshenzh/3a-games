import { useEffect, useRef, useState } from "react";
import { Badge, Button, LinkButton, Text } from "@cloudflare/kumo";
import { ArrowSquareOutIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import type { Game } from "@/lib/games.ts";

type FrameState = "loading" | "ready" | "blocked";

export function Player({ game }: { game: Game }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [armed, setArmed] = useState(false);
  const [frameState, setFrameState] = useState<FrameState>(game.embed.mode === "external" ? "blocked" : "loading");
  const external = frameState === "blocked";

  function arm() {
    setArmed(true);
    window.requestAnimationFrame(() => frameRef.current?.focus());
  }

  function onFrameLoad() {
    window.setTimeout(() => {
      const frame = frameRef.current;
      if (!frame) return;
      try {
        const href = frame.contentWindow?.location.href ?? "";
        setFrameState(!href || href === "about:blank" ? "blocked" : "ready");
      } catch {
        setFrameState("ready");
      }
    }, 700);
  }

  useEffect(() => {
    return () => {
      frameRef.current = null;
    };
  }, []);

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={shellRef} className="flex flex-col overflow-hidden rounded-2xl bg-black ring ring-kumo-line">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-kumo-base px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {external ? <Badge variant="warning">新标签打开</Badge> : <Badge variant="success">原站 iframe</Badge>}
            {game.landscape ? <Badge variant="neutral">建议横屏</Badge> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {external ? null : (
              <Button variant="secondary" size="sm" icon={ArrowsOutIcon} onClick={() => void toggleFullscreen()}>
                全屏
              </Button>
            )}
            <LinkButton href={game.url} external variant="secondary" size="sm" icon={ArrowSquareOutIcon}>
              打开原站
            </LinkButton>
          </div>
        </div>
        {external ? (
          <ExternalPlay game={game} runtimeBlocked={game.embed.mode === "iframe"} />
        ) : (
          <div className="relative h-[72dvh] w-full bg-black md:h-auto md:aspect-video md:max-h-[78dvh]">
            <iframe
              ref={frameRef}
              title={`${game.title}（原站）`}
              src={game.url}
              className="absolute inset-0 size-full border-0 bg-black"
              allow="fullscreen; gamepad; autoplay; pointer-lock; xr-spatial-tracking"
              allowFullScreen
              tabIndex={0}
              onLoad={onFrameLoad}
            />
            {armed ? null : (
              <button
                type="button"
                className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/15 to-transparent p-6"
                onClick={arm}
              >
                <span className="rounded-full bg-black/75 px-4 py-2 text-sm text-white">
                  点击画面，把键盘交给游戏
                </span>
              </button>
            )}
            {frameState === "loading" ? (
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                正在连接原站…
              </div>
            ) : null}
          </div>
        )}
      </div>
      <Text variant="secondary" size="sm">
        {external
          ? "这个网址不能嵌进本站，请到原作者的页面游玩。"
          : "键盘会送到当前获得焦点的画面。如果按键没有反应，再点一次游戏。"}
      </Text>
    </div>
  );
}

function ExternalPlay({ game, runtimeBlocked }: { game: Game; runtimeBlocked: boolean }) {
  return (
    <div className="grid gap-4 bg-kumo-base p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
      <img src={game.thumbnail} alt={`${game.title} 画面截图`} className="aspect-video w-full rounded-xl object-cover" />
      <div className="flex flex-col items-start gap-3">
        <Text variant="heading" as="h2">
          请在原站打开
        </Text>
        <Text variant="secondary" size="sm">
          {runtimeBlocked
            ? "构建时的响应头允许嵌入，但浏览器拒绝了这次 iframe。已改为新标签打开。"
            : game.embed.reason}
        </Text>
        <LinkButton href={game.url} external variant="primary" icon={ArrowSquareOutIcon}>
          打开原站
        </LinkButton>
      </div>
    </div>
  );
}
