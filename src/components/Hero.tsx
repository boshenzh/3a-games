import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Badge, Button, LinkButton, Text } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon, PaperPlaneTiltIcon, PlayIcon } from "@phosphor-icons/react";
import GradientText from "@/components/GradientText.tsx";
import ShinyText from "@/components/ShinyText.tsx";
import TiltedCard from "@/components/TiltedCard.tsx";
import { SITE_NAME } from "@/config.ts";
import { type Game } from "@/lib/games.ts";
import { usePrefersReducedMotion } from "@/lib/motion.ts";
import { useSubmitDialog } from "@/state.tsx";

const Aurora = lazy(() => import("@/components/Aurora.tsx"));

const slideOrder = ["wukong-tiger", "qq-speed", "lol-aram", "evensong", "cf-ship", "pelican-bike"];

export function Hero({ games }: { games: Game[] }) {
  const slides = slideOrder.flatMap((id) => {
    const game = games.find((item) => item.id === id);
    return game ? [game] : [];
  });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fx, setFx] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { openSubmit } = useSubmitDialog();
  const active = slides[index] ?? slides[0];

  useEffect(() => {
    if (reduced || paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6800);
    return () => window.clearInterval(timer);
  }, [paused, reduced, slides.length]);

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const timer = window.setTimeout(() => setFx(true), 280);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (!active) return null;

  function step(delta: number) {
    setIndex((current) => (current + delta + slides.length) % slides.length);
  }

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {fx ? (
        <QuietBoundary>
          <div className="pointer-events-none absolute inset-0 -z-20 opacity-80">
            <Suspense fallback={null}>
              <Aurora
                colorStops={["#10192b", "#d7b56a", "#3c6ea5"]}
                amplitude={0.72}
                blend={0.5}
                speed={0.32}
                brightness={0.55}
                paused={reduced}
              />
            </Suspense>
          </div>
        </QuietBoundary>
      ) : null}
      <img
        src={active.thumbnail}
        alt=""
        className="pointer-events-none absolute inset-0 -z-10 size-full scale-110 object-cover opacity-35 blur-2xl"
      />
      <div className="hero-shade pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-8 md:min-h-[34rem] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:py-14">
        <div className="order-2 flex flex-col items-start gap-4 md:order-1">
          <ShinyText
            text="WEBGL  /  WEBGPU"
            color="#d9d3c6"
            shineColor="#ffe7a8"
            speed={2.4}
            className="font-display text-xs tracking-[0.28em]"
          />
          <h1 className="font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl">
            <GradientText colors={["#fff8ea", "#e7c56a", "#9ec4ff"]} animationSpeed={7} glow={0.4} variant="linear">
              {SITE_NAME}
            </GradientText>
          </h1>
          <Text size="lg">
            把还能在网页里跑起来的高规格画面收在一处。点开就在原作者的网址上玩，这里不镜像代码，也不转存素材。
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            <LinkButton href={`/play/${active.id}`} variant="primary" size="lg" icon={PlayIcon}>
              开始游戏
            </LinkButton>
            <Button variant="secondary" size="lg" icon={PaperPlaneTiltIcon} onClick={openSubmit}>
              提交你的游戏 / Submit yours
            </Button>
          </div>
          <Text variant="secondary" size="sm">
            当前：{active.title}
          </Text>
          <div className="flex items-center gap-2">
            <Button variant="ghost" shape="square" size="sm" icon={CaretLeftIcon} aria-label="上一款" onClick={() => step(-1)} />
            <div className="flex items-center gap-1.5">
              {slides.map((game, slideIndex) => (
                <button
                  key={game.id}
                  type="button"
                  aria-label={game.title}
                  aria-current={slideIndex === index}
                  className={slideIndex === index ? "h-1.5 w-6 rounded-full bg-kumo-contrast" : "size-1.5 rounded-full bg-kumo-line"}
                  onClick={() => setIndex(slideIndex)}
                />
              ))}
            </div>
            <Button variant="ghost" shape="square" size="sm" icon={CaretRightIcon} aria-label="下一款" onClick={() => step(1)} />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative aspect-video w-full">
            <TiltedCard
              className="absolute inset-0"
              imageSrc={active.thumbnail}
              altText={`${active.title} 画面截图`}
              containerWidth="100%"
              containerHeight="100%"
              imageWidth="100%"
              imageHeight="100%"
              rotateAmplitude={reduced ? 0 : 7}
              scaleOnHover={reduced ? 1 : 1.03}
              showTooltip={false}
              radius={18}
              glare={0.28}
              displayOverlayContent
              overlayContent={
                <div className="flex h-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4">
                  <div className="flex flex-wrap gap-1">
                    {active.tags.map((tag) => (
                      <Badge key={tag} variant="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">{active.title}</p>
                  <p className="text-xs text-white/75">{active.titleEn}</p>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

class QuietBoundary extends Component<{ children: ReactNode }, { on: boolean }> {
  state = { on: true };

  static getDerivedStateFromError(): { on: boolean } {
    return { on: false };
  }

  render(): ReactNode {
    return this.state.on ? this.props.children : null;
  }
}
