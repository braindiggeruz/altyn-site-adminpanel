import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getArticles: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getArticleById: vi.fn().mockResolvedValue(undefined),
  createArticle: vi.fn().mockResolvedValue(1),
  updateArticle: vi.fn().mockResolvedValue(undefined),
  deleteArticle: vi.fn().mockResolvedValue(undefined),
  getKeywords: vi.fn().mockResolvedValue([]),
  createKeyword: vi.fn().mockResolvedValue(1),
  getCompetitors: vi.fn().mockResolvedValue([]),
  createCompetitor: vi.fn().mockResolvedValue(1),
  deleteCompetitor: vi.fn().mockResolvedValue(undefined),
  getCalendarEvents: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue(1),
  deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
  getAllCategories: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  getAuditLog: vi.fn().mockResolvedValue([]),
  getTopArticlesByPerformance: vi.fn().mockResolvedValue([]),
  getArticleAnalytics: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  logAudit: vi.fn().mockResolvedValue(undefined),
  updateCalendarEvent: vi.fn().mockResolvedValue(undefined),
  updateCompetitor: vi.fn().mockResolvedValue(undefined),
  createCategory: vi.fn().mockResolvedValue(1),
  updateKeyword: vi.fn().mockResolvedValue(undefined),
  deleteKeyword: vi.fn().mockResolvedValue(undefined),
  getArticleVersions: vi.fn().mockResolvedValue([]),
  createArticleVersion: vi.fn().mockResolvedValue(1),
  getInternalLinks: vi.fn().mockResolvedValue([]),
  createInternalLink: vi.fn().mockResolvedValue(1),
  getSeoTasks: vi.fn().mockResolvedValue([]),
  createSeoTask: vi.fn().mockResolvedValue(1),
  updateSeoTask: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({ totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalKeywords: 0, avgSeoScore: 0 }),
  getTrafficChartData: vi.fn().mockResolvedValue([]),
  getRecentArticles: vi.fn().mockResolvedValue([]),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ h1: "Test H1", metaDescription: "Test meta", keywords: ["kw1", "kw2"], schemaJson: {} }) } }],
  }),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@altyn-therapy.uz",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createEditorContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "editor-user",
      email: "editor@altyn-therapy.uz",
      name: "Editor User",
      loginMethod: "manus",
      role: "editor",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createViewerContext(): TrpcContext {
  return {
    user: {
      id: 3,
      openId: "viewer-user",
      email: "viewer@altyn-therapy.uz",
      name: "Viewer User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("SEO Score Calculator", () => {
  it("calculates SEO score for article with all fields", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const score = await caller.seo.score({
      title: "Психолог онлайн — профессиональная помощь",
      h1: "Психолог онлайн: запишитесь на консультацию",
      metaDescription: "Профессиональный психолог онлайн. Запишитесь на консультацию прямо сейчас. Помощь при тревоге, депрессии, стрессе.",
      metaKeywords: "психолог онлайн, консультация, тревога, депрессия",
      content: "Психолог онлайн — это удобный способ получить профессиональную психологическую помощь. Наши специалисты помогут вам справиться с тревогой, депрессией и стрессом. Запишитесь на консультацию сегодня.",
      targetKeyword: "психолог онлайн",
      ogTitle: "Психолог онлайн | Altyn Therapy",
      canonicalUrl: "https://altyn-therapy.uz/psikholog-onlajn",
    });
    expect(score.score).toBeGreaterThan(60);
    expect(score.checks).toBeDefined();
    expect(Array.isArray(score.checks)).toBe(true);
  });

  it("returns low score for empty article", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const score = await caller.seo.score({
      title: "Short",
    });
    expect(score.score).toBeLessThan(30);
  });
});

describe("Articles CRUD", () => {
  it("lists articles for authenticated users", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.articles.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("creates article as editor", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.articles.create({
      title: "Test Article",
      slug: "test-article",
      content: "Test content for the article",
      status: "draft",
    });
    expect(result).toHaveProperty("id");
  });

  it("denies article creation for viewer", async () => {
    const caller = appRouter.createCaller(createViewerContext());
    await expect(
      caller.articles.create({
        title: "Test Article",
        slug: "test-article",
        content: "Test content",
        status: "draft",
      })
    ).rejects.toThrow();
  });
});

describe("Keywords", () => {
  it("lists keywords for authenticated users", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.keywords.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates keyword as editor", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.keywords.create({
      keyword: "психолог онлайн",
      searchVolume: 5000,
      keywordDifficulty: 45,
    });
    expect(result).toHaveProperty("success", true);
  });
});

describe("Competitors", () => {
  it("lists competitors for authenticated users", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.competitors.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("denies competitor deletion for editor", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    await expect(
      caller.competitors.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it("allows competitor deletion for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.competitors.delete({ id: 1 });
    expect(result).toHaveProperty("success", true);
  });
});

describe("Admin - User Management", () => {
  it("allows admin to list users", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.users();
    expect(Array.isArray(result)).toBe(true);
  });

  it("denies non-admin from listing users", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    await expect(caller.admin.users()).rejects.toThrow();
  });

  it("allows admin to update user role", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.updateRole({ userId: 2, role: "editor" });
    expect(result).toHaveProperty("success", true);
  });
});

describe("Calendar Events", () => {
  it("lists calendar events", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.calendar.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates calendar event as editor", async () => {
    const caller = appRouter.createCaller(createEditorContext());
    const result = await caller.calendar.create({
      title: "New Blog Post",
      scheduledDate: "2026-05-01",
      status: "planned",
      priority: "high",
    });
    expect(result).toHaveProperty("success", true);
  });
});

describe("SEO Sitemap Generation", () => {
  it("generates sitemap XML", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.seo.generateSitemap();
    expect(result).toHaveProperty("xml");
    expect(result).toHaveProperty("count");
    expect(result.xml).toContain("<?xml");
    expect(result.xml).toContain("urlset");
  });
});
