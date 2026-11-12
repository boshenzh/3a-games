import embedFile from "@/generated/embed.json";
import gamesFile from "@/data/games.json";

export type EmbedMode = "iframe" | "external";

export type EmbedInfo = {
  mode: EmbedMode;
  reason: string;
  xFrameOptions: string | null;
  frameAncestors: string | null;
  status: number;
};

export type Game = {
  id: string;
  title: string;
  titleEn: string;
  url: string;
  tags: string[];
  description: string;
  controls: string[];
  notes: string;
  credit: string;
  creditDetail: string;
  creditUrl: string;
  thumbnail: string;
  thumbnailKind: "screenshot" | "title-card";
  hotRank: number;
  updatedAt: string;
  landscape: boolean;
  embed: EmbedInfo;
};

const fallbackEmbed: EmbedInfo = {
  mode: "iframe",
  reason: "还没有嵌入检测结果。播放页会先尝试 iframe，被拒绝时改为新标签打开。",
  xFrameOptions: null,
  frameAncestors: null,
  status: 0,
};

const embedMap = embedFile.games as Record<string, EmbedInfo>;

export const games: Game[] = gamesFile.map((game) => ({
  ...game,
  thumbnailKind: game.thumbnailKind === "title-card" ? "title-card" : "screenshot",
  embed: embedMap[game.id] ?? fallbackEmbed,
}));

export const embedCheckedAt = embedFile.checkedAt;

export const tags = ["全部", ...Array.from(new Set(games.flatMap((game) => game.tags)))];

export function gameById(id: string | undefined): Game | undefined {
  return games.find((game) => game.id === id);
}

export function matchesGame(game: Game, query: string, tag: string): boolean {
  if (tag !== "全部" && !game.tags.includes(tag)) return false;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [game.title, game.titleEn, game.description, game.credit, game.notes, ...game.tags, ...game.controls]
    .join("\n")
    .toLowerCase();
  return haystack.includes(needle);
}

const updated = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return updated.format(date);
}

export function hotGames(list: Game[]): Game[] {
  return [...list].sort((a, b) => a.hotRank - b.hotRank);
}

export function newestGames(list: Game[]): Game[] {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
