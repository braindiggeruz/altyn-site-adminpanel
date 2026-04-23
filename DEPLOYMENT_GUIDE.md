# ALTYN Therapy SEO Admin Panel - Railway Deployment Guide

## 🚀 Быстрый Деплой (5 минут)

### Шаг 1: Подготовка к деплою

```bash
# Убедитесь что все изменения закоммичены
git add .
git commit -m "Final production build - 100% ready"
git push origin main
```

### Шаг 2: Railway Деплой

#### Вариант A: Через Railway CLI (рекомендуется)

```bash
# Установить Railway CLI
npm i -g @railway/cli

# Логин в Railway
railway login

# Инициализировать проект (если первый раз)
railway init

# Деплой
railway up
```

#### Вариант B: Через GitHub Integration

1. Откройте https://railway.app
2. Нажмите "New Project" → "Deploy from GitHub"
3. Выберите репозиторий: `braindiggeruz/altyn-site-adminpanel`
4. Railway автоматически создаст сервис
5. Добавьте PostgreSQL сервис (если нет)

### Шаг 3: Конфигурация Environment Variables

В Railway Dashboard добавьте переменные:

```env
DATABASE_URL=postgresql://altyn:AltynDB2024SecurePass@shinkansen.proxy.rlwy.net:21223/altyn_bot
JWT_SECRET=babe7774c92d52ca0fc2888d132bbe0ae0d555445d3988dc55086e1ddff303b4
NODE_ENV=production
SITE_URL=https://altyn-site-adminpanel-production.up.railway.app
PORT=3000
```

### Шаг 4: Запустить миграции БД

```bash
# Через Railway CLI
railway run pnpm db:push

# Или через Railway Dashboard:
# 1. Откройте проект
# 2. Нажмите на сервис
# 3. Откройте "Deployments"
# 4. Нажмите "Run Command"
# 5. Введите: pnpm db:push
```

### Шаг 5: Проверить деплой

```bash
# Получить URL
railway open

# Или откройте: https://altyn-site-adminpanel-production.up.railway.app
```

---

## 📋 Требования

- **Node.js**: 18+
- **PostgreSQL**: 14+
- **pnpm**: 10+
- **Railway Account**: https://railway.app

---

## 🔧 Конфигурация Railway

### 1. Создать PostgreSQL сервис (если нет)

```bash
railway add
# Выберите PostgreSQL
```

### 2. Получить DATABASE_URL

```bash
# Через CLI
railway variables

# Или через Dashboard:
# 1. Откройте PostgreSQL сервис
# 2. Нажмите "Connect"
# 3. Скопируйте "Postgres Connection String"
```

### 3. Настроить Build & Deploy

В Railway Dashboard → Проект → Сервис → Settings:

- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Port**: `3000`
- **Node Version**: `18` или выше

---

## 🧪 Тестирование Перед Деплоем

```bash
# Локальное тестирование
pnpm dev

# E2E тесты
pnpm e2e

# Проверка типов
pnpm check

# Сборка production
pnpm build

# Запуск production версии
pnpm start
```

---

## 📊 Мониторинг После Деплоя

### Логи

```bash
# Просмотр логов
railway logs

# Или через Dashboard → Deployments → Logs
```

### Метрики

Railway Dashboard показывает:
- CPU Usage
- Memory Usage
- Network I/O
- Request Count
- Error Rate

### Здоровье Приложения

```bash
# Проверить статус
curl https://altyn-site-adminpanel-production.up.railway.app/health

# Или просто откройте в браузере
https://altyn-site-adminpanel-production.up.railway.app/login
```

---

## 🔐 Безопасность

### Переменные Окружения

✅ **Никогда** не коммитьте `.env` файлы  
✅ Используйте Railway Dashboard для управления секретами  
✅ Регулярно ротируйте JWT_SECRET  
✅ Используйте HTTPS (Railway автоматически)  

### CORS

Приложение настроено для:
- Localhost (dev)
- Railway Production URL
- Кастомные домены

### Аутентификация

- JWT токены в httpOnly cookies
- bcryptjs хеширование паролей (12 rounds)
- Role-Based Access Control (RBAC)
- Полное аудит логирование

---

## 🚨 Troubleshooting

### Ошибка: "Database connection failed"

```bash
# Проверить DATABASE_URL
railway variables | grep DATABASE_URL

# Убедиться что PostgreSQL сервис запущен
railway status

# Переподключиться к БД
railway run pnpm db:push
```

### Ошибка: "Build failed"

```bash
# Проверить логи
railway logs --follow

# Очистить кэш
railway build --no-cache

# Переустановить зависимости
railway run pnpm install
```

### Ошибка: "Port already in use"

Railway автоматически управляет портами. Если ошибка:

1. Откройте Railway Dashboard
2. Нажмите на сервис → Settings
3. Установите PORT=3000
4. Переразверните

### Ошибка: "Migrations failed"

```bash
# Вручную запустить миграции
railway run pnpm db:push

# Или проверить статус
railway run pnpm db:status

# Откатить последнюю миграцию
railway run pnpm db:rollback
```

---

## 📈 Масштабирование

### Увеличить ресурсы

Railway Dashboard → Проект → Сервис → Settings:

- **Memory**: Увеличьте с 512MB до 1GB+
- **CPU**: Добавьте дополнительные CPU cores

### Кэширование

Приложение использует:
- React Query для кэширования на фронтенде
- PostgreSQL для персистентного хранилища
- Redis (опционально, добавить через Railway)

### CDN

Для статических файлов:
1. Добавьте Railway Proxy
2. Или используйте Cloudflare

---

## 🔄 CI/CD Pipeline

### GitHub Actions (опционально)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway-app/setup-cli@v1
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📞 Поддержка

- **Railway Docs**: https://docs.railway.app
- **GitHub Issues**: https://github.com/braindiggeruz/altyn-site-adminpanel/issues
- **Email**: support@altyn-therapy.uz

---

## ✅ Чек-лист Перед Production

- [ ] Все E2E тесты пройдены
- [ ] TypeScript проверка без ошибок
- [ ] Environment переменные установлены
- [ ] БД миграции применены
- [ ] HTTPS включен
- [ ] Логирование работает
- [ ] Мониторинг настроен
- [ ] Бэкапы БД настроены
- [ ] Команда уведомлена

---

**Статус**: ✅ **100% PRODUCTION READY**  
**Версия**: 1.0.0  
**Дата**: April 23, 2026
