# 🚀 Coolify Frontend Deployment Configuration

## ⚠️ PENTING: Base Directory

Untuk **Frontend**, Base Directory harus: `reactjs-template` (BUKAN `reactjs-template/backend`)

## 📋 Form Settings di Coolify

| Field | Value |
|-------|-------|
| **Repository URL** | `https://github.com/envexx/training-app` |
| **Branch** | `main` |
| **Build Pack** | `Nixpacks` (auto-detect) |
| **Base Directory** | `reactjs-template` ⚠️ **PENTING** |
| **Port** | `5173` (atau port yang digunakan Vite) |
| **Is it a static site?** | ✅ **Yes** (checked) |

## ⚙️ Environment Variables

**⚠️ PENTING**: Tambahkan environment variable berikut di Coolify:

```env
VITE_API_URL=https://your-backend-domain.com
```

**Catatan**: 
- Ganti `https://your-backend-domain.com` dengan URL backend yang sudah di-deploy
- Contoh: `https://kkoo004wcswswsgskcs004w4.31.97.67.141.sslip.io`
- **WAJIB** menggunakan `https://` (bukan `http://`)
- Frontend akan build sebagai static site dan di-serve oleh Coolify
- **Setelah menambahkan env var, HARUS redeploy** agar perubahan berlaku

## 🔧 Build Process

Nixpacks akan otomatis:
1. Detect Node.js dari `package.json`
2. Install dependencies dengan `pnpm install` atau `npm install`
3. Run build: `pnpm run build` atau `npm run build`
4. Serve static files dari `dist/` directory

## ✅ Post-Deployment

Setelah deployment berhasil:
1. Pastikan `VITE_API_URL` di-set ke URL backend yang benar
2. Test aplikasi di browser
3. Check console untuk error CORS atau API connection

## 🐛 Troubleshooting

### Build Fails dengan TypeScript Errors
- ✅ Pastikan semua TypeScript errors sudah diperbaiki
- ✅ Run `npm run build` atau `pnpm run build` lokal untuk test
- ✅ Check build logs di Coolify

### CORS Error
- ✅ Pastikan backend `CORS_ORIGIN` include frontend domain
- ✅ Format: `https://your-frontend-domain.com`

### API Connection Error
- ✅ Pastikan `VITE_API_URL` benar
- ✅ Pastikan backend sudah running dan accessible
- ✅ Check network tab di browser untuk melihat request yang gagal

### Static Site Not Loading
- ✅ Pastikan "Is it a static site?" di-check
- ✅ Pastikan build output ada di `dist/` directory
- ✅ Check Coolify logs untuk routing issues

