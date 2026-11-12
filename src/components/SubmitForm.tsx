import { useState, type FormEvent } from "react";
import { Button, Input, InputArea, Text } from "@cloudflare/kumo";
import { SUBMIT_EMAIL } from "@/config.ts";

type Fields = { name: string; url: string; note: string };

const emptyFields: Fields = { name: "", url: "", note: "" };

function isHttp(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function mailtoHref(fields: Fields): string {
  const lines = [`游戏名称：${fields.name.trim()}`, `地址：${fields.url.trim()}`];
  if (fields.note.trim()) lines.push(`备注：${fields.note.trim()}`);
  const subject = encodeURIComponent(`投稿：${fields.name.trim()}`);
  return `mailto:${SUBMIT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function SubmitForm({ idPrefix, onDone }: { idPrefix: string; onDone?: () => void }) {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [error, setError] = useState<{ field: "name" | "url"; message: string } | null>(null);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fields.name.trim()) return setError({ field: "name", message: "请填写游戏名称" });
    if (!isHttp(fields.url)) return setError({ field: "url", message: "请填写以 http(s):// 开头的地址" });
    setError(null);
    window.location.href = mailtoHref(fields);
    setFields(emptyFields);
    onDone?.();
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <Input
        id={`${idPrefix}-name`}
        label="游戏名称"
        name="name"
        required
        maxLength={60}
        value={fields.name}
        error={error?.field === "name" ? error.message : undefined}
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
        value={fields.url}
        error={error?.field === "url" ? error.message : undefined}
        onChange={(event) => set("url", event.target.value)}
      />
      <InputArea
        id={`${idPrefix}-note`}
        label="备注（选填）"
        name="note"
        rows={3}
        maxLength={400}
        value={fields.note}
        onChange={(event) => set("note", event.target.value)}
      />
      {error ? (
        <Text variant="error" size="sm" role="alert">
          {error.message}
        </Text>
      ) : null}
      <Button type="submit" variant="primary">
        提交
      </Button>
    </form>
  );
}
