import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ArrowSquareOutIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import type { Game } from "@/lib/games.ts";

const control =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-kumo-subtle no-underline transition hover:bg-white/5 hover:text-kumo-default";

export function Player({ game }: { game: Game }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [armed, setArmed] = useState(false);
  const [blocked, setBlocked] = useState(game.embed.mode === "external");

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
        if (!href || href === "about:blank") setBlocked(true);
      } catch {
        // Cross-origin access throws once the game page has loaded, which means it is playing.
      }
    }, 700);
  }

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-3.5rem)] w-full max-w-[1800px] flex-col gap-2 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex h-11 shrink-0 items-center gap-2">
        <Link to="/" className={control} aria-label="返回">
          <ArrowLeftIcon size={16} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-kumo-default">{game.title}</h1>
        {blocked ? null : (
          <button type="button" className={control} onClick={() => void toggleFullscreen()}>
            <ArrowsOutIcon size={16} />
            <span className="hidden sm:inline">全屏</span>
          </button>
        )}
        <a href={game.sourceUrl ?? game.url} target="_blank" rel="noopener noreferrer" className={control}>
          <ArrowSquareOutIcon size={16} />
          <span className="hidden sm:inline">原站</span>
        </a>
      </div>
      <div ref={shellRef} className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
        {blocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <img src={game.thumbnail} alt="" className="absolute inset-0 size-full object-cover opacity-30" />
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black no-underline"
            >
              <ArrowSquareOutIcon size={16} />
              在原站打开
            </a>
          </div>
        ) : (
          <>
            <iframe
              ref={frameRef}
              title={game.title}
              src={game.url}
              className="absolute inset-0 size-full border-0 bg-black"
              allow="fullscreen; gamepad; autoplay; pointer-lock; xr-spatial-tracking"
              allowFullScreen
              tabIndex={0}
              onLoad={onFrameLoad}
            />
            {armed ? null : (
              <button type="button" aria-label="开始游戏" className="absolute inset-0 z-10 cursor-pointer" onClick={arm} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
