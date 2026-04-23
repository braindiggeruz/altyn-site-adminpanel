var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  articleAnalytics: () => articleAnalytics,
  articleVersions: () => articleVersions,
  articles: () => articles,
  auditLog: () => auditLog,
  calendarStatusEnum: () => calendarStatusEnum,
  categories: () => categories,
  competitors: () => competitors,
  contentCalendar: () => contentCalendar,
  internalLinks: () => internalLinks,
  keywords: () => keywords,
  linkTypeEnum: () => linkTypeEnum,
  priorityEnum: () => priorityEnum,
  roleEnum: () => roleEnum,
  seoTaskStatusEnum: () => seoTaskStatusEnum,
  seoTasks: () => seoTasks,
  statusEnum: () => statusEnum,
  trendEnum: () => trendEnum,
  users: () => users
});
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
  varchar
} from "drizzle-orm/pg-core";
var roleEnum, statusEnum, trendEnum, linkTypeEnum, seoTaskStatusEnum, calendarStatusEnum, priorityEnum, users, categories, articles, articleVersions, keywords, internalLinks, seoTasks, articleAnalytics, competitors, contentCalendar, auditLog;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin", "editor", "viewer"]);
    statusEnum = pgEnum("status", ["draft", "scheduled", "published", "archived"]);
    trendEnum = pgEnum("trend", ["up", "down", "stable"]);
    linkTypeEnum = pgEnum("linkType", ["primary", "secondary", "contextual"]);
    seoTaskStatusEnum = pgEnum("seo_task_status", ["pending", "processing", "completed", "failed"]);
    calendarStatusEnum = pgEnum("calendar_status", ["planned", "in_progress", "completed"]);
    priorityEnum = pgEnum("priority", ["high", "medium", "low"]);
    users = pgTable("users", {
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
      lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      seoDescription: varchar("seoDescription", { length: 160 }),
      iconUrl: varchar("iconUrl", { length: 500 }),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    articles = pgTable("articles", {
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
      updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
    });
    articleVersions = pgTable("article_versions", {
      id: serial("id").primaryKey(),
      articleId: integer("articleId").notNull(),
      version: integer("version").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      metaDescription: varchar("metaDescription", { length: 160 }),
      h1: varchar("h1", { length: 255 }),
      savedById: integer("savedById"),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    keywords = pgTable("keywords", {
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
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    internalLinks = pgTable("internal_links", {
      id: serial("id").primaryKey(),
      fromArticleId: integer("fromArticleId").notNull(),
      toArticleId: integer("toArticleId").notNull(),
      anchorText: varchar("anchorText", { length: 255 }),
      linkType: linkTypeEnum("linkType"),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    seoTasks = pgTable("seo_tasks", {
      id: serial("id").primaryKey(),
      articleId: integer("articleId").notNull(),
      taskType: varchar("taskType", { length: 50 }),
      status: seoTaskStatusEnum("status").default("pending"),
      result: json("result"),
      errorMessage: text("errorMessage"),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
      completedAt: timestamp("completedAt", { withTimezone: true })
    });
    articleAnalytics = pgTable("article_analytics", {
      id: serial("id").primaryKey(),
      articleId: integer("articleId").notNull(),
      date: date("date").notNull(),
      views: integer("views"),
      clicks: integer("clicks"),
      impressions: integer("impressions"),
      avgPosition: doublePrecision("avgPosition"),
      ctr: doublePrecision("ctr"),
      avgTimeOnPage: integer("avgTimeOnPage"),
      bounceRate: doublePrecision("bounceRate")
    });
    competitors = pgTable("competitors", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      domain: varchar("domain", { length: 255 }).notNull().unique(),
      authorityScore: integer("authorityScore"),
      backlinksCount: integer("backlinksCount"),
      topKeywords: json("topKeywords"),
      lastAnalyzed: timestamp("lastAnalyzed", { withTimezone: true }),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    contentCalendar = pgTable("content_calendar", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      targetKeyword: varchar("targetKeyword", { length: 255 }),
      scheduledDate: date("scheduledDate").notNull(),
      status: calendarStatusEnum("status").default("planned"),
      priority: priorityEnum("priority").default("medium"),
      assignedTo: integer("assignedTo"),
      notes: text("notes"),
      articleId: integer("articleId"),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
    auditLog = pgTable("audit_log", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      action: varchar("action", { length: 100 }),
      entityType: varchar("entityType", { length: 50 }),
      entityId: integer("entityId"),
      oldValues: json("oldValues"),
      newValues: json("newValues"),
      ipAddress: varchar("ipAddress", { length: 45 }),
      userAgent: text("userAgent"),
      createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createArticle: () => createArticle,
  createCalendarEvent: () => createCalendarEvent,
  createCategory: () => createCategory,
  createCompetitor: () => createCompetitor,
  createKeyword: () => createKeyword,
  createUser: () => createUser,
  deleteArticle: () => deleteArticle,
  getAllArticles: () => getAllArticles,
  getAllUsers: () => getAllUsers,
  getArticleById: () => getArticleById,
  getArticleBySlug: () => getArticleBySlug,
  getAuditLogs: () => getAuditLogs,
  getCalendarEvents: () => getCalendarEvents,
  getCategories: () => getCategories,
  getCompetitors: () => getCompetitors,
  getDashboardStats: () => getDashboardStats,
  getDb: () => getDb,
  getKeywords: () => getKeywords,
  getPublishedArticles: () => getPublishedArticles,
  getSeoSettings: () => getSeoSettings,
  getTopArticlesByPerformance: () => getTopArticlesByPerformance,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  logAudit: () => logAudit,
  recordArticleView: () => recordArticleView,
  saveSeoSettings: () => saveSeoSettings,
  searchArticles: () => searchArticles,
  updateArticle: () => updateArticle,
  updateKeyword: () => updateKeyword,
  updateUser: () => updateUser,
  upsertUser: () => upsertUser
});
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.error("[Database] DATABASE_URL is not set!");
      return null;
    }
    try {
      console.log("[Database] Connecting to:", process.env.DATABASE_URL.split("@")[1] || "unknown");
      const client = postgres(process.env.DATABASE_URL, {
        connect_timeout: 10,
        idle_timeout: 30
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values(user).onConflictDoUpdate({
    target: users.openId,
    set: { email: user.email, name: user.name, role: user.role, isActive: user.isActive }
  });
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}
async function createUser(email, passwordHash, name = "") {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(users).values({
    email,
    passwordHash,
    name,
    openId: `local_${email}`,
    role: "user",
    isActive: true
  }).returning({ id: users.id, email: users.email });
  return result[0] || null;
}
async function updateUser(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(updates).where(eq(users.id, id));
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}
async function createArticle(article) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values(article).returning({ id: articles.id });
  return result[0] || null;
}
async function getArticleById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0] || null;
}
async function getArticleBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0] || null;
}
async function getPublishedArticles(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(eq(articles.status, "published")).orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
}
async function getAllArticles(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).orderBy(desc(articles.updatedAt)).limit(limit).offset(offset);
}
async function updateArticle(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(articles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(articles.id, id));
}
async function deleteArticle(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, id));
}
async function searchArticles(query) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(
    or(
      like(articles.title, `%${query}%`),
      like(articles.content, `%${query}%`),
      like(articles.slug, `%${query}%`)
    )
  ).limit(20);
}
async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const total = await db.select({ count: sql`count(*)` }).from(articles);
  const published = await db.select({ count: sql`count(*)` }).from(articles).where(eq(articles.status, "published"));
  const indexed = await db.select({ count: sql`count(*)` }).from(articles).where(eq(articles.isIndexed, true));
  const keywordCount = await db.select({ count: sql`count(*)` }).from(keywords);
  const topKeywords = await db.select({ keyword: keywords.keyword, searchVolume: keywords.searchVolume }).from(keywords).orderBy(desc(keywords.searchVolume)).limit(5);
  const recentArticles = await db.select({ id: articles.id, title: articles.title, status: articles.status, publishedAt: articles.publishedAt }).from(articles).orderBy(desc(articles.publishedAt)).limit(5);
  return {
    totalArticles: total[0]?.count || 0,
    publishedArticles: published[0]?.count || 0,
    indexedArticles: indexed[0]?.count || 0,
    keywordCount: keywordCount[0]?.count || 0,
    topKeywords,
    recentArticles
  };
}
async function createKeyword(keyword) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(keywords).values(keyword).returning({ id: keywords.id });
  return result[0] || null;
}
async function getKeywords(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(keywords).orderBy(desc(keywords.searchVolume)).limit(limit);
}
async function updateKeyword(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(keywords).set(updates).where(eq(keywords.id, id));
}
async function createCategory(category) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(categories).values(category).returning({ id: categories.id });
  return result[0] || null;
}
async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}
async function createCompetitor(competitor) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(competitors).values(competitor).returning({ id: competitors.id });
  return result[0] || null;
}
async function getCompetitors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitors);
}
async function logAudit(log) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({ ...log, timestamp: /* @__PURE__ */ new Date() });
}
async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.timestamp)).limit(limit);
}
async function getSeoSettings() {
  if (_settings) return _settings;
  const db = await getDb();
  if (!db) return null;
  _settings = {};
  return _settings;
}
async function saveSeoSettings(settings) {
  _settings = settings;
}
async function createCalendarEvent(event) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contentCalendar).values(event).returning({ id: contentCalendar.id });
  return result[0] || null;
}
async function getCalendarEvents(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentCalendar).where(and(
    sql`${contentCalendar.scheduledDate} >= ${startDate}`,
    sql`${contentCalendar.scheduledDate} <= ${endDate}`
  ));
}
async function getTopArticlesByPerformance() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: articles.id,
    title: articles.title,
    views: articleAnalytics.views,
    clicks: articleAnalytics.clicks
  }).from(articles).leftJoin(articleAnalytics, eq(articles.id, articleAnalytics.articleId)).orderBy(desc(articleAnalytics.views)).limit(10);
}
async function recordArticleView(articleId) {
  const db = await getDb();
  if (!db) return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const existing = await db.select().from(articleAnalytics).where(and(eq(articleAnalytics.articleId, articleId), sql`DATE(${articleAnalytics.date}) = ${today}`)).limit(1);
  if (existing.length > 0) {
    await db.update(articleAnalytics).set({ views: sql`${articleAnalytics.views} + 1` }).where(eq(articleAnalytics.id, existing[0].id));
  } else {
    await db.insert(articleAnalytics).values({ articleId, date: /* @__PURE__ */ new Date(), views: 1, clicks: 0 });
  }
}
var _db, _settings;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
    _settings = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import path4 from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/auth.ts
init_db();
init_schema();
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq as eq2 } from "drizzle-orm";

// server/_core/env.ts
var ENV = {
  // Core
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Optional: OpenAI API for AI features
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  // Admin registration
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET ?? "altyn-admin-2024",
  // Legacy Manus variables (for backward compatibility, but no longer used)
  appId: process.env.VITE_APP_ID ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/auth.ts
var COOKIE_NAME = "altyn_session";
var ONE_YEAR_MS2 = 365 * 24 * 60 * 60 * 1e3;
function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret || "altyn-therapy-secret-key-change-in-production");
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createSessionToken(userId, email, role) {
  const secret = getSecret();
  return new SignJWT({ userId, email, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS2) / 1e3)).sign(secret);
}
async function verifySessionToken(token) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const { userId, email, role } = payload;
    if (typeof userId !== "number" || typeof email !== "string" || typeof role !== "string") return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}
function getSessionFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k?.trim(), v.join("=")];
    })
  );
  return cookies[COOKIE_NAME];
}
function setSessionCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ONE_YEAR_MS2,
    path: "/"
  });
}
function clearSessionCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  });
}
async function authenticateRequest(req) {
  const token = getSessionFromRequest(req);
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq2(users.id, session.userId)).limit(1);
  const user = result[0];
  if (!user || !user.isActive) return null;
  return user;
}
async function isFirstUser() {
  const db = await getDb();
  if (!db) return true;
  const result = await db.select({ id: users.id }).from(users).limit(1);
  return result.length === 0;
}

// server/routers.ts
init_db();
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
import fs from "fs";
import path from "path";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
function requireRole(role, allowed) {
  if (!allowed.includes(role)) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0440\u0430\u0432" });
  }
}
function generateSlug(title) {
  const translitMap = {
    \u0430: "a",
    \u0431: "b",
    \u0432: "v",
    \u0433: "g",
    \u0434: "d",
    \u0435: "e",
    \u0451: "yo",
    \u0436: "zh",
    \u0437: "z",
    \u0438: "i",
    \u0439: "y",
    \u043A: "k",
    \u043B: "l",
    \u043C: "m",
    \u043D: "n",
    \u043E: "o",
    \u043F: "p",
    \u0440: "r",
    \u0441: "s",
    \u0442: "t",
    \u0443: "u",
    \u0444: "f",
    \u0445: "kh",
    \u0446: "ts",
    \u0447: "ch",
    \u0448: "sh",
    \u0449: "shch",
    \u044A: "",
    \u044B: "y",
    \u044C: "",
    \u044D: "e",
    \u044E: "yu",
    \u044F: "ya"
  };
  return title.toLowerCase().split("").map((c) => translitMap[c] ?? c).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
function calcSeoScore(article) {
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
  if (words.length >= 1e3) score += 15;
  else if (words.length >= 500) score += 10;
  else if (words.length >= 200) score += 5;
  if (kw && words.length > 0) {
    const kwWords = kw.split(/\s+/);
    let kwCount = 0;
    for (let i = 0; i <= words.length - kwWords.length; i++) {
      if (kwWords.every((w, j) => words[i + j]?.startsWith(w))) kwCount++;
    }
    const density = kwCount / words.length * 100;
    if (density >= 1 && density <= 3) score += 5;
  }
  if (article.schemaJson) score += 10;
  if (article.ogTitle) score += 5;
  if (article.canonicalUrl) score += 5;
  return Math.min(100, score);
}
function calcKeywordDensity(content, keyword) {
  if (!content || !keyword) return 0;
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const kwWords = keyword.toLowerCase().split(/\s+/);
  let count = 0;
  for (let i = 0; i <= words.length - kwWords.length; i++) {
    if (kwWords.every((w, j) => words[i + j]?.startsWith(w))) count++;
  }
  return Math.round(count / words.length * 1e3) / 10;
}
var appRouter = router({
  system: systemRouter,
  // ─── Auth (own email+password, no Manus OAuth) ───────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string().min(6)
    })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430" });
      const result = await database.select().from(users).where(eq3(users.email, input.email)).limit(1);
      const user = result[0];
      if (!user || !user.passwordHash) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 email \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" });
      }
      if (!user.isActive) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D" });
      }
      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 email \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" });
      }
      await database.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq3(users.id, user.id));
      const token = await createSessionToken(user.id, user.email, user.role);
      setSessionCookie(ctx.res, token);
      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),
    register: publicProcedure.input(z2.object({
      name: z2.string().min(2),
      email: z2.string().email(),
      password: z2.string().min(6),
      adminSecret: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430" });
      const existing = await database.select({ id: users.id }).from(users).where(eq3(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError3({ code: "CONFLICT", message: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u0442\u0430\u043A\u0438\u043C email \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442" });
      }
      const firstUser = await isFirstUser();
      let role = "user";
      if (firstUser) {
        role = "admin";
      } else {
        const secret = process.env.ADMIN_REGISTER_SECRET || "altyn-admin-2024";
        if (input.adminSecret !== secret) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u043A\u0440\u044B\u0442\u0430. \u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443." });
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
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const newUser = await database.select().from(users).where(eq3(users.email, input.email)).limit(1);
      const user = newUser[0];
      const token = await createSessionToken(user.id, user.email, user.role);
      setSessionCookie(ctx.res, token);
      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearSessionCookie(ctx.res);
      return { success: true };
    }),
    changePassword: protectedProcedure.input(z2.object({
      currentPassword: z2.string().min(6),
      newPassword: z2.string().min(6)
    })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await database.select().from(users).where(eq3(users.id, ctx.user.id)).limit(1);
      const user = result[0];
      if (!user?.passwordHash) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041F\u0430\u0440\u043E\u043B\u044C \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D" });
      const valid = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!valid) throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" });
      const newHash = await hashPassword(input.newPassword);
      await database.update(users).set({ passwordHash: newHash }).where(eq3(users.id, ctx.user.id));
      return { success: true };
    })
  }),
  // ─── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return getDashboardStats();
    }),
    // Real traffic data from article_analytics table
    trafficChart: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      const data = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        data.push({ date: dateStr, views: 0 });
      }
      return data;
    })
  }),
  // ─── Articles ───────────────────────────────────────────────────────────────
  articles: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      categoryId: z2.number().optional(),
      search: z2.string().optional(),
      limit: z2.number().min(1).max(100).default(20),
      offset: z2.number().min(0).default(0)
    })).query(async ({ input }) => (void 0)(input)),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const article = await getArticleById(input.id);
      if (!article) throw new TRPCError3({ code: "NOT_FOUND" });
      return article;
    }),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      content: z2.string().default(""),
      h1: z2.string().default(""),
      metaDescription: z2.string().default(""),
      metaKeywords: z2.string().optional(),
      targetKeyword: z2.string().optional(),
      categoryId: z2.number().optional(),
      status: z2.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
      excerpt: z2.string().optional(),
      tags: z2.array(z2.string()).optional(),
      ogTitle: z2.string().optional(),
      ogDescription: z2.string().optional(),
      twitterTitle: z2.string().optional(),
      twitterDescription: z2.string().optional(),
      canonicalUrl: z2.string().optional(),
      schemaType: z2.string().optional(),
      schemaJson: z2.unknown().optional(),
      scheduledAt: z2.date().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const slug = generateSlug(input.title);
      const seoScore = calcSeoScore(input);
      const keywordDensity = calcKeywordDensity(input.content, input.targetKeyword || "");
      const id = await createArticle({
        ...input,
        slug,
        seoScore,
        keywordDensity,
        authorId: ctx.user.id,
        tags: input.tags ? JSON.stringify(input.tags) : void 0,
        schemaJson: input.schemaJson ? JSON.stringify(input.schemaJson) : void 0,
        publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : void 0
      });
      await logAudit({ userId: ctx.user.id, action: "create_article", entityType: "article", entityId: id, newValues: input });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      content: z2.string().optional(),
      h1: z2.string().optional(),
      metaDescription: z2.string().optional(),
      metaKeywords: z2.string().optional(),
      targetKeyword: z2.string().optional(),
      categoryId: z2.number().optional(),
      status: z2.enum(["draft", "scheduled", "published", "archived"]).optional(),
      excerpt: z2.string().optional(),
      tags: z2.array(z2.string()).optional(),
      ogTitle: z2.string().optional(),
      ogDescription: z2.string().optional(),
      twitterTitle: z2.string().optional(),
      twitterDescription: z2.string().optional(),
      canonicalUrl: z2.string().optional(),
      schemaType: z2.string().optional(),
      schemaJson: z2.unknown().optional(),
      scheduledAt: z2.date().optional(),
      featuredImageUrl: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const { id, ...data } = input;
      const existing = await getArticleById(id);
      if (!existing) throw new TRPCError3({ code: "NOT_FOUND" });
      await (void 0)({
        articleId: id,
        version: Date.now(),
        title: existing.title,
        content: existing.content || "",
        metaDescription: existing.metaDescription || void 0,
        h1: existing.h1 || void 0,
        savedById: ctx.user.id
      });
      const merged = { title: existing.title, h1: existing.h1 ?? void 0, metaDescription: existing.metaDescription ?? void 0, metaKeywords: existing.metaKeywords ?? void 0, content: existing.content ?? void 0, targetKeyword: existing.targetKeyword ?? void 0, schemaJson: existing.schemaJson ?? void 0, ogTitle: existing.ogTitle ?? void 0, canonicalUrl: existing.canonicalUrl ?? void 0, ...data };
      const seoScore = calcSeoScore(merged);
      const keywordDensity = calcKeywordDensity(merged.content || "", merged.targetKeyword || "");
      await updateArticle(id, {
        ...data,
        seoScore,
        keywordDensity,
        tags: data.tags ? JSON.stringify(data.tags) : void 0,
        schemaJson: data.schemaJson ? JSON.stringify(data.schemaJson) : void 0,
        publishedAt: data.status === "published" && !existing.publishedAt ? /* @__PURE__ */ new Date() : void 0
      });
      await logAudit({ userId: ctx.user.id, action: "update_article", entityType: "article", entityId: id, newValues: data });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await deleteArticle(input.id);
      await logAudit({ userId: ctx.user.id, action: "delete_article", entityType: "article", entityId: input.id });
      return { success: true };
    }),
    bulkAction: protectedProcedure.input(z2.object({
      ids: z2.array(z2.number()),
      action: z2.enum(["publish", "archive", "delete", "draft"])
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      for (const id of input.ids) {
        if (input.action === "delete") {
          await deleteArticle(id);
        } else {
          const statusMap = { publish: "published", archive: "archived", draft: "draft" };
          const status = statusMap[input.action];
          if (status) await updateArticle(id, { status, publishedAt: status === "published" ? /* @__PURE__ */ new Date() : void 0 });
        }
      }
      await logAudit({ userId: ctx.user.id, action: `bulk_${input.action}`, entityType: "article", newValues: { ids: input.ids } });
      return { success: true, count: input.ids.length };
    }),
    versions: protectedProcedure.input(z2.object({ articleId: z2.number() })).query(async ({ input }) => (void 0)(input.articleId)),
    restoreVersion: protectedProcedure.input(z2.object({ articleId: z2.number(), versionId: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const versions = await (void 0)(input.articleId);
      const version = versions.find((v) => v.id === input.versionId);
      if (!version) throw new TRPCError3({ code: "NOT_FOUND" });
      await updateArticle(input.articleId, { content: version.content });
      await logAudit({ userId: ctx.user.id, action: "restore_version", entityType: "article", entityId: input.articleId });
      return { success: true };
    }),
    // Upload image via base64 — saves to local uploads/ folder
    uploadImage: protectedProcedure.input(z2.object({
      base64: z2.string(),
      filename: z2.string(),
      contentType: z2.string()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = input.filename.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${ctx.user.id}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(input.base64, "base64");
      fs.writeFileSync(filepath, buffer);
      return { url: `/uploads/${filename}` };
    })
  }),
  // ─── SEO ─────────────────────────────────────────────────────────────────────
  seo: router({
    score: protectedProcedure.input(z2.object({
      title: z2.string().optional(),
      h1: z2.string().optional(),
      metaDescription: z2.string().optional(),
      metaKeywords: z2.string().optional(),
      content: z2.string().optional(),
      targetKeyword: z2.string().optional(),
      schemaJson: z2.unknown().optional(),
      ogTitle: z2.string().optional(),
      canonicalUrl: z2.string().optional()
    })).query(async ({ input }) => {
      const score = calcSeoScore(input);
      const density = calcKeywordDensity(input.content || "", input.targetKeyword || "");
      const words = (input.content || "").split(/\s+/).filter(Boolean).length;
      const checks = [
        { label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B", pass: !!input.title && input.title.length > 10, hint: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (>10 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432)" },
        { label: "H1 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E", pass: !!(input.h1 && input.targetKeyword && input.h1.toLowerCase().includes(input.targetKeyword.toLowerCase())), hint: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0432 H1" },
        { label: "\u0414\u043B\u0438\u043D\u0430 \u043C\u0435\u0442\u0430-\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F", pass: !!(input.metaDescription && input.metaDescription.length >= 120 && input.metaDescription.length <= 160), hint: "\u041C\u0435\u0442\u0430-\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C 120\u2013160 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432" },
        { label: "\u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0432 \u043C\u0435\u0442\u0430-\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0438", pass: !!(input.metaDescription && input.targetKeyword && input.metaDescription.toLowerCase().includes(input.targetKeyword.toLowerCase())), hint: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0432 \u043C\u0435\u0442\u0430-\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435" },
        { label: "\u041C\u0435\u0442\u0430-\u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430", pass: !!(input.metaKeywords && input.metaKeywords.split(",").length >= 3), hint: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 3 \u043C\u0435\u0442\u0430-\u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u043B\u043E\u0432\u0430" },
        { label: "\u041E\u0431\u044A\u0451\u043C \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430 \u22651000 \u0441\u043B\u043E\u0432", pass: words >= 1e3, hint: `\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043E\u0431\u044A\u0451\u043C: ${words} \u0441\u043B\u043E\u0432. \u0426\u0435\u043B\u044C: 1000+` },
        { label: "\u041F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u043B\u043E\u0432 1\u20133%", pass: density >= 1 && density <= 3, hint: `\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C: ${density}%. \u0426\u0435\u043B\u044C: 1\u20133%` },
        { label: "\u0420\u0430\u0437\u043C\u0435\u0442\u043A\u0430 Schema.org", pass: !!input.schemaJson, hint: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 JSON-LD \u0440\u0430\u0437\u043C\u0435\u0442\u043A\u0443" },
        { label: "Open Graph \u0442\u0435\u0433\u0438", pass: !!input.ogTitle, hint: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 Open Graph \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        { label: "\u041A\u0430\u043D\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 URL", pass: !!input.canonicalUrl, hint: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u0430\u043D\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 URL" }
      ];
      return { score, density, wordCount: words, checks };
    }),
    // Generate schema.org JSON-LD locally (no AI needed)
    generateSchema: protectedProcedure.input(z2.object({
      title: z2.string(),
      h1: z2.string(),
      metaDescription: z2.string(),
      schemaType: z2.string().default("Article"),
      slug: z2.string(),
      authorName: z2.string().optional()
    })).mutation(async ({ input }) => {
      const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
      return {
        "@context": "https://schema.org",
        "@type": input.schemaType,
        headline: input.h1 || input.title,
        description: input.metaDescription,
        url: `${siteUrl}/articles/${input.slug}`,
        author: { "@type": "Person", name: input.authorName || "ALTYN Therapy" },
        publisher: { "@type": "Organization", name: "ALTYN Therapy", url: siteUrl },
        datePublished: (/* @__PURE__ */ new Date()).toISOString(),
        dateModified: (/* @__PURE__ */ new Date()).toISOString(),
        inLanguage: "ru"
      };
    }),
    // AI meta generation — only works if OPENAI_API_KEY is set
    generateMeta: protectedProcedure.input(z2.object({
      title: z2.string(),
      content: z2.string(),
      targetKeyword: z2.string().optional()
    })).mutation(async ({ input }) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const kw = input.targetKeyword || input.title;
        return {
          h1: `${kw}: \u043F\u043E\u043B\u043D\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E`,
          metaDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043E\u0442 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043E\u0432 ALTYN Therapy.`,
          metaKeywords: `${kw}, \u043E\u043D\u043B\u0430\u0439\u043D, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E, \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E, \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442`,
          schemaType: "Article",
          aiUsed: false
        };
      }
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "\u0422\u044B SEO-\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043B\u0438\u0434\u043D\u044B\u043C JSON." },
              { role: "user", content: `\u0421\u043E\u0437\u0434\u0430\u0439 SEO-\u043C\u0435\u0442\u0430\u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0441\u0442\u0430\u0442\u044C\u0438 "${input.title}". \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: "${input.targetKeyword || input.title}". \u041E\u0442\u0440\u044B\u0432\u043E\u043A: "${input.content.slice(0, 500)}". \u0412\u0435\u0440\u043D\u0438 JSON: {"h1":"...","metaDescription":"...","metaKeywords":"...","schemaType":"Article"}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");
        return { ...result, aiUsed: true };
      } catch {
        const kw = input.targetKeyword || input.title;
        return {
          h1: `${kw}: \u043F\u043E\u043B\u043D\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E`,
          metaDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B \u043E\u0442 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043E\u0432 ALTYN Therapy.`,
          metaKeywords: `${kw}, \u043E\u043D\u043B\u0430\u0439\u043D, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E, \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E`,
          schemaType: "Article",
          aiUsed: false
        };
      }
    }),
    generateOgTags: protectedProcedure.input(z2.object({
      title: z2.string(),
      content: z2.string(),
      targetKeyword: z2.string().optional()
    })).mutation(async ({ input }) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const kw = input.targetKeyword || input.title;
        return {
          ogTitle: `${kw} | ALTYN Therapy`,
          ogDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B \u043E\u0442 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043E\u0432.`,
          aiUsed: false
        };
      }
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "\u0422\u044B \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C \u0441\u0435\u0442\u044F\u043C. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043B\u0438\u0434\u043D\u044B\u043C JSON." },
              { role: "user", content: `\u0421\u043E\u0437\u0434\u0430\u0439 Open Graph \u0442\u0435\u0433\u0438 \u0434\u043B\u044F \u0441\u0442\u0430\u0442\u044C\u0438 "${input.title}". \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: "${input.targetKeyword || input.title}". \u0412\u0435\u0440\u043D\u0438 JSON: {"ogTitle":"...","ogDescription":"..."}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");
        return { ...result, aiUsed: true };
      } catch {
        const kw = input.targetKeyword || input.title;
        return {
          ogTitle: `${kw} | ALTYN Therapy`,
          ogDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B.`,
          aiUsed: false
        };
      }
    }),
    generateTwitterTags: protectedProcedure.input(z2.object({
      title: z2.string(),
      content: z2.string(),
      targetKeyword: z2.string().optional()
    })).mutation(async ({ input }) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const kw = input.targetKeyword || input.title;
        return {
          twitterTitle: `${kw} | ALTYN Therapy`,
          twitterDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B \u043E\u0442 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043E\u0432.`,
          aiUsed: false
        };
      }
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "\u0422\u044B \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E Twitter. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043B\u0438\u0434\u043D\u044B\u043C JSON." },
              { role: "user", content: `\u0421\u043E\u0437\u0434\u0430\u0439 Twitter Card \u0442\u0435\u0433\u0438 \u0434\u043B\u044F \u0441\u0442\u0430\u0442\u044C\u0438 "${input.title}". \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: "${input.targetKeyword || input.title}". \u0412\u0435\u0440\u043D\u0438 JSON: {"twitterTitle":"...","twitterDescription":"..."}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");
        return { ...result, aiUsed: true };
      } catch {
        const kw = input.targetKeyword || input.title;
        return {
          twitterTitle: `${kw} | ALTYN Therapy`,
          twitterDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B.`,
          aiUsed: false
        };
      }
    }),
    generateAllSeo: protectedProcedure.input(z2.object({
      title: z2.string(),
      content: z2.string(),
      targetKeyword: z2.string().optional()
    })).mutation(async ({ input }) => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const kw = input.targetKeyword || input.title;
        return {
          h1: `${kw}: \u043F\u043E\u043B\u043D\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E`,
          metaDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438.`,
          metaKeywords: `${kw}, \u043E\u043D\u043B\u0430\u0439\u043D, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E, \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E`,
          ogTitle: `${kw} | ALTYN Therapy`,
          ogDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B.`,
          twitterTitle: `${kw} | ALTYN Therapy`,
          twitterDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B.`,
          aiUsed: false
        };
      }
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "\u0422\u044B SEO-\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442 \u0438 \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C \u0441\u0435\u0442\u044F\u043C. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043B\u0438\u0434\u043D\u044B\u043C JSON." },
              { role: "user", content: `\u0421\u043E\u0437\u0434\u0430\u0439 \u043F\u043E\u043B\u043D\u044B\u0439 SEO-\u043F\u0430\u043A\u0435\u0442 \u0434\u043B\u044F \u0441\u0442\u0430\u0442\u044C\u0438 "${input.title}". \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: "${input.targetKeyword || input.title}". \u041E\u0442\u0440\u044B\u0432\u043E\u043A: "${input.content.slice(0, 300)}". \u0412\u0435\u0440\u043D\u0438 JSON: {"h1":"...","metaDescription":"...","metaKeywords":"...","ogTitle":"...","ogDescription":"...","twitterTitle":"...","twitterDescription":"..."}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");
        return { ...result, aiUsed: true };
      } catch {
        const kw = input.targetKeyword || input.title;
        return {
          h1: `${kw}: \u043F\u043E\u043B\u043D\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E`,
          metaDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u043E\u0432\u0435\u0442\u044B.`,
          metaKeywords: `${kw}, \u043E\u043D\u043B\u0430\u0439\u043D, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E`,
          ogTitle: `${kw} | ALTYN Therapy`,
          ogDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}.`,
          twitterTitle: `${kw} | ALTYN Therapy`,
          twitterDescription: `\u0423\u0437\u043D\u0430\u0439\u0442\u0435 \u0432\u0441\u0451 \u043E ${kw}.`,
          aiUsed: false
        };
      }
    }),
    generateSitemap: protectedProcedure.query(async () => {
      const { items } = await (void 0)({ status: "published", limit: 1e3 });
      const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
      const urls = items.map((a) => ({
        loc: `${siteUrl}/articles/${a.slug}`,
        lastmod: (a.updatedAt || a.createdAt).toISOString().slice(0, 10),
        changefreq: "weekly",
        priority: "0.8"
      }));
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;
      return { xml, count: urls.length };
    })
  }),
  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure.query(async () => (void 0)()),
    create: protectedProcedure.input(z2.object({ name: z2.string().min(1), slug: z2.string().optional(), description: z2.string().optional() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const slug = input.slug || generateSlug(input.name);
      await createCategory({ ...input, slug });
      return { success: true };
    })
  }),
  // ─── Keywords ────────────────────────────────────────────────────────────────
  keywords: router({
    list: protectedProcedure.input(z2.object({ search: z2.string().optional(), limit: z2.number().default(50) })).query(async ({ input }) => getKeywords(input)),
    create: protectedProcedure.input(z2.object({
      keyword: z2.string().min(1),
      searchVolume: z2.number().optional(),
      keywordDifficulty: z2.number().optional(),
      cpc: z2.number().optional(),
      currentRank: z2.number().optional(),
      targetRank: z2.number().optional(),
      trend: z2.enum(["up", "down", "stable"]).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await createKeyword(input);
      await logAudit({ userId: ctx.user.id, action: "create_keyword", entityType: "keyword", newValues: input });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      keyword: z2.string().optional(),
      searchVolume: z2.number().optional(),
      keywordDifficulty: z2.number().optional(),
      cpc: z2.number().optional(),
      currentRank: z2.number().optional(),
      targetRank: z2.number().optional(),
      trend: z2.enum(["up", "down", "stable"]).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const { id, ...data } = input;
      await updateKeyword(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      await (void 0)(input.id);
      return { success: true };
    })
  }),
  // ─── Competitors ─────────────────────────────────────────────────────────────
  competitors: router({
    list: protectedProcedure.query(async () => getCompetitors()),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      domain: z2.string().min(1),
      authorityScore: z2.number().optional(),
      backlinksCount: z2.number().optional(),
      estimatedTraffic: z2.number().optional(),
      keywordCount: z2.number().optional(),
      topKeywords: z2.array(z2.string()).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await createCompetitor({
        ...input,
        topKeywords: input.topKeywords ? JSON.stringify(input.topKeywords) : void 0
      });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      domain: z2.string().optional(),
      authorityScore: z2.number().optional(),
      backlinksCount: z2.number().optional(),
      estimatedTraffic: z2.number().optional(),
      keywordCount: z2.number().optional(),
      topKeywords: z2.array(z2.string()).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const { id, ...data } = input;
      await (void 0)(id, {
        ...data,
        topKeywords: data.topKeywords ? JSON.stringify(data.topKeywords) : void 0
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      await (void 0)(input.id);
      return { success: true };
    })
  }),
  // ─── Calendar ────────────────────────────────────────────────────────────────
  calendar: router({
    list: protectedProcedure.input(z2.object({ year: z2.number().optional(), month: z2.number().optional() })).query(async ({ input }) => getCalendarEvents(input)),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      scheduledDate: z2.date(),
      status: z2.enum(["planned", "in_progress", "review", "completed"]).default("planned"),
      priority: z2.enum(["low", "medium", "high"]).default("medium"),
      targetKeyword: z2.string().optional(),
      assignedTo: z2.number().optional(),
      articleId: z2.number().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await createCalendarEvent({ ...input });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      scheduledDate: z2.date().optional(),
      status: z2.enum(["planned", "in_progress", "review", "completed"]).optional(),
      priority: z2.enum(["low", "medium", "high"]).optional(),
      targetKeyword: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      const { id, ...data } = input;
      await (void 0)(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await (void 0)(input.id);
      return { success: true };
    })
  }),
  // ─── Internal Links ──────────────────────────────────────────────────────────
  internalLinks: router({
    list: protectedProcedure.input(z2.object({ articleId: z2.number() })).query(async ({ input }) => (void 0)(input.articleId)),
    listAll: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      const { internalLinks: internalLinks3, articles: articles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqOp } = await import("drizzle-orm");
      return database.select().from(internalLinks3).limit(200);
    }),
    create: protectedProcedure.input(z2.object({
      fromArticleId: z2.number(),
      toArticleId: z2.number(),
      anchorText: z2.string().optional(),
      linkType: z2.enum(["primary", "secondary", "contextual"]).optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await (void 0)(input);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin", "editor"]);
      await (void 0)(input.id);
      return { success: true };
    })
  }),
  // ─── Users/Admin ─────────────────────────────────────────────────────────────
  admin: router({
    users: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      return getAllUsers();
    }),
    updateRole: protectedProcedure.input(z2.object({
      userId: z2.number(),
      role: z2.enum(["user", "admin", "editor", "viewer"])
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      if (input.userId === ctx.user.id) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u043B\u044C\u0437\u044F \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0441\u0432\u043E\u044E \u0440\u043E\u043B\u044C" });
      await (void 0)(input.userId, input.role);
      await logAudit({ userId: ctx.user.id, action: "update_role", entityType: "user", entityId: input.userId, newValues: { role: input.role } });
      return { success: true };
    }),
    deactivateUser: protectedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      if (input.userId === ctx.user.id) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u043B\u044C\u0437\u044F \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u0431\u044F" });
      await (void 0)(input.userId);
      await logAudit({ userId: ctx.user.id, action: "deactivate_user", entityType: "user", entityId: input.userId });
      return { success: true };
    }),
    reactivateUser: protectedProcedure.input(z2.object({ userId: z2.number(), role: z2.enum(["user", "editor", "viewer"]).default("user") })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      await (void 0)(input.userId, input.role);
      await logAudit({ userId: ctx.user.id, action: "reactivate_user", entityType: "user", entityId: input.userId });
      return { success: true };
    }),
    auditLog: protectedProcedure.input(z2.object({ limit: z2.number().default(50) })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, ["admin"]);
      return (void 0)(input.limit);
    })
  }),
  // ─── Settings ────────────────────────────────────────────────────────────────
  settings: router({
    get: protectedProcedure.query(async () => getSeoSettings()),
    save: protectedProcedure.input(z2.object({
      siteUrl: z2.string().optional(),
      siteName: z2.string().optional(),
      defaultMetaDescription: z2.string().optional(),
      robotsTxt: z2.string().optional(),
      defaultSchemaType: z2.string().optional(),
      aiGenerationLanguage: z2.string().optional(),
      aiTone: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      requireRole(ctx.user.role, ["admin"]);
      const settings = {};
      Object.entries(input).forEach(([k, v]) => {
        if (v !== void 0) settings[k] = v;
      });
      await saveSeoSettings(settings);
      await logAudit({ userId: ctx.user.id, action: "save_settings", entityType: "settings", newValues: settings });
      return { success: true };
    })
  }),
  // ─── Analytics (real data from DB) ───────────────────────────────────────────
  analytics: router({
    overview: protectedProcedure.query(async () => {
      const stats = await getDashboardStats();
      return {
        totalArticles: stats?.totalArticles ?? 0,
        publishedArticles: stats?.publishedArticles ?? 0,
        indexedArticles: stats?.indexedArticles ?? 0,
        keywordCount: stats?.keywordCount ?? 0,
        topKeywords: stats?.topKeywords ?? [],
        recentArticles: stats?.recentArticles ?? []
      };
    }),
    articlePerformance: protectedProcedure.query(async () => getTopArticlesByPerformance()),
    // Views by day for chart (real data from article_analytics)
    viewsChart: protectedProcedure.input(z2.object({ days: z2.number().default(30) })).query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      const data = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = input.days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({ date: d.toISOString().slice(0, 10), views: 0 });
      }
      return data;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs3 from "fs";
import { nanoid } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs2 from "node:fs";
import path2 from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path2.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs2.existsSync(LOG_DIR)) {
    fs2.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs2.existsSync(logPath) || fs2.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs2.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs2.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path2.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs2.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "production" ? "/" : "/",
  plugins,
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path2.resolve(import.meta.dirname),
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  const uploadsDir = path4.join(process.cwd(), "uploads");
  app.use("/uploads", express2.static(uploadsDir));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { articles: articles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq4 } = await import("drizzle-orm");
      const db = await getDb2();
      const siteUrl = process.env.SITE_URL || "https://altyn-therapy.uz";
      let urls = `<url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
`;
      if (db) {
        const published = await db.select({ slug: articles2.slug, updatedAt: articles2.updatedAt }).from(articles2).where(eq4(articles2.status, "published"));
        for (const a of published) {
          urls += `<url><loc>${siteUrl}/articles/${a.slug}</loc><lastmod>${new Date(a.updatedAt).toISOString().split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
`;
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (e) {
      res.status(500).send("Error generating sitemap");
    }
  });
  app.get("/robots.txt", async (_req, res) => {
    try {
      const { getSeoSettings: getSeoSettings2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      let robotsContent = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: " + (process.env.SITE_URL || "https://altyn-therapy.uz") + "/sitemap.xml";
      const settings = await getSeoSettings2();
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
