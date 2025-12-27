# Fix "Failed to fetch" Error

## ✅ Backend Sudah Running

Backend server sudah berjalan di `http://localhost:3000` ✅

## 🔧 Langkah Perbaikan

### 1. File `.env` Sudah Dibuat

File `.env` sudah dibuat di `reactjs-template/.env` dengan isi:
```
VITE_API_URL=http://localhost:3000
```

### 2. **PENTING: Restart Frontend Dev Server**

Setelah membuat/update `.env`, **HARUS restart** frontend dev server:

```bash
# Di terminal frontend, tekan Ctrl+C untuk stop
# Kemudian start lagi:
npm run dev
```

⚠️ **Vite hanya membaca `.env` saat server start!**

### 3. Verifikasi CORS di Backend

Pastikan backend `.env` memiliki:
```
CORS_ORIGIN=http://localhost:5173
```

Jika belum, tambahkan ke `backend/.env` dan restart backend.

### 4. Test Koneksi

Buka browser console (F12) dan cek:

**A. API Config Log:**
Seharusnya ada log:
```
[API Config] {
  API_BASE_URL: "http://localhost:3000",
  API_VERSION: "v1",
  API_URL: "http://localhost:3000/api/v1",
  env: "from .env"
}
```

**B. Test Health Endpoint:**
Buka di browser: `http://localhost:3000/health`

Seharusnya return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

**C. Test dari Console:**
```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 5. Check Network Tab

1. Buka Developer Tools (F12)
2. Tab **Network**
3. Coba login atau akses API
4. Lihat request yang gagal:
   - Status code?
   - Error message?
   - Request URL benar?

## 🐛 Common Issues

### Issue 1: "Failed to fetch" masih muncul
**Solusi:**
- ✅ Pastikan frontend dev server di-restart
- ✅ Cek browser console untuk error detail
- ✅ Pastikan backend masih running

### Issue 2: CORS Error
**Solusi:**
- ✅ Pastikan `CORS_ORIGIN=http://localhost:5173` di backend `.env`
- ✅ Restart backend setelah update `.env`

### Issue 3: 401 Unauthorized
**Solusi:**
- ✅ Pastikan sudah login
- ✅ Cek token di localStorage: `localStorage.getItem('auth_token')`
- ✅ Pastikan admin user sudah dibuat: `npm run seed:admin`

### Issue 4: Network Error
**Solusi:**
- ✅ Pastikan backend running: `http://localhost:3000/health`
- ✅ Cek firewall/antivirus tidak block connection
- ✅ Pastikan URL benar di `.env`

## ✅ Checklist Final

- [ ] Backend running di `http://localhost:3000` ✅
- [ ] File `.env` ada di `reactjs-template/` ✅
- [ ] Frontend dev server di-restart setelah membuat `.env`
- [ ] CORS_ORIGIN di backend `.env` = `http://localhost:5173`
- [ ] Browser console tidak ada error
- [ ] Network tab menunjukkan request berhasil

## 🚀 Quick Test

1. **Test Backend:**
   Buka: `http://localhost:3000/health`

2. **Test Frontend:**
   - Buka: `http://localhost:5173`
   - Buka Console (F12)
   - Cek log `[API Config]`
   - Coba login

3. **Jika masih error:**
   - Screenshot error di console
   - Screenshot Network tab
   - Check apakah backend masih running

