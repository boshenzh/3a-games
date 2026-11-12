import { LinkProvider } from "@cloudflare/kumo";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLink } from "@/components/AppLink.tsx";
import { SiteHeader } from "@/components/SiteHeader.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { PlayPage } from "@/pages/PlayPage.tsx";
import { AppState } from "@/state.tsx";

export default function App() {
  return (
    <HashRouter>
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
          </div>
        </AppState>
      </LinkProvider>
    </HashRouter>
  );
}
