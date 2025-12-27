# Coolify Deployment Guide

## Konfigurasi Coolify

### Basic Settings

1. **Repository URL**: `https://github.com/envexx/training-app`
2. **Branch**: `main`
3. **Build Pack**: `Nixpacks` (auto-detect Node.js)
4. **Base Directory**: `reactjs-template/backend`
5. **Port**: `3000`
6. **Is it a static site?**: `No` (unchecked)

### Environment Variables

Tambahkan environment variables berikut di Coolify:

#### Required Variables

```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://9cf6dd183241e89475da66046714f239a389d2979088b658415ec4f4f95e9f03:sk_Jfhz11-sxmE3lP4BKiQLa@db.prisma.io:5432/postgres?sslmode=require&pool=true
CORS_ORIGIN=https://your-frontend-domain.com
API_VERSION=v1
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

#### Optional Variables

```
# Jika menggunakan individual DB config (jika tidak pakai DATABASE_URL)
# DB_HOST=your-db-host
# DB_PORT=5432
# DB_NAME=training_app
# DB_USER=postgres
# DB_PASSWORD=your_password
```

### Build & Deploy Process

1. **Install Dependencies**: `npm ci` (akan otomatis dijalankan oleh Nixpacks)
2. **Run Migrations**: `npm run migrate` (akan otomatis dijalankan jika ada nixpacks.toml)
3. **Start Server**: `npm start` (akan menjalankan `node src/server.js`)

### Post-Deployment

Setelah deployment berhasil:

1. **Run Database Migrations** (jika belum otomatis):
   ```bash
   npm run migrate
   ```

2. **Create Admin User** (opsional):
   ```bash
   npm run seed:admin
   ```

### Health Check

Coolify akan otomatis check health endpoint di:
- `GET /health` atau `GET /api/v1/health`

Pastikan endpoint ini mengembalikan status 200.

### Troubleshooting

#### Build Fails
- Pastikan `Base Directory` benar: `reactjs-template/backend`
- Pastikan `package.json` ada di base directory
- Check build logs di Coolify

#### Database Connection Error
- Pastikan `DATABASE_URL` atau DB credentials benar
- Pastikan database accessible dari server Coolify
- Check SSL mode jika menggunakan Prisma/Neon

#### CORS Error
- Pastikan `CORS_ORIGIN` di-set ke domain frontend yang benar
- Format: `https://your-frontend-domain.com` (tanpa trailing slash)
- Untuk multiple origins: `https://domain1.com,https://domain2.com`

#### Port Already in Use
- Pastikan `PORT=3000` di environment variables
- Coolify akan otomatis map port internal ke external

### Notes

- Nixpacks akan otomatis detect Node.js dari `package.json`
- Pastikan `node_modules` tidak di-commit ke Git (ada di `.gitignore`)
- Environment variables sensitive jangan di-commit ke Git
- Untuk production, pastikan `JWT_SECRET` adalah random string yang kuat (min 32 karakter)

