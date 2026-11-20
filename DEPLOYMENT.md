# Production Deployment Guide

This project is pre-configured for free, high-performance production hosting.

## Option 1: Vercel (Recommended)
1. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. Import project into [Vercel](https://vercel.com).
3. Vercel automatically detects `vercel.json` and Vite configurations.
4. Deploys live in ~30 seconds with automatic free SSL/HTTPS and CDN caching.

Or deploy via terminal:
```bash
npx vercel --prod
```

## Option 2: Netlify
1. Connect repo on [Netlify](https://netlify.com).
2. It detects `netlify.toml` automatically.
3. Deploys live with free SSL.

## Option 3: GitHub Pages
1. Go to repository **Settings** -> **Pages**.
2. Select Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` will automatically build and publish.
