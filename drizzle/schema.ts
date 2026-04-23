import {
  boolean,
  date,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "editor", "viewer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  seoDescription: varchar("seoDescription", { length: 160 }),
  iconUrl: varchar("iconUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Articles ─────────────────────────────────────────────────────────────────
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  h1: varchar("h1", { length: 255 }).notNull().default(""),
  metaDescription: varchar("metaDescription", { length: 160 }).notNull().default(""),
  metaKeywords: varchar("metaKeywords", { length: 255 }),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 300 }),
  ogImage: varchar("ogImage", { length: 500 }),
  twitterTitle: varchar("twitterTitle", { length: 255 }),
  twitterDescription: varchar("twitterDescription", { length: 300 }),
  canonicalUrl: varchar("canonicalUrl", { length: 500 }),
  content: text("content").notNull().default(""),
  excerpt: varchar("excerpt", { length: 500 }),
  featuredImageUrl: varchar("featuredImageUrl", { length: 500 }),
  featuredImageAlt: varchar("featuredImageAlt", { length: 255 }),
  internalLinks: json("internalLinks"),
  relatedArticles: json("relatedArticles"),
  schemaType: varchar("schemaType", { length: 50 }),
  schemaJson: json("schemaJson"),
  targetKeyword: varchar("targetKeyword", { length: 255 }),
  keywordDensity: float("keywordDensity"),
  readabilityScore: int("readabilityScore"),
  seoScore: int("seoScore"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"),
  views: int("views").default(0),
  avgTimeOnPage: int("avgTimeOnPage"),
  bounceRate: float("bounceRate"),
  indexed: boolean("indexed").default(false),
  indexedAt: timestamp("indexedAt"),
  googleRank: int("googleRank"),
  googleRankUpdatedAt: timestamp("googleRankUpdatedAt"),
  authorId: int("authorId"),
  categoryId: int("categoryId"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ─── Article Versions ─────────────────────────────────────────────────────────
export const articleVersions = mysqlTable("article_versions", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  version: int("version").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  metaDescription: varchar("metaDescription", { length: 160 }),
  h1: varchar("h1", { length: 255 }),
  savedById: int("savedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleVersion = typeof articleVersions.$inferSelect;

// ─── Keywords ─────────────────────────────────────────────────────────────────
export const keywords = mysqlTable("keywords", {
  id: int("id").autoincrement().primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull().unique(),
  searchVolume: int("searchVolume"),
  keywordDifficulty: int("keywordDifficulty"),
  cpc: float("cpc"),
  competition: float("competition"),
  trend: mysqlEnum("trend", ["up", "down", "stable"]),
  currentRank: int("currentRank"),
  previousRank: int("previousRank"),
  rankUpdatedAt: timestamp("rankUpdatedAt"),
  targetArticleId: int("targetArticleId"),
  targetPosition: int("targetPosition").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = typeof keywords.$inferInsert;

// ─── Internal Links ───────────────────────────────────────────────────────────
export const internalLinks = mysqlTable("internal_links", {
  id: int("id").autoincrement().primaryKey(),
  fromArticleId: int("fromArticleId").notNull(),
  toArticleId: int("toArticleId").notNull(),
  anchorText: varchar("anchorText", { length: 255 }),
  linkType: mysqlEnum("linkType", ["primary", "secondary", "contextual"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InternalLink = typeof internalLinks.$inferSelect;

// ─── SEO Tasks ────────────────────────────────────────────────────────────────
export const seoTasks = mysqlTable("seo_tasks", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  taskType: varchar("taskType", { length: 50 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  result: json("result"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SeoTask = typeof seoTasks.$inferSelect;

// ─── Article Analytics ────────────────────────────────────────────────────────
export const articleAnalytics = mysqlTable("article_analytics", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  date: date("date").notNull(),
  views: int("views"),
  clicks: int("clicks"),
  impressions: int("impressions"),
  avgPosition: float("avgPosition"),
  ctr: float("ctr"),
  avgTimeOnPage: int("avgTimeOnPage"),
  bounceRate: float("bounceRate"),
});

export type ArticleAnalytic = typeof articleAnalytics.$inferSelect;

// ─── Competitors ──────────────────────────────────────────────────────────────
export const competitors = mysqlTable("competitors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  authorityScore: int("authorityScore"),
  backlinksCount: int("backlinksCount"),
  topKeywords: json("topKeywords"),
  lastAnalyzed: timestamp("lastAnalyzed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

// ─── Content Calendar ─────────────────────────────────────────────────────────
export const contentCalendar = mysqlTable("content_calendar", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  targetKeyword: varchar("targetKeyword", { length: 255 }),
  scheduledDate: date("scheduledDate").notNull(),
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]).default("planned"),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  assignedTo: int("assignedTo"),
  notes: text("notes"),
  articleId: int("articleId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEvent = typeof contentCalendar.$inferSelect;
export type InsertCalendarEvent = typeof contentCalendar.$inferInsert;

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
