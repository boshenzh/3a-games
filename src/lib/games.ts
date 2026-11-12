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
  /** Optional link to the original/source page when it differs from the play URL. */
  sourceUrl?: string;
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

export function gameById(id: string | undefined): Game | undefined {
  return games.find((game) => game.id === id);
}

export function matchesGame(game: Game, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [game.title, game.titleEn, ...game.tags].join("\n").toLowerCase().includes(needle);
}
