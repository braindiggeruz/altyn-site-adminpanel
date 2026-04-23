# ALTYN Therapy SEO Admin Panel — TODO (REFACTOR)

## ✅ Уже сделано (предыдущая версия)
- [x] Database schema: 10 tables
- [x] DashboardLayout with sidebar navigation
- [x] Articles CRUD (create, edit, delete, bulk actions)
- [x] Real-time SEO score (0–100)
- [x] H1, Meta Description, Meta Keywords editors
- [x] Open Graph / Twitter Card tags
- [x] Canonical URL management
- [x] Version history per article (read-only)
- [x] Keywords CRUD
- [x] Competitors CRUD
- [x] Content Calendar (create/delete events)
- [x] Admin user management (roles)
- [x] Settings page (SEO defaults, robots.txt)
- [x] Audit log viewer
- [x] Dark theme, responsive design

## 🔧 РЕФАКТОРИНГ: Независимость от Manus

- [ ] Добавить поле password в таблицу users (bcrypt)
- [ ] Добавить поле isActive в таблицу users
- [ ] Заменить Manus OAuth на свою email+password JWT аутентификацию
- [ ] Создать страницу Login (/login)
- [ ] Создать страницу Register (/register) — только для первого admin
- [ ] Убрать зависимости от OAUTH_SERVER_URL, VITE_APP_ID, VITE_OAUTH_PORTAL_URL
- [ ] Заменить Manus LLM (invokeLLM) на прямой OpenAI API (OPENAI_API_KEY)
- [ ] Убрать BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY из кода
- [ ] Заменить Manus S3 storage на multer + локальное хранилище
- [ ] Добавить railway.json для деплоя на Railway
- [ ] Добавить .env.example с документацией переменных

## 🗑️ УБРАТЬ нерабочие заглушки

- [ ] Убрать фейковые данные из Analytics (Math.random, захардкоженные числа)
- [ ] Убрать "Simulated Data" GSC блок из Analytics
- [ ] Убрать GSC Submit to Index кнопку (нет реального API)
- [ ] Убрать Semrush интеграцию из Settings
- [ ] Убрать GA4 интеграцию из Settings (нет реального API)
- [ ] Убрать AI Research кнопку для ключевых слов
- [ ] Убрать AI Analyze конкурентов
- [ ] Убрать Content Gap AI анализ
- [ ] Убрать AI генерацию метаданных (если нет OpenAI ключа — показывать заглушку)
- [ ] Убрать AI Schema.org генерацию
- [ ] Убрать AI Internal Links suggestions
- [ ] Исправить поля конкурентов (добавить estimatedTraffic, keywordCount в схему БД)
- [ ] Убрать нерабочий период-фильтр из Analytics

## 🌍 Русская локализация

- [ ] Установить react-i18next
- [ ] Создать ru.json (основной язык)
- [ ] Создать en.json (дополнительный)
- [ ] Перевести DashboardLayout (навигация)
- [ ] Перевести все страницы на русский
- [ ] Добавить переключатель RU/EN в sidebar

## ✏️ WYSIWYG редактор

- [ ] Установить @tiptap/react
- [ ] Заменить Textarea на TipTap в ArticleEditor
- [ ] Тулбар: жирный, курсив, заголовки H2/H3, списки, ссылки
- [ ] Загрузка изображений через multer в редактор

## 🔧 Реальные функции (доработка)

- [ ] Исправить sitemap.xml — отдавать по URL /sitemap.xml как XML
- [ ] Исправить robots.txt — отдавать по URL /robots.txt
- [ ] Analytics: реальные данные из БД (views, articles count, avg SEO score)
- [ ] Добавить редактирование событий Calendar
- [ ] Добавить откат версий статей
- [ ] Исправить деактивацию пользователей (поле isActive)
- [ ] Добавить правильные права для editor/viewer ролей

## 🚀 Deploy

- [ ] Протестировать все функции
- [ ] README с инструкцией деплоя на Railway
- [ ] Финальный checkpoint
