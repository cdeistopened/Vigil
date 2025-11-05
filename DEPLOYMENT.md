# Deployment Guide - Vigil App

This guide covers deploying the Vigil Liturgy of the Hours app to production.

## 📋 Pre-Deployment Checklist

- [x] **Build works locally**: `npm run build` completes successfully
- [x] **Tests pass**: `npm test` shows all 88 tests passing
- [x] **Production preview works**: `npm run preview` displays correctly
- [x] **Data included**: 9.1MB `prayers-english.json` in `public/` directory
- [x] **Git committed**: All changes committed and pushed

## 🚀 Recommended: Deploy to Vercel

Vercel is the **best choice** for this app because:
- Zero-configuration Vite support
- Automatic builds on Git push
- Global CDN for fast loading
- Free HTTPS certificates
- Generous free tier (100GB bandwidth/month)
- Perfect for static sites

### Option 1: One-Click Deploy (Easiest)

1. **Fork or push this repo to GitHub**

2. **Click the Deploy button:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vigil)

3. **Connect your GitHub account** (if not already connected)

4. **Configure project:**
   - Vercel auto-detects Vite
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
   - Install Command: `npm install` (auto-filled)

5. **Click "Deploy"**

6. **Done!** Your app is live in ~2 minutes at `https://your-project.vercel.app`

### Option 2: Vercel CLI (For More Control)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy to preview (for testing)
vercel

# Deploy to production
vercel --prod
```

**CLI Workflow:**
1. `vercel` creates a preview deployment (unique URL for testing)
2. Test the preview URL thoroughly
3. `vercel --prod` promotes to production

### Option 3: Vercel Dashboard (Manual)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from Git (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Vercel auto-detects settings
6. Click "Deploy"

## 🌐 Alternative Platforms

The app is a standard Vite static site and works with any static host:

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Or use Netlify UI:**
1. Drag `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Or connect Git repo with build command: `npm run build`

### GitHub Pages

```bash
# Build first
npm run build

# Install gh-pages
npm install -g gh-pages

# Deploy to gh-pages branch
gh-pages -d dist
```

Then enable GitHub Pages in repo settings → Pages → Source: gh-pages branch

### Cloudflare Pages

1. Connect Git repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Auto-deploy on push

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time only)
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

## ⚙️ Configuration Files

### `vercel.json` (Included)

Optimizes caching and security:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/prayers-english.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**What this does:**
- Tells Vercel to use Vite framework detection
- Caches prayer data for 1 year (it never changes for a deployed version)
- Adds security headers

### `.vercelignore` (Included)

Excludes unnecessary files from deployment:
- `divinum-officium/` (29,000 source files not needed)
- `node_modules/` (will be reinstalled during build)
- `tests/` (not needed in production)
- `scripts/` (build-time only)

This keeps deployments fast and small.

## 📊 Deployment Specs

**Build Output:**
- Total size: ~9.5 MB
- `index.html`: 7.8 KB
- `assets/*.js`: ~85 KB (bundled JavaScript)
- `prayers-english.json`: 9.1 MB (prayer data)

**Requirements:**
- Node.js: 18.x or higher
- Build time: ~2-5 seconds
- Memory: Minimal (static build)

**Performance:**
- Initial load: ~9 MB (prayer data downloaded once)
- Subsequent loads: Instant (cached)
- Lighthouse score: Should be 95+ on all metrics

## 🔒 Security Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection

## 🌍 Custom Domain

### On Vercel:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `vigil.yourdomain.com`)
3. Follow DNS instructions:
   - Add A record or CNAME
   - Vercel auto-provisions SSL certificate
4. Domain active in ~5 minutes

### SSL/HTTPS

All platforms provide free HTTPS automatically:
- Vercel: Automatic via Let's Encrypt
- Netlify: Automatic via Let's Encrypt
- Cloudflare: Automatic via Cloudflare
- GitHub Pages: Automatic for `.github.io` domains

## 🐛 Troubleshooting

### Build fails on Vercel

**Check:**
1. Node version (should be 18+): Add `.nvmrc` file with `18` or `20`
2. Build logs in Vercel dashboard
3. Try building locally first: `npm run build`

### 404 on routes

**Fix:** Vite apps are SPAs - they use client-side routing. Vercel handles this automatically, but if using another platform:
- Add a `_redirects` file (Netlify): `/* /index.html 200`
- Add `404.html` = `index.html` (GitHub Pages)

### Prayer data not loading

**Check:**
1. `public/prayers-english.json` exists (9.1 MB)
2. File is in `dist/` after build
3. Network tab shows 200 response for `/prayers-english.json`

### Large file warnings

**9.1 MB is normal** - it's the full year of prayer data. All platforms support it:
- Vercel: ✅ Up to 100 MB per deployment
- Netlify: ✅ Up to 125 MB per deployment
- Cloudflare: ✅ Up to 25 MB per file (you're fine)

## 📈 Post-Deployment

### Monitor Performance

**Vercel Analytics:**
- Enable in Project Settings → Analytics
- Free tier: 2,500 requests/day
- See load times, geographic distribution

**Google Analytics:**
- Add tracking ID to `index.html` if desired
- Monitor usage patterns

### Update Strategy

**Vercel (automatic):**
1. Push to `main` branch
2. Vercel auto-builds and deploys
3. Live in ~2 minutes

**Manual platforms:**
1. `npm run build`
2. Upload `dist/` contents or run deploy command
3. Clear CDN cache if needed

## 🎯 Production Checklist

Before going live:

- [ ] Test all 8 hours display correctly
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Verify prayer data loads (check DevTools Network tab)
- [ ] Check for console errors
- [ ] Test a few specific dates (Christmas, Easter, ordinary day)
- [ ] Verify liturgical calendar is accurate
- [ ] Add custom domain (optional)
- [ ] Enable analytics (optional)

## 📞 Support

**Deployment Issues:**
- Vercel: [vercel.com/support](https://vercel.com/support)
- Netlify: [netlify.com/support](https://netlify.com/support)

**App Issues:**
- Check browser console for errors
- Verify `prayers-english.json` loads successfully
- Test with `npm run preview` locally first

## 📝 Summary

**Recommended: Vercel**
- Fastest setup (1-click deploy)
- Best developer experience
- Free for hobby projects
- Auto-deploy on Git push

**Alternative: Any static host works**
- Netlify, Cloudflare Pages, GitHub Pages all work great
- Just point to `dist/` directory after `npm run build`

Your app is ready to deploy! 🚀
