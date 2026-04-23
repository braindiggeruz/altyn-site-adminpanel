import {
  boolean,
  date,
  doublePrecision,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin", "editor", "viewer"]);
export const statusEnum = pgEnum("status", ["draft", "scheduled", "published", "archived"]);
export const trendEnum = pgEnum("trend", ["up", "down", "stable"]);
export const linkTypeEnum = pgEnum("linkType", ["primary", "secondary", "contextual"]);
export const seoTaskStatusEnum = pgEnum("seo_task_status", ["pending", "processing", "completed", "failed"]);
export const calendarStatusEnum = pgEnum("calendar_status", ["planned", "in_progress", "completed"]);
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: roleEnum("role").default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  seoDescription: varchar("seoDescription", { length: 160 }),
  iconUrl: varchar("iconUrl", { length: 500 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Articles ─────────────────────────────────────────────────────────────────
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
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
  keywordDensity: doublePrecision("keywordDensity"),
  readabilityScore: integer("readabilityScore"),
  seoScore: integer("seoScore"),
  status: statusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("publishedAt", { withTimezone: true }),
  scheduledAt: timestamp("scheduledAt", { withTimezone: true }),
  views: integer("views").default(0),
  avgTimeOnPage: integer("avgTimeOnPage"),
  bounceRate: doublePrecision("bounceRate"),
  indexed: boolean("indexed").default(false),
  indexedAt: timestamp("indexedAt", { withTimezone: true }),
  googleRank: integer("googleRank"),
  googleRankUpdatedAt: timestamp("googleRankUpdatedAt", { withTimezone: true }),
  authorId: integer("authorId"),
  categoryId: integer("categoryId"),
  tags: json("tags"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ─── Article Versions ─────────────────────────────────────────────────────────
export const articleVersions = pgTable("article_versions", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull(),
  version: integer("version").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  metaDescription: varchar("metaDescription", { length: 160 }),
  h1: varchar("h1", { length: 255 }),
  savedById: integer("savedById"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type ArticleVersion = typeof articleVersions.$inferSelect;

// ─── Keywords ─────────────────────────────────────────────────────────────────
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull().unique(),
  searchVolume: integer("searchVolume"),
  keywordDifficulty: integer("keywordDifficulty"),
  cpc: doublePrecision("cpc"),
  competition: doublePrecision("competition"),
  trend: trendEnum("trend"),
  currentRank: integer("currentRank"),
  previousRank: integer("previousRank"),
  rankUpdatedAt: timestamp("rankUpdatedAt", { withTimezone: true }),
  targetArticleId: integer("targetArticleId"),
  targetPosition: integer("targetPosition").default(1),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = typeof keywords.$inferInsert;

// ─── Internal Links ───────────────────────────────────────────────────────────
export const internalLinks = pgTable("internal_links", {
  id: serial("id").primaryKey(),
  fromArticleId: integer("fromArticleId").notNull(),
  toArticleId: integer("toArticleId").notNull(),
  anchorText: varchar("anchorText", { length: 255 }),
  linkType: linkTypeEnum("linkType"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type InternalLink = typeof internalLinks.$inferSelect;

// ─── SEO Tasks ────────────────────────────────────────────────────────────────
export const seoTasks = pgTable("seo_tasks", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull(),
  taskType: varchar("taskType", { length: 50 }),
  status: seoTaskStatusEnum("status").default("pending"),
  result: json("result"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type SeoTask = typeof seoTasks.$inferSelect;

// ─── Article Analytics ────────────────────────────────────────────────────────
export const articleAnalytics = pgTable("article_analytics", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull(),
  date: date("date").notNull(),
  views: integer("views"),
  clicks: integer("clicks"),
  impressions: integer("impressions"),
  avgPosition: doublePrecision("avgPosition"),
  ctr: doublePrecision("ctr"),
  avgTimeOnPage: integer("avgTimeOnPage"),
  bounceRate: doublePrecision("bounceRate"),
});

export type ArticleAnalytic = typeof articleAnalytics.$inferSelect;

// ─── Competitors ──────────────────────────────────────────────────────────────
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  authorityScore: integer("authorityScore"),
  backlinksCount: integer("backlinksCount"),
  topKeywords: json("topKeywords"),
  lastAnalyzed: timestamp("lastAnalyzed", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

// ─── Content Calendar ─────────────────────────────────────────────────────────
export const contentCalendar = pgTable("content_calendar", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  targetKeyword: varchar("targetKeyword", { length: 255 }),
  scheduledDate: date("scheduledDate").notNull(),
  status: calendarStatusEnum("status").default("planned"),
  priority: priorityEnum("priority").default("medium"),
  assignedTo: integer("assignedTo"),
  notes: text("notes"),
  articleId: integer("articleId"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type CalendarEvent = typeof contentCalendar.$inferSelect;
export type InsertCalendarEvent = typeof contentCalendar.$inferInsert;

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  action: varchar("action", { length: 100 }),
  entityType: varchar("entityType", { length: 50 }),
  entityId: integer("entityId"),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
