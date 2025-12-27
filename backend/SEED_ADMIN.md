# Seeder Admin User

Script sederhana untuk membuat admin user di database.

## Cara Menggunakan

### 1. Menggunakan NPM Script (Recommended)

```bash
npm run seed:admin
```

### 2. Menggunakan Node Langsung

```bash
node src/database/seed-admin.js
```

## Environment Variables (Optional)

Anda bisa mengatur custom credentials dengan environment variables:

```bash
# .env file
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@training.app
ADMIN_FULL_NAME=System Administrator
```

Atau set langsung saat menjalankan:

```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypassword npm run seed:admin
```

## Default Credentials

Jika tidak diatur, default credentials adalah:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@training.app`
- **Full Name**: `System Administrator`

## Fitur

- ✅ Auto-create roles table jika belum ada
- ✅ Auto-create admin role jika belum ada
- ✅ Auto-create users table jika belum ada
- ✅ Check jika admin sudah ada (tidak akan duplicate)
- ✅ Hash password dengan bcrypt
- ✅ Safe untuk dijalankan berkali-kali (idempotent)

## Catatan

⚠️ **PENTING**: Setelah login pertama kali, segera ubah password default!

## Troubleshooting

### Error: "relation does not exist"
Pastikan database sudah dibuat dan connection string di `.env` benar.

### Error: "role does not exist"
Script akan otomatis membuat role "admin" jika belum ada.

### Admin sudah ada
Jika admin user sudah ada, script akan menampilkan pesan dan exit tanpa error.

