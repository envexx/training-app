# Dokumentasi Backend - Sistem Manajemen Training Terapis

## Daftar Isi
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Format](#requestresponse-format)
5. [Contoh Implementasi](#contoh-implementasi)
6. [Error Handling](#error-handling)
7. [Authentication & Authorization](#authentication--authorization)

---

## Overview

Sistem ini terdiri dari beberapa modul utama:
1. **Data Terapis** - Manajemen data terapis
2. **Form TNA (Training Need Analysis)** - Analisis kebutuhan training per terapis
3. **Form Evaluasi Pasca Pelatihan** - Evaluasi setelah pelatihan per terapis
4. **Jadwal Training** - Penjadwalan training dengan calendar view

Setiap terapis memiliki relasi 1:1 dengan TNA dan Evaluasi.

---

## Database Schema

### 1. Tabel: `terapis`

Menyimpan data terapis.

```sql
CREATE TABLE terapis (
    id VARCHAR(255) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    lulusan VARCHAR(255) NOT NULL,
    tanggal_requirement DATE NOT NULL,
    mulai_kontrak DATE,
    end_kontrak DATE,
    alamat TEXT,
    no_telp VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nama (nama),
    INDEX idx_lulusan (lulusan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field Required:**
- `id` (UUID atau auto-increment)
- `nama`
- `lulusan`
- `tanggal_requirement`

**Field Optional:**
- `mulai_kontrak`
- `end_kontrak`
- `alamat`
- `no_telp`
- `email`

---

### 2. Tabel: `tna` (Training Need Analysis)

Menyimpan data TNA per terapis. Relasi 1:1 dengan terapis.

```sql
CREATE TABLE tna (
    id VARCHAR(255) PRIMARY KEY,
    terapis_id VARCHAR(255) NOT NULL UNIQUE,
    no_dokumen VARCHAR(255) NOT NULL,
    revisi VARCHAR(50) DEFAULT '0',
    tgl_berlaku DATE NOT NULL,
    unit VARCHAR(255) NOT NULL,
    departement VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (terapis_id) REFERENCES terapis(id) ON DELETE CASCADE,
    INDEX idx_terapis_id (terapis_id),
    INDEX idx_no_dokumen (no_dokumen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. Tabel: `tna_training_rows`

Menyimpan baris-baris training dalam TNA.

```sql
CREATE TABLE tna_training_rows (
    id VARCHAR(255) PRIMARY KEY,
    tna_id VARCHAR(255) NOT NULL,
    jenis_topik VARCHAR(255),
    alasan TEXT,
    peserta VARCHAR(255),
    rencana_pelaksanaan VARCHAR(255),
    budget_biaya VARCHAR(255),
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tna_id) REFERENCES tna(id) ON DELETE CASCADE,
    INDEX idx_tna_id (tna_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. Tabel: `tna_approval`

Menyimpan data approval untuk TNA.

```sql
CREATE TABLE tna_approval (
    id VARCHAR(255) PRIMARY KEY,
    tna_id VARCHAR(255) NOT NULL UNIQUE,
    diajukan_oleh VARCHAR(255),
    direview_oleh VARCHAR(255),
    disetujui_oleh_1 VARCHAR(255),
    disetujui_oleh_2 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tna_id) REFERENCES tna(id) ON DELETE CASCADE,
    INDEX idx_tna_id (tna_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. Tabel: `evaluasi`

Menyimpan data evaluasi pasca pelatihan per terapis. Relasi 1:1 dengan terapis.

```sql
CREATE TABLE evaluasi (
    id VARCHAR(255) PRIMARY KEY,
    terapis_id VARCHAR(255) NOT NULL UNIQUE,
    no_dokumen VARCHAR(255) NOT NULL,
    revisi VARCHAR(50) DEFAULT '0',
    tgl_berlaku DATE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    departemen VARCHAR(255) NOT NULL,
    divisi VARCHAR(255),
    jabatan VARCHAR(255),
    tgl_pelaksanaan DATE,
    sifat_pelatihan_general BOOLEAN DEFAULT FALSE,
    sifat_pelatihan_technical BOOLEAN DEFAULT FALSE,
    sifat_pelatihan_managerial BOOLEAN DEFAULT FALSE,
    nama_pelatihan VARCHAR(255),
    tempat VARCHAR(255) DEFAULT 'Mojokerto',
    tanggal DATE,
    yang_menilai VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (terapis_id) REFERENCES terapis(id) ON DELETE CASCADE,
    INDEX idx_terapis_id (terapis_id),
    INDEX idx_no_dokumen (no_dokumen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. Tabel: `evaluasi_tujuan_pelatihan`

Menyimpan tujuan pelatihan (5 baris).

```sql
CREATE TABLE evaluasi_tujuan_pelatihan (
    id VARCHAR(255) PRIMARY KEY,
    evaluasi_id VARCHAR(255) NOT NULL,
    urutan INT NOT NULL, -- 1-5
    tujuan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE,
    INDEX idx_evaluasi_id (evaluasi_id),
    UNIQUE KEY unique_evaluasi_urutan (evaluasi_id, urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. Tabel: `evaluasi_proficiency`

Menyimpan data proficiency (pengetahuan, keterampilan).

```sql
CREATE TABLE evaluasi_proficiency (
    id VARCHAR(255) PRIMARY KEY,
    evaluasi_id VARCHAR(255) NOT NULL,
    urutan INT NOT NULL, -- 1-5
    pengetahuan TEXT,
    sebelum VARCHAR(50), -- Score 0-100
    sesudah VARCHAR(50), -- Score 0-100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE,
    INDEX idx_evaluasi_id (evaluasi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8. Tabel: `evaluasi_harapan_komentar`

Menyimpan harapan, komentar dan saran (5 baris).

```sql
CREATE TABLE evaluasi_harapan_komentar (
    id VARCHAR(255) PRIMARY KEY,
    evaluasi_id VARCHAR(255) NOT NULL,
    urutan INT NOT NULL, -- 1-5
    harapan_komentar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE,
    INDEX idx_evaluasi_id (evaluasi_id),
    UNIQUE KEY unique_evaluasi_urutan (evaluasi_id, urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 9. Tabel: `training_modules`

Menyimpan modul training untuk jadwal training.

```sql
CREATE TABLE training_modules (
    id VARCHAR(255) PRIMARY KEY,
    category ENUM('BASIC', 'TECHNICAL', 'MANAGERIAL', 'HSE') NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    durasi VARCHAR(100),
    class_field VARCHAR(255),
    trainer VARCHAR(255),
    target_trainee ENUM('P', 'A') NOT NULL DEFAULT 'P',
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_year (year),
    INDEX idx_category_year (category, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 10. Tabel: `training_scheduled_weeks`

Menyimpan jadwal training per minggu (1-52).

```sql
CREATE TABLE training_scheduled_weeks (
    id VARCHAR(255) PRIMARY KEY,
    module_id VARCHAR(255) NOT NULL,
    week_number INT NOT NULL, -- 1-52
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_week_number (week_number),
    UNIQUE KEY unique_module_week (module_id, week_number),
    CHECK (week_number >= 1 AND week_number <= 52)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Base URL
```
https://api.yourdomain.com/api/v1
```

### Authentication
Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

---

### 1. Terapis Endpoints

#### GET `/terapis`
Mendapatkan daftar semua terapis.

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Pencarian berdasarkan nama atau lulusan

**Response:**
```json
{
  "success": true,
  "data": {
    "terapis": [
      {
        "id": "uuid-123",
        "nama": "Dr. Ahmad Fauzi",
        "lulusan": "S1 Kedokteran",
        "tanggalRequirement": "2024-01-15",
        "mulaiKontrak": "2024-02-01",
        "endKontrak": "2025-01-31",
        "alamat": "Jl. Sudirman No. 123",
        "noTelp": "081234567890",
        "email": "ahmad@example.com",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### GET `/terapis/:id`
Mendapatkan detail terapis berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "nama": "Dr. Ahmad Fauzi",
    "lulusan": "S1 Kedokteran",
    "tanggalRequirement": "2024-01-15",
    "mulaiKontrak": "2024-02-01",
    "endKontrak": "2025-01-31",
    "alamat": "Jl. Sudirman No. 123",
    "noTelp": "081234567890",
    "email": "ahmad@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/terapis`
Membuat terapis baru.

**Request Body:**
```json
{
  "nama": "Dr. Ahmad Fauzi",
  "lulusan": "S1 Kedokteran",
  "tanggalRequirement": "2024-01-15",
  "mulaiKontrak": "2024-02-01",
  "endKontrak": "2025-01-31",
  "alamat": "Jl. Sudirman No. 123",
  "noTelp": "081234567890",
  "email": "ahmad@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Terapis berhasil dibuat",
  "data": {
    "id": "uuid-123",
    "nama": "Dr. Ahmad Fauzi",
    ...
  }
}
```

#### PUT `/terapis/:id`
Update terapis.

**Request Body:** (sama dengan POST)

#### DELETE `/terapis/:id`
Hapus terapis. Akan otomatis menghapus TNA dan Evaluasi terkait (CASCADE).

---

### 2. TNA Endpoints

#### GET `/tna/terapis/:terapisId`
Mendapatkan TNA berdasarkan terapis ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tna-uuid",
    "terapisId": "uuid-123",
    "noDokumen": "TNA-001",
    "revisi": "0",
    "tglBerlaku": "2024-01-01",
    "unit": "Unit A",
    "departement": "Departemen B",
    "trainingRows": [
      {
        "id": "row-uuid",
        "jenisTopik": "Basic Training",
        "alasan": "Kebutuhan dasar",
        "peserta": "10 orang",
        "rencanaPelaksanaan": "Q1 2024",
        "budgetBiaya": "5000000"
      }
    ],
    "approvalData": {
      "diajukanOleh": "John Doe",
      "direviewOleh": "Jane Doe",
      "disetujuiOleh1": "Manager A",
      "disetujuiOleh2": "Manager B"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/tna`
Membuat atau update TNA (jika sudah ada untuk terapis tersebut).

**Request Body:**
```json
{
  "terapisId": "uuid-123",
  "noDokumen": "TNA-001",
  "revisi": "0",
  "tglBerlaku": "2024-01-01",
  "unit": "Unit A",
  "departement": "Departemen B",
  "trainingRows": [
    {
      "id": "row-uuid",
      "jenisTopik": "Basic Training",
      "alasan": "Kebutuhan dasar",
      "peserta": "10 orang",
      "rencanaPelaksanaan": "Q1 2024",
      "budgetBiaya": "5000000"
    }
  ],
  "approvalData": {
    "diajukanOleh": "John Doe",
    "direviewOleh": "Jane Doe",
    "disetujuiOleh1": "Manager A",
    "disetujuiOleh2": "Manager B"
  }
}
```

#### PUT `/tna/:id`
Update TNA yang sudah ada.

#### DELETE `/tna/:id`
Hapus TNA.

---

### 3. Evaluasi Endpoints

#### GET `/evaluasi/terapis/:terapisId`
Mendapatkan Evaluasi berdasarkan terapis ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "eval-uuid",
    "terapisId": "uuid-123",
    "noDokumen": "EVAL-001",
    "revisi": "0",
    "tglBerlaku": "2024-01-01",
    "nama": "Dr. Ahmad Fauzi",
    "departemen": "Departemen A",
    "divisi": "Divisi B",
    "jabatan": "Terapis Senior",
    "tglPelaksanaan": "2024-02-01",
    "sifatPelatihan": {
      "general": true,
      "technical": false,
      "managerial": false
    },
    "namaPelatihan": "Basic Training Program",
    "tujuanPelatihan": [
      "Tujuan 1",
      "Tujuan 2",
      "Tujuan 3",
      "Tujuan 4",
      "Tujuan 5"
    ],
    "proficiencyRows": [
      {
        "id": "prof-uuid",
        "pengetahuan": "Pengetahuan dasar",
        "sebelum": "60",
        "sesudah": "85"
      }
    ],
    "harapanKomentar": [
      "Harapan 1",
      "Harapan 2",
      "Harapan 3",
      "Harapan 4",
      "Harapan 5"
    ],
    "tempat": "Mojokerto",
    "tanggal": "2024-02-01",
    "yangMenilai": "Departemen Head",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/evaluasi`
Membuat atau update Evaluasi.

**Request Body:**
```json
{
  "terapisId": "uuid-123",
  "noDokumen": "EVAL-001",
  "revisi": "0",
  "tglBerlaku": "2024-01-01",
  "nama": "Dr. Ahmad Fauzi",
  "departemen": "Departemen A",
  "divisi": "Divisi B",
  "jabatan": "Terapis Senior",
  "tglPelaksanaan": "2024-02-01",
  "sifatPelatihan": {
    "general": true,
    "technical": false,
    "managerial": false
  },
  "namaPelatihan": "Basic Training Program",
  "tujuanPelatihan": ["Tujuan 1", "Tujuan 2", "Tujuan 3", "Tujuan 4", "Tujuan 5"],
  "proficiencyRows": [
    {
      "id": "prof-uuid",
      "pengetahuan": "Pengetahuan dasar",
      "sebelum": "60",
      "sesudah": "85"
    }
  ],
  "harapanKomentar": ["Harapan 1", "Harapan 2", "Harapan 3", "Harapan 4", "Harapan 5"],
  "tempat": "Mojokerto",
  "tanggal": "2024-02-01",
  "yangMenilai": "Departemen Head"
}
```

#### PUT `/evaluasi/:id`
Update Evaluasi.

#### DELETE `/evaluasi/:id`
Hapus Evaluasi.

---

### 4. Training Modules Endpoints

#### GET `/training-modules`
Mendapatkan daftar modul training.

**Query Parameters:**
- `year` (required): Tahun jadwal
- `category` (optional): Filter kategori (BASIC, TECHNICAL, MANAGERIAL, HSE)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "module-uuid",
      "category": "BASIC",
      "moduleName": "BASIC TRAINING",
      "durasi": "8 jam",
      "classField": "Class",
      "trainer": "Trainer A",
      "targetTrainee": "P",
      "year": 2024,
      "scheduledWeeks": [1, 2, 5, 10],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/training-modules/:id`
Mendapatkan detail modul training.

#### POST `/training-modules`
Membuat modul training baru.

**Request Body:**
```json
{
  "category": "BASIC",
  "moduleName": "BASIC TRAINING",
  "durasi": "8 jam",
  "classField": "Class",
  "trainer": "Trainer A",
  "targetTrainee": "P",
  "year": 2024,
  "scheduledWeeks": [1, 2, 5, 10]
}
```

#### PUT `/training-modules/:id`
Update modul training.

#### PATCH `/training-modules/:id/weeks`
Update jadwal minggu saja (lebih efisien).

**Request Body:**
```json
{
  "scheduledWeeks": [1, 2, 5, 10, 15]
}
```

#### DELETE `/training-modules/:id`
Hapus modul training.

---

## Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Contoh Implementasi

### Node.js/Express Example

```javascript
// routes/terapis.js
const express = require('express');
const router = express.Router();
const { TerapisController } = require('../controllers');

router.get('/', TerapisController.getAll);
router.get('/:id', TerapisController.getById);
router.post('/', TerapisController.create);
router.put('/:id', TerapisController.update);
router.delete('/:id', TerapisController.delete);

module.exports = router;

// controllers/TerapisController.js
class TerapisController {
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await TerapisService.getAll({ page, limit, search });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  }

  static async create(req, res) {
    try {
      // Validasi
      const { nama, lulusan, tanggalRequirement } = req.body;
      if (!nama || !lulusan || !tanggalRequirement) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nama, lulusan, dan tanggal requirement wajib diisi'
          }
        });
      }

      const terapis = await TerapisService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Terapis berhasil dibuat',
        data: terapis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  }
}

// services/TerapisService.js
class TerapisService {
  static async getAll({ page, limit, search }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM terapis WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nama LIKE ? OR lulusan LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const terapis = await db.query(query, params);
    const total = await db.query('SELECT COUNT(*) as total FROM terapis');

    return {
      terapis,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / limit)
      }
    };
  }

  static async create(data) {
    const id = uuidv4();
    const query = `
      INSERT INTO terapis 
      (id, nama, lulusan, tanggal_requirement, mulai_kontrak, end_kontrak, alamat, no_telp, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.nama,
      data.lulusan,
      data.tanggalRequirement,
      data.mulaiKontrak || null,
      data.endKontrak || null,
      data.alamat || null,
      data.noTelp || null,
      data.email || null
    ];

    await db.query(query, params);
    return await this.getById(id);
  }
}
```

### PHP/Laravel Example

```php
// app/Http/Controllers/TerapisController.php
namespace App\Http\Controllers;

use App\Models\Terapis;
use Illuminate\Http\Request;

class TerapisController extends Controller
{
    public function index(Request $request)
    {
        $query = Terapis::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('lulusan', 'like', "%{$search}%");
            });
        }

        $terapis = $query->paginate($request->get('limit', 10));

        return response()->json([
            'success' => true,
            'data' => $terapis
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'lulusan' => 'required|string|max:255',
            'tanggalRequirement' => 'required|date',
            'mulaiKontrak' => 'nullable|date',
            'endKontrak' => 'nullable|date',
            'alamat' => 'nullable|string',
            'noTelp' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $terapis = Terapis::create([
            'nama' => $validated['nama'],
            'lulusan' => $validated['lulusan'],
            'tanggal_requirement' => $validated['tanggalRequirement'],
            'mulai_kontrak' => $validated['mulaiKontrak'] ?? null,
            'end_kontrak' => $validated['endKontrak'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'no_telp' => $validated['noTelp'] ?? null,
            'email' => $validated['email'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Terapis berhasil dibuat',
            'data' => $terapis
        ], 201);
    }
}
```

---

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "nama": ["Nama wajib diisi"],
      "tanggalRequirement": ["Format tanggal tidak valid"]
    }
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Terapis tidak ditemukan"
  }
}
```

### Duplicate Error (untuk TNA/Evaluasi yang sudah ada)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Terapis ini sudah memiliki data TNA. Gunakan PUT untuk update."
  }
}
```

---

## Authentication & Authorization

### JWT Token
Semua endpoint memerlukan JWT token di header:
```
Authorization: Bearer <jwt_token>
```

### Token Format
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1234567890
}
```

### Role-based Access
- **Admin**: Full access
- **User**: Read-only untuk beberapa endpoint

---

## Frontend Integration

### Contoh penggunaan di Frontend

```typescript
// services/api.ts
const API_BASE_URL = 'https://api.yourdomain.com/api/v1';

export const terapisAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/terapis?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/terapis/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  create: async (data: TerapisData) => {
    const response = await fetch(`${API_BASE_URL}/terapis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id: string, data: TerapisData) => {
    const response = await fetch(`${API_BASE_URL}/terapis/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/terapis/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

---

## Catatan Penting

1. **Relasi 1:1**: Setiap terapis hanya memiliki 1 TNA dan 1 Evaluasi. Gunakan `UNIQUE` constraint pada `terapis_id`.

2. **CASCADE DELETE**: Saat terapis dihapus, TNA dan Evaluasi terkait akan otomatis terhapus.

3. **Data Validation**: 
   - Pastikan validasi di backend untuk semua required fields
   - Validasi format tanggal
   - Validasi email format
   - Validasi week_number (1-52)

4. **Performance**:
   - Gunakan index pada foreign keys
   - Gunakan pagination untuk list endpoints
   - Cache data yang sering diakses

5. **Security**:
   - Sanitize semua input
   - Gunakan prepared statements
   - Validasi file upload (jika ada)
   - Rate limiting untuk API

---

## Testing

### Contoh Test Cases

1. **Create Terapis**
   - Success: Valid data
   - Error: Missing required fields
   - Error: Invalid date format

2. **Get TNA by Terapis**
   - Success: TNA exists
   - Success: TNA not exists (return null)
   - Error: Invalid terapis ID

3. **Create TNA**
   - Success: New TNA
   - Error: TNA already exists for terapis
   - Error: Invalid terapis ID

4. **Update Training Schedule**
   - Success: Update weeks
   - Error: Invalid week number (> 52)
   - Error: Module not found

---

## Support

Untuk pertanyaan atau bantuan, hubungi:
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com

