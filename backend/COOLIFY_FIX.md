# 🔧 Fix untuk Coolify Backend Deployment

## ❌ Masalah

Error: `undefined variable 'npm'` saat build dengan Nixpacks.

## ✅ Solusi

### Opsi 1: Gunakan Dockerfile (Recommended)

Coolify akan otomatis detect `Dockerfile` jika ada. File `Dockerfile` sudah dibuat di `reactjs-template/backend/Dockerfile`.

**Konfigurasi Coolify:**
- **Base Directory**: `reactjs-template/backend`
- **Build Pack**: Biarkan auto-detect (akan pakai Dockerfile)
- **Port**: `3000`
- **Is it a static site?**: ❌ No

### Opsi 2: Hapus nixpacks.toml

Jika ingin tetap pakai Nixpacks auto-detect, hapus file `nixpacks.toml` dan biarkan Nixpacks auto-detect dari `package.json`.

**Konfigurasi Coolify:**
- **Base Directory**: `reactjs-template/backend`
- **Build Pack**: `Nixpacks` (auto-detect)
- **Port**: `3000`
- **Is it a static site?**: ❌ No

### Opsi 3: Perbaiki nixpacks.toml

File `nixpacks.toml` sudah diperbaiki dengan menghapus `npm` dari `nixPkgs` karena `npm` sudah included dengan `nodejs_20`.

## 📋 Environment Variables

Pastikan environment variables berikut di-set di Coolify:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://9cf6dd183241e89475da66046714f239a389d2979088b658415ec4f4f95e9f03:sk_Jfhz11-sxmE3lP4BKiQLa@db.prisma.io:5432/postgres?sslmode=require&pool=true
CORS_ORIGIN=https://your-frontend-domain.com
API_VERSION=v1
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

## 🚀 Build Process

1. **Install Dependencies**: `npm ci`
2. **Run Migrations** (opsional): `npm run migrate`
3. **Start Server**: `npm start`

## ✅ Post-Deployment

Setelah deployment berhasil:
1. Test health endpoint: `GET https://your-domain.com/health`
2. Run migrations (jika belum otomatis): `npm run migrate`
3. Test API: `GET https://your-domain.com/`

