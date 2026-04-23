# 📚 ALTYN SEO Admin Panel - API Documentation

## Overview

The API is built with **tRPC** and provides type-safe endpoints for managing SEO content, keywords, analytics, and user administration.

**Base URL**: `/api/trpc`  
**Authentication**: JWT in httpOnly cookies  
**Response Format**: JSON  
**Error Format**: tRPC error codes

---

## Authentication Endpoints

### `auth.login`
Login with email and password.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  email: string;        // Valid email address
  password: string;     // Minimum 6 characters
}
```

**Output**:
```typescript
{
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "editor" | "user" | "viewer";
  isActive: boolean;
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@altyn-therapy.uz","password":"password123"}'
```

---

### `auth.register`
Register a new user (first user becomes admin).

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  name: string;                    // User full name
  email: string;                   // Valid email
  password: string;                // Minimum 6 characters
  adminSecret?: string;            // Required if not first user
}
```

**Output**:
```typescript
{
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor" | "user";
  isActive: boolean;
}
```

---

### `auth.logout`
Logout current user and clear session.

**Type**: `POST` (mutation)

**Input**: None

**Output**:
```typescript
{ success: true }
```

---

### `auth.me`
Get current authenticated user.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
{
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "editor" | "user" | "viewer";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} | null
```

---

## Dashboard Endpoints

### `dashboard.stats`
Get dashboard statistics and KPIs.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
{
  totalArticles: number;
  publishedArticles: number;
  indexedArticles: number;
  keywordCount: number;
  topKeywords: Array<{
    id: number;
    keyword: string;
    searchVolume: number | null;
    currentRank: number | null;
    trend: "up" | "down" | "stable";
  }>;
  recentArticles: Array<{
    id: number;
    title: string;
    targetKeyword: string | null;
    status: string;
    seoScore: number | null;
    views: number;
  }>;
}
```

---

### `dashboard.trafficChart`
Get traffic data for the last 30 days.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
Array<{
  date: string;      // YYYY-MM-DD
  organic: number;
  direct: number;
}>
```

---

## Articles Endpoints

### `articles.list`
List articles with filters and pagination.

**Type**: `GET` (query)

**Input**:
```typescript
{
  status?: "draft" | "scheduled" | "published" | "archived";
  categoryId?: number;
  search?: string;
  limit?: number;      // 1-100, default 20
  offset?: number;     // default 0
}
```

**Output**:
```typescript
{
  items: Array<Article>;
  total: number;
}
```

---

### `articles.byId`
Get single article by ID.

**Type**: `GET` (query)

**Input**:
```typescript
{ id: number }
```

**Output**:
```typescript
{
  id: number;
  title: string;
  slug: string;
  content: string;
  h1: string;
  metaDescription: string;
  metaKeywords: string | null;
  targetKeyword: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  seoScore: number | null;
  keywordDensity: number | null;
  views: number;
  indexed: boolean;
  googleRank: number | null;
  categoryId: number | null;
  authorId: number | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  // ... more fields
}
```

---

### `articles.create`
Create a new article.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  title: string;
  content?: string;
  h1?: string;
  metaDescription?: string;
  metaKeywords?: string;
  targetKeyword?: string;
  categoryId?: number;
  status?: "draft" | "scheduled" | "published" | "archived";
  excerpt?: string;
  tags?: string[];
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
  schemaType?: string;
  schemaJson?: object;
  scheduledAt?: Date;
  featuredImageUrl?: string;
}
```

**Output**:
```typescript
{ id: number }
```

**Required Role**: `admin` or `editor`

---

### `articles.update`
Update an existing article.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  id: number;
  // All fields from create are optional
  title?: string;
  content?: string;
  status?: string;
  // ...
}
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin` or `editor`

---

### `articles.delete`
Delete an article.

**Type**: `POST` (mutation)

**Input**:
```typescript
{ id: number }
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin` or `editor`

---

## Keywords Endpoints

### `keywords.list`
List all keywords.

**Type**: `GET` (query)

**Input**:
```typescript
{
  search?: string;
  limit?: number;  // default 100
}
```

**Output**:
```typescript
Array<{
  id: number;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  currentRank: number | null;
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
}>
```

---

### `keywords.create`
Create a new keyword.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  currentRank?: number;
  trend?: "up" | "down" | "stable";
}
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin` or `editor`

---

### `keywords.update`
Update a keyword.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  id: number;
  keyword?: string;
  searchVolume?: number;
  difficulty?: number;
  currentRank?: number;
  trend?: "up" | "down" | "stable";
}
```

**Output**:
```typescript
{ success: true }
```

---

### `keywords.delete`
Delete a keyword.

**Type**: `POST` (mutation)

**Input**:
```typescript
{ id: number }
```

**Output**:
```typescript
{ success: true }
```

---

## Competitors Endpoints

### `competitors.list`
List all competitors.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
Array<{
  id: number;
  domain: string;
  name: string;
  authorityScore: number;
  backlinks: number;
  topKeywords: number;
  lastAnalyzed: Date;
}>
```

---

### `competitors.create`
Add a new competitor.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  domain: string;
  name: string;
  authorityScore?: number;
}
```

**Output**:
```typescript
{ success: true }
```

---

## Calendar Endpoints

### `calendar.list`
List calendar events.

**Type**: `GET` (query)

**Input**:
```typescript
{
  year?: number;
  month?: number;
}
```

**Output**:
```typescript
Array<{
  id: number;
  title: string;
  description: string | null;
  scheduledDate: Date;
  status: "planned" | "in_progress" | "completed";
  priority: "high" | "medium" | "low";
  relatedArticleId: number | null;
}>
```

---

### `calendar.create`
Create a calendar event.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  title: string;
  description?: string;
  scheduledDate: Date;
  status?: "planned" | "in_progress" | "completed";
  priority?: "high" | "medium" | "low";
  relatedArticleId?: number;
}
```

**Output**:
```typescript
{ id: number }
```

---

## Admin Endpoints

### `admin.users`
List all users (admin only).

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
Array<{
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "editor" | "user" | "viewer";
  isActive: boolean;
  createdAt: Date;
  lastSignedIn: Date;
}>
```

**Required Role**: `admin`

---

### `admin.updateRole`
Update user role.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  userId: number;
  role: "user" | "admin" | "editor" | "viewer";
}
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin`

---

### `admin.deactivateUser`
Deactivate a user.

**Type**: `POST` (mutation)

**Input**:
```typescript
{ userId: number }
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin`

---

### `admin.auditLog`
Get audit log entries.

**Type**: `GET` (query)

**Input**:
```typescript
{ limit?: number }  // default 50
```

**Output**:
```typescript
Array<{
  id: number;
  userId: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  oldValues: object | null;
  newValues: object | null;
  ipAddress: string | null;
  createdAt: Date;
}>
```

**Required Role**: `admin`

---

## Settings Endpoints

### `settings.get`
Get SEO settings.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
{
  siteUrl?: string;
  siteName?: string;
  defaultMetaDescription?: string;
  robotsTxt?: string;
  defaultSchemaType?: string;
  aiGenerationLanguage?: string;
  aiTone?: string;
} | null
```

---

### `settings.save`
Save SEO settings.

**Type**: `POST` (mutation)

**Input**:
```typescript
{
  siteUrl?: string;
  siteName?: string;
  defaultMetaDescription?: string;
  robotsTxt?: string;
  defaultSchemaType?: string;
  aiGenerationLanguage?: string;
  aiTone?: string;
}
```

**Output**:
```typescript
{ success: true }
```

**Required Role**: `admin`

---

## Analytics Endpoints

### `analytics.overview`
Get analytics overview.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
{
  totalArticles: number;
  publishedArticles: number;
  indexedArticles: number;
  keywordCount: number;
  topKeywords: Array<Keyword>;
  recentArticles: Array<Article>;
}
```

---

### `analytics.articlePerformance`
Get top performing articles.

**Type**: `GET` (query)

**Input**: None

**Output**:
```typescript
Array<{
  id: number;
  title: string;
  targetKeyword: string | null;
  views: number;
  seoScore: number | null;
  status: string;
}>
```

---

## Error Handling

### Error Response Format

```typescript
{
  code: string;           // UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.
  message: string;        // Human-readable error message
  data?: {
    code: string;         // Detailed error code
    httpStatus: number;   // HTTP status code
  };
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input data |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `CONFLICT` | 409 | Resource already exists |

---

## Rate Limiting

Recommended limits:
- **Login**: 5 attempts per 15 minutes per IP
- **API**: 100 requests per minute per user
- **File uploads**: 10 per hour per user

---

## Pagination

All list endpoints support pagination:

```typescript
{
  limit: number;    // Items per page (1-100)
  offset: number;   // Starting position (0-based)
}
```

Response includes `total` for calculating pages:
```typescript
const totalPages = Math.ceil(total / limit);
const currentPage = Math.floor(offset / limit) + 1;
```

---

## Sorting

Sorting is not yet implemented but can be added:

```typescript
{
  sortBy?: string;   // Field name
  sortOrder?: "asc" | "desc";
}
```

---

## Filtering

Filters are endpoint-specific:

```typescript
// Articles
{ status?: string, categoryId?: number, search?: string }

// Keywords
{ search?: string }

// Calendar
{ year?: number, month?: number }
```

---

## Examples

### Create Article with cURL

```bash
curl -X POST http://localhost:3000/api/trpc/articles.create \
  -H "Content-Type: application/json" \
  -H "Cookie: altyn_session=<token>" \
  -d '{
    "title": "SEO Best Practices",
    "content": "...",
    "h1": "SEO Best Practices",
    "metaDescription": "Learn SEO best practices",
    "targetKeyword": "seo best practices",
    "status": "published"
  }'
```

### List Articles with JavaScript

```javascript
const response = await fetch('/api/trpc/articles.list?input={"limit":20,"offset":0}', {
  credentials: 'include',
});
const data = await response.json();
```

### Using tRPC Client

```typescript
import { trpc } from '@/lib/trpc';

// Query
const articles = await trpc.articles.list.query({ limit: 20 });

// Mutation
const result = await trpc.articles.create.mutate({
  title: "New Article",
  content: "...",
});
```

---

**Last Updated**: April 23, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
