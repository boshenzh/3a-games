import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vite";
import { handleHttp } from "./api/submit-core.ts";

const root = path.dirname(fileURLToPath(import.meta.url));

function submitDevApi(): Plugin {
  return {
    name: "submit-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/submit", (req, res) => {
        const env = loadEnv(server.config.mode, server.config.root, "");
        void handleHttp(req, res, env.SUBMIT_WEBHOOK_URL);
      });
    },
  };
}

export default defineConfig({
  base: process.env.PAGES_BASE || "/",
  plugins: [react(), tailwindcss(), submitDevApi()],
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 47231,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 47231,
    strictPort: true,
  },
});
