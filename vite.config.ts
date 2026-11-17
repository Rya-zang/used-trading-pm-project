import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

function amapDevApi(): Plugin {
  return {
    name: "amap-dev-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== "/api/commute" || req.method !== "POST") {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          if (Buffer.concat(chunks).length > 2000) req.destroy();
        });
        req.on("end", () => {
          void (async () => {
            const loaded = (await server.ssrLoadModule("/src/server/amap.ts")) as {
              commuteFromRequest: (request: Request) => Promise<Response>;
            };
            const request = new Request("http://127.0.0.1/api/commute", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: Buffer.concat(chunks).toString("utf8"),
            });
            const response = await loaded.commuteFromRequest(request);
            res.statusCode = response.status;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.setHeader("cache-control", "no-store");
            res.end(Buffer.from(await response.arrayBuffer()));
          })().catch(() => {
            if (!res.headersSent) res.statusCode = 500;
            res.end(JSON.stringify({ error: "unavailable" }));
          });
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), amapDevApi()],
});
