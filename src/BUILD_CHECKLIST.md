# Build & Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Build Checklist

### Required Files
- [x] `/index.html` - Entry HTML file
- [x] `/main.tsx` - Application entry point
- [x] `/App.tsx` - Main React component
- [x] `/manifest.json` - PWA manifest
- [x] `/icon.svg` - Favicon
- [x] `/styles/globals.css` - Global styles
- [x] `/utils/supabase/info.tsx` - Supabase configuration

### PWA Assets (ACTION REQUIRED)
- [ ] Add `/public/icon-192.png` - 192x192 app icon
- [ ] Add `/public/icon-512.png` - 512x512 app icon

**Note**: These icons are referenced in `manifest.json` and required for PWA installation.

### Supabase Backend
- [x] Edge function at `/supabase/functions/server/index.tsx`
- [x] KV store utilities at `/supabase/functions/server/kv_store.tsx`
- [ ] Deploy edge function: `supabase functions deploy make-server-d9780f4d`
- [ ] Set edge function secrets (see DEPLOYMENT.md)

### Components Structure
- [x] Auth components (Login, SignUp)
- [x] Dashboard components (Home, Forecast, Personal)
- [x] Goals tracking components
- [x] Settings & Household management
- [x] UI component library
- [x] State management (FinanceContext)

## ✅ Build Verification

### 1. Local Build Test
```bash
# Run in terminal
npm run build
# or
bun run build

# Expected output:
# - dist/ folder created
# - No TypeScript errors
# - No build warnings
```

### 2. File Size Check
After building, verify bundle sizes:
- Main JS bundle: < 500KB (gzipped)
- CSS bundle: < 100KB (gzipped)
- Total page weight: < 1MB

### 3. Test Production Build Locally
```bash
# Serve the dist folder
npx serve dist
# or
python -m http.server 3000 --directory dist

# Test in browser at http://localhost:3000
```

### 4. Verify Functionality
- [ ] App loads without errors
- [ ] Login/signup works
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] Data persists in Supabase
- [ ] Mobile responsive
- [ ] Dark mode works

### 5. PWA Verification
Open DevTools → Application tab:
- [ ] Manifest is valid
- [ ] Icons are loaded (will be 404 until you add them)
- [ ] Service worker registers (if implemented)
- [ ] "Add to Home Screen" prompt appears on mobile

### 6. Performance Check
Run Lighthouse audit (Chrome DevTools):
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 80
- [ ] PWA: 100 (after adding icons)

## ✅ Deployment Checklist

### Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Verify build settings: Framework = Vite
- [ ] Deploy to production
- [ ] Test deployed URL
- [ ] Verify HTTPS is active
- [ ] Test PWA installation

### Netlify Deployment
- [ ] Connect GitHub repository to Netlify
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add `netlify.toml` for SPA routing
- [ ] Deploy to production
- [ ] Test deployed URL

### Custom Domain (Optional)
- [ ] Add custom domain in hosting provider
- [ ] Configure DNS records
- [ ] Verify SSL certificate
- [ ] Update manifest.json start_url if needed

## ✅ Post-Deployment Checklist

### Functionality Tests
- [ ] Login with test account
- [ ] Create household
- [ ] Add income sources
- [ ] Add accounts
- [ ] Add fixed costs
- [ ] Add debts (new feature)
- [ ] Create goals
- [ ] View forecasts
- [ ] Test settings
- [ ] Test dark mode
- [ ] Test mobile view
- [ ] Test PWA installation

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Mobile browsers

### Performance Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure analytics (optional)
- [ ] Monitor Supabase usage/costs
- [ ] Set up uptime monitoring

## 🚨 Common Issues & Solutions

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Blank page after deployment
**Solution**: Check browser console, verify base URL in router, check asset paths

### Issue: Supabase connection fails
**Solution**: Verify `/utils/supabase/info.tsx` has correct credentials

### Issue: PWA doesn't install
**Solution**: 
1. Ensure HTTPS is enabled
2. Add icon-192.png and icon-512.png to /public/
3. Verify manifest.json is accessible at /manifest.json

### Issue: Styles not loading
**Solution**: Verify `/styles/globals.css` is imported in `/main.tsx`

### Issue: Environment variables not working
**Solution**: The app uses auto-generated Supabase info, no env vars needed

## 📦 Final Build Output

Your `dist/` folder should contain:
```
dist/
├── index.html
├── manifest.json
├── icon.svg
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other chunks]
└── [copied from /public/]
```

## ✨ Ready to Deploy!

Once all checkboxes are complete:

```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod

# For Figma Make
# Use the built-in deployment button
```

---

**Last Updated**: December 2024
**App Version**: 1.0.0
**Target Platform**: Vercel, Netlify, Figma Make
