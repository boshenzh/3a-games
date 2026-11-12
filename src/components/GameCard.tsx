import { Link } from "react-router-dom";
import type { Game } from "@/lib/games.ts";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to={`/play/${game.id}`}
      className="group flex flex-col gap-2.5 rounded-xl text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <div className="aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/5">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="size-full object-cover brightness-90 transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="truncate text-sm font-medium text-kumo-default">{game.title}</span>
        {game.tags[0] ? <span className="shrink-0 text-xs text-kumo-subtle">{game.tags[0]}</span> : null}
      </div>
    </Link>
  );
}
