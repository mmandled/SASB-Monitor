import "dotenv/config";

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./backend/src/routes/api.js";
import { cacheService } from "./backend/src/services/cacheService.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use("/api", apiRouter);
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[SAS Bulletin Task Monitor] Server running on http://0.0.0.0:${PORT}`,
    );

    if (cacheService.isClientConfigured()) {
      console.log(
        "[SAS Bulletin Task Monitor] ClickUp token detected. Triggering initial sync...",
      );
      cacheService
        .sync()
        .then((res) => {
          console.log(
            `[SAS Bulletin Task Monitor] Initial sync finished: ${res.message}`,
          );
        })
        .catch((err) => {
          console.warn(
            `[SAS Bulletin Task Monitor] Initial sync error: ${err.message}`,
          );
        });
    } else {
      console.log(
        "[SAS Bulletin Task Monitor] ClickUp token not set. Awaiting configuration.",
      );
    }
  });
}

startServer().catch((err) => {
  console.error("[SAS Bulletin Task Monitor] Fatal server start error:", err);
  process.exit(1);
});
