# 🗄️ Database Migration di Coolify Backend

## 📋 Opsi untuk Menjalankan Migration

Ada 3 cara untuk menjalankan migration di Coolify:

### Opsi 1: Via Terminal Coolify (Recommended) ⭐

**Langkah:**
1. Buka Coolify Dashboard → Pilih deployment backend
2. Klik tab **Terminal**
3. Jalankan command:
   ```bash
   npm run migrate
   ```

**Keuntungan:**
- ✅ Bisa melihat output migration secara real-time
- ✅ Bisa handle error dengan mudah
- ✅ Tidak perlu rebuild deployment

### Opsi 2: Via Startup Command (Auto-migrate)

Tambahkan startup command di Coolify:

1. Buka **Configuration** → **General**
2. Di bagian **Start Command**, ubah dari:
   ```
   npm start
   ```
   Menjadi salah satu dari:
   
   **Option A (Safe - continue even if migration fails):**
   ```
   npm run migrate || true && npm start
   ```
   
   **Option B (Using start script):**
   ```
   sh start.sh
   ```
   
   **Option C (Direct - strict):**
   ```
   npm run migrate && npm start
   ```

**Keuntungan:**
- ✅ Migration otomatis jalan setiap deployment
- ✅ Tidak perlu manual run migration
- ✅ Option A: Deployment tetap start meskipun migration gagal (safety)

**Kekurangan:**
- ⚠️ Option C: Jika migration gagal, deployment tidak akan start (lebih strict)

### Opsi 3: Via Dockerfile (Build Time)

Update Dockerfile untuk include migration di build process:

**Langkah:**
1. Edit `reactjs-template/backend/Dockerfile`
2. Tambahkan migration command sebelum `CMD`

**Catatan:** Opsi ini sudah di-comment di Dockerfile karena lebih baik run migration setelah container start (karena butuh database connection).

## 🚀 Cara yang Disarankan

### Untuk Production:

**Gunakan Opsi 1 (Terminal)** untuk migration pertama kali atau migration manual.

**Untuk auto-migrate setiap deployment, gunakan Opsi 2** dengan startup command:
```
npm run migrate || true && npm start
```

Command `|| true` memastikan deployment tetap start meskipun migration gagal (untuk safety).

## 📝 Contoh Command

### Migration Normal
```bash
npm run migrate
```

### Migration dengan Output Detail
```bash
npm run migrate 2>&1 | tee migration.log
```

### Check Migration Status
```bash
# Connect ke database dan check schema_migrations table
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY executed_at DESC;"
```

## ⚠️ Catatan Penting

1. **Backup Database**: Selalu backup database sebelum migration di production
2. **Test Migration**: Test migration di staging environment dulu
3. **Migration Order**: Migration dijalankan berdasarkan nama file (alphabetical)
   - **PENTING**: `001_initial_schema.sql` harus dijalankan pertama kali untuk membuat semua table dasar
   - Setelah itu, migration lain seperti `add_cabang_to_terapis.sql` bisa dijalankan
4. **Idempotent**: Migration sudah idempotent (bisa dijalankan berkali-kali tanpa error)
5. **First Time Setup**: Jika database masih kosong, pastikan `001_initial_schema.sql` dijalankan dulu

## 🐛 Troubleshooting

### Migration Gagal?
1. Check database connection: `DATABASE_URL` sudah benar
2. Check migration files: Pastikan file migration valid
3. Check logs: Lihat error message di terminal/output
4. Rollback: Jika perlu, restore dari backup

### Migration Sudah Pernah Di-run?
- ✅ Tidak masalah, migration system akan skip migration yang sudah dijalankan
- ✅ Check di table `schema_migrations` untuk melihat migration yang sudah dijalankan

