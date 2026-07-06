# Deployment Guide

Complete guide for deploying Zarinpal Payment Gateway to production.

---

## Prerequisites

- Node.js 20+ installed
- Git for version control
- Docker (optional, for containerized deployment)
- SSL/TLS certificate for HTTPS
- Zarinpal production merchant account

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/arsamadineh/zarinpal-api-gateway.git
cd zarinpal-api-gateway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
npm run setup
# Or manually:
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NODE_ENV=development
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true
PORT=3000
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs with hot-reload on `http://localhost:3000`

---

## Production Deployment

### 1. Build for Production

```bash
npm run build
npm run lint  # Optional: type checking
```

### 2. Environment Configuration

Create `.env.production`:

```env
NODE_ENV=production
PORT=3000
ZARINPAL_MERCHANT_ID=your-production-merchant-id
ZARINPAL_API_KEY=your-api-key
ZARINPAL_SANDBOX=false
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
JWT_SECRET=your-super-secret-key
```

### 3. Start Production Server

```bash
npm run prod:serve
```

---

## Docker Deployment

### Build Docker Image

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env.production ./.env

EXPOSE 3000

CMD ["node", "dist/examples/express-server.js"]
```

Build and run:

```bash
# Build
docker build -t zarinpal-gateway:latest .

# Run
docker run -p 3000:3000 \
  -e ZARINPAL_MERCHANT_ID=xxx \
  -e ZARINPAL_SANDBOX=false \
  zarinpal-gateway:latest

# With Docker Compose
docker-compose up -d
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  zarinpal-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      ZARINPAL_MERCHANT_ID: ${ZARINPAL_MERCHANT_ID}
      ZARINPAL_SANDBOX: ${ZARINPAL_SANDBOX:-false}
      PORT: 3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/zarinpal/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - zarinpal-api
```

---

## Linux/VPS Deployment

### Using systemd Service

Create `/etc/systemd/system/zarinpal-gateway.service`:

```ini
[Unit]
Description=Zarinpal Payment Gateway
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/zarinpal-gateway
EnvironmentFile=/opt/zarinpal-gateway/.env.production
ExecStart=/usr/bin/node /opt/zarinpal-gateway/dist/examples/express-server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable zarinpal-gateway
sudo systemctl start zarinpal-gateway
sudo systemctl status zarinpal-gateway
```

View logs:

```bash
sudo journalctl -u zarinpal-gateway -f
```

---

## Nginx Reverse Proxy

### Configuration

Create `/etc/nginx/sites-available/zarinpal`:

```nginx
upstream zarinpal_backend {
    server localhost:3000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/zarinpal_access.log;
    error_log /var/log/nginx/zarinpal_error.log;

    # Reverse proxy
    location / {
        proxy_pass http://zarinpal_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/zarinpal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renewal (automatic with modern certbot)
sudo certbot renew --dry-run
```

### Manual Certificate

```bash
sudo certbot certonly --manual -d api.yourdomain.com
```

---

## PM2 Process Manager

### Install PM2

```bash
npm install -g pm2
```

### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'zarinpal-gateway',
    script: './dist/examples/express-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### Start with PM2

```bash
# Start
pm2 start ecosystem.config.js

# Monit (monitoring)
pm2 monit

# View logs
pm2 logs zarinpal-gateway

# Save startup config
pm2 startup
pm2 save

# Restart
pm2 restart zarinpal-gateway

# Stop
pm2 stop zarinpal-gateway
```

---

## Monitoring & Logging

### Health Checks

Regular health check:

```bash
curl -f http://localhost:3000/api/zarinpal/health || systemctl restart zarinpal-gateway
```

Add to crontab:

```bash
*/5 * * * * curl -f http://localhost:3000/api/zarinpal/health || /usr/bin/systemctl restart zarinpal-gateway
```

### Log Aggregation

Example with Winston logger:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring Tools

- **PM2 Plus**: `pm2 plus`
- **Datadog**: APM monitoring
- **New Relic**: Performance monitoring
- **Sentry**: Error tracking

---

## Database Setup (Optional)

For transaction logging, setup PostgreSQL:

```bash
# Create database
createdb zarinpal_gateway

# Connection string
DATABASE_URL=postgresql://user:password@localhost:5432/zarinpal_gateway
```

---

## Backup & Recovery

### Backup Environment

```bash
# Backup .env file
cp .env.production .env.production.backup

# Backup database
pg_dump zarinpal_gateway > zarinpal_backup.sql
```

### Recovery

```bash
# Restore from backup
psql zarinpal_gateway < zarinpal_backup.sql
```

---

## Performance Optimization

### Enable Compression

```env
COMPRESSION=true
```

### Database Connection Pooling

```env
DB_POOL_SIZE=20
```

### Cache Configuration

```env
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379
```

---

## Security Hardening

### 1. Firewall Rules

```bash
# Allow HTTPS only
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp  # For ACME validation
sudo ufw deny 3000/tcp # Block direct access
```

### 2. Environment Variables

```bash
# Store secrets securely
export ZARINPAL_MERCHANT_ID="xxx"
export JWT_SECRET="xxx"

# Or use .env with restricted permissions
chmod 600 .env.production
```

### 3. Rate Limiting

Already enabled by default. Adjust in code if needed:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### 4. CORS Configuration

```env
CORS_ORIGIN=https://yourdomain.com
```

---

## Troubleshooting

### Server Won't Start

```bash
# Check port in use
lsof -i :3000

# Check environment
echo $NODE_ENV
echo $ZARINPAL_MERCHANT_ID

# Check logs
tail -f /var/log/zarinpal-gateway.log
```

### High Memory Usage

```bash
# Monitor
pm2 monit

# Increase restart limit
max_memory_restart: '2G'
```

### Slow Requests

```bash
# Check Zarinpal API status
curl https://api.zarinpal.com/pg/v4/payment/request.json

# Increase timeout
ZARINPAL_TIMEOUT=60000
```

---

## Scaling

### Horizontal Scaling

Use load balancer (HAProxy, nginx):

```bash
# Run multiple instances
npm run prod:serve &
npm run prod:serve &
npm run prod:serve &
```

### Database Scaling

Use read replicas for transaction queries:

```env
DATABASE_URL=postgresql://user:pass@primary:5432/db
DATABASE_READ_URL=postgresql://user:pass@replica:5432/db
```

---

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
npm run build
```

### Backup Database Regularly

```bash
# Daily backup
0 2 * * * pg_dump zarinpal_gateway | gzip > backups/zarinpal_$(date +\%Y\%m\%d).sql.gz
```

### Monitor Disk Space

```bash
df -h
du -sh /opt/zarinpal-gateway
```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: |
          npm run test
          # Deploy to production
```

---

## Rollback Plan

```bash
# Keep previous build
cp -r dist/ dist.backup/

# Rollback if issues
rm -rf dist/
cp -r dist.backup/ dist/
systemctl restart zarinpal-gateway
```

---

## Support & Issues

- **Documentation**: Full docs at repository
- **GitHub Issues**: Report bugs
- **Zarinpal Support**: https://www.zarinpal.com/contact/

Happy deploying! 🚀
