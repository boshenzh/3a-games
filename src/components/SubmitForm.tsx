import { useState, type FormEvent } from "react";
import { Badge, Button, Input, InputArea, LinkButton, Text } from "@cloudflare/kumo";
import { EnvelopeSimpleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { SUBMIT_EMAIL } from "@/config.ts";

type Fields = {
  name: string;
  url: string;
  description: string;
  creator: string;
  screenshotUrl: string;
  company: string;
};

type FieldName = "name" | "url" | "description" | "creator" | "screenshotUrl" | "form";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "webhook" }
  | { kind: "mailto"; href: string }
  | { kind: "error"; message: string };

const emptyFields: Fields = {
  name: "",
  url: "",
  description: "",
  creator: "",
  screenshotUrl: "",
  company: "",
};

function mailtoHref(fields: Fields): string {
  const lines = [
    `游戏名称：${fields.name.trim()}`,
    `地址：${fields.url.trim()}`,
    `简介：${fields.description.trim()}`,
  ];
  if (fields.creator.trim()) lines.push(`作者 / 联系：${fields.creator.trim()}`);
  if (fields.screenshotUrl.trim()) lines.push(`截图：${fields.screenshotUrl.trim()}`);
  lines.push("", "来自 3A 小游戏投稿。请只收录原作者的链接，不要镜像代码或素材。");
  return `mailto:${SUBMIT_EMAIL}?subject=${encodeURIComponent(`投稿：${fields.name.trim()}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function localError(fields: Fields): { field: FieldName; message: string } | null {
  if (!fields.name.trim()) return { field: "name", message: "请填写游戏名称。" };
  if (!fields.url.trim()) return { field: "url", message: "请填写游戏地址。" };
  if (!isHttp(fields.url)) return { field: "url", message: "游戏地址需要以 http:// 或 https:// 开头。" };
  if (!fields.description.trim()) return { field: "description", message: "请用一两句话介绍这款游戏。" };
  if (fields.screenshotUrl.trim() && !isHttp(fields.screenshotUrl)) {
    return { field: "screenshotUrl", message: "截图地址需要以 http:// 或 https:// 开头。" };
  }
  return null;
}

function isHttp(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function SubmitForm({ idPrefix }: { idPrefix: string }) {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<{ field: FieldName; message: string } | null>(null);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = localError(fields);
    if (problem) {
      setFieldError(problem);
      setStatus({ kind: "error", message: problem.message });
      return;
    }
    setFieldError(null);
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const payload = (await response.json()) as { ok?: boolean; mode?: string; error?: string; field?: FieldName };
      if (!response.ok || payload.ok === false) {
        const message = payload.error || "提交没有成功，请稍后再试。";
        if (payload.field) setFieldError({ field: payload.field, message });
        setStatus({ kind: "error", message });
        return;
      }
      if (payload.mode === "mailto") {
        setStatus({ kind: "mailto", href: mailtoHref(fields) });
        return;
      }
      setStatus({ kind: "webhook" });
    } catch {
      setStatus({ kind: "error", message: "没有连上投稿接口。本地预览请用 npm run dev，它会带上 /api/submit。" });
    }
  }

  if (status.kind === "webhook") {
    return (
      <div role="status" className="flex flex-col gap-3">
        <Badge variant="success">已提交</Badge>
        <Text>这条投稿已经转发到接收端。游戏本体不会被保存，之后如果收录，也只会链到原作者的网址。</Text>
        <Button variant="secondary" onClick={() => { setFields(emptyFields); setStatus({ kind: "idle" }); }}>
          再写一条
        </Button>
      </div>
    );
  }

  if (status.kind === "mailto") {
    const placeholder = SUBMIT_EMAIL.endsWith("@example.com");
    return (
      <div role="status" className="flex flex-col gap-3">
        <Badge variant="warning">还没有配置接收服务</Badge>
        <Text>站点没有设置 SUBMIT_WEBHOOK_URL，所以这次没有被存到任何服务器。下面的邮件草稿里是同一份内容。</Text>
        <LinkButton href={status.href} variant="primary" icon={EnvelopeSimpleIcon}>
          打开邮件草稿
        </LinkButton>
        <Text variant="secondary" size="sm">
          {placeholder
            ? `当前邮箱 ${SUBMIT_EMAIL} 是占位符。把 src/config.ts 里的 SUBMIT_EMAIL 换成真实地址，邮件才会送到人。`
            : `邮件将发给 ${SUBMIT_EMAIL}。`}
        </Text>
        <Button variant="secondary" onClick={() => setStatus({ kind: "idle" })}>
          返回修改
        </Button>
      </div>
    );
  }

  const errorFor = (field: FieldName) => (fieldError?.field === field ? fieldError.message : undefined);

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <Input
        id={`${idPrefix}-name`}
        label="游戏名称"
        name="name"
        required
        maxLength={60}
        value={fields.name}
        error={errorFor("name")}
        onChange={(event) => set("name", event.target.value)}
      />
      <Input
        id={`${idPrefix}-url`}
        label="游戏地址"
        name="url"
        type="url"
        required
        maxLength={400}
        placeholder="https://"
        description="原作者发布这款网页游戏的网址"
        value={fields.url}
        error={errorFor("url")}
        onChange={(event) => set("url", event.target.value)}
      />
      <InputArea
        id={`${idPrefix}-description`}
        label="简短介绍"
        name="description"
        required
        rows={4}
        maxLength={400}
        description="一两句就好：玩法、画风，或者需要横屏"
        value={fields.description}
        error={errorFor("description")}
        onChange={(event) => set("description", event.target.value)}
      />
      <Input
        id={`${idPrefix}-creator`}
        label="作者 / 联系方式"
        name="creator"
        maxLength={80}
        description="选填。名字、邮箱或主页都可以"
        value={fields.creator}
        onChange={(event) => set("creator", event.target.value)}
      />
      <Input
        id={`${idPrefix}-shot`}
        label="截图地址"
        name="screenshotUrl"
        type="url"
        maxLength={400}
        description="选填。一张你可以公开使用的图片链接，不要用别人的素材包"
        value={fields.screenshotUrl}
        error={errorFor("screenshotUrl")}
        onChange={(event) => set("screenshotUrl", event.target.value)}
      />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          公司网站
          <input
            tabIndex={-1}
            autoComplete="off"
            name="company"
            value={fields.company}
            onChange={(event) => set("company", event.target.value)}
          />
        </label>
      </div>
      {status.kind === "error" ? (
        <Text variant="error" role="alert">
          {status.message}
        </Text>
      ) : null}
      <Button type="submit" variant="primary" icon={PaperPlaneTiltIcon} loading={status.kind === "sending"}>
        提交你的游戏 / Submit yours
      </Button>
    </form>
  );
}
