# ALTYN Therapy SEO Admin Panel — TODO

## Phase 1: Foundation
- [x] Initialize project with db, server, user features
- [x] Design system: dark theme, OKLCH color palette, Inter + JetBrains Mono typography
- [x] Database schema: 10 tables (articles, categories, keywords, internal_links, seo_tasks, article_analytics, competitors, content_calendar, audit_log, article_versions)
- [x] Run DB migrations and seed sample data
- [x] DashboardLayout with full sidebar navigation (8 sections + user profile)
- [x] App.tsx routing for all pages with AuthGate

## Phase 2: Authentication & User Management
- [x] JWT-based auth via Manus OAuth (built-in)
- [x] Role-based access: admin, editor, viewer, user
- [x] Activity/audit logging (audit_log table + procedures)
- [x] Admin user management page: list, change role, deactivate, reactivate
- [x] Deactivate user sets role to viewer; reactivate restores to user

## Phase 3: Article Management
- [x] Articles list page with search, filter by status/category, SEO score display
- [x] Bulk actions: publish, archive, delete
- [x] Rich text WYSIWYG editor (contenteditable + formatting toolbar)
- [x] Draft / Schedule / Publish workflow
- [x] Image upload for featured image (base64 → S3 via storagePut)
- [x] Version history per article (article_versions table)

## Phase 4: SEO Optimization
- [x] Real-time SEO score (0–100) sidebar panel in article editor
- [x] H1 editor with keyword presence check
- [x] Meta description editor with character counter (max 160)
- [x] Meta keywords editor
- [x] Keyword density checker (target 1–3%)
- [x] Readability analysis (Flesch-Kincaid style score)
- [x] Open Graph tags editor (og:title, og:description, og:image)
- [x] Twitter Card tags editor
- [x] Canonical URL management
- [x] Schema.org JSON-LD structured data preview

## Phase 5: AI-Powered Features
- [x] AI auto-generate H1 from article content + target keyword
- [x] AI auto-generate meta description
- [x] AI auto-generate meta keywords
- [x] AI generate schema.org JSON-LD markup
- [x] AI smart internal linking suggestions with anchor text
- [x] AI competitor analysis (top keywords, content gaps)
- [x] AI keyword research (10 suggestions from seed keyword)
- [x] AI content calendar topic suggestions

## Phase 6: Google Search Console Integration
- [x] GSC submit article for indexing (UI + seo_tasks queue)
- [x] Auto-generate XML sitemap on demand (generateSitemap procedure)
- [x] robots.txt editor with real DB persistence (saved via settings.save)
- [x] Indexing status per article (indexed boolean + indexedAt timestamp)

## Phase 7: Analytics Dashboard
- [x] KPI cards: total articles, published, avg SEO score, keywords tracked
- [x] Traffic chart (30-day area chart with Recharts)
- [x] Top ranking keywords table with rank changes
- [x] Per-article performance metrics table (views, SEO score, status)

## Phase 8: Keyword Research & Tracking
- [x] Keywords list with search volume, KD, CPC, trend, rank
- [x] Add keywords (manual form)
- [x] Edit keyword rank and trend (dialog)
- [x] Delete keywords (admin only)
- [x] AI keyword suggestions (10 related keywords from seed)

## Phase 9: Competitor Analysis
- [x] Competitors list page with authority score, traffic, keywords, backlinks
- [x] Add/delete competitors (admin/editor)
- [x] AI competitor analysis (top keywords discovery)
- [x] Content gap identification (AI-powered)
- [x] Backlinks count displayed as metric

## Phase 10: Content Calendar
- [x] Monthly calendar view with event dots per day
- [x] Click day to see events, double-click to add
- [x] Create/delete calendar events
- [x] Priority levels: high, medium, low
- [x] Status tracking: planned, in_progress, review, completed
- [x] Upcoming events sidebar

## Phase 11: Internal Linking
- [x] AI-powered link suggestions in article editor
- [x] Anchor text optimization (stored in internal_links.anchorText)
- [x] Link density analysis (internal links count per article)

## Phase 12: Settings
- [x] SEO defaults (siteUrl, siteName, defaultMetaDescription) with DB persistence
- [x] robots.txt editor with real DB save (settings.save mutation)
- [x] Sitemap management with regenerate button
- [x] Integrations panel (GSC, GA4, Semrush) with connection status
- [x] AI settings (language, tone) with DB persistence
- [x] Audit log viewer with full activity history

## Phase 13: Testing & Polish
- [x] Vitest unit tests: 17 tests passing (SEO scoring, articles CRUD, keywords, competitors, admin, calendar, sitemap)
- [x] Loading skeletons on all data-heavy pages
- [x] Empty states on all list views
- [x] Error handling with toast notifications
- [x] Responsive design (mobile-first with breakpoints)
- [x] Final checkpoint and delivery
