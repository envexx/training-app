# 📱 Setup Telegram Bot untuk Training App

Panduan lengkap untuk setup bot Telegram dan mengkonfigurasi Mini App agar aplikasi bisa diakses dari Telegram.

## 📋 Prerequisites

1. Akun Telegram
2. Bot token dari [@BotFather](https://t.me/BotFather)
3. URL aplikasi yang sudah di-deploy (contoh: Vercel, Netlify, atau hosting lainnya)

## 🚀 Langkah-langkah Setup

### Step 1: Buat Bot di BotFather

1. Buka Telegram dan cari [@BotFather](https://t.me/BotFather)
2. Kirim perintah `/newbot`
3. Ikuti instruksi:
   - Masukkan nama bot (contoh: "Training Management Bot")
   - Masukkan username bot (harus diakhiri dengan `bot`, contoh: `training_management_bot`)
4. BotFather akan memberikan **Bot Token** (simpan token ini dengan aman!)

**Contoh Bot Token:**
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 2: Deploy Aplikasi

Pastikan aplikasi sudah di-deploy dan bisa diakses via HTTPS. Contoh URL:
- Vercel: `https://training-app-eight-nu.vercel.app`
- Netlify: `https://your-app.netlify.app`
- Custom domain: `https://training.yourdomain.com`

**Penting:** 
- ✅ URL harus menggunakan **HTTPS** (bukan HTTP)
- ✅ URL harus bisa diakses publik (tidak localhost)
- ✅ Aplikasi harus sudah di-build dan di-deploy

### Step 3: Konfigurasi Mini App di BotFather

1. Buka chat dengan [@BotFather](https://t.me/BotFather)
2. Kirim perintah `/newapp`
3. Pilih bot yang sudah dibuat
4. Ikuti instruksi:

   **a. Masukkan App Title:**
   ```
   Training Management App
   ```

   **b. Masukkan Short Name:**
   ```
   Training App
   ```

   **c. Masukkan Description:**
   ```
   Sistem manajemen training terapis dengan fitur TNA, Evaluasi, dan Jadwal Training
   ```

   **d. Upload Photo (opsional):**
   - Upload logo/icon aplikasi (format: PNG/JPG, max 640x360px)
   - Atau skip dengan mengirim `/empty`

   **e. Masukkan Web App URL:**
   ```
   https://training-app-eight-nu.vercel.app
   ```
   **Penting:** Ganti dengan URL aplikasi Anda yang sebenarnya!

   **f. Upload GIF (opsional):**
   - Upload GIF untuk preview (format: GIF, max 1MB)
   - Atau skip dengan mengirim `/empty`

   **g. Upload Short Name Icon (opsional):**
   - Upload icon kecil (format: PNG, 640x360px)
   - Atau skip dengan mengirim `/empty`

5. BotFather akan memberikan konfirmasi dan link untuk mengakses Mini App

### Step 4: Test Mini App

1. Buka chat dengan bot Anda di Telegram
2. Klik tombol "Menu" atau ketik `/start`
3. Klik tombol "Open App" atau "Launch App"
4. Aplikasi akan terbuka di dalam Telegram

### Step 5: Konfigurasi Bot Commands (Opsional)

Untuk menambahkan perintah bot, kirim ke BotFather:

```
/setcommands
```

Pilih bot Anda, lalu kirim:
```
start - Buka aplikasi Training Management
help - Bantuan penggunaan aplikasi
```

## 🔧 Konfigurasi Tambahan

### Update URL di tonconnect-manifest.json

Jika URL aplikasi berubah, update file `public/tonconnect-manifest.json`:

```json
{
  "url": "https://your-new-url.com",
  "name": "Training App - Sistem Manajemen Training Terapis",
  "iconUrl": "https://your-new-url.com/favicon.ico"
}
```

### Update URL di Vercel/Netlify

Jika menggunakan Vercel atau Netlify, pastikan:
1. Environment variables sudah dikonfigurasi (jika diperlukan)
2. Build settings sudah benar
3. Domain sudah terhubung (jika menggunakan custom domain)

## 🐛 Troubleshooting

### Problem: "App tidak terbuka di Telegram"

**Solusi:**
1. Pastikan URL menggunakan HTTPS (bukan HTTP)
2. Pastikan URL bisa diakses dari browser
3. Pastikan aplikasi sudah di-deploy dan tidak error
4. Cek console browser untuk error JavaScript
5. Pastikan `vercel.json` sudah dikonfigurasi dengan benar untuk SPA routing

### Problem: "Error: Cannot find module" atau build error

**Solusi:**
1. Pastikan semua dependencies terinstall: `npm install`
2. Build aplikasi: `npm run build`
3. Test build lokal: `npm run preview`
4. Cek log build di Vercel/Netlify

### Problem: "SDK initialization error"

**Solusi:**
1. Pastikan `mockEnv.ts` sudah di-setup dengan benar
2. Pastikan `init.ts` dipanggil setelah `setupMockEnvironment()`
3. Cek console browser untuk error detail
4. Pastikan aplikasi bisa berjalan di browser biasa dulu

### Problem: "Routing tidak bekerja"

**Solusi:**
1. Pastikan menggunakan `HashRouter` (sudah dikonfigurasi)
2. Pastikan `vercel.json` ada dengan konfigurasi rewrites
3. Untuk Netlify, buat file `_redirects` di folder `public`:
   ```
   /*    /index.html   200
   ```

## 📝 Checklist Setup

- [ ] Bot sudah dibuat di BotFather
- [ ] Bot token sudah disimpan dengan aman
- [ ] Aplikasi sudah di-deploy dan bisa diakses via HTTPS
- [ ] Mini App sudah dikonfigurasi di BotFather
- [ ] URL di `tonconnect-manifest.json` sudah di-update
- [ ] Aplikasi bisa dibuka dari Telegram
- [ ] Semua fitur berfungsi dengan baik
- [ ] Data tersimpan di localStorage (untuk testing)

## 🔐 Security Notes

1. **Jangan share Bot Token** ke publik atau commit ke GitHub
2. Jika menggunakan backend, simpan Bot Token di environment variables
3. Untuk production, pertimbangkan untuk:
   - Verifikasi `initData` di backend
   - Implementasi authentication/authorization
   - Rate limiting untuk API calls

## 📚 Referensi

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [@tma.js/sdk-react Documentation](https://docs.telegram-mini-apps.com/packages/tma-js-sdk-react)
- [BotFather Guide](https://core.telegram.org/bots/tutorial)

## 🆘 Support

Jika mengalami masalah:
1. Cek console browser untuk error
2. Cek log build di platform deployment
3. Test aplikasi di browser biasa dulu
4. Pastikan semua langkah di atas sudah diikuti

---

**Catatan:** Aplikasi ini dirancang untuk berjalan di Telegram Mini Apps, tetapi juga bisa diakses sebagai web app biasa untuk development dan testing.

