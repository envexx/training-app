# 🚨 FIX: Frontend Masih Menggunakan localhost:3000

## ❌ Masalah

Frontend masih menggunakan `http://localhost:3000` sebagai API URL di production, menyebabkan error:
```
Access to fetch at 'http://localhost:3000/api/v1/auth/login' from origin 'http://aw4gskwkcok4g0ws4808c8oo.31.97.67.141.sslip.io' has been blocked by CORS policy
```

## ✅ Solusi: Set Environment Variable di Coolify

### Langkah 1: Buka Coolify Dashboard

1. Login ke Coolify
2. Pilih **Deployment** frontend (bukan backend)
3. Klik **Configuration** tab
4. Scroll ke bagian **Environment Variables**

### Langkah 2: Tambahkan Environment Variable

Klik **Add Environment Variable** dan isi:

```
Key: VITE_API_URL
Value: https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io
```

**⚠️ PENTING:**
- Ganti `https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io` dengan URL backend production Anda
- **WAJIB** menggunakan `https://` (bukan `http://`)
- Pastikan URL backend benar dan accessible

### Langkah 3: Redeploy Frontend

**WAJIB**: Setelah menambahkan environment variable, **redeploy** frontend:

1. Klik tombol **Deploy** di Coolify
2. Atau push commit baru ke GitHub (jika auto-deploy enabled)

**Mengapa harus redeploy?**
- Environment variables di Vite di-inject saat **build time**
- Build yang sudah ada tidak akan menggunakan env var baru
- Harus rebuild dengan env var baru

### Langkah 4: Verifikasi

Setelah redeploy selesai:

1. Buka frontend di browser
2. Buka **Developer Tools** (F12) → **Console**
3. Cek apakah masih ada error `localhost:3000`
4. Buka **Network** tab → cek request API
5. Seharusnya request ke URL backend production, bukan `localhost:3000`

## 🔍 Cara Cek Environment Variable Sudah Ter-set

Setelah redeploy, buka browser console dan ketik:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Seharusnya menampilkan URL backend production, bukan `undefined` atau `http://localhost:3000`.

## 🐛 Troubleshooting

### Masih Error localhost:3000?

1. ✅ Pastikan `VITE_API_URL` sudah di-set di Coolify
2. ✅ Pastikan sudah **redeploy** setelah menambahkan env var
3. ✅ Pastikan URL backend benar (dengan `https://`)
4. ✅ Clear browser cache dan hard refresh (Ctrl+Shift+R)

### Masih Error CORS?

1. ✅ Pastikan backend `CORS_ORIGIN` include frontend domain
2. ✅ Format: `http://aw4gskwkcok4g0ws4808c8oo.31.97.67.141.sslip.io`
3. ✅ Pastikan backend sudah running dan accessible

### Environment Variable Tidak Ter-load?

1. ✅ Pastikan nama env var: `VITE_API_URL` (dengan prefix `VITE_`)
2. ✅ Pastikan sudah redeploy setelah menambahkan env var
3. ✅ Cek build logs di Coolify untuk melihat env var yang di-inject



