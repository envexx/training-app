# 🔧 Environment Variables Setup Guide

## ❌ Masalah

Frontend masih menggunakan `http://localhost:3000` sebagai API URL di production, menyebabkan error CORS.

## ✅ Solusi

### Untuk Vercel Deployment

1. **Buka Vercel Dashboard**:
   - Pilih project → **Settings** → **Environment Variables**

2. **Tambahkan Environment Variable**:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-domain.com
   Environment: Production, Preview, Development
   ```

3. **Redeploy**:
   - Setelah menambahkan env var, **redeploy** project
   - Environment variables di-inject saat **build time**

### Untuk Coolify Deployment

1. **Buka Coolify Dashboard**:
   - Pilih deployment → **Configuration** → **Environment Variables**

2. **Tambahkan Environment Variable**:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-domain.com
   ```

3. **Redeploy**:
   - Setelah menambahkan env var, **redeploy** deployment

## 📝 Catatan Penting

- ✅ `VITE_` prefix **WAJIB** untuk Vite environment variables
- ✅ Environment variables di-inject saat **build time**, bukan runtime
- ✅ Setelah menambahkan env var, **harus redeploy** agar perubahan berlaku
- ✅ URL backend harus **https** (bukan http) untuk production
- ✅ Pastikan backend CORS sudah dikonfigurasi untuk allow frontend domain

## 🔍 Cara Cek

Setelah redeploy, buka browser console dan cek:
- Tidak ada error CORS
- API calls ke URL backend production (bukan `localhost:3000`)
- Network tab menunjukkan request ke URL backend yang benar

## 🐛 Troubleshooting

### Masih error CORS?
1. Pastikan `VITE_API_URL` sudah di-set di Vercel/Coolify
2. Pastikan sudah **redeploy** setelah menambahkan env var
3. Pastikan URL backend benar dan accessible
4. Pastikan backend CORS sudah dikonfigurasi untuk allow frontend domain

### Masih menggunakan localhost?
1. Cek environment variable sudah di-set dengan benar
2. Pastikan sudah redeploy
3. Clear browser cache dan hard refresh (Ctrl+Shift+R)



