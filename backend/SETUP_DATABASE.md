# Setup Database - Training App

## Database Connection

Aplikasi ini menggunakan PostgreSQL database. Ada dua cara untuk mengkonfigurasi koneksi:

### Option 1: Connection String (Recommended)

Gunakan `DATABASE_URL` untuk koneksi langsung:

```env
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require&pool=true
```

**Untuk project ini, gunakan:**
```env
DATABASE_URL=postgres://9cf6dd183241e89475da66046714f239a389d2979088b658415ec4f4f95e9f03:sk_Jfhz11-sxmE3lP4BKiQLg@db.prisma.io:5432/postgres?sslmode=require&pool=true
```

### Option 2: Individual Config

Atau gunakan konfigurasi terpisah:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=training_app
DB_USER=postgres
DB_PASSWORD=your_password
```

## Setup Steps

1. **Copy environment file:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit `.env` file:**
   - Jika menggunakan connection string, uncomment dan isi `DATABASE_URL`
   - Jika menggunakan individual config, isi `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

3. **Run database migration:**
   ```bash
   npm run migrate
   ```
   
   Ini akan membuat semua tabel yang diperlukan.

4. **Create default admin user:**
   ```bash
   npm run create-admin
   ```
   
   Default credentials:
   - Username: `admin`
   - Password: `admin123`
   
   ⚠️ **PENTING**: Ubah password setelah first login!

5. **Test connection:**
   ```bash
   npm run dev
   ```
   
   Cek health endpoint: `http://localhost:3000/health`

## Troubleshooting

### Connection Error

Jika mendapat error koneksi:

1. **Cek DATABASE_URL format:**
   - Pastikan format: `postgres://user:password@host:port/database?params`
   - Pastikan tidak ada spasi di connection string
   - Pastikan SSL mode sesuai (biasanya `sslmode=require` untuk cloud databases)

2. **Cek network/firewall:**
   - Pastikan IP Anda diizinkan mengakses database
   - Untuk cloud databases, mungkin perlu whitelist IP

3. **Cek credentials:**
   - Pastikan username dan password benar
   - Pastikan database name benar

### SSL Connection Error

Jika mendapat SSL error:

- Pastikan `sslmode=require` ada di connection string
- Atau set `sslmode=disable` untuk development (tidak recommended untuk production)

### Migration Error

Jika migration gagal:

1. Pastikan database sudah dibuat
2. Pastikan user memiliki permission untuk create tables
3. Pastikan extension `uuid-ossp` tersedia:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## Database Schema

Setelah migration berhasil, akan ada 14 tabel:

1. `requirement` - Data requirement terapis
2. `terapis` - Data terapis
3. `tna` - Training Need Analysis
4. `tna_training_rows` - Baris training dalam TNA
5. `tna_approval` - Approval TNA
6. `evaluasi` - Evaluasi pasca pelatihan
7. `evaluasi_tujuan_pelatihan` - Tujuan pelatihan
8. `evaluasi_proficiency` - Proficiency level
9. `evaluasi_harapan_komentar` - Harapan dan komentar
10. `training_modules` - Modul training
11. `training_scheduled_weeks` - Jadwal training per minggu
12. `roles` - Role/peran pengguna
13. `users` - Data pengguna
14. `audit_logs` - Audit trail

## Backup & Restore

### Backup Database

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
psql $DATABASE_URL < backup.sql
```

## Production Notes

1. **Jangan commit `.env` file** ke Git
2. **Gunakan connection pooling** (sudah dikonfigurasi)
3. **Monitor connection pool** usage
4. **Setup regular backups**
5. **Use SSL** untuk production (sslmode=require)
6. **Rotate credentials** secara berkala

