# 🚀 Coolify Deployment Configuration

## 📋 Form Settings di Coolify

Isi form deployment dengan konfigurasi berikut:

### Basic Configuration

| Field | Value |
|-------|-------|
| **Repository URL** | `https://github.com/envexx/training-app` |
| **Branch** | `main` |
| **Build Pack** | `Nixpacks` (auto-detect) |
| **Base Directory** | `reactjs-template/backend` ⚠️ **PENTING** |
| **Port** | `3000` |
| **Is it a static site?** | ❌ **No** (unchecked) |

### ⚙️ Environment Variables

Setelah deployment dibuat, tambahkan environment variables berikut:

#### 🔴 Required (Wajib)

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://9cf6dd183241e89475da66046714f239a389d2979088b658415ec4f4f95e9f03:sk_Jfhz11-sxmE3lP4BKiQLa@db.prisma.io:5432/postgres?sslmode=require&pool=true
CORS_ORIGIN=https://your-frontend-domain.com
API_VERSION=v1
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-random
```

#### 📝 Penjelasan Environment Variables

- **PORT**: Port yang digunakan server (3000)
- **NODE_ENV**: Set ke `production` untuk production
- **DATABASE_URL**: Connection string ke PostgreSQL database
- **CORS_ORIGIN**: Domain frontend yang diizinkan (ganti dengan domain frontend Anda)
  - Contoh: `https://training-app.vercel.app`
  - Untuk multiple domains: `https://domain1.com,https://domain2.com`
- **API_VERSION**: Versi API (v1)
- **JWT_SECRET**: Secret key untuk JWT (minimal 32 karakter, random string)

### 🔧 Build Configuration

Nixpacks akan otomatis:
1. Detect Node.js dari `package.json`
2. Install dependencies dengan `npm ci`
3. Run migrations (jika ada `nixpacks.toml`)
4. Start server dengan `npm start`

### ✅ Post-Deployment Steps

1. **Check Health Endpoint**:
   ```
   GET https://your-backend-domain.com/health
   ```
   Harus return: `{"status":"ok","database":"connected"}`

2. **Run Database Migrations** (jika belum otomatis):
   - Masuk ke terminal Coolify atau SSH ke server
   - Run: `npm run migrate`

3. **Create Admin User** (opsional):
   - Run: `npm run seed:admin`

### 🐛 Troubleshooting

#### ❌ Build Fails
- ✅ Pastikan **Base Directory** = `reactjs-template/backend`
- ✅ Pastikan `package.json` ada di base directory
- ✅ Check build logs di Coolify dashboard

#### ❌ Database Connection Error
- ✅ Pastikan `DATABASE_URL` benar
- ✅ Pastikan database accessible dari server Coolify
- ✅ Check SSL mode (harus `sslmode=require` untuk Prisma/Neon)

#### ❌ CORS Error
- ✅ Pastikan `CORS_ORIGIN` di-set ke domain frontend
- ✅ Format: `https://domain.com` (tanpa trailing slash)
- ✅ Untuk development: `http://localhost:5173,https://your-domain.com`

#### ❌ Port Error
- ✅ Pastikan `PORT=3000` di environment variables
- ✅ Coolify akan otomatis map port internal ke external

#### ❌ Health Check Fails
- ✅ Check apakah server running: `GET /health`
- ✅ Check database connection di health endpoint
- ✅ Check logs di Coolify dashboard

### 📝 Notes

- ✅ Server akan listen di `0.0.0.0:3000` (semua network interfaces)
- ✅ Health check endpoint: `/health`
- ✅ API base path: `/api/v1`
- ✅ Jangan commit `.env` file ke Git
- ✅ Pastikan `JWT_SECRET` kuat dan random untuk production

### 🔗 Useful Endpoints

Setelah deployment, test endpoints berikut:

- Health: `GET /health`
- API Info: `GET /`
- Login: `POST /api/v1/auth/login`
- Register: `POST /api/v1/auth/register`

### 📞 Support

Jika ada masalah:
1. Check logs di Coolify dashboard
2. Check environment variables
3. Test health endpoint
4. Check database connection

