# Deployment Guide - Roomah

## Deploy ke Netlify

### Persiapan

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Build Locally**
   ```bash
   npm run build
   npm start
   ```

### Opsi 1: Deploy via Netlify Dashboard (Recommended)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Login ke [Netlify](https://app.netlify.com)
   - Klik "Add new site" → "Import an existing project"
   - Pilih GitHub repository: `roomah`
   - Netlify akan auto-detect Next.js configuration

3. **Configure Build Settings**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `.next` (auto-detected)
   - Functions directory: `.netlify/functions` (auto-detected)

4. **Set Environment Variables**
   Go to: Site settings → Environment variables → Add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

5. **Deploy**
   - Klik "Deploy site"
   - Tunggu build selesai (~2-5 menit)

### Opsi 2: Deploy via Netlify CLI

1. **Login**
   ```bash
   netlify login
   ```

2. **Initialize Project**
   ```bash
   netlify init
   ```
   
   Pilih:
   - Create & configure a new site
   - Team: Your team
   - Site name: roomah (atau nama lain)
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Set Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key"
   netlify env:set NEXT_PUBLIC_MIDTRANS_CLIENT_KEY "your_client_key"
   netlify env:set MIDTRANS_SERVER_KEY "your_server_key"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
   ```

4. **Deploy**
   ```bash
   # Preview deploy (test)
   npm run deploy:preview
   
   # Production deploy
   npm run deploy
   ```

### Post-Deployment

1. **Update Supabase URL Whitelist**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Netlify URL to "Redirect URLs":
     ```
     https://your-site.netlify.app/*
     https://your-site.netlify.app/auth/callback
     ```

2. **Update Midtrans Callback URL**
   - Go to Midtrans Dashboard → Settings
   - Set payment notification URL:
     ```
     https://your-site.netlify.app/api/webhooks/midtrans
     ```

3. **Test Deployment**
   - Visit your site
   - Test login/register
   - Test OAuth
   - Test payment flow

### Continuous Deployment

Setiap push ke branch `main` akan otomatis deploy ke production.

Untuk preview deploy:
- Push ke branch lain
- Netlify akan auto-create preview URL

### Troubleshooting

**Build Failed?**
- Check build logs di Netlify dashboard
- Pastikan semua environment variables sudah di-set
- Test `npm run build` locally

**Runtime Error?**
- Check Function logs di Netlify dashboard
- Verify environment variables
- Check Supabase connection

**OAuth Not Working?**
- Verify redirect URLs di Supabase
- Check `NEXT_PUBLIC_APP_URL` environment variable

### Custom Domain (Optional)

1. Go to: Site settings → Domain management
2. Add custom domain
3. Update DNS records sesuai instruksi Netlify
4. Update `NEXT_PUBLIC_APP_URL` ke domain custom
5. Update Supabase & Midtrans callback URLs

## Monitoring

- **Analytics**: Netlify Analytics (optional, berbayar)
- **Error Tracking**: Check Netlify Function logs
- **Performance**: Lighthouse scores di Netlify UI

## Cost

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Upgrade**: Jika traffic tinggi atau butuh advanced features
