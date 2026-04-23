# 🚀 Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL 14+

### Setup

```bash
# 1. Clone repository
git clone https://github.com/braindiggeruz/altyn-site-adminpanel.git
cd altyn-site-adminpanel

# 2. Install dependencies
pnpm install

# 3. Setup database
# Create PostgreSQL database
createdb altyn_therapy

# 4. Configure environment
cp .env.example .env

# Edit .env with your settings
DATABASE_URL=postgresql://user:password@localhost:5432/altyn_therapy
JWT_SECRET=your-random-secret-key-min-32-chars

# 5. Apply migrations
pnpm db:push

# 6. Start development server
pnpm dev

# 7. Open http://localhost:3000
```

---

## Production Deployment on Railway

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Production ready: PostgreSQL migration, auth fixes"
git push origin main
```

### Step 2: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project
4. Select "Deploy from GitHub repo"
5. Choose `altyn-site-adminpanel` repository

### Step 3: Configure Environment

In Railway dashboard:

1. **Add PostgreSQL plugin**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

2. **Set environment variables**
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-32-char-random-string>
   OPENAI_API_KEY=sk-... (optional)
   ADMIN_REGISTER_SECRET=altyn-admin-2024
   ```

3. **Configure build settings**
   - Build command: `pnpm install && pnpm db:push && pnpm build`
   - Start command: `pnpm start`
   - Port: `3000`

### Step 4: Deploy

```bash
# Railway auto-deploys on push to main
git push origin main

# Or manually trigger in Railway dashboard
# Click "Deploy" button
```

### Step 5: Verify Deployment

```bash
# Check deployment logs
railway logs

# Test API
curl https://your-app.railway.app/api/trpc/auth.me

# Access admin panel
# https://your-app.railway.app
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: altyn_therapy
      POSTGRES_USER: altyn_app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://altyn_app:${DB_PASSWORD}@db:5432/altyn_therapy
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build image
docker build -t altyn-admin:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  altyn-admin:latest

# Or use docker-compose
docker-compose up -d
```

---

## Vercel Deployment

### 1. Setup Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Configure vercel.json

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  },
  "functions": {
    "server/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### 3. Add Environment Variables

In Vercel dashboard:
- Settings → Environment Variables
- Add `DATABASE_URL` and `JWT_SECRET`

---

## AWS Deployment

### Option 1: EC2 + RDS

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# 3. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs npm
npm install -g pnpm

# 4. Clone repository
git clone https://github.com/braindiggeruz/altyn-site-adminpanel.git
cd altyn-site-adminpanel

# 5. Install and build
pnpm install
pnpm build

# 6. Setup environment
cat > .env << EOF
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/altyn
JWT_SECRET=your-secret
NODE_ENV=production
EOF

# 7. Run with PM2
npm install -g pm2
pm2 start "pnpm start" --name "altyn-admin"
pm2 startup
pm2 save
```

### Option 2: ECS (Elastic Container Service)

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name altyn-admin

# 2. Build and push image
docker build -t altyn-admin:latest .
docker tag altyn-admin:latest <account>.dkr.ecr.us-east-1.amazonaws.com/altyn-admin:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/altyn-admin:latest

# 3. Create ECS task definition
# 4. Create ECS service
# 5. Configure load balancer
```

---

## Google Cloud Deployment

### Cloud Run

```bash
# 1. Authenticate
gcloud auth login

# 2. Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/altyn-admin

# 3. Deploy to Cloud Run
gcloud run deploy altyn-admin \
  --image gcr.io/PROJECT_ID/altyn-admin \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=postgresql://... \
  --set-env-vars JWT_SECRET=...
```

### Cloud SQL

```bash
# Create PostgreSQL instance
gcloud sql instances create altyn-db \
  --database-version POSTGRES_15 \
  --region us-central1 \
  --tier db-f1-micro

# Create database
gcloud sql databases create altyn_therapy \
  --instance altyn-db
```

---

## Monitoring & Logging

### Application Logs

```bash
# Railway
railway logs

# Docker
docker logs <container-id>

# PM2
pm2 logs altyn-admin

# Vercel
vercel logs
```

### Error Tracking

```bash
# Setup Sentry
npm install @sentry/node

# In server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

```bash
# Setup New Relic
npm install newrelic

# Create newrelic.js
# Start with: node -r newrelic server.js
```

---

## Database Backups

### PostgreSQL Backup

```bash
# Manual backup
pg_dump -U user -h localhost altyn_therapy > backup.sql

# Restore
psql -U user -h localhost altyn_therapy < backup.sql

# Automated backup (cron)
0 2 * * * pg_dump -U user altyn_therapy | gzip > /backups/altyn_$(date +\%Y\%m\%d).sql.gz
```

### Railway Backups

- Automatic daily backups
- 7-day retention
- Manual backup available in dashboard

---

## SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Using Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d altyn-therapy.uz

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Railway

- Automatic HTTPS with Let's Encrypt
- Auto-renewal
- No additional configuration needed

---

## Performance Tuning

### Database

```sql
-- Create indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(categoryId);
CREATE INDEX idx_keywords_keyword ON keywords(keyword);

-- Analyze
ANALYZE;

-- Vacuum
VACUUM ANALYZE;
```

### Node.js

```bash
# Set memory limit
NODE_OPTIONS=--max-old-space-size=512

# Enable clustering
NODE_CLUSTER_WORKERS=4
```

### Nginx (Reverse Proxy)

```nginx
upstream app {
  server localhost:3000;
}

server {
  listen 80;
  server_name altyn-therapy.uz;

  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name altyn-therapy.uz;

  ssl_certificate /etc/letsencrypt/live/altyn-therapy.uz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/altyn-therapy.uz/privkey.pem;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;

  # Proxy
  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Rollback

### Railway

```bash
# View deployment history
railway deployments

# Rollback to previous version
railway rollback <deployment-id>
```

### Docker

```bash
# Tag previous version
docker tag altyn-admin:previous altyn-admin:latest

# Restart
docker-compose restart app
```

### Git

```bash
# Revert commit
git revert <commit-hash>
git push origin main
```

---

## Health Checks

### Endpoint

```typescript
// server/index.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### Monitoring

```bash
# Check health
curl https://altyn-therapy.uz/health

# Automated monitoring
# Configure in Railway/Vercel dashboard
```

---

## Troubleshooting

### Database Connection Error

```
Error: Failed to connect to database
```

**Solution**:
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check firewall rules
- Test connection: `psql $DATABASE_URL`

### Build Fails

```
Error: pnpm install failed
```

**Solution**:
- Clear cache: `pnpm store prune`
- Rebuild: `pnpm install --force`
- Check Node version: `node --version`

### High Memory Usage

```
JavaScript heap out of memory
```

**Solution**:
- Increase memory: `NODE_OPTIONS=--max-old-space-size=1024`
- Check for memory leaks
- Optimize database queries

---

## Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure `DATABASE_URL`
- [ ] Enable HTTPS
- [ ] Setup backups
- [ ] Configure monitoring
- [ ] Setup error tracking
- [ ] Configure logging
- [ ] Test disaster recovery
- [ ] Document runbooks
- [ ] Setup CI/CD pipeline

---

**Last Updated**: April 23, 2026  
**Status**: ✅ Production Ready
