// Store untuk menyimpan data TNA dan Evaluasi per terapis
interface TNAData {
  id: string;
  terapisId: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  unit: string;
  departement: string;
  trainingRows: Array<{
    id: string;
    jenisTopik: string;
    alasan: string;
    peserta: string;
    rencanaPelaksanaan: string;
    budgetBiaya: string;
  }>;
  approvalData: {
    diajukanOleh: string;
    direviewOleh: string;
    disetujuiOleh1: string;
    disetujuiOleh2: string;
  };
  createdAt: string;
}

interface EvaluasiData {
  id: string;
  terapisId: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  nama: string;
  departemen: string;
  divisi: string;
  jabatan: string;
  tglPelaksanaan: string;
  sifatPelatihan: {
    general: boolean;
    technical: boolean;
    managerial: boolean;
  };
  namaPelatihan: string;
  tujuanPelatihan: string[];
  proficiencyRows: Array<{
    id: string;
    pengetahuan: string;
    sebelum: string;
    sesudah: string;
  }>;
  harapanKomentar: string[];
  tempat: string;
  tanggal: string;
  yangMenilai: string;
  createdAt: string;
}

// Simpan di localStorage untuk persistensi
const STORAGE_KEYS = {
  TNA: 'tna_data',
  EVALUASI: 'evaluasi_data',
};

export const dataStore = {
  // TNA Methods
  getTNAByTerapis: (terapisId: string): TNAData | null => {
    const allTNA = dataStore.getAllTNA();
    return allTNA.find((tna) => tna.terapisId === terapisId) || null;
  },

  getAllTNA: (): TNAData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TNA);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTNA: (tnaData: TNAData): void => {
    const allTNA = dataStore.getAllTNA();
    const existingIndex = allTNA.findIndex((t) => t.id === tnaData.id);
    
    if (existingIndex >= 0) {
      allTNA[existingIndex] = tnaData;
    } else {
      allTNA.push(tnaData);
    }
    
    localStorage.setItem(STORAGE_KEYS.TNA, JSON.stringify(allTNA));
  },

  deleteTNA: (id: string): void => {
    const allTNA = dataStore.getAllTNA();
    const filtered = allTNA.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TNA, JSON.stringify(filtered));
  },

  // Evaluasi Methods
  getEvaluasiByTerapis: (terapisId: string): EvaluasiData | null => {
    const allEvaluasi = dataStore.getAllEvaluasi();
    return allEvaluasi.find((evaluasi) => evaluasi.terapisId === terapisId) || null;
  },

  getAllEvaluasi: (): EvaluasiData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVALUASI);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveEvaluasi: (evaluasiData: EvaluasiData): void => {
    const allEvaluasi = dataStore.getAllEvaluasi();
    const existingIndex = allEvaluasi.findIndex((e) => e.id === evaluasiData.id);
    
    if (existingIndex >= 0) {
      allEvaluasi[existingIndex] = evaluasiData;
    } else {
      allEvaluasi.push(evaluasiData);
    }
    
    localStorage.setItem(STORAGE_KEYS.EVALUASI, JSON.stringify(allEvaluasi));
  },

  deleteEvaluasi: (id: string): void => {
    const allEvaluasi = dataStore.getAllEvaluasi();
    const filtered = allEvaluasi.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVALUASI, JSON.stringify(filtered));
  },
};

export type { TNAData, EvaluasiData };

