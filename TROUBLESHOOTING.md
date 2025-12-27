# Troubleshooting "Failed to fetch" Error

## Penyebab Umum

### 1. Backend Server Tidak Running

**Gejala**: Error "Failed to fetch" saat mengakses API

**Solusi**:
```bash
# Pastikan backend server running
cd backend
npm start

# Atau untuk development dengan auto-reload
npm run dev
```

Backend harus running di `http://localhost:3000` (atau port yang dikonfigurasi)

### 2. Environment Variable Tidak Di-Set

**Gejala**: Frontend tidak bisa connect ke backend

**Solusi**:
1. Buat file `.env` di root folder `reactjs-template/`
2. Isi dengan:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. **Restart dev server** setelah membuat/update `.env`:
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   npm run dev
   ```

⚠️ **PENTING**: Vite hanya membaca `.env` saat server start. Harus restart setelah update!

### 3. CORS Error

**Gejala**: Error di browser console tentang CORS policy

**Solusi**:
1. Pastikan backend CORS sudah dikonfigurasi di `backend/src/server.js`:
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     credentials: true
   }));
   ```

2. Set `CORS_ORIGIN` di backend `.env`:
   ```
   CORS_ORIGIN=http://localhost:5173
   ```

3. Restart backend server

### 4. Port Tidak Sesuai

**Gejala**: Backend running di port berbeda

**Solusi**:
1. Cek port backend di `backend/.env`:
   ```
   PORT=3000
   ```

2. Update frontend `.env` sesuai:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Restart kedua server

### 5. Network/Firewall Issue

**Gejala**: Tidak bisa connect meskipun backend running

**Solusi**:
1. Cek apakah backend accessible:
   ```bash
   # Test di browser atau curl
   curl http://localhost:3000/health
   ```

2. Cek firewall/antivirus yang mungkin block connection

### 6. Database Connection Error

**Gejala**: Backend running tapi error saat query database

**Solusi**:
1. Pastikan database connection string di `backend/.env` benar
2. Test connection:
   ```bash
   cd backend
   npm run migrate
   ```

## Checklist Debugging

- [ ] Backend server running? (`npm start` di folder backend)
- [ ] Frontend `.env` file ada dan berisi `VITE_API_URL`?
- [ ] Dev server di-restart setelah update `.env`?
- [ ] Backend `.env` ada dan database connection string benar?
- [ ] CORS origin di backend sesuai dengan frontend URL?
- [ ] Port backend dan frontend tidak conflict?
- [ ] Database sudah di-migrate? (`npm run migrate`)
- [ ] Admin user sudah dibuat? (`npm run seed:admin`)

## Test Connection

### Test Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### Test API Endpoint
```bash
curl http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test dari Browser Console
```javascript
// Test API connection
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Common Error Messages

### "Failed to fetch"
- Backend tidak running
- URL salah
- CORS issue
- Network issue

### "NetworkError when attempting to fetch resource"
- Backend tidak accessible
- Firewall blocking
- Wrong URL

### "CORS policy: No 'Access-Control-Allow-Origin'"
- CORS tidak dikonfigurasi di backend
- Origin tidak match

### "401 Unauthorized"
- Token expired atau invalid
- Belum login
- Token tidak dikirim di header

## Quick Fix Script

```bash
# 1. Start backend
cd backend
npm start &

# 2. Setup frontend env
cd ../reactjs-template
echo "VITE_API_URL=http://localhost:3000" > .env

# 3. Start frontend
npm run dev
```

