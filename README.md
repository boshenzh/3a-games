# 3A 小游戏

一个中文小游戏门户，把能在浏览器里玩的 WebGL / WebGPU 作品收在一起。名字写在 `src/config.ts` 的 `SITE_NAME` 里，改那一个常量即可。

游戏始终从创作者原来的网址打开。本站不复制、不镜像、不转存任何游戏的代码或素材。能被嵌入的页面放在 iframe 里；响应头拒绝嵌入的，改为新标签打开。

## 本地运行

```bash
npm install
npm run dev
```

开发服务器在 <http://127.0.0.1:47231>。`npm run dev` 会在本机挂上和线上一样的 `POST /api/submit`。

```bash
npm test
npm run build
npm run preview
```

`npm run build` 会先检查每个游戏网址的响应头，再做类型检查和静态构建。产物在 `dist/`。

## 加一款游戏

只改 `src/data/games.json`，追加一条。字段：

| 字段 | 含义 |
| --- | --- |
| `id` | 播放页路径，`/play/<id>` |
| `title` / `titleEn` | 中文名，和一行英文 |
| `url` | 创作者原来的页面 |
| `tags` | 例如 `MOBA`、`赛车`、`FPS`、`动作`、`休闲` |
| `description` | 短介绍，按页面上能看到的来写 |
| `controls` | 页面上给出的操作，没有就留空数组 |
| `notes` | 体积、横屏、浏览器之类页面上写明的说明 |
| `credit` / `creditDetail` / `creditUrl` | 页面上的署名；没有名字就写域名 |
| `thumbnail` | 放在 `public/thumbnails/` 的 16:9 截图 |
| `thumbnailKind` | `screenshot`，或无头浏览器确实渲不出画面时的 `title-card` |
| `hotRank` | 热门排序，数字小的更靠前 |
| `updatedAt` | 原站 `Last-Modified`，用来排「最新」 |
| `landscape` | 页面是否建议横屏 |

然后把截图放进 `public/thumbnails/`，运行：

```bash
npm run check-frames
```

脚本读取响应头里的 `X-Frame-Options` 和 `Content-Security-Policy` 的 `frame-ancestors`，把结果写到 `src/generated/embed.json`。`DENY`、`SAMEORIGIN`、`ALLOW-FROM`，以及没有 `*` / `https:` 的 `frame-ancestors`，都会标成新标签打开。播放页另外有一层兜底：iframe 如果停在 `about:blank`，也会改成新标签。

## 环境变量

复制 `.env.example`。

| 变量 | 作用 |
| --- | --- |
| `SUBMIT_WEBHOOK_URL` | 设置后，`POST /api/submit` 会把投稿 JSON 转发到这个地址。不设置时什么都不保存，页面改为打开一封邮件草稿。 |

邮件收件人不是环境变量，而是 `src/config.ts` 里的 `SUBMIT_EMAIL`。现在是占位的 `replace-me@example.com`，请换成真实邮箱。`example.com` 收不到信。

投稿 JSON 形如：

```json
{
  "source": "3a-mini-games",
  "siteName": "3A 小游戏",
  "submittedAt": "2026-11-12T00:00:00.000Z",
  "name": "游戏名称",
  "url": "https://example.com/game",
  "description": "一句话介绍",
  "creator": null,
  "screenshotUrl": null
}
```

接口会检查字段，并用内存里的计数做简单限流（同一 IP 十分钟最多 5 次）。无服务器实例不共享这张表，所以它只挡住短时间的重复提交。

## 部署到 Vercel

`vercel.json` 已经写好这些设置。Vite 预设自带的构建命令是 `vite build`，这里改成 `npm run build`，这样才会先做嵌入检测和类型检查。

| 设置 | 值 |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install`（有 `package-lock.json`） |
| Node.js version | `22.x`（`package.json` 的 `engines.node`） |

静态页面在 `dist/`。`api/submit.ts` 是 Node.js runtime 的函数，入口是文档里的 `export default { fetch(request) }`。重写规则不会把 `/api` 指到 `index.html`。可选环境变量仍然是 `SUBMIT_WEBHOOK_URL`。

## 界面

基础控件来自 [Kumo](https://github.com/cloudflare/kumo)（`@cloudflare/kumo`）。首页的极光、渐变字、聚光卡片、倾斜封面和扫光来自 [React Bits](https://reactbits.dev/)，用 shadcn 注册表拷进 `src/components/`。这些动效会尊重 `prefers-reduced-motion`；极光只在较宽的屏幕上延迟加载。
