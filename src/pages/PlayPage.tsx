import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Player } from "@/components/Player.tsx";
import { SITE_NAME } from "@/config.ts";
import { gameById } from "@/lib/games.ts";

export function PlayPage() {
  const { id } = useParams();
  const game = gameById(id);

  useEffect(() => {
    document.title = game ? `${game.title} · ${SITE_NAME}` : SITE_NAME;
  }, [game]);

  if (!game) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-sm text-kumo-subtle">
        <p>没有这款游戏</p>
        <Link to="/" className="text-kumo-default">
          返回
        </Link>
      </div>
    );
  }

  return <Player key={game.id} game={game} />;
}
