# ALTYN Therapy SEO Admin Panel — Деплой на Railway

## Переменные окружения (Railway Variables)

| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_URL` | MySQL/PostgreSQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Секрет для JWT токенов (мин. 32 символа) | `your-random-secret-key-here` |
| `NODE_ENV` | Режим работы | `production` |
| `PORT` | Порт сервера (Railway ставит автоматически) | `3000` |
| `OPENAI_API_KEY` | (Опционально) Для AI-генерации метаданных | `sk-...` |

## Шаги деплоя на Railway

1. Создайте новый сервис в Railway → "Deploy from GitHub repo"
2. Выберите репозиторий `braindiggeruz/altyn-site-adminpanel`
3. В Variables добавьте все переменные из таблицы выше
4. Railway автоматически запустит build и деплой

## Первый запуск

После деплоя нужно создать первого admin-пользователя через API:

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@altyn-therapy.uz","password":"your-password","name":"Admin"}'
```

Затем через базу данных установите роль admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@altyn-therapy.uz';
```

## Sitemap и Robots.txt

- Sitemap: `https://your-domain.com/sitemap.xml`
- Robots.txt: `https://your-domain.com/robots.txt`

Оба файла генерируются автоматически из базы данных.
