import { useEffect, useState } from "react";
import { Button, Empty, LayerCard, Tabs, Text } from "@cloudflare/kumo";
import { GameControllerIcon } from "@phosphor-icons/react";
import { GameCard } from "@/components/GameCard.tsx";
import { Hero } from "@/components/Hero.tsx";
import { SubmitForm } from "@/components/SubmitForm.tsx";
import { SITE_NAME } from "@/config.ts";
import { games, hotGames, matchesGame, newestGames, tags } from "@/lib/games.ts";
import { useCatalogQuery } from "@/state.tsx";

export function HomePage() {
  const { query, setQuery } = useCatalogQuery();
  const [tag, setTag] = useState("全部");
  const filtering = query.trim() !== "" || tag !== "全部";
  const filtered = games.filter((game) => matchesGame(game, query, tag));

  useEffect(() => {
    document.title = SITE_NAME;
  }, []);

  return (
    <div className="flex flex-col">
      <Hero games={games} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10">
        {filtering ? (
          <section id="catalog" className="flex flex-col gap-4">
            <SectionTitle kicker="筛选结果" title={filtered.length ? `找到 ${filtered.length} 款` : "没有对上的游戏"} />
            <Tabs
              tabs={tags.map((item) => ({ value: item, label: item }))}
              value={tag}
              onValueChange={setTag}
              variant="segmented"
              size="sm"
            />
            {filtered.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <Empty
                icon={<GameControllerIcon size={28} />}
                title="没有对上的游戏"
                description="换个关键词，或回到全部分类。"
                contents={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setTag("全部");
                    }}
                  >
                    清空筛选
                  </Button>
                }
              />
            )}
          </section>
        ) : (
          <>
            <section id="hot" className="flex flex-col gap-4">
              <SectionTitle kicker="热门" title="先从这几款看起" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {hotGames(games).slice(0, 4).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
            <section id="latest" className="flex flex-col gap-4">
              <SectionTitle kicker="最新" title="按原站更新时间" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {newestGames(games).slice(0, 4).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
            <section id="catalog" className="flex flex-col gap-4">
              <SectionTitle kicker="全部作品" title={`${games.length} 款，都从原网址打开`} />
              <Tabs
                tabs={tags.map((item) => ({ value: item, label: item }))}
                value={tag}
                onValueChange={setTag}
                variant="segmented"
                size="sm"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          </>
        )}
        <section id="submit">
          <LayerCard className="p-5 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)]">
              <div className="flex flex-col gap-3">
                <Text variant="secondary" size="sm">
                  Submit yours
                </Text>
                <Text variant="heading" size="lg" as="h2">
                  提交你的游戏
                </Text>
                <Text>
                  本站不复制、不镜像、不转存任何作品的代码和素材。通过之后，条目只会嵌进创作者原来的网址；如果那个网址拒绝被嵌入，就改成新标签打开。
                </Text>
                <Text variant="secondary" size="sm">
                  适合投稿的是你自己能玩到的 WebGL / WebGPU 页面，并带上作者希望被如何署名的信息。
                </Text>
              </div>
              <SubmitForm idPrefix="page" />
            </div>
          </LayerCard>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="secondary" size="sm">
        {kicker}
      </Text>
      <Text variant="heading" size="lg" as="h2">
        {title}
      </Text>
    </div>
  );
}
