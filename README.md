# ALTYN Therapy SEO Admin Panel

SEO-административная панель для управления контентом и оптимизацией сайта altyn-therapy.uz.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/braindiggeruz/altyn-site-adminpanel.git
cd altyn-site-adminpanel

# 2. Установить зависимости
pnpm install

# 3. Создать .env файл
cp .env.example .env

# 4. Заполнить переменные окружения
# DATABASE_URL=postgresql://user:password@host:port/database
# JWT_SECRET=your-random-secret-key-min-32-chars

# 5. Применить миграции БД
pnpm db:push

# 6. Запустить dev сервер
pnpm dev

# Откроется на http://localhost:3000
```

### Первый вход

1. Откройте http://localhost:3000
2. Вы будете перенаправлены на /login
3. Нажмите "Зарегистрируйтесь" для создания первого администратора
4. Заполните форму регистрации (первый пользователь автоматически становится admin)
5. Вы будете залогированы и перенаправлены на Dashboard

## 📋 Что было исправлено

### ✅ Критические проблемы

1. **Авторизация (ИСПРАВЛЕНО)**
   - ❌ Было: Бесконечный редирект на Manus OAuth
   - ✅ Теперь: Локальная авторизация с email+пароль
   - ✅ Создана Login.tsx страница
   - ✅ Создана Register.tsx страница
   - ✅ Обновлен useAuth хук

2. **БД (ИСПРАВЛЕНО)**
   - ❌ Было: MySQL schema в PostgreSQL Railway
   - ✅ Теперь: Полная миграция на PostgreSQL
   - ✅ schema.ts: mysqlTable → pgTable
   - ✅ drizzle.config.ts: dialect → "postgresql"
   - ✅ server/db.ts: mysql2 → postgres драйвер
   - ✅ package.json: mysql2 → postgres
   - ✅ Генерирована миграция: drizzle/0000_rich_hercules.sql

3. **Удалены Manus зависимости**
   - ✅ const.ts: Удалены getLoginUrl() функции
   - ✅ main.tsx: Редирект на /login вместо Manus OAuth
   - ✅ DashboardLayout.tsx: Удалена кнопка "Sign in with Manus"
   - ✅ server/_core/env.ts: Стоит очистить Manus переменные

## 🏗️ Архитектура

### Стек технологий

- **Frontend**: React 19 + TypeScript + TailwindCSS 4
- **Backend**: Express + tRPC + Node.js
- **БД**: PostgreSQL + Drizzle ORM
- **Аутентификация**: JWT + bcryptjs
- **UI**: shadcn/ui + Radix UI

### Структура проекта

```
├── client/src/
│   ├── pages/
│   │   ├── Login.tsx ✅ (новая)
│   │   ├── Register.tsx ✅ (новая)
│   │   ├── Dashboard.tsx
│   │   ├── Articles.tsx
│   │   └── ...
│   ├── components/
│   ├── _core/hooks/useAuth.ts ✅ (обновлена)
│   ├── App.tsx ✅ (обновлена)
│   └── const.ts ✅ (очищена)
├── server/
│   ├── auth.ts ✅ (готова)
│   ├── routers.ts ✅ (готова)
│   ├── db.ts ✅ (обновлена на PostgreSQL)
│   └── _core/
├── drizzle/
│   ├── schema.ts ✅ (PostgreSQL)
│   ├── 0000_rich_hercules.sql ✅ (новая миграция)
│   └── drizzle.config.ts ✅ (обновлена)
└── package.json ✅ (обновлена)
```

## 🔑 Переменные окружения

### Обязательные

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-random-secret-key-min-32-chars
NODE_ENV=development
SITE_URL=http://localhost:3000
PORT=3000
```

### Опциональные

```env
OPENAI_API_KEY=sk-...  # Для AI функций
ADMIN_REGISTER_SECRET=altyn-admin-2024  # Для регистрации новых admin после первого
```

## 🚀 Деплой на Railway

### 1. Подготовка

```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Fix: Migrate to PostgreSQL and fix authentication"
git push origin main
```

### 2. Настройка Railway

1. Откройте Railway Dashboard: https://railway.app/project/5ea94d1c-cdb3-4ca8-82cf-2bd5319a3d2a
2. Перейдите в Settings → Variables
3. Убедитесь, что установлены:
   - `DATABASE_URL`: `postgresql://altyn:AltynDB2024SecurePass@shinkansen.proxy.rlwy.net:21223/altyn_bot`
   - `JWT_SECRET`: `babe7774c92d52ca0fc2888d132bbe0ae0d555445d3988dc55086e1ddff303b4`
   - `NODE_ENV`: `production`
   - `SITE_URL`: `https://altyn-site-adminpanel-production.up.railway.app`

### 3. Применить миграции

После деплоя, подключитесь к Railway PostgreSQL и примените миграции:

```bash
# Через Railway CLI
railway run pnpm db:push

# Или вручную через psql
psql postgresql://altyn:AltynDB2024SecurePass@shinkansen.proxy.rlwy.net:21223/altyn_bot < drizzle/0000_rich_hercules.sql
```

### 4. Проверить статус

```bash
# Проверить деплой
curl https://altyn-site-adminpanel-production.up.railway.app/api/health

# Должен вернуть: {"status":"ok"}
```

## 📝 API Endpoints

### Аутентификация

```typescript
// Публичные
POST /api/trpc/auth.login
POST /api/trpc/auth.register
POST /api/trpc/auth.logout
GET /api/trpc/auth.me

// Защищённые
POST /api/trpc/auth.changePassword
```

### Статьи

```typescript
// Защищённые
GET /api/trpc/articles.list
GET /api/trpc/articles.get
POST /api/trpc/articles.create
PUT /api/trpc/articles.update
DELETE /api/trpc/articles.delete
POST /api/trpc/articles.bulkDelete
POST /api/trpc/articles.bulkPublish
```

### Ключевые слова, конкуренты, календарь

```typescript
GET /api/trpc/keywords.list
POST /api/trpc/keywords.create
PUT /api/trpc/keywords.update
DELETE /api/trpc/keywords.delete

GET /api/trpc/competitors.list
POST /api/trpc/competitors.create
DELETE /api/trpc/competitors.delete

GET /api/trpc/calendar.list
POST /api/trpc/calendar.create
PUT /api/trpc/calendar.update
DELETE /api/trpc/calendar.delete
```

### Аналитика и SEO

```typescript
GET /api/trpc/analytics.overview
GET /api/trpc/analytics.articlePerformance
GET /api/trpc/seo.generateSitemap
POST /api/trpc/seo.saveRobots
GET /api/trpc/seo.getRobots
```

### Admin

```typescript
GET /api/trpc/admin.users
PUT /api/trpc/admin.updateRole
POST /api/trpc/admin.deactivateUser
POST /api/trpc/admin.reactivateUser
GET /api/trpc/admin.auditLog
```

## 🔐 Роли и права доступа

| Роль | Права |
|------|-------|
| **admin** | Полный доступ ко всем функциям и управлению пользователями |
| **editor** | Создание и редактирование статей, управление ключевыми словами |
| **user** | Чтение данных, создание черновиков |
| **viewer** | Только чтение (деактивированные пользователи) |

## 📊 SEO Scoring Algorithm

Максимум **100 баллов**:

- Title (+10) + содержит keyword (+5)
- H1 (+10) + содержит keyword (+5)
- Meta description 120-160 символов (+15) или >50 (+8) + keyword (+5)
- Meta keywords ≥3 слов (+10)
- Контент ≥1000 слов (+15), ≥500 (+10), ≥200 (+5)
- Keyword density 1-3% (+5)
- Schema.org JSON-LD (+10)
- OG tags (+5)
- Canonical URL (+5)

## 🧪 Тестирование

```bash
# Запустить тесты
pnpm test

# Запустить с coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## 📦 Сборка для production

```bash
# Собрать
pnpm build

# Запустить production сервер
pnpm start
```

## 🐛 Решение проблем

### Ошибка подключения к БД

```
Error: Failed to connect to database
```

**Решение:**
1. Проверьте `DATABASE_URL` в .env
2. Убедитесь, что PostgreSQL доступен
3. Проверьте учётные данные

### Ошибка миграции

```
Error: Migration failed
```

**Решение:**
```bash
# Очистить и пересоздать
rm -rf drizzle/*.sql drizzle/meta
pnpm db:push
```

### Ошибка авторизации

```
Unauthorized: Invalid email or password
```

**Решение:**
1. Убедитесь, что пользователь зарегистрирован
2. Проверьте правильность email и пароля
3. Проверьте, что пользователь активен (не деактивирован)

## 📚 Документация

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

## 📞 Контакты

Проект: altyn-therapy.uz
GitHub: https://github.com/braindiggeruz/altyn-site-adminpanel

## 📄 Лицензия

MIT
