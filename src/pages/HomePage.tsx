import { useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard.tsx";
import { SITE_NAME } from "@/config.ts";
import { games, matchesGame } from "@/lib/games.ts";

export function HomePage() {
  const [query, setQuery] = useState("");
  const filtered = games.filter((game) => matchesGame(game, query));

  useEffect(() => {
    document.title = SITE_NAME;
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <input
        type="search"
        aria-label="搜索游戏"
        placeholder="搜索"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-9 w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-kumo-default outline-none placeholder:text-kumo-subtle focus:border-white/25"
      />
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-kumo-subtle">没有找到</p>
      )}
    </div>
  );
}
