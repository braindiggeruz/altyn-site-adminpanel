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
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
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
      set: {
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role,
        lastSignedIn: user.lastSignedIn || new Date(),
        updatedAt: new Date(),
      },
    });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "editor" | "viewer") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(categories).values(data);
}

// ─── Articles ─────────────────────────────────────────────────────────────────
export async function getArticles(opts?: {
  status?: string;
  categoryId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (opts?.status) conditions.push(eq(articles.status, opts.status as any));
  if (opts?.categoryId) conditions.push(eq(articles.categoryId, opts.categoryId));
  if (opts?.search) {
    conditions.push(
      or(
        like(articles.title, `%${opts.search}%`),
        like(articles.targetKeyword, `%${opts.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(where)
      .orderBy(desc(articles.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(articles).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0];
}

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(articles).values(data).returning({ id: articles.id });
  return result[0]?.id;
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(articles).where(eq(articles.id, id));
}

export async function getArticleVersions(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articleVersions)
    .where(eq(articleVersions.articleId, articleId))
    .orderBy(desc(articleVersions.version));
}

export async function saveArticleVersion(data: {
  articleId: number;
  version: number;
  title: string;
  content: string;
  metaDescription?: string;
  h1?: string;
  savedById?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(articleVersions).values(data);
}

// ─── Keywords ─────────────────────────────────────────────────────────────────
export async function getKeywords(opts?: { search?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.search) conditions.push(like(keywords.keyword, `%${opts.search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db
    .select()
    .from(keywords)
    .where(where)
    .orderBy(desc(keywords.searchVolume))
    .limit(opts?.limit ?? 100);
}

export async function createKeyword(data: InsertKeyword) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(keywords).values(data);
}

export async function updateKeyword(id: number, data: Partial<InsertKeyword>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(keywords).set(data).where(eq(keywords.id, id));
}

export async function deleteKeyword(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(keywords).where(eq(keywords.id, id));
}

// ─── Competitors ──────────────────────────────────────────────────────────────
export async function getCompetitors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitors).orderBy(desc(competitors.authorityScore));
}

export async function createCompetitor(data: InsertCompetitor) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(competitors).values(data);
}

export async function updateCompetitor(id: number, data: Partial<InsertCompetitor>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(competitors).set(data).where(eq(competitors.id, id));
}

export async function deleteCompetitor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(competitors).where(eq(competitors.id, id));
}

// ─── Content Calendar ─────────────────────────────────────────────────────────
export async function getCalendarEvents(opts?: { year?: number; month?: number }) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentCalendar).orderBy(contentCalendar.scheduledDate);
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(contentCalendar).values(data).returning({ id: contentCalendar.id });
  return result[0]?.id;
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(contentCalendar).set(data).where(eq(contentCalendar.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(contentCalendar).where(eq(contentCalendar.id, id));
}

// ─── Internal Links ───────────────────────────────────────────────────────────
export async function getInternalLinks(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(internalLinks)
    .where(eq(internalLinks.fromArticleId, articleId));
}

export async function createInternalLink(data: {
  fromArticleId: number;
  toArticleId: number;
  anchorText?: string;
  linkType?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(internalLinks).values(data as any);
}

export async function deleteInternalLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(internalLinks).where(eq(internalLinks.id, id));
}

// ─── SEO Tasks ────────────────────────────────────────────────────────────────
export async function createSeoTask(data: {
  articleId: number;
  taskType: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(seoTasks).values({ ...data, status: "pending" });
}

export async function updateSeoTask(id: number, data: {
  status: string;
  result?: unknown;
  errorMessage?: string;
  completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(seoTasks).set(data as any).where(eq(seoTasks.id, id));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getArticleAnalytics(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articleAnalytics)
    .where(eq(articleAnalytics.articleId, articleId))
    .orderBy(desc(articleAnalytics.date));
}

export async function recordAnalytics(data: {
  articleId: number;
  date: Date;
  views?: number;
  clicks?: number;
  impressions?: number;
  avgPosition?: number;
  ctr?: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(articleAnalytics).values(data as any);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalArticles: 0, publishedArticles: 0, indexedArticles: 0, keywordCount: 0, topKeywords: [], recentArticles: [] };

  const totalArticles = await db.select({ count: sql<number>`count(*)` }).from(articles);
  const publishedArticles = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, "published"));
  const indexedArticles = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.indexed, true));
  const keywordCount = await db.select({ count: sql<number>`count(*)` }).from(keywords);

  const topKeywords = await db
    .select()
    .from(keywords)
    .orderBy(keywords.currentRank)
    .limit(10);
  const recentArticles = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.updatedAt))
    .limit(5);
  return {
    totalArticles: Number(totalArticles[0]?.count ?? 0),
    publishedArticles: Number(publishedArticles[0]?.count ?? 0),
    indexedArticles: Number(indexedArticles[0]?.count ?? 0),
    keywordCount: Number(keywordCount[0]?.count ?? 0),
    topKeywords,
    recentArticles,
  };
}
// ─── Audit Log ────────────────────────────────────────────────────────────────
export async function logAudit(data: {
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values(data as any);
}
export async function getAuditLog(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}
export async function getTopArticlesByPerformance() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: articles.id,
      title: articles.title,
      targetKeyword: articles.targetKeyword,
      views: articles.views,
      seoScore: articles.seoScore,
      status: articles.status,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.views))
    .limit(10);
}
// ─── User Deactivation ────────────────────────────────────────────────────────
export async function deactivateUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Store deactivation as a role change to "viewer" with audit trail
  await db.update(users).set({ role: "viewer" }).where(eq(users.id, userId));
}
export async function reactivateUser(userId: number, role: "user" | "admin" | "editor" | "viewer" = "user"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
// ─── App Settings (robots.txt, SEO defaults stored as audit-log entries) ──────
// We store settings as JSON in a dedicated seo_tasks row with taskType="settings"
export async function getSeoSettings(): Promise<Record<string, string> | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db
    .select()
    .from(seoTasks)
    .where(sql`${seoTasks.taskType} = 'app_settings'`)
    .orderBy(desc(seoTasks.createdAt))
    .limit(1);
  if (!row[0]?.result) return null;
  return row[0].result as Record<string, string>;
}
export async function saveSeoSettings(settings: Record<string, string>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Upsert: delete old settings row and insert new one
  await db.delete(seoTasks).where(sql`${seoTasks.taskType} = 'app_settings'`);
  await db.insert(seoTasks).values({
    articleId: 0,
    taskType: "app_settings",
    status: "completed",
    result: settings as any,
    completedAt: new Date(),
  });
}
