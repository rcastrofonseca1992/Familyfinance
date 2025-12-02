# Quick Start Guide

Get your Family Finance Dashboard deployed in 5 minutes!

## 🚀 Fastest Path to Deployment

### Option 1: Figma Make (Instant) ⚡
**Your app is already configured!** Just click the deploy button in Figma Make.

### Option 2: Vercel (5 minutes) 🎯

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

That's it! Your app is live at `https://your-project.vercel.app`

### Option 3: Netlify (5 minutes) 🌐

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repo
4. Click "Deploy site"

Done! Your app is live.

## ⚠️ Before You Deploy

### 1. Add App Icons (2 minutes)

**Required for PWA installation:**

1. Create a 512x512 PNG icon
2. Resize to 192x192
3. Save both to `/public/`:
   - `/public/icon-192.png`
   - `/public/icon-512.png`

**Quick icon creation:**
- Use [Favicon.io](https://favicon.io/favicon-generator/) to generate
- Or design in [Figma](https://figma.com)
- Or use [RealFaviconGenerator](https://realfavicongenerator.net)

### 2. Deploy Supabase Edge Functions (3 minutes)

```bash
# Deploy your backend
cd supabase
supabase functions deploy make-server-d9780f4d

# Set secrets
supabase secrets set SUPABASE_URL=https://sbloltrvdnbrgszhounz.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 🧪 Test Locally First (Optional)

```bash
# Build the app
npm run build

# Serve locally
npx serve dist

# Open http://localhost:3000
```

## 📱 Test Your Deployed App

1. Visit your deployed URL
2. Try to install as PWA on mobile
3. Create an account
4. Create a household
5. Add some test data

## 🔧 Troubleshooting

### Build Fails?
```bash
rm -rf node_modules dist
npm install
npm run build
```

### App Shows Blank Page?
- Check browser console for errors
- Verify `/utils/supabase/info.tsx` exists

### Can't Install PWA?
- Add the PNG icons to `/public/`
- Ensure site uses HTTPS (automatic on Vercel/Netlify)

## 📚 Next Steps

1. ✅ Deploy (you just did this!)
2. ✅ Test the app
3. 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced options
4. ✅ Check [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md) for complete verification
5. 🎨 Customize the app icons and branding
6. 📊 Set up analytics (optional)
7. 🐛 Configure error tracking (optional)

## 🎉 You're Done!

Your Family Finance Dashboard is now live and ready to use!

**Share your app:**
- Mobile: "Add to Home Screen"
- Desktop: Install via browser's app menu
- Share the URL with your household members

---

**Need Help?**
- Check [README.md](./README.md) for full documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides
- Open an issue on GitHub

**Happy Budgeting! 💰**
