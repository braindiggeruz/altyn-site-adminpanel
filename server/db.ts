import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  articleAnalytics,
  articleVersions,
  articles,
  auditLog,
  categories,
  competitors,
  contentCalendar,
  internalLinks,
  InsertArticle,
  InsertCalendarEvent,
  InsertCategory,
  InsertCompetitor,
  InsertKeyword,
  InsertUser,
  keywords,
  seoTasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.error("[Database] DATABASE_URL is not set!");
      return null;
    }
    try {
      console.log("[Database] Connecting to:", process.env.DATABASE_URL.split("@")[1] || "unknown");
      const client = postgres(process.env.DATABASE_URL, {
        connect_timeout: 10,
        idle_timeout: 30,
      });
      _db = drizzle(client);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  // PostgreSQL upsert using ON CONFLICT
  await db
    .insert(users)
    .values(user)
    .onConflictDoUpdate({
      target: users.openId,
      set: { email: user.email, name: user.name, role: user.role, isActive: user.isActive },
    });
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(email: string, passwordHash: string, name: string = ""): Promise<{ id: number; email: string } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      openId: `local_${email}`,
      role: "user",
      isActive: true,
    })
    .returning({ id: users.id, email: users.email });
  return result[0] || null;
}

export async function updateUser(id: number, updates: Partial<InsertUser>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

// ─── Articles ─────────────────────────────────────────────────────────────────
export async function createArticle(article: InsertArticle): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values(article).returning({ id: articles.id });
  return result[0] || null;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0] || null;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getPublishedArticles(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllArticles(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).orderBy(desc(articles.updatedAt)).limit(limit).offset(offset);
}

export async function updateArticle(id: number, updates: Partial<InsertArticle>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(articles).set({ ...updates, updatedAt: new Date() }).where(eq(articles.id, id));
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, id));
}

export async function searchArticles(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(
      or(
        like(articles.title, `%${query}%`),
        like(articles.content, `%${query}%`),
        like(articles.slug, `%${query}%`)
      )
    )
    .limit(20);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const total = await db.select({ count: sql<number>`count(*)` }).from(articles);
  const published = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, "published"));
  const indexed = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.isIndexed, true));
  const keywordCount = await db.select({ count: sql<number>`count(*)` }).from(keywords);
  const topKeywords = await db
    .select({ keyword: keywords.keyword, searchVolume: keywords.searchVolume })
    .from(keywords)
    .orderBy(desc(keywords.searchVolume))
    .limit(5);
  const recentArticles = await db
    .select({ id: articles.id, title: articles.title, status: articles.status, publishedAt: articles.publishedAt })
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(5);
  return {
    totalArticles: (total[0]?.count as number) || 0,
    publishedArticles: (published[0]?.count as number) || 0,
    indexedArticles: (indexed[0]?.count as number) || 0,
    keywordCount: (keywordCount[0]?.count as number) || 0,
    topKeywords,
    recentArticles,
  };
}

// ─── Keywords ─────────────────────────────────────────────────────────────────
export async function createKeyword(keyword: InsertKeyword): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(keywords).values(keyword).returning({ id: keywords.id });
  return result[0] || null;
}

export async function getKeywords(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(keywords).orderBy(desc(keywords.searchVolume)).limit(limit);
}

export async function updateKeyword(id: number, updates: Partial<InsertKeyword>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(keywords).set(updates).where(eq(keywords.id, id));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function createCategory(category: InsertCategory): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(categories).values(category).returning({ id: categories.id });
  return result[0] || null;
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

// ─── Competitors ──────────────────────────────────────────────────────────────
export async function createCompetitor(competitor: InsertCompetitor): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(competitors).values(competitor).returning({ id: competitors.id });
  return result[0] || null;
}

export async function getCompetitors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitors);
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────
export async function logAudit(log: any): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({ ...log, timestamp: new Date() });
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.timestamp)).limit(limit);
}

// ─── Settings ──────────────────────────────────────────────────────────────────
let _settings: Record<string, string> | null = null;

export async function getSeoSettings() {
  if (_settings) return _settings;
  const db = await getDb();
  if (!db) return null;
  // Assuming settings are stored in a simple key-value format
  _settings = {};
  return _settings;
}

export async function saveSeoSettings(settings: Record<string, string>): Promise<void> {
  _settings = settings;
}

// ─── Content Calendar ─────────────────────────────────────────────────────────
export async function createCalendarEvent(event: InsertCalendarEvent): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contentCalendar).values(event).returning({ id: contentCalendar.id });
  return result[0] || null;
}

export async function getCalendarEvents(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contentCalendar)
    .where(and(
      sql`${contentCalendar.scheduledDate} >= ${startDate}`,
      sql`${contentCalendar.scheduledDate} <= ${endDate}`
    ));
}

// ─── Article Analytics ────────────────────────────────────────────────────────
export async function getTopArticlesByPerformance() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: articles.id,
      title: articles.title,
      views: articleAnalytics.views,
      clicks: articleAnalytics.clicks,
    })
    .from(articles)
    .leftJoin(articleAnalytics, eq(articles.id, articleAnalytics.articleId))
    .orderBy(desc(articleAnalytics.views))
    .limit(10);
}

export async function recordArticleView(articleId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const today = new Date().toISOString().split("T")[0];
  const existing = await db
    .select()
    .from(articleAnalytics)
    .where(and(eq(articleAnalytics.articleId, articleId), sql`DATE(${articleAnalytics.date}) = ${today}`))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(articleAnalytics)
      .set({ views: sql`${articleAnalytics.views} + 1` })
      .where(eq(articleAnalytics.id, existing[0].id));
  } else {
    await db.insert(articleAnalytics).values({ articleId, date: new Date(), views: 1, clicks: 0 });
  }
}
