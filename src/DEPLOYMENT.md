# Deployment Guide - Family Finance Dashboard

This guide will help you deploy your Family Finance Dashboard to production.

## Pre-Deployment Checklist

### 1. Add PWA Icons
Before deploying, you need to add actual app icons:

1. Create a 512x512 PNG icon for your app
2. Generate a 192x192 version
3. Place them in `/public/`:
   - `/public/icon-192.png`
   - `/public/icon-512.png`

You can use tools like:
- [Figma](https://figma.com) to design your icon
- [Squoosh](https://squoosh.app) to optimize images
- [RealFaviconGenerator](https://realfavicongenerator.net) for comprehensive favicon generation

### 2. Environment Variables
Ensure your Supabase credentials are set:
- The app uses `/utils/supabase/info.tsx` which is auto-generated
- For local development, you can override with `.env` file (not required for Figma Make)

### 3. Supabase Setup
Make sure your Supabase backend is configured:

```bash
# Deploy edge functions
cd supabase
supabase functions deploy make-server-d9780f4d

# Set environment variables for edge functions
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
```

## Deployment Options

### Option 1: Figma Make (Zero Config)

The app is **already configured** for Figma Make deployment:

1. ✅ All files are in place
2. ✅ Entry point (`/src/main.tsx`) configured
3. ✅ Supabase credentials integrated
4. ✅ PWA manifest ready
5. ✅ Vite config created
6. ✅ Node version set to 18

**Simply use the Figma Make deployment button!**

---

### Option 2: Vercel (Recommended for Production)

#### A. Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

#### B. Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

**Environment Variables in Vercel:**
The app uses auto-generated Supabase info, so no env vars needed for Vercel deployment.

---

### Option 3: Netlify

#### A. Via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repo
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

#### B. Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 4: GitHub Pages

```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts:
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Deploy
npm run deploy
```

**Note**: Update the base URL in your vite config if deploying to a subpath.

---

### Option 5: Self-Hosted (VPS/Cloud)

#### Using Nginx

```bash
# Build the app
npm run build

# Upload dist/ to your server
scp -r dist/* user@yourserver:/var/www/familyfinance

# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/familyfinance;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t family-finance .
docker run -p 80:80 family-finance
```

---

## Post-Deployment

### 1. Test PWA Installation
- Visit your deployed URL on mobile
- Look for "Add to Home Screen" prompt
- Install and test offline functionality

### 2. Verify Supabase Connection
- Test login/signup
- Create test household
- Verify data sync

### 3. Performance Check
Use [Lighthouse](https://developers.google.com/web/tools/lighthouse) to verify:
- ✅ Performance score > 90
- ✅ PWA score = 100
- ✅ Accessibility score > 90
- ✅ Best Practices score > 90

### 4. SSL/HTTPS
Ensure your domain uses HTTPS (required for PWA):
- Vercel/Netlify: Automatic
- Self-hosted: Use [Let's Encrypt](https://letsencrypt.org/)

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Supabase Connection Issues
- Check `/utils/supabase/info.tsx` has correct credentials
- Verify Supabase project is active
- Check browser console for CORS errors

### PWA Not Installing
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify icons exist in /public/
- Check service worker registration

### Blank Page After Deployment
- Check browser console for errors
- Verify all imports are correct
- Ensure base URL is configured correctly
- Check that all assets are in /public/ if needed

---

## Performance Optimization

### Code Splitting
The app already uses React lazy loading for optimal bundle size.

### Caching Strategy
Configure caching headers (example for Netlify):

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Asset Optimization
- Icons should be optimized PNGs (< 50KB each)
- SVGs should be minified
- Consider using WebP for screenshots

---

## Monitoring

### Analytics
Add analytics by creating a new component:

```tsx
// components/utils/Analytics.tsx
import { useEffect } from 'react';

export const Analytics = () => {
  useEffect(() => {
    // Add Google Analytics, Plausible, or other analytics
  }, []);
  return null;
};
```

### Error Tracking
The app already has ErrorBoundary. Consider adding:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Bugsnag](https://bugsnag.com)

---

## CI/CD Setup

### GitHub Actions (Vercel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
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
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Security Checklist

- ✅ HTTPS enabled
- ✅ Supabase RLS (Row Level Security) configured
- ✅ API keys not exposed in client code
- ✅ Auth tokens stored securely (handled by Supabase)
- ✅ CORS configured properly
- ✅ Content Security Policy headers set

---

## Support

For deployment issues:
1. Check browser console for errors
2. Review Supabase logs
3. Open an issue on GitHub
4. Contact support

**Your app is now ready to deploy! 🚀**
