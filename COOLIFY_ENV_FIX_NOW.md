# 🔧 FIX Environment Variable di Coolify

## ❌ Masalah di Environment Variable

Environment variable Anda saat ini:
```
VITE_API_URL=http://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io/
```

**Masalah:**
1. ❌ Menggunakan `http://` (harus `https://`)
2. ❌ Ada trailing slash `/` di akhir (harus dihapus)

## ✅ Perbaikan

### Langkah 1: Edit Environment Variable

1. Di Coolify, klik **Edit** pada environment variable `VITE_API_URL`
2. Ubah value menjadi:
   ```
   https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io
   ```
   **Perubahan:**
   - `http://` → `https://`
   - Hapus trailing slash `/` di akhir

### Langkah 2: Redeploy

Setelah mengubah environment variable:
1. Klik tombol **Redeploy** di Coolify
2. Tunggu deployment selesai

### Langkah 3: Verifikasi

Setelah redeploy selesai:
1. Buka frontend di browser
2. Buka **Developer Tools** (F12) → **Console**
3. Ketik: `console.log(import.meta.env.VITE_API_URL)`
4. Seharusnya menampilkan: `https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io`
5. Cek **Network** tab → request API harus ke URL backend production

## 📝 Format yang Benar

```
✅ BENAR: https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io
❌ SALAH: http://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io/
❌ SALAH: http://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io
❌ SALAH: https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io/
```

## ⚠️ Catatan

- **WAJIB** menggunakan `https://` untuk production
- **JANGAN** ada trailing slash `/` di akhir URL
- Setelah mengubah env var, **WAJIB redeploy**



