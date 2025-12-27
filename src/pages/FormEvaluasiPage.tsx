import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { dataStore, type EvaluasiData } from '@/store/dataStore';

import './FormEvaluasiPage.css';

interface ProficiencyRow {
  id: string;
  pengetahuan: string;
  sebelum: string;
  sesudah: string;
}

interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
}

export const FormEvaluasiPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const terapisIdParam = searchParams.get('terapisId');
  const evaluasiId = searchParams.get('id');

  const [terapisList, setTerapisList] = useState<Terapis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerapis, setSelectedTerapis] = useState<Terapis | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [terapisId, setTerapisId] = useState<string | null>(terapisIdParam);

  const [formData, setFormData] = useState({
    noDokumen: '',
    revisi: '0',
    tglBerlaku: '',
    nama: '',
    departemen: '',
    divisi: '',
    jabatan: '',
    tglPelaksanaan: '',
    sifatPelatihan: {
      general: false,
      technical: false,
      managerial: false,
    },
    namaPelatihan: '',
    tempat: 'Mojokerto',
    tanggal: '',
    yangMenilai: '',
  });

  const [tujuanPelatihan, setTujuanPelatihan] = useState<string[]>(['', '', '', '', '']);
  const [proficiencyRows, setProficiencyRows] = useState<ProficiencyRow[]>([
    { id: '1', pengetahuan: '', sebelum: '', sesudah: '' },
    { id: '2', pengetahuan: '', sebelum: '', sesudah: '' },
    { id: '3', pengetahuan: '', sebelum: '', sesudah: '' },
    { id: '4', pengetahuan: '', sebelum: '', sesudah: '' },
    { id: '5', pengetahuan: '', sebelum: '', sesudah: '' },
  ]);
  const [harapanKomentar, setHarapanKomentar] = useState<string[]>(['', '', '', '', '']);

  // Load terapis list
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('terapis_list') || '[]');
    setTerapisList(stored);
    
    // If terapisId from URL, set selected terapis
    if (terapisIdParam) {
      const found = stored.find((t: Terapis) => t.id === terapisIdParam);
      if (found) {
        setSelectedTerapis(found);
        setTerapisId(terapisIdParam);
      }
    }
  }, [terapisIdParam]);

  // Load existing data if editing
  useEffect(() => {
    if (!terapisId) {
      return;
    }

    // Load existing Evaluasi data if editing
    if (evaluasiId) {
      const existingEvaluasi = dataStore.getAllEvaluasi().find((e) => e.id === evaluasiId);
      if (existingEvaluasi && existingEvaluasi.terapisId === terapisId) {
        setFormData({
          noDokumen: existingEvaluasi.noDokumen,
          revisi: existingEvaluasi.revisi,
          tglBerlaku: existingEvaluasi.tglBerlaku,
          nama: existingEvaluasi.nama,
          departemen: existingEvaluasi.departemen,
          divisi: existingEvaluasi.divisi,
          jabatan: existingEvaluasi.jabatan,
          tglPelaksanaan: existingEvaluasi.tglPelaksanaan,
          sifatPelatihan: existingEvaluasi.sifatPelatihan,
          namaPelatihan: existingEvaluasi.namaPelatihan,
          tempat: existingEvaluasi.tempat,
          tanggal: existingEvaluasi.tanggal,
          yangMenilai: existingEvaluasi.yangMenilai,
        });
        setTujuanPelatihan(existingEvaluasi.tujuanPelatihan);
        setProficiencyRows(existingEvaluasi.proficiencyRows);
        setHarapanKomentar(existingEvaluasi.harapanKomentar);
      }
    } else {
      // Check if terapis already has Evaluasi
      const existingEvaluasi = dataStore.getEvaluasiByTerapis(terapisId);
      if (existingEvaluasi) {
        if (confirm('Terapis ini sudah memiliki data Evaluasi. Apakah Anda ingin mengedit data yang ada?')) {
          setFormData({
            noDokumen: existingEvaluasi.noDokumen,
            revisi: existingEvaluasi.revisi,
            tglBerlaku: existingEvaluasi.tglBerlaku,
            nama: existingEvaluasi.nama,
            departemen: existingEvaluasi.departemen,
            divisi: existingEvaluasi.divisi,
            jabatan: existingEvaluasi.jabatan,
            tglPelaksanaan: existingEvaluasi.tglPelaksanaan,
            sifatPelatihan: existingEvaluasi.sifatPelatihan,
            namaPelatihan: existingEvaluasi.namaPelatihan,
            tempat: existingEvaluasi.tempat,
            tanggal: existingEvaluasi.tanggal,
            yangMenilai: existingEvaluasi.yangMenilai,
          });
          setTujuanPelatihan(existingEvaluasi.tujuanPelatihan);
          setProficiencyRows(existingEvaluasi.proficiencyRows);
          setHarapanKomentar(existingEvaluasi.harapanKomentar);
        }
      }
    }
  }, [terapisId, evaluasiId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSelectTerapis = (terapis: Terapis) => {
    setSelectedTerapis(terapis);
    setTerapisId(terapis.id);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Check if terapis already has Evaluasi
    const existingEvaluasi = dataStore.getEvaluasiByTerapis(terapis.id);
    if (existingEvaluasi && !evaluasiId) {
      if (confirm('Terapis ini sudah memiliki data Evaluasi. Apakah Anda ingin mengedit data yang ada?')) {
        setFormData({
          noDokumen: existingEvaluasi.noDokumen,
          revisi: existingEvaluasi.revisi,
          tglBerlaku: existingEvaluasi.tglBerlaku,
          nama: existingEvaluasi.nama,
          departemen: existingEvaluasi.departemen,
          divisi: existingEvaluasi.divisi,
          jabatan: existingEvaluasi.jabatan,
          tglPelaksanaan: existingEvaluasi.tglPelaksanaan,
          sifatPelatihan: existingEvaluasi.sifatPelatihan,
          namaPelatihan: existingEvaluasi.namaPelatihan,
          tempat: existingEvaluasi.tempat,
          tanggal: existingEvaluasi.tanggal,
          yangMenilai: existingEvaluasi.yangMenilai,
        });
        setTujuanPelatihan(existingEvaluasi.tujuanPelatihan);
        setProficiencyRows(existingEvaluasi.proficiencyRows);
        setHarapanKomentar(existingEvaluasi.harapanKomentar);
      }
    }
  };

  const filteredTerapis = terapisList.filter((t) =>
    t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lulusan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTujuanChange = (index: number, value: string) => {
    const newTujuan = [...tujuanPelatihan];
    newTujuan[index] = value;
    setTujuanPelatihan(newTujuan);
  };

  const handleProficiencyChange = (id: string, field: keyof ProficiencyRow, value: string) => {
    setProficiencyRows(
      proficiencyRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleHarapanChange = (index: number, value: string) => {
    const newHarapan = [...harapanKomentar];
    newHarapan[index] = value;
    setHarapanKomentar(newHarapan);
  };

  const handleSifatPelatihanChange = (type: 'general' | 'technical' | 'managerial') => {
    setFormData({
      ...formData,
      sifatPelatihan: {
        ...formData.sifatPelatihan,
        [type]: !formData.sifatPelatihan[type],
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terapisId) return;
    
    if (!formData.noDokumen || !formData.tglBerlaku || !formData.nama || !formData.departemen) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }
    
    // Simpan ke dataStore
    const evaluasiData: EvaluasiData = {
      id: evaluasiId || Date.now().toString(),
      terapisId: terapisId,
      ...formData,
      tujuanPelatihan,
      proficiencyRows,
      harapanKomentar,
      createdAt: new Date().toISOString(),
    };

    dataStore.saveEvaluasi(evaluasiData);
    alert('Form Evaluasi berhasil disimpan!');
    navigate(`/detail-terapis?id=${terapisId}`);
  };

  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Form Evaluasi Pasca Pelatihan" 
          subtitle="Evaluasi setelah pelatihan"
          icon="fas fa-star"
          iconColor="linear-gradient(135deg, #FF9500 0%, #FFB84D 100%)"
        />

        <div className="page-content">
          {/* Search Terapis */}
          <div className="menu-section">
            <h2 className="section-title">Pilih Terapis</h2>
            <div className="search-terapis-container">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari nama terapis atau lulusan..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                />
              </div>
              
              {showSearchResults && filteredTerapis.length > 0 && (
                <div className="search-results">
                  {filteredTerapis.map((terapis) => (
                    <div
                      key={terapis.id}
                      className="search-result-item"
                      onClick={() => handleSelectTerapis(terapis)}
                    >
                      <div className="result-avatar">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="result-info">
                        <div className="result-name">{terapis.nama}</div>
                        <div className="result-lulusan">{terapis.lulusan}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTerapis && (
                <div className="selected-terapis">
                  <div className="selected-terapis-info">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <div className="selected-name">{selectedTerapis.nama}</div>
                      <div className="selected-lulusan">{selectedTerapis.lulusan}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setSelectedTerapis(null);
                      setTerapisId(null);
                      setFormData({
                        noDokumen: '',
                        revisi: '0',
                        tglBerlaku: '',
                        nama: '',
                        departemen: '',
                        divisi: '',
                        jabatan: '',
                        tglPelaksanaan: '',
                        sifatPelatihan: {
                          general: false,
                          technical: false,
                          managerial: false,
                        },
                        namaPelatihan: '',
                        tempat: 'Mojokerto',
                        tanggal: '',
                        yangMenilai: '',
                      });
                      setTujuanPelatihan(['', '', '', '', '']);
                      setProficiencyRows([
                        { id: '1', pengetahuan: '', sebelum: '', sesudah: '' },
                        { id: '2', pengetahuan: '', sebelum: '', sesudah: '' },
                        { id: '3', pengetahuan: '', sebelum: '', sesudah: '' },
                        { id: '4', pengetahuan: '', sebelum: '', sesudah: '' },
                        { id: '5', pengetahuan: '', sebelum: '', sesudah: '' },
                      ]);
                      setHarapanKomentar(['', '', '', '', '']);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!selectedTerapis && (
            <div className="empty-state-form">
              <i className="fas fa-user-md"></i>
              <p>Silakan pilih terapis terlebih dahulu untuk membuat form Evaluasi</p>
            </div>
          )}

          {selectedTerapis && (
            <form onSubmit={handleSubmit} className="evaluasi-form">
            {/* Header Form */}
            <div className="form-section">
              <div className="form-header-row">
                <div className="form-field-inline">
                  <label className="form-label-inline">No. Dokumen:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.noDokumen}
                    onChange={(e) => setFormData({ ...formData, noDokumen: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field-inline">
                  <label className="form-label-inline">Revisi Ke-:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.revisi}
                    onChange={(e) => setFormData({ ...formData, revisi: e.target.value })}
                  />
                </div>
                <div className="form-field-inline">
                  <label className="form-label-inline">Tgl. Berlaku:</label>
                  <input
                    type="date"
                    className="form-input-inline"
                    value={formData.tglBerlaku}
                    onChange={(e) => setFormData({ ...formData, tglBerlaku: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Diisi Oleh Dept Head */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-subtitle">(Diisi Oleh Dept. Head)</h3>
              </div>
              <div className="form-two-columns">
                <div className="form-column">
                  <div className="form-field">
                    <label className="form-label">Nama:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Departemen:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.departemen}
                      onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Divisi:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.divisi}
                      onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-column">
                  <div className="form-field">
                    <label className="form-label">Jabatan:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Tgl. Pelaksanaan:</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.tglPelaksanaan}
                      onChange={(e) => setFormData({ ...formData, tglPelaksanaan: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Sifat Pelatihan:</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.sifatPelatihan.general}
                          onChange={() => handleSifatPelatihanChange('general')}
                        />
                        <span>General</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.sifatPelatihan.technical}
                          onChange={() => handleSifatPelatihanChange('technical')}
                        />
                        <span>Technical</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.sifatPelatihan.managerial}
                          onChange={() => handleSifatPelatihanChange('managerial')}
                        />
                        <span>Managerial</span>
                      </label>
                      <span className="checkbox-note">(coret yg tdk sesuai)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-field full-width">
                <label className="form-label">Nama Pelatihan:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.namaPelatihan}
                  onChange={(e) => setFormData({ ...formData, namaPelatihan: e.target.value })}
                />
              </div>
            </div>

            {/* Section 1: Tujuan Pelatihan */}
            <div className="form-section">
              <h3 className="section-title-numbered">1. TUJUAN PELATIHAN</h3>
              <div className="numbered-list">
                {tujuanPelatihan.map((tujuan, index) => (
                  <div key={index} className="numbered-item">
                    <span className="number">{index + 1}.</span>
                    <textarea
                      className="numbered-textarea"
                      value={tujuan}
                      onChange={(e) => handleTujuanChange(index, e.target.value)}
                      rows={2}
                      placeholder="Masukkan tujuan pelatihan..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Pengetahuan, Keterampilan */}
            <div className="form-section">
              <div className="section-2-header">
                <h3 className="section-title-numbered">2. PENGETAHUAN, KETERAMPILAN DAN SIKAP-PERILAKU</h3>
                <div className="proficiency-level-box">
                  <div className="proficiency-header">PROFICIENCY LEVEL</div>
                  <div className="proficiency-columns">
                    <div className="proficiency-col">SEBELUM</div>
                    <div className="proficiency-col">SESUDAH</div>
                  </div>
                </div>
              </div>
              <div className="proficiency-table-container">
                <table className="proficiency-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Pengetahuan, Keterampilan</th>
                      <th>SEBELUM</th>
                      <th>SESUDAH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proficiencyRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="td-number">{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.pengetahuan}
                            onChange={(e) => handleProficiencyChange(row.id, 'pengetahuan', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input proficiency-input"
                            value={row.sebelum}
                            onChange={(e) => handleProficiencyChange(row.id, 'sebelum', e.target.value)}
                            placeholder="0-100"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input proficiency-input"
                            value={row.sesudah}
                            onChange={(e) => handleProficiencyChange(row.id, 'sesudah', e.target.value)}
                            placeholder="0-100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Harapan, Komentar */}
            <div className="form-section">
              <h3 className="section-title-numbered">3. HARAPAN, KOMENTAR DAN SARAN</h3>
              <div className="numbered-list">
                {harapanKomentar.map((harapan, index) => (
                  <div key={index} className="numbered-item">
                    <span className="number">{index + 1}.</span>
                    <textarea
                      className="numbered-textarea"
                      value={harapan}
                      onChange={(e) => handleHarapanChange(index, e.target.value)}
                      rows={2}
                      placeholder="Masukkan harapan, komentar atau saran..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Level Proficiency Table */}
            <div className="form-section">
              <div className="proficiency-legend-container">
                <table className="proficiency-legend-table">
                  <thead>
                    <tr>
                      <th colSpan={2}>Keterangan point 2</th>
                    </tr>
                    <tr>
                      <th>Level Proficiency</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>81 - 90</td>
                      <td>Sangat Baik</td>
                    </tr>
                    <tr>
                      <td>71 - 79</td>
                      <td>Baik</td>
                    </tr>
                    <tr>
                      <td>61 - 69</td>
                      <td>Cukup</td>
                    </tr>
                    <tr>
                      <td>&lt; 60</td>
                      <td>Kurang</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Section */}
            <div className="form-section">
              <div className="signature-section">
                <div className="signature-field">
                  <label className="form-label">Tempat, Tanggal:</label>
                  <div className="signature-input-group">
                    <input
                      type="text"
                      className="form-input signature-input"
                      value={formData.tempat}
                      onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                    />
                    <span>,</span>
                    <input
                      type="date"
                      className="form-input signature-input"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    />
                  </div>
                </div>
                <div className="signature-field">
                  <label className="form-label">Yang menilai:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.yangMenilai}
                    onChange={(e) => setFormData({ ...formData, yangMenilai: e.target.value })}
                    placeholder="Departemen Head"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary">
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Simpan Form
              </button>
            </div>
          </form>
          )}
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};

