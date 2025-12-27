# Quick Start Guide

## Setup Backend

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Setup database**:
   - Buat file `.env` di folder `backend/`
   - Isi dengan connection string PostgreSQL:
     ```
     DATABASE_URL=postgres://user:password@host:5432/database
     PORT=3000
     CORS_ORIGIN=http://localhost:5173
     JWT_SECRET=your-secret-key-here
     ```

3. **Run migration**:
   ```bash
   npm run migrate
   ```

4. **Create admin user**:
   ```bash
   npm run seed:admin
   ```

5. **Start backend**:
   ```bash
   npm start
   ```

   Backend akan running di `http://localhost:3000`

## Setup Frontend

1. **Install dependencies**:
   ```bash
   cd reactjs-template
   npm install
   ```

2. **Setup environment**:
   - Buat file `.env` di folder `reactjs-template/`
   - Isi dengan:
     ```
     VITE_API_URL=http://localhost:3000
     ```

3. **Start frontend**:
   ```bash
   npm run dev
   ```

   Frontend akan running di `http://localhost:5173`

## Login

1. Buka browser: `http://localhost:5173`
2. Akan redirect ke `/login`
3. Login dengan:
   - **Username**: `admin`
   - **Password**: `admin123`

## Troubleshooting "Failed to fetch"

### 1. Pastikan Backend Running
```bash
# Test backend health
curl http://localhost:3000/health
```

### 2. Pastikan .env File Ada
- Frontend: `reactjs-template/.env` dengan `VITE_API_URL=http://localhost:3000`
- Backend: `backend/.env` dengan `DATABASE_URL` dan config lainnya

### 3. Restart Dev Server
Setelah membuat/update `.env`, **harus restart**:
```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### 4. Check Browser Console
Buka Developer Tools (F12) dan lihat:
- Error messages
- Network tab untuk melihat request yang gagal
- Console untuk API config logs

### 5. Check CORS
Pastikan backend `.env` memiliki:
```
CORS_ORIGIN=http://localhost:5173
```

## Verify Setup

### Test Backend
```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### Test Frontend API Config
Buka browser console, seharusnya ada log:
```
[API Config] {
  API_BASE_URL: "http://localhost:3000",
  API_VERSION: "v1",
  API_URL: "http://localhost:3000/api/v1",
  env: "from .env" // atau "default"
}
```

## Common Issues

### "Failed to fetch"
- ✅ Backend running?
- ✅ `.env` file ada?
- ✅ Dev server di-restart setelah update `.env`?

### "401 Unauthorized"
- ✅ Sudah login?
- ✅ Token masih valid?
- ✅ Admin user sudah dibuat?

### "Database connection error"
- ✅ Database connection string benar?
- ✅ Database sudah dibuat?
- ✅ Migration sudah di-run?

