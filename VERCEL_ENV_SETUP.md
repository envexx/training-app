# 🔧 Vercel Environment Variables Setup

## ❌ Masalah

Frontend masih menggunakan `http://localhost:3000` sebagai API URL di production, menyebabkan error:
```
Access to fetch at 'http://localhost:3000/api/v1/auth/login' from origin 'http://your-frontend-domain.com' has been blocked by CORS policy
```

## ✅ Solusi

### 1. Set Environment Variable di Vercel

1. Buka **Vercel Dashboard** → Pilih project → **Settings** → **Environment Variables**
2. Tambahkan environment variable berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-domain.com` | Production, Preview, Development |

**Contoh:**
- Jika backend di Coolify: `https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io`
- Jika backend di Vercel: `https://your-backend.vercel.app`

### 2. Redeploy Frontend

Setelah menambahkan environment variable:
1. **Redeploy** project di Vercel (atau push commit baru)
2. Environment variable akan di-inject saat build time

### 3. Verifikasi

Setelah redeploy, cek di browser console:
- Seharusnya tidak ada error CORS
- API calls harus ke URL backend production, bukan `localhost:3000`

## 📝 Catatan

- `VITE_` prefix **WAJIB** untuk Vite environment variables
- Environment variables di Vercel di-inject saat **build time**, bukan runtime
- Setelah menambahkan env var, **harus redeploy** agar perubahan berlaku

## 🔍 Debug

Jika masih error, cek:
1. Environment variable sudah di-set di Vercel
2. Sudah redeploy setelah menambahkan env var
3. URL backend benar dan accessible
4. Backend CORS sudah dikonfigurasi untuk allow frontend domain



