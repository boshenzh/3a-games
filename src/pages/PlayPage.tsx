import { useEffect } from "react";
import { Badge, Empty, Link, LinkButton, Text } from "@cloudflare/kumo";
import { ArrowLeftIcon, GameControllerIcon } from "@phosphor-icons/react";
import { Player } from "@/components/Player.tsx";
import { SITE_NAME } from "@/config.ts";
import { formatUpdated, gameById } from "@/lib/games.ts";
import { useParams } from "react-router-dom";

export function PlayPage() {
  const { id } = useParams();
  const game = gameById(id);

  useEffect(() => {
    document.title = game ? `${game.title} · ${SITE_NAME}` : `没有这款游戏 · ${SITE_NAME}`;
  }, [game]);

  if (!game) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <Empty
          icon={<GameControllerIcon size={28} />}
          title="没有这款游戏"
          description="链接可能写错了，或者这款作品还没放进目录。"
          contents={
            <LinkButton href="/" variant="primary" icon={ArrowLeftIcon}>
              返回大厅
            </LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <Link href="/" variant="plain">
        返回大厅
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {game.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Badge variant={game.thumbnailKind === "screenshot" ? "outline" : "warning"}>
            {game.thumbnailKind === "screenshot" ? "实机截图" : "标题卡"}
          </Badge>
        </div>
        <Text variant="heading" size="lg" as="h1">
          {game.title}
        </Text>
        <Text variant="secondary">{game.titleEn}</Text>
      </div>
      <Player key={game.id} game={game} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="flex flex-col gap-3">
          <Text variant="heading" as="h2">
            这是什么
          </Text>
          <Text>{game.description}</Text>
          <Text variant="secondary" size="sm">
            {game.notes}
          </Text>
          <Text variant="secondary" size="sm">
            原站更新 {formatUpdated(game.updatedAt)}。嵌入检测：{game.embed.reason}
          </Text>
        </section>
        <section className="flex flex-col gap-3">
          <Text variant="heading" as="h2">
            操作
          </Text>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {game.controls.map((line) => (
              <li key={line}>
                <Text size="sm">{line}</Text>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="flex flex-col gap-2 rounded-xl bg-kumo-elevated p-4 ring ring-kumo-line">
        <Text variant="heading" as="h2">
          作者
        </Text>
        <Text>
          <Link href={game.creditUrl} target="_blank" rel="noopener noreferrer">
            {game.credit}
          </Link>
        </Text>
        <Text variant="secondary" size="sm">
          {game.creditDetail}
        </Text>
      </section>
    </div>
  );
}
