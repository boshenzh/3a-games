import { Badge, Text } from "@cloudflare/kumo";
import { Link } from "react-router-dom";
import GlareHover from "@/components/GlareHover.tsx";
import SpotlightCard from "@/components/SpotlightCard.tsx";
import { formatUpdated, type Game } from "@/lib/games.ts";

const tagVariant = {
  MOBA: "blue",
  赛车: "orange",
  FPS: "red",
  动作: "purple",
  休闲: "teal",
} as const;

export function GameCard({ game }: { game: Game }) {
  return (
    <SpotlightCard
      theme="dark"
      className="group h-full p-0! rounded-2xl"
      borderGlow={0.9}
      intensity={0.85}
      spotlightColor="rgba(230, 196, 120, 0.42)"
    >
      <Link to={`/play/${game.id}`} className="flex h-full flex-col text-inherit no-underline outline-none">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={game.thumbnail}
            alt={`${game.title} 画面截图`}
            className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          />
          <GlareHover
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            borderRadius="0px"
            glareColor="#fff4d2"
            glareOpacity={0.28}
            className="absolute inset-0"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
            {game.embed.mode === "external" ? (
              <Badge variant="warning">新标签打开</Badge>
            ) : (
              <Badge variant="success">站内游玩</Badge>
            )}
            {game.landscape ? <Badge variant="neutral">建议横屏</Badge> : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex flex-col gap-0.5">
            <Text as="h3" variant="heading">
              {game.title}
            </Text>
            <Text variant="secondary" size="xs">
              {game.titleEn}
            </Text>
          </div>
          <div className="flex flex-wrap gap-1">
            {game.tags.map((tag) => (
              <Badge key={tag} variant={tagVariant[tag as keyof typeof tagVariant] ?? "secondary"}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="line-clamp-3">
            <Text as="span" variant="secondary" size="sm">
              {game.description}
            </Text>
          </div>
          <Text variant="secondary" size="xs">
            {game.credit} · 原站更新 {formatUpdated(game.updatedAt)}
          </Text>
        </div>
      </Link>
    </SpotlightCard>
  );
}
