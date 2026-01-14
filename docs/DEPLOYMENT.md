# Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended)

**Best for:** Quick deployment, auto-scaling, free tier available

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
cd backend
railway up

# Set environment variable
railway variables set DeepSeek_API_KEY=your_key
```

Railway auto-detects Node.js and provisions SQLite.

---

### Option 2: Render

**Backend:**
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo
4. Configure:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Environment Variables: `DeepSeek_API_KEY`

**Frontend:**
1. Build: `cd frontend && npm run build`
2. Deploy `dist/` folder to Render Static Site

---

### Option 3: VPS (Full Control)

```bash
# On Ubuntu/Debian server
sudo apt update
sudo apt install nodejs npm nginx

# Clone and install
git clone <repo-url>
cd ai-greenloan-advisor
npm install
cd frontend && npm install && npm run build && cd ..

# Start with PM2
npm install -g pm2
pm2 start backend/server.js --name verdescore-api

# Configure nginx
sudo nano /etc/nginx/sites-available/verdescore
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/ai-greenloan-advisor/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

---

## Production Checklist

### Before Deployment

- [ ] Set `DeepSeek_API_KEY` environment variable
- [ ] Update `frontend/src/api.js` API_BASE URL
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test locally with production build

### Security

- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Add rate limiting to API
- [ ] Implement API key authentication
- [ ] Set CORS origins properly

### Frontend API Configuration

Update `frontend/src/api.js`:
```javascript
// Development
const API_BASE = 'http://localhost:3001/api';

// Production
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-api.railway.app/api';
```

---

## Single-Server Setup

Serve both frontend and backend from one Express server:

**Add to `backend/server.js`:**
```javascript
const path = require('path');

// After all API routes, add:
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

Now everything runs on port 3001.

---

## Database Considerations

### SQLite (Default)
- ✅ Simple, no setup
- ⚠️ Data resets on redeploy (Railway/Render)

### PostgreSQL (Production)
For persistent data, switch to PostgreSQL:

1. Update `backend/database.js` to use `pg` package
2. Set `DATABASE_URL` environment variable
3. Railway provides free PostgreSQL

---

## Monitoring

### PM2 (VPS)
```bash
pm2 status
pm2 logs verdescore-api
pm2 monit
```

### Health Check Endpoint
```bash
curl https://your-api.com/api/info
```

Expected response:
```json
{
  "name": "VerdeScore API",
  "version": "2.0.0-semantic",
  "status": "healthy"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend blank | Check API_BASE URL matches backend |
| CORS errors | Add frontend origin to backend CORS config |
| SQLite locked | Ensure single server instance |
| API timeout | Check DeepSeek API key validity |
