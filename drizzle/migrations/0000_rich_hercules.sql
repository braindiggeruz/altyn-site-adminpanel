CREATE TYPE "public"."calendar_status" AS ENUM('planned', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."linkType" AS ENUM('primary', 'secondary', 'contextual');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."seo_task_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."trend" AS ENUM('up', 'down', 'stable');--> statement-breakpoint
CREATE TABLE "article_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"date" date NOT NULL,
	"views" integer,
	"clicks" integer,
	"impressions" integer,
	"avgPosition" double precision,
	"ctr" double precision,
	"avgTimeOnPage" integer,
	"bounceRate" double precision
);
--> statement-breakpoint
CREATE TABLE "article_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"metaDescription" varchar(160),
	"h1" varchar(255),
	"savedById" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"h1" varchar(255) DEFAULT '' NOT NULL,
	"metaDescription" varchar(160) DEFAULT '' NOT NULL,
	"metaKeywords" varchar(255),
	"ogTitle" varchar(255),
	"ogDescription" varchar(300),
	"ogImage" varchar(500),
	"twitterTitle" varchar(255),
	"twitterDescription" varchar(300),
	"canonicalUrl" varchar(500),
	"content" text DEFAULT '' NOT NULL,
	"excerpt" varchar(500),
	"featuredImageUrl" varchar(500),
	"featuredImageAlt" varchar(255),
	"internalLinks" json,
	"relatedArticles" json,
	"schemaType" varchar(50),
	"schemaJson" json,
	"targetKeyword" varchar(255),
	"keywordDensity" double precision,
	"readabilityScore" integer,
	"seoScore" integer,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp with time zone,
	"scheduledAt" timestamp with time zone,
	"views" integer DEFAULT 0,
	"avgTimeOnPage" integer,
	"bounceRate" double precision,
	"indexed" boolean DEFAULT false,
	"indexedAt" timestamp with time zone,
	"googleRank" integer,
	"googleRankUpdatedAt" timestamp with time zone,
	"authorId" integer,
	"categoryId" integer,
	"tags" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"action" varchar(100),
	"entityType" varchar(50),
	"entityId" integer,
	"oldValues" json,
	"newValues" json,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"seoDescription" varchar(160),
	"iconUrl" varchar(500),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"authorityScore" integer,
	"backlinksCount" integer,
	"topKeywords" json,
	"lastAnalyzed" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competitors_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "content_calendar" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"targetKeyword" varchar(255),
	"scheduledDate" date NOT NULL,
	"status" "calendar_status" DEFAULT 'planned',
	"priority" "priority" DEFAULT 'medium',
	"assignedTo" integer,
	"notes" text,
	"articleId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internal_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromArticleId" integer NOT NULL,
	"toArticleId" integer NOT NULL,
	"anchorText" varchar(255),
	"linkType" "linkType",
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"searchVolume" integer,
	"keywordDifficulty" integer,
	"cpc" double precision,
	"competition" double precision,
	"trend" "trend",
	"currentRank" integer,
	"previousRank" integer,
	"rankUpdatedAt" timestamp with time zone,
	"targetArticleId" integer,
	"targetPosition" integer DEFAULT 1,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "keywords_keyword_unique" UNIQUE("keyword")
);
--> statement-breakpoint
CREATE TABLE "seo_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"taskType" varchar(50),
	"status" "seo_task_status" DEFAULT 'pending',
	"result" json,
	"errorMessage" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64) DEFAULT 'email',
	"role" "role" DEFAULT 'user' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
