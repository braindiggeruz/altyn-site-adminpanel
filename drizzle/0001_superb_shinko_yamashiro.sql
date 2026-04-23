CREATE TABLE `article_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`date` date NOT NULL,
	`views` int,
	`clicks` int,
	`impressions` int,
	`avgPosition` float,
	`ctr` float,
	`avgTimeOnPage` int,
	`bounceRate` float,
	CONSTRAINT `article_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `article_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`version` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`metaDescription` varchar(160),
	`h1` varchar(255),
	`savedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`h1` varchar(255) NOT NULL DEFAULT '',
	`metaDescription` varchar(160) NOT NULL DEFAULT '',
	`metaKeywords` varchar(255),
	`ogTitle` varchar(255),
	`ogDescription` varchar(300),
	`ogImage` varchar(500),
	`twitterTitle` varchar(255),
	`twitterDescription` varchar(300),
	`canonicalUrl` varchar(500),
	`content` text NOT NULL DEFAULT (''),
	`excerpt` varchar(500),
	`featuredImageUrl` varchar(500),
	`featuredImageAlt` varchar(255),
	`internalLinks` json,
	`relatedArticles` json,
	`schemaType` varchar(50),
	`schemaJson` json,
	`targetKeyword` varchar(255),
	`keywordDensity` float,
	`readabilityScore` int,
	`seoScore` int,
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`scheduledAt` timestamp,
	`views` int DEFAULT 0,
	`avgTimeOnPage` int,
	`bounceRate` float,
	`indexed` boolean DEFAULT false,
	`indexedAt` timestamp,
	`googleRank` int,
	`googleRankUpdatedAt` timestamp,
	`authorId` int,
	`categoryId` int,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100),
	`entityType` varchar(50),
	`entityId` int,
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`seoDescription` varchar(160),
	`iconUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`authorityScore` int,
	`backlinksCount` int,
	`topKeywords` json,
	`lastAnalyzed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `competitors_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `content_calendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`targetKeyword` varchar(255),
	`scheduledDate` date NOT NULL,
	`status` enum('planned','in_progress','completed') DEFAULT 'planned',
	`priority` enum('high','medium','low') DEFAULT 'medium',
	`assignedTo` int,
	`notes` text,
	`articleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internal_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromArticleId` int NOT NULL,
	`toArticleId` int NOT NULL,
	`anchorText` varchar(255),
	`linkType` enum('primary','secondary','contextual'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `internal_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`searchVolume` int,
	`keywordDifficulty` int,
	`cpc` float,
	`competition` float,
	`trend` enum('up','down','stable'),
	`currentRank` int,
	`previousRank` int,
	`rankUpdatedAt` timestamp,
	`targetArticleId` int,
	`targetPosition` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keywords_id` PRIMARY KEY(`id`),
	CONSTRAINT `keywords_keyword_unique` UNIQUE(`keyword`)
);
--> statement-breakpoint
CREATE TABLE `seo_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`taskType` varchar(50),
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`result` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `seo_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','editor','viewer') NOT NULL DEFAULT 'user';