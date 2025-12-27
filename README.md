# Training App - Sistem Manajemen Training Terapis

Aplikasi web untuk manajemen data terapis, training need analysis (TNA), evaluasi pasca pelatihan, dan jadwal training.

## 🚀 Fitur Utama

### 1. Data Terapis
- CRUD (Create, Read, Update, Delete) data terapis
- Pencarian terapis
- Detail terapis dengan informasi lengkap
- Relasi dengan TNA dan Evaluasi

### 2. Form TNA (Training Need Analysis)
- Form analisis kebutuhan training per terapis
- Input data training rows (jenis topik, alasan, peserta, rencana pelaksanaan, budget)
- Data approval (diajukan, direview, disetujui)
- Relasi 1:1 dengan terapis

### 3. Form Evaluasi Pasca Pelatihan
- Form evaluasi setelah pelatihan per terapis
- Tujuan pelatihan (5 baris dengan textarea)
- Pengetahuan, keterampilan dengan proficiency level (sebelum/sesudah)
- Harapan, komentar dan saran (5 baris dengan textarea)
- Relasi 1:1 dengan terapis

### 4. Jadwal Training
- Calendar view dengan navigasi tahun
- Tabel jadwal training dengan 52 minggu
- Kategori training: BASIC, TECHNICAL, MANAGERIAL, HSE
- Planning columns: Durasi, Class/Field, Trainer, Target Trainee
- Marking jadwal per minggu dengan klik
- Filter berdasarkan kategori

## 🛠️ Teknologi

- **React** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Telegram Mini Apps SDK** - Telegram integration
- **LocalStorage** - Data persistence (frontend-only)

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Struktur Project

```
reactjs-template/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Dashboard/
│   │   ├── PageHeader/
│   │   ├── BottomNavigation/
│   │   └── Page.tsx
│   ├── pages/               # Page components
│   │   ├── IndexPage/       # Dashboard
│   │   ├── DataTerapisPage/ # Data terapis
│   │   ├── DetailTerapisPage/ # Detail terapis
│   │   ├── FormTNAPage/    # Form TNA
│   │   ├── FormEvaluasiPage/ # Form Evaluasi
│   │   └── DataTrainingPage/ # Jadwal Training
│   ├── store/               # Data store
│   │   └── dataStore.ts     # TNA & Evaluasi store
│   ├── navigation/          # Routing
│   │   └── routes.tsx
│   └── index.css            # Global styles
├── BACKEND_DOCUMENTATION.md # Dokumentasi backend lengkap
└── README.md
```

## 🔌 Backend Integration

Aplikasi ini saat ini menggunakan localStorage untuk penyimpanan data. Untuk integrasi dengan backend, lihat dokumentasi lengkap di [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md).

Dokumentasi backend mencakup:
- Database schema (10 tabel)
- API endpoints lengkap
- Request/Response format
- Contoh implementasi (Node.js, PHP/Laravel)
- Error handling
- Security best practices

## 📱 Pages

1. **Dashboard** (`/`) - Overview dan menu utama
2. **Data Terapis** (`/data-terapis`) - Kelola data terapis
3. **Detail Terapis** (`/detail-terapis?id=xxx`) - Detail terapis dengan TNA dan Evaluasi
4. **Form TNA** (`/form-tna?terapisId=xxx`) - Buat/edit TNA
5. **Form Evaluasi** (`/form-evaluasi?terapisId=xxx`) - Buat/edit Evaluasi
6. **Jadwal Training** (`/data-training`) - Kelola jadwal training
7. **Setting** (`/setting`) - Pengaturan aplikasi

## 🎨 Design

- **Font**: Quicksand (Google Fonts)
- **Icons**: Font Awesome 6.0
- **Color Scheme**: Light theme dengan background #F8F9FA
- **UI Style**: Modern, clean, responsive

## 📝 Data Structure

### Terapis
```typescript
interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
  tanggalRequirement: string;
  mulaiKontrak?: string;
  endKontrak?: string;
  alamat?: string;
  noTelp?: string;
  email?: string;
}
```

### TNA
```typescript
interface TNAData {
  id: string;
  terapisId: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  unit: string;
  departement: string;
  trainingRows: Array<{...}>;
  approvalData: {...};
}
```

### Evaluasi
```typescript
interface EvaluasiData {
  id: string;
  terapisId: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  nama: string;
  departemen: string;
  // ... more fields
  tujuanPelatihan: string[];
  proficiencyRows: Array<{...}>;
  harapanKomentar: string[];
}
```

### Training Module
```typescript
interface TrainingModule {
  id: string;
  category: 'BASIC' | 'TECHNICAL' | 'MANAGERIAL' | 'HSE';
  moduleName: string;
  durasi: string;
  classField: string;
  trainer: string;
  targetTrainee: 'P' | 'A';
  weeks: Set<number>; // Week numbers 1-52
  year: number;
}
```

## 🔐 Data Persistence

Saat ini data disimpan di localStorage dengan keys:
- `terapis_list` - Data terapis
- `tna_data` - Data TNA
- `evaluasi_data` - Data Evaluasi
- `training_modules_{year}` - Data training modules per tahun

## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

Output akan berada di folder `dist/`.

### Deploy ke Vercel/Netlify
1. Push code ke GitHub
2. Connect repository ke Vercel/Netlify
3. Deploy otomatis akan berjalan

## 📱 Setup Telegram Bot

Untuk mengakses aplikasi dari Telegram, ikuti panduan lengkap di **[TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)**.

**Quick Start:**
1. Buat bot di [@BotFather](https://t.me/BotFather)
2. Deploy aplikasi ke Vercel/Netlify (pastikan HTTPS)
3. Konfigurasi Mini App di BotFather dengan URL aplikasi
4. Test aplikasi dari Telegram

Lihat **[TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)** untuk instruksi detail.

## 📄 License

MIT License

## 👥 Contributors

- Development Team

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

---

**Note**: Aplikasi ini dirancang untuk Telegram Mini Apps, tetapi juga dapat berjalan sebagai aplikasi web standalone.
