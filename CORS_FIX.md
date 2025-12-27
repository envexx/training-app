# CORS Error Fix

## Masalah
Frontend berjalan di `http://localhost:5174` tapi backend CORS hanya mengizinkan `http://localhost:5173`.

## Solusi
CORS configuration di backend sudah diupdate untuk:
- ✅ Mengizinkan **semua localhost ports** di development mode
- ✅ Tetap secure di production dengan CORS_ORIGIN dari env

## Langkah

### 1. Restart Backend Server

**PENTING**: Restart backend setelah perubahan CORS:

```bash
# Di terminal backend, tekan Ctrl+C untuk stop
# Kemudian start lagi:
cd backend
npm start
```

### 2. Verifikasi

Setelah restart, coba login lagi di frontend. Error CORS seharusnya sudah hilang.

### 3. Test

Buka browser console dan coba login. Seharusnya:
- ✅ Tidak ada error CORS
- ✅ Request berhasil
- ✅ Login sukses

## Catatan

- Di **development mode**, backend sekarang mengizinkan semua `http://localhost:*` dan `http://127.0.0.1:*`
- Di **production mode**, tetap menggunakan `CORS_ORIGIN` dari `.env`
- Ini aman karena hanya berlaku untuk localhost di development

