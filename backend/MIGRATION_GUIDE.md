# Database Migration Guide

## Cara Menggunakan Migration

### Menjalankan Migration

Jalankan semua migration yang belum dieksekusi:

```bash
cd backend
npm run migrate
```

Script ini akan:
- ✅ Membuat tabel `schema_migrations` untuk tracking migration
- ✅ Menjalankan semua file `.sql` dari folder `migrations/` secara berurutan
- ✅ Mencatat migration yang sudah dieksekusi
- ✅ Skip migration yang sudah pernah dijalankan

### Menambah Migration Baru

1. **Buat file SQL baru** di folder `migrations/` dengan format:
   ```
   YYYYMMDD_description.sql
   ```
   
   Contoh:
   - `20240101_add_cabang_to_terapis.sql`
   - `20240102_add_new_field.sql`

2. **Tulis SQL migration** di file tersebut:
   ```sql
   -- Migration: Add cabang column to terapis table
   ALTER TABLE terapis DROP COLUMN IF EXISTS cabang;
   ALTER TABLE terapis 
   ADD COLUMN cabang VARCHAR(50) CHECK (cabang IN ('Batu Aji', 'Tiban') OR cabang IS NULL);
   ```

3. **Jalankan migration**:
   ```bash
   npm run migrate
   ```

### Catatan Penting

- ⚠️ **Data Loss**: Migration menggunakan `DROP COLUMN IF EXISTS` atau `DROP TABLE IF EXISTS`, jadi data bisa terhapus. Pastikan backup jika diperlukan.
- ✅ **Idempotent**: Migration bisa dijalankan berulang kali tanpa error (kecuali ada konflik)
- 📝 **Tracking**: Semua migration yang sudah dijalankan dicatat di tabel `schema_migrations`
- 🔄 **Order**: Migration dijalankan berdasarkan urutan alfabet nama file

### Troubleshooting

**Error: "relation does not exist"**
- Pastikan tabel sudah dibuat sebelumnya
- Atau tambahkan `CREATE TABLE IF NOT EXISTS` di migration

**Error: "column already exists"**
- Gunakan `DROP COLUMN IF EXISTS` sebelum `ADD COLUMN`
- Atau gunakan `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (PostgreSQL 9.6+)

**Migration sudah dijalankan tapi ingin dijalankan lagi**
- Hapus record dari tabel `schema_migrations`:
  ```sql
  DELETE FROM schema_migrations WHERE filename = 'add_cabang_to_terapis.sql';
  ```

### Contoh Migration Files

**File: `migrations/20240101_add_cabang_to_terapis.sql`**
```sql
-- Migration: Add cabang column to terapis table
ALTER TABLE terapis DROP COLUMN IF EXISTS cabang;
ALTER TABLE terapis 
ADD COLUMN cabang VARCHAR(50) CHECK (cabang IN ('Batu Aji', 'Tiban') OR cabang IS NULL);
COMMENT ON COLUMN terapis.cabang IS 'Cabang terapis: Batu Aji atau Tiban (optional)';
```

**File: `migrations/20240102_add_index.sql`**
```sql
-- Migration: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_terapis_cabang ON terapis(cabang);
CREATE INDEX IF NOT EXISTS idx_terapis_nama ON terapis(nama);
```

