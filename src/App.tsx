import { LinkProvider, Text } from "@cloudflare/kumo";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLink } from "@/components/AppLink.tsx";
import { SiteHeader } from "@/components/SiteHeader.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { PlayPage } from "@/pages/PlayPage.tsx";
import { embedCheckedAt } from "@/lib/games.ts";
import { SITE_NAME } from "@/config.ts";
import { AppState } from "@/state.tsx";

export default function App() {
  const checked = embedCheckedAt
    ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(embedCheckedAt))
    : "";

  return (
    <BrowserRouter>
      <LinkProvider component={AppLink}>
        <AppState>
          <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/play/:id" element={<PlayPage />} />
              </Routes>
            </main>
            <footer className="border-t border-kumo-line">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8">
                <Text variant="secondary" size="sm">
                  {SITE_NAME} 不复制、不镜像、不转存任何游戏的代码或素材。能嵌入的用 iframe 打开原网址，响应头拒绝嵌入的改为新标签。
                </Text>
                {checked ? (
                  <Text variant="secondary" size="xs">
                    嵌入检测时间（UTC）：{checked}
                  </Text>
                ) : null}
              </div>
            </footer>
          </div>
        </AppState>
      </LinkProvider>
    </BrowserRouter>
  );
}
