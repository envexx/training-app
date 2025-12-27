# Backend API - Training App

Backend API untuk Sistem Manajemen Training Terapis menggunakan Node.js, Express, dan PostgreSQL.

## 📦 Database Migrations

### Menjalankan Migrations

Untuk menjalankan semua migration yang belum dieksekusi:

```bash
npm run migrate
```

Script ini akan:
- Membuat tabel `schema_migrations` jika belum ada
- Menjalankan semua file `.sql` dari folder `migrations/` secara berurutan
- Mencatat migration yang sudah dieksekusi untuk menghindari duplikasi
- Skip migration yang sudah pernah dijalankan

### Menambah Migration Baru

1. Buat file SQL baru di folder `migrations/` dengan format: `YYYYMMDD_description.sql`
   Contoh: `20240101_add_cabang_to_terapis.sql`

2. Tulis SQL migration di file tersebut

3. Jalankan `npm run migrate`

**Note:** Data terhapus tidak masalah, jadi migration bisa menggunakan `DROP COLUMN IF EXISTS` atau `DROP TABLE IF EXISTS`.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm atau pnpm

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup database:**
   - Buat database PostgreSQL:
     ```sql
     CREATE DATABASE training_app;
     ```
   - Atau gunakan psql:
     ```bash
     createdb training_app
     ```

3. **Setup environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` dan sesuaikan dengan konfigurasi database Anda:
   
   **Option 1: Connection String (Recommended)**
   ```env
   DATABASE_URL=postgres://user:password@host:port/database?sslmode=require&pool=true
   ```
   
   **Option 2: Individual Config**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=training_app
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
   
   **Note:** Jika menggunakan connection string, individual config akan diabaikan.
   
   Lihat [SETUP_DATABASE.md](./SETUP_DATABASE.md) untuk detail lengkap.

4. **Run database migration:**
   ```bash
   npm run migrate
   ```
   
   Ini akan membuat semua tabel dan index yang diperlukan.

5. **Start server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

Server akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   └── migrate.js           # Migration script
│   ├── routes/
│   │   ├── terapis.routes.js    # Terapis endpoints
│   │   ├── requirement.routes.js # Requirement endpoints
│   │   ├── tna.routes.js        # TNA endpoints
│   │   ├── evaluasi.routes.js    # Evaluasi endpoints
│   │   └── training.routes.js   # Training endpoints
│   └── server.js                 # Express server
├── package.json
├── env.example                   # Environment variables template
└── README.md
```

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Health Check
- `GET /health` - Check server and database status

### Authentication
- `POST /auth/login` - Login user (returns JWT token)
- `POST /auth/register` - Register new user (admin only)
- `GET /auth/me` - Get current user info (requires auth)
- `POST /auth/change-password` - Change password (requires auth)

### Roles (Admin Only)
- `GET /roles` - Get all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Users (Admin Only)
- `GET /users` - Get all users (with pagination & search)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Audit Logs (Admin Only)
- `GET /audit` - Get all audit logs (with filters)
- `GET /audit/record/:tableName/:recordId` - Get audit logs for a specific record
- `GET /audit/user/:userId` - Get audit logs for a specific user

### Terapis
- `GET /terapis` - Get all terapis (with pagination & search)
- `GET /terapis/:id` - Get terapis by ID
- `POST /terapis` - Create new terapis
- `PUT /terapis/:id` - Update terapis
- `DELETE /terapis/:id` - Delete terapis

### Requirement
- `GET /requirement` - Get all requirements
- `GET /requirement/:id` - Get requirement by ID
- `POST /requirement` - Create new requirement
- `POST /requirement/:id/accept` - Accept requirement (move to terapis)
- `DELETE /requirement/:id` - Reject/Delete requirement

### TNA (Training Need Analysis)
- `GET /tna/terapis/:terapisId` - Get TNA by terapis ID
- `POST /tna` - Create or update TNA
- `DELETE /tna/:id` - Delete TNA

### Evaluasi
- `GET /evaluasi/terapis/:terapisId` - Get Evaluasi by terapis ID
- `POST /evaluasi` - Create or update Evaluasi
- `DELETE /evaluasi/:id` - Delete Evaluasi

### Training
- `GET /training/modules` - Get training modules (with filters)
- `GET /training/modules/:id` - Get module by ID
- `POST /training/modules` - Create training module
- `PUT /training/modules/:id` - Update training module
- `DELETE /training/modules/:id` - Delete training module
- `POST /training/modules/:id/schedule` - Schedule week for module
- `DELETE /training/modules/:id/schedule/:week` - Unschedule week

## 📊 Database Schema

Database menggunakan PostgreSQL dengan 13 tabel utama:

1. `requirement` - Data requirement terapis
2. `terapis` - Data terapis
3. `tna` - Training Need Analysis (1:1 dengan terapis)
4. `tna_training_rows` - Baris training dalam TNA
5. `tna_approval` - Data approval TNA
6. `evaluasi` - Evaluasi pasca pelatihan (1:1 dengan terapis)
7. `evaluasi_tujuan_pelatihan` - Tujuan pelatihan (5 baris)
8. `evaluasi_proficiency` - Proficiency level (5 baris)
9. `evaluasi_harapan_komentar` - Harapan, komentar (5 baris)
10. `training_modules` - Modul training
11. `training_scheduled_weeks` - Jadwal training per minggu
12. `roles` - Role/peran pengguna
13. `users` - Data pengguna dengan autentikasi
14. `audit_logs` - Audit trail untuk semua operasi CRUD

Lihat `src/database/schema.sql` untuk detail lengkap.

## 🔧 Development

### Run in development mode:
```bash
npm run dev
```

### Run database migration:
```bash
npm run migrate
```

### Test API:
```bash
# Health check
curl http://localhost:3000/health

# Get all terapis
curl http://localhost:3000/api/v1/terapis
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `training_app` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `API_VERSION` | API version | `v1` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `ADMIN_PASSWORD` | Default admin password (for create-admin script) | `admin123` |

## 🐛 Troubleshooting

### Database connection error
- Pastikan PostgreSQL sudah running
- Cek credentials di `.env`
- Pastikan database sudah dibuat

### Migration error
- Pastikan PostgreSQL extension `uuid-ossp` tersedia
- Cek apakah tabel sudah ada (migration tidak idempotent untuk existing tables)

### Port already in use
- Ubah `PORT` di `.env`
- Atau kill process yang menggunakan port tersebut

## 📚 Documentation

Lihat `BACKEND_DOCUMENTATION.md` di root project untuk dokumentasi lengkap API endpoints dan request/response format.

## 📊 Audit Trail

Sistem ini memiliki audit trail lengkap untuk semua operasi CRUD:

- **Automatic Logging**: Semua operasi CREATE, UPDATE, DELETE otomatis tercatat
- **User Tracking**: Setiap record menyimpan `created_by` dan `updated_by`
- **Audit Logs**: Tabel `audit_logs` menyimpan:
  - Table name dan record ID
  - Action (CREATE, UPDATE, DELETE)
  - User yang melakukan (ID, username)
  - Old data dan new data (JSON)
  - IP address dan user agent
  - Timestamp

**Query Audit Logs:**
- Get logs untuk record tertentu: `GET /api/v1/audit/record/:tableName/:recordId`
- Get logs untuk user tertentu: `GET /api/v1/audit/user/:userId`
- Get semua logs dengan filter: `GET /api/v1/audit?tableName=terapis&action=UPDATE`

## 🔐 Security Notes

- Jangan commit file `.env` ke Git
- Gunakan environment variables untuk sensitive data
- **Ubah JWT_SECRET** di production dengan string yang kuat dan random
- **Ubah default admin password** setelah first login
- Semua API endpoints (kecuali `/auth/login`) memerlukan JWT token di header:
  ```
  Authorization: Bearer <token>
  ```
- **Audit Trail**: Semua operasi CRUD tercatat dengan detail user, timestamp, dan perubahan data
- Untuk production, pertimbangkan:
  - Rate limiting
  - HTTPS only
  - Token refresh mechanism
  - Password complexity requirements
  - SQL injection protection (sudah ada - menggunakan parameterized queries)
  - Regular backup audit logs (karena akan terus bertambah)

