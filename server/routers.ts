import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  clearSessionCookie,
  setSessionCookie,
  isFirstUser,
} from "./auth";
import * as db from "./db";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { systemRouter } from "./_core/systemRouter";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function requireRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Недостаточно прав" });
  }
}

function generateSlug(title: string): string {
  const translitMap: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
  };
  return title.toLowerCase()
    .split("").map(c => translitMap[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function calcSeoScore(article: {
  title?: string; h1?: string; metaDescription?: string; metaKeywords?: string;
  content?: string; targetKeyword?: string; schemaJson?: unknown; ogTitle?: string; canonicalUrl?: string;
}): number {
  let score = 0;
  const kw = (article.targetKeyword || "").toLowerCase();
  const content = (article.content || "").toLowerCase();
  const words = content.split(/\s+/).filter(Boolean);
  if (article.title && article.title.length > 10) score += 10;
  if (kw && article.title?.toLowerCase().includes(kw)) score += 5;
  if (article.h1 && article.h1.length > 5) score += 10;
  if (kw && article.h1?.toLowerCase().includes(kw)) score += 5;
  if (article.metaDescription && article.metaDescription.length >= 120 && article.metaDescription.length <= 160) score += 15;
  else if (article.metaDescription && article.metaDescription.length > 50) score += 8;
  if (kw && article.metaDescription?.toLowerCase().includes(kw)) score += 5;
  if (article.metaKeywords && article.metaKeywords.split(",").length >= 3) score += 10;
  if (words.length >= 1000) score += 15;
  else if (words.length >= 500) score += 10;
  else if (words.length >= 200) score += 5;
  if (kw && words.length > 0) {
    const kwWords = kw.split(/\s+/);
    let kwCount = 0;
    for (let i = 0; i <= words.length - kwWords.length; i++) {
      if (kwWords.every((w, j) => words[i + j]?.startsWith(w))) kwCount++;
    }
    const density = (kwCount / words.length) * 100;
    if (density >= 1 && density <= 3) score += 5;
  }
  if (article.schemaJson) score += 10;
  if (article.ogTitle) score += 5;
  if (article.canonicalUrl) score += 5;
  return Math.min(100, score);
}

function calcKeywordDensity(content: string, keyword: string): number {
  if (!content || !keyword) return 0;
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const kwWords = keyword.toLowerCase().split(/\s+/);
  let count = 0;
  for (let i = 0; i <= words.length - kwWords.length; i++) {
    if (kwWords.every((w, j) => words[i + j]?.startsWith(w))) count++;
  }
  return Math.round((count / words.length) * 1000) / 10;
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  // ─── Auth (own email+password, no Manus OAuth) ───────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "База данных недоступна" });
        const result = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
        const user = result[0];
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный email или пароль" });
        }
        if (!user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Аккаунт деактивирован" });
        }
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный email или пароль" });
        }
        await database.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
        const token = await createSessionToken(user.id, user.email!, user.role);
        setSessionCookie(ctx.res, token);
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        adminSecret: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "База данных недоступна" });

        // Check if email already exists
        const existing = await database.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Пользователь с таким email уже существует" });
        }

        const firstUser = await isFirstUser();
        let role: "admin" | "user" = "user";

        if (firstUser) {
          // First user is always admin
          role = "admin";
        } else {
          // Subsequent users need admin secret to register
          const secret = process.env.ADMIN_REGISTER_SECRET || "altyn-admin-2024";
          if (input.adminSecret !== secret) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Регистрация закрыта. Обратитесь к администратору." });
          }
        }

        const passwordHash = await hashPassword(input.password);
        const openId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        await database.insert(users).values({
          openId,
          name: input.name,
          email: input.email,
          passwordHash,
          loginMethod: "email",
          role,
          isActive: true,
          lastSignedIn: new Date(),
        });

        const newUser = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
        const user = newUser[0]!;
        const token = await createSessionToken(user.id, user.email!, user.role);
        setSessionCookie(ctx.res, token);
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      clearSessionCookie(ctx.res);
      return { success: true } as const;
    }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await database.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        const user = result[0];
        if (!user?.passwordHash) throw new TRPCError({ code: "BAD_REQUEST", message: "Пароль не установлен" });
        const valid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный текущий пароль" });
        const newHash = await hashPassword(input.newPassword);
        await database.update(users).set({ passwordHash: newHash }).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),
    // Real traffic data from article_analytics table
    trafficChart: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      // Get last 30 days of article views aggregated by day
      const data = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        data.push({ date: dateStr, views: 0 });
      }
      return data;
    }),
  }),

  // ─── Articles ───────────────────────────────────────────────────────────────
  articles: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => db.getArticles(input)),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const article = await db.getArticleById(input.id);
        if (!article) throw new TRPCError({ code: "NOT_FOUND" });
        return article;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().default(""),
        h1: z.string().default(""),
        metaDescription: z.string().default(""),
        metaKeywords: z.string().optional(),
        targetKeyword: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
        excerpt: z.string().optional(),
        tags: z.array(z.string()).optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        twitterTitle: z.string().optional(),
        twitterDescription: z.string().optional(),
        canonicalUrl: z.string().optional(),
        schemaType: z.string().optional(),
        schemaJson: z.unknown().optional(),
        scheduledAt: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const slug = generateSlug(input.title);
        const seoScore = calcSeoScore(input);
        const keywordDensity = calcKeywordDensity(input.content, input.targetKeyword || "");
        const id = await db.createArticle({
          ...input,
          slug,
          seoScore,
          keywordDensity,
          authorId: ctx.user.id,
          tags: input.tags ? JSON.stringify(input.tags) as any : undefined,
          schemaJson: input.schemaJson ? JSON.stringify(input.schemaJson) as any : undefined,
          publishedAt: input.status === "published" ? new Date() : undefined,
        });
        await db.logAudit({ userId: ctx.user.id, action: "create_article", entityType: "article", entityId: id, newValues: input });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        h1: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        targetKeyword: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
        excerpt: z.string().optional(),
        tags: z.array(z.string()).optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        twitterTitle: z.string().optional(),
        twitterDescription: z.string().optional(),
        canonicalUrl: z.string().optional(),
        schemaType: z.string().optional(),
        schemaJson: z.unknown().optional(),
        scheduledAt: z.date().optional(),
        featuredImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const { id, ...data } = input;
        const existing = await db.getArticleById(id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        // Save version before update
        await db.saveArticleVersion({
          articleId: id,
          version: Date.now(),
          title: existing.title,
          content: existing.content || "",
          metaDescription: existing.metaDescription || undefined,
          h1: existing.h1 || undefined,
          savedById: ctx.user.id,
        });
        const merged = { title: existing.title, h1: existing.h1 ?? undefined, metaDescription: existing.metaDescription ?? undefined, metaKeywords: existing.metaKeywords ?? undefined, content: existing.content ?? undefined, targetKeyword: existing.targetKeyword ?? undefined, schemaJson: existing.schemaJson ?? undefined, ogTitle: existing.ogTitle ?? undefined, canonicalUrl: existing.canonicalUrl ?? undefined, ...data };
        const seoScore = calcSeoScore(merged);
        const keywordDensity = calcKeywordDensity(merged.content || "", merged.targetKeyword || "");
        await db.updateArticle(id, {
          ...data,
          seoScore,
          keywordDensity,
          tags: data.tags ? JSON.stringify(data.tags) as any : undefined,
          schemaJson: data.schemaJson ? JSON.stringify(data.schemaJson) as any : undefined,
          publishedAt: data.status === "published" && !existing.publishedAt ? new Date() : undefined,
        });
        await db.logAudit({ userId: ctx.user.id, action: "update_article", entityType: "article", entityId: id, newValues: data });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.deleteArticle(input.id);
        await db.logAudit({ userId: ctx.user.id, action: "delete_article", entityType: "article", entityId: input.id });
        return { success: true };
      }),

    bulkAction: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
        action: z.enum(["publish", "archive", "delete", "draft"]),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        for (const id of input.ids) {
          if (input.action === "delete") {
            await db.deleteArticle(id);
          } else {
            const statusMap = { publish: "published", archive: "archived", draft: "draft" } as const;
            const status = statusMap[input.action as keyof typeof statusMap];
            if (status) await db.updateArticle(id, { status, publishedAt: status === "published" ? new Date() : undefined });
          }
        }
        await db.logAudit({ userId: ctx.user.id, action: `bulk_${input.action}`, entityType: "article", newValues: { ids: input.ids } });
        return { success: true, count: input.ids.length };
      }),

    versions: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => db.getArticleVersions(input.articleId)),

    restoreVersion: protectedProcedure
      .input(z.object({ articleId: z.number(), versionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const versions = await db.getArticleVersions(input.articleId);
        const version = versions.find((v) => v.id === input.versionId);
        if (!version) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateArticle(input.articleId, { content: version.content });
        await db.logAudit({ userId: ctx.user.id, action: "restore_version", entityType: "article", entityId: input.articleId });
        return { success: true };
      }),

    // Upload image via base64 — saves to local uploads/ folder
    uploadImage: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const ext = input.filename.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${ctx.user.id}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(input.base64, "base64");
        fs.writeFileSync(filepath, buffer);
        return { url: `/uploads/${filename}` };
      }),
  }),

  // ─── SEO ─────────────────────────────────────────────────────────────────────
  seo: router({
    score: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        h1: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        content: z.string().optional(),
        targetKeyword: z.string().optional(),
        schemaJson: z.unknown().optional(),
        ogTitle: z.string().optional(),
        canonicalUrl: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const score = calcSeoScore(input);
        const density = calcKeywordDensity(input.content || "", input.targetKeyword || "");
        const words = (input.content || "").split(/\s+/).filter(Boolean).length;
        const checks = [
          { label: "Заголовок страницы", pass: !!input.title && input.title.length > 10, hint: "Добавьте описательный заголовок (>10 символов)" },
          { label: "H1 содержит ключевое слово", pass: !!(input.h1 && input.targetKeyword && input.h1.toLowerCase().includes(input.targetKeyword.toLowerCase())), hint: "Включите ключевое слово в H1" },
          { label: "Длина мета-описания", pass: !!(input.metaDescription && input.metaDescription.length >= 120 && input.metaDescription.length <= 160), hint: "Мета-описание должно быть 120–160 символов" },
          { label: "Ключевое слово в мета-описании", pass: !!(input.metaDescription && input.targetKeyword && input.metaDescription.toLowerCase().includes(input.targetKeyword.toLowerCase())), hint: "Включите ключевое слово в мета-описание" },
          { label: "Мета-ключевые слова", pass: !!(input.metaKeywords && input.metaKeywords.split(",").length >= 3), hint: "Добавьте минимум 3 мета-ключевых слова" },
          { label: "Объём контента ≥1000 слов", pass: words >= 1000, hint: `Текущий объём: ${words} слов. Цель: 1000+` },
          { label: "Плотность ключевых слов 1–3%", pass: density >= 1 && density <= 3, hint: `Текущая плотность: ${density}%. Цель: 1–3%` },
          { label: "Разметка Schema.org", pass: !!input.schemaJson, hint: "Добавьте JSON-LD разметку" },
          { label: "Open Graph теги", pass: !!input.ogTitle, hint: "Добавьте Open Graph заголовок" },
          { label: "Канонический URL", pass: !!input.canonicalUrl, hint: "Укажите канонический URL" },
        ];
        return { score, density, wordCount: words, checks };
      }),

    // Generate schema.org JSON-LD locally (no AI needed)
    generateSchema: protectedProcedure
      .input(z.object({
        title: z.string(),
        h1: z.string(),
        metaDescription: z.string(),
        schemaType: z.string().default("Article"),
        slug: z.string(),
        authorName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
        return {
          "@context": "https://schema.org",
          "@type": input.schemaType,
          headline: input.h1 || input.title,
          description: input.metaDescription,
          url: `${siteUrl}/articles/${input.slug}`,
          author: { "@type": "Person", name: input.authorName || "ALTYN Therapy" },
          publisher: { "@type": "Organization", name: "ALTYN Therapy", url: siteUrl },
          datePublished: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          inLanguage: "ru",
        };
      }),

    // AI meta generation — only works if OPENAI_API_KEY is set
    generateMeta: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        targetKeyword: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          // Return template-based suggestions without AI
          const kw = input.targetKeyword || input.title;
          return {
            h1: `${kw}: полное руководство`,
            metaDescription: `Узнайте всё о ${kw}. Профессиональные советы и практические рекомендации от экспертов ALTYN Therapy.`,
            metaKeywords: `${kw}, онлайн, профессионально, эффективно, результат`,
            schemaType: "Article",
            aiUsed: false,
          };
        }
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "Ты SEO-специалист. Отвечай только валидным JSON." },
                { role: "user", content: `Создай SEO-метаданные для статьи "${input.title}". Ключевое слово: "${input.targetKeyword || input.title}". Отрывок: "${input.content.slice(0, 500)}". Верни JSON: {"h1":"...","metaDescription":"...","metaKeywords":"...","schemaType":"Article"}` },
              ],
              response_format: { type: "json_object" },
            }),
          });
          const data = await response.json() as any;
          const result = JSON.parse(data.choices[0]?.message?.content || "{}");
          return { ...result, aiUsed: true };
        } catch {
          const kw = input.targetKeyword || input.title;
          return {
            h1: `${kw}: полное руководство`,
            metaDescription: `Узнайте всё о ${kw}. Профессиональные советы от экспертов ALTYN Therapy.`,
            metaKeywords: `${kw}, онлайн, профессионально, эффективно`,
            schemaType: "Article",
            aiUsed: false,
          };
        }
      }),

    generateSitemap: protectedProcedure.query(async () => {
      const { items } = await db.getArticles({ status: "published", limit: 1000 });
      const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
      const urls = items.map((a) => ({
        loc: `${siteUrl}/articles/${a.slug}`,
        lastmod: (a.updatedAt || a.createdAt).toISOString().slice(0, 10),
        changefreq: "weekly",
        priority: "0.8",
      }));
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}\n</urlset>`;
      return { xml, count: urls.length };
    }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure.query(async () => db.getAllCategories()),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), slug: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const slug = input.slug || generateSlug(input.name);
        await db.createCategory({ ...input, slug });
        return { success: true };
      }),
  }),

  // ─── Keywords ────────────────────────────────────────────────────────────────
  keywords: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), limit: z.number().default(50) }))
      .query(async ({ input }) => db.getKeywords(input)),

    create: protectedProcedure
      .input(z.object({
        keyword: z.string().min(1),
        searchVolume: z.number().optional(),
        keywordDifficulty: z.number().optional(),
        cpc: z.number().optional(),
        currentRank: z.number().optional(),
        targetRank: z.number().optional(),
        trend: z.enum(["up", "down", "stable"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.createKeyword(input);
        await db.logAudit({ userId: ctx.user.id, action: "create_keyword", entityType: "keyword", newValues: input });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        keyword: z.string().optional(),
        searchVolume: z.number().optional(),
        keywordDifficulty: z.number().optional(),
        cpc: z.number().optional(),
        currentRank: z.number().optional(),
        targetRank: z.number().optional(),
        trend: z.enum(["up", "down", "stable"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const { id, ...data } = input;
        await db.updateKeyword(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        await db.deleteKeyword(input.id);
        return { success: true };
      }),
  }),

  // ─── Competitors ─────────────────────────────────────────────────────────────
  competitors: router({
    list: protectedProcedure.query(async () => db.getCompetitors()),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        domain: z.string().min(1),
        authorityScore: z.number().optional(),
        backlinksCount: z.number().optional(),
        estimatedTraffic: z.number().optional(),
        keywordCount: z.number().optional(),
        topKeywords: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.createCompetitor({
          ...input,
          topKeywords: input.topKeywords ? JSON.stringify(input.topKeywords) as any : undefined,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        domain: z.string().optional(),
        authorityScore: z.number().optional(),
        backlinksCount: z.number().optional(),
        estimatedTraffic: z.number().optional(),
        keywordCount: z.number().optional(),
        topKeywords: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const { id, ...data } = input;
        await db.updateCompetitor(id, {
          ...data,
          topKeywords: data.topKeywords ? JSON.stringify(data.topKeywords) as any : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        await db.deleteCompetitor(input.id);
        return { success: true };
      }),
  }),

  // ─── Calendar ────────────────────────────────────────────────────────────────
  calendar: router({
    list: protectedProcedure
      .input(z.object({ year: z.number().optional(), month: z.number().optional() }))
      .query(async ({ input }) => db.getCalendarEvents(input)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledDate: z.date(),
        status: z.enum(["planned", "in_progress", "review", "completed"]).default("planned"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        targetKeyword: z.string().optional(),
        assignedTo: z.number().optional(),
        articleId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.createCalendarEvent({ ...input } as any);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        scheduledDate: z.date().optional(),
        status: z.enum(["planned", "in_progress", "review", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        targetKeyword: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        const { id, ...data } = input;
        await db.updateCalendarEvent(id, data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.deleteCalendarEvent(input.id);
        return { success: true };
      }),
  }),

  // ─── Internal Links ──────────────────────────────────────────────────────────
  internalLinks: router({
    list: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => db.getInternalLinks(input.articleId)),

    listAll: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      const { internalLinks, articles } = await import("../drizzle/schema");
      const { eq: eqOp } = await import("drizzle-orm");
      return database.select().from(internalLinks).limit(200);
    }),

    create: protectedProcedure
      .input(z.object({
        fromArticleId: z.number(),
        toArticleId: z.number(),
        anchorText: z.string().optional(),
        linkType: z.enum(["primary", "secondary", "contextual"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.createInternalLink(input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin", "editor"]);
        await db.deleteInternalLink(input.id);
        return { success: true };
      }),
  }),

  // ─── Users/Admin ─────────────────────────────────────────────────────────────
  admin: router({
    users: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      return db.getAllUsers();
    }),

    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "editor", "viewer"]),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Нельзя изменить свою роль" });
        await db.updateUserRole(input.userId, input.role);
        await db.logAudit({ userId: ctx.user.id, action: "update_role", entityType: "user", entityId: input.userId, newValues: { role: input.role } });
        return { success: true };
      }),

    deactivateUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Нельзя деактивировать себя" });
        await db.deactivateUser(input.userId);
        await db.logAudit({ userId: ctx.user.id, action: "deactivate_user", entityType: "user", entityId: input.userId });
        return { success: true };
      }),

    reactivateUser: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "editor", "viewer"]).default("user") }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        await db.reactivateUser(input.userId, input.role);
        await db.logAudit({ userId: ctx.user.id, action: "reactivate_user", entityType: "user", entityId: input.userId });
        return { success: true };
      }),

    auditLog: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, ["admin"]);
        return db.getAuditLog(input.limit);
      }),
  }),

  // ─── Settings ────────────────────────────────────────────────────────────────
  settings: router({
    get: protectedProcedure.query(async () => db.getSeoSettings()),

    save: protectedProcedure
      .input(z.object({
        siteUrl: z.string().optional(),
        siteName: z.string().optional(),
        defaultMetaDescription: z.string().optional(),
        robotsTxt: z.string().optional(),
        defaultSchemaType: z.string().optional(),
        aiGenerationLanguage: z.string().optional(),
        aiTone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireRole(ctx.user.role, ["admin"]);
        const settings: Record<string, string> = {};
        Object.entries(input).forEach(([k, v]) => { if (v !== undefined) settings[k] = v; });
        await db.saveSeoSettings(settings);
        await db.logAudit({ userId: ctx.user.id, action: "save_settings", entityType: "settings", newValues: settings });
        return { success: true };
      }),
  }),

  // ─── Analytics (real data from DB) ───────────────────────────────────────────
  analytics: router({
    overview: protectedProcedure.query(async () => {
      const stats = await db.getDashboardStats();
      return {
        totalArticles: stats?.totalArticles ?? 0,
        publishedArticles: stats?.publishedArticles ?? 0,
        indexedArticles: stats?.indexedArticles ?? 0,
        keywordCount: stats?.keywordCount ?? 0,
        topKeywords: stats?.topKeywords ?? [],
        recentArticles: stats?.recentArticles ?? [],
      };
    }),

    articlePerformance: protectedProcedure.query(async () => db.getTopArticlesByPerformance()),

    // Views by day for chart (real data from article_analytics)
    viewsChart: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        const data = [];
        const now = new Date();
        for (let i = input.days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          data.push({ date: d.toISOString().slice(0, 10), views: 0 });
        }
        return data;
      }),
  }),
});

export type AppRouter = typeof appRouter;
