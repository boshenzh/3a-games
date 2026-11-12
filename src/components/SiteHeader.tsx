import { Button, Input, Link } from "@cloudflare/kumo";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { SITE_NAME, SITE_NAME_EN } from "@/config.ts";
import { useCatalogQuery, useSubmitDialog } from "@/state.tsx";

export function SiteHeader() {
  const { query, setQuery } = useCatalogQuery();
  const { openSubmit } = useSubmitDialog();
  const location = useLocation();
  const navigate = useNavigate();

  function onSearch(value: string) {
    setQuery(value);
    if (location.pathname !== "/") navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-kumo-line bg-kumo-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" variant="plain" className="flex items-center gap-2 no-underline">
          <span className="font-display text-xl font-bold tracking-[0.14em] text-kumo-default">3A</span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-kumo-default">{SITE_NAME}</span>
            <span className="text-[11px] text-kumo-subtle">{SITE_NAME_EN}</span>
          </span>
        </Link>
        <div className="ml-auto md:hidden">
          <SubmitButton compact onClick={openSubmit} />
        </div>
        <div className="w-full md:min-w-64 md:flex-1">
          <Input
            className="w-full"
            size="sm"
            aria-label="搜索游戏"
            placeholder="搜索标题、标签或作者"
            value={query}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <div className="hidden md:block">
          <SubmitButton onClick={openSubmit} />
        </div>
      </div>
    </header>
  );
}

function SubmitButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <Button variant="primary" size="sm" icon={PaperPlaneTiltIcon} onClick={onClick}>
        投稿
      </Button>
    );
  }
  return (
    <Button variant="primary" icon={PaperPlaneTiltIcon} onClick={onClick}>
      提交你的游戏 / Submit yours
    </Button>
  );
}
