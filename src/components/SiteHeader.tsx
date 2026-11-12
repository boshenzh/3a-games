import { Button } from "@cloudflare/kumo";
import { Link } from "react-router-dom";
import { SITE_NAME } from "@/config.ts";
import { useSubmitDialog } from "@/state.tsx";

export function SiteHeader() {
  const { openSubmit } = useSubmitDialog();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-kumo-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-wide text-kumo-default no-underline">
          {SITE_NAME}
        </Link>
        <Button variant="secondary" size="sm" onClick={openSubmit}>
          提交游戏
        </Button>
      </div>
    </header>
  );
}
