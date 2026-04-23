import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploaded files statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve sitemap.xml and robots.txt dynamically
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const { articles } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
      let urls = `<url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
      if (db) {
        const published = await db.select({ slug: articles.slug, updatedAt: articles.updatedAt })
          .from(articles).where(eq(articles.status, "published"));
        for (const a of published) {
          urls += `<url><loc>${siteUrl}/articles/${a.slug}</loc><lastmod>${new Date(a.updatedAt).toISOString().split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (e) {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (_req, res) => {
    try {
      const { getSeoSettings } = await import("../db");
      let robotsContent = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: " + (process.env.SITE_URL || "https://altyn-therapy.uz") + "/sitemap.xml";
      const settings = await getSeoSettings();
      if (settings?.robotsTxt) robotsContent = settings.robotsTxt;
      res.set("Content-Type", "text/plain");
      res.send(robotsContent);
    } catch {
      res.set("Content-Type", "text/plain");
      res.send("User-agent: *\nAllow: /\n");
    }
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
