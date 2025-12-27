import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { terapisAPI, evaluasiAPI } from '@/services/api';
import { formatDateForInput } from '@/utils/dateUtils';

import './FormEvaluasiPage.css';

interface ProficiencyRow {
  id: string;
  pengetahuan: string;
  keterampilan: string;
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
    { id: '1', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
    { id: '2', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
    { id: '3', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
    { id: '4', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
    { id: '5', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
  ]);
  const [harapanKomentar, setHarapanKomentar] = useState<string[]>(['', '', '', '', '']);

  // Load terapis list
  useEffect(() => {
    const loadTerapis = async () => {
      try {
        const response = await terapisAPI.getAll();
        if (response.success && response.data.terapis) {
          const terapis = response.data.terapis.map((t: any) => ({
            id: t.id,
            nama: t.nama,
            lulusan: t.lulusan,
          }));
          setTerapisList(terapis);
          
          // If terapisId from URL, set selected terapis
          if (terapisIdParam) {
            const found = terapis.find((t: Terapis) => t.id === terapisIdParam);
            if (found) {
              setSelectedTerapis(found);
              setTerapisId(terapisIdParam);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading terapis:', err);
        alert('Gagal memuat data terapis');
      }
    };
    
    loadTerapis();
  }, [terapisIdParam]);

  // Load existing data if editing
  useEffect(() => {
    if (!terapisId) {
      return;
    }

    const loadEvaluasiData = async () => {
      try {
        const response = await evaluasiAPI.getByTerapisId(terapisId);
        if (response.success && response.data) {
          const evaluasi = response.data;
          
          // If editing specific Evaluasi, check if ID matches
          if (evaluasiId && evaluasi.id !== evaluasiId) {
            return; // Different Evaluasi, don't load
          }
          
          // Load Evaluasi data
          setFormData({
            noDokumen: evaluasi.noDokumen || '',
            revisi: evaluasi.revisi || '0',
            tglBerlaku: formatDateForInput(evaluasi.tglBerlaku),
            nama: evaluasi.nama || '',
            departemen: evaluasi.departemen || '',
            divisi: evaluasi.divisi || '',
            jabatan: evaluasi.jabatan || '',
            tglPelaksanaan: formatDateForInput(evaluasi.tglPelaksanaan),
            sifatPelatihan: evaluasi.sifatPelatihan || {
              general: false,
              technical: false,
              managerial: false,
            },
            namaPelatihan: evaluasi.namaPelatihan || '',
            tempat: evaluasi.tempat || 'Mojokerto',
            tanggal: formatDateForInput(evaluasi.tanggal),
            yangMenilai: evaluasi.yangMenilai || '',
          });
          
          // Load tujuan pelatihan
          if (evaluasi.tujuanPelatihan && Array.isArray(evaluasi.tujuanPelatihan)) {
            const tujuan = [...evaluasi.tujuanPelatihan];
            while (tujuan.length < 5) tujuan.push('');
            setTujuanPelatihan(tujuan.slice(0, 5));
          }
          
          // Load proficiency rows
          if (evaluasi.proficiencyRows && Array.isArray(evaluasi.proficiencyRows)) {
            const rows = evaluasi.proficiencyRows.map((row: any, index: number) => ({
              id: (index + 1).toString(),
              pengetahuan: row.pengetahuan || '',
              keterampilan: row.keterampilan || '',
              sebelum: row.sebelum || '',
              sesudah: row.sesudah || '',
            }));
            while (rows.length < 5) {
              rows.push({
                id: (rows.length + 1).toString(),
                pengetahuan: '',
                keterampilan: '',
                sebelum: '',
                sesudah: '',
              });
            }
            setProficiencyRows(rows.slice(0, 5));
          }
          
          // Load harapan komentar
          if (evaluasi.harapanKomentar && Array.isArray(evaluasi.harapanKomentar)) {
            const harapan = [...evaluasi.harapanKomentar];
            while (harapan.length < 5) harapan.push('');
            setHarapanKomentar(harapan.slice(0, 5));
          }
        } else if (!evaluasiId) {
          // No existing Evaluasi, show confirmation if user wants to create new
          // (This is handled in handleSelectTerapis)
        }
      } catch (err: any) {
        // Evaluasi not found is OK for new Evaluasi
        if (evaluasiId) {
          console.error('Error loading Evaluasi:', err);
        }
      }
    };

    loadEvaluasiData();
  }, [terapisId, evaluasiId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSelectTerapis = async (terapis: Terapis) => {
    setSelectedTerapis(terapis);
    setTerapisId(terapis.id);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Check if terapis already has Evaluasi
    if (!evaluasiId) {
      try {
        const response = await evaluasiAPI.getByTerapisId(terapis.id);
        if (response.success && response.data) {
          const evaluasi = response.data;
          if (confirm('Terapis ini sudah memiliki data Evaluasi. Apakah Anda ingin mengedit data yang ada?')) {
            setFormData({
              noDokumen: evaluasi.noDokumen || '',
              revisi: evaluasi.revisi || '0',
              tglBerlaku: formatDateForInput(evaluasi.tglBerlaku),
              nama: evaluasi.nama || '',
              departemen: evaluasi.departemen || '',
              divisi: evaluasi.divisi || '',
              jabatan: evaluasi.jabatan || '',
              tglPelaksanaan: formatDateForInput(evaluasi.tglPelaksanaan),
              sifatPelatihan: evaluasi.sifatPelatihan || {
                general: false,
                technical: false,
                managerial: false,
              },
              namaPelatihan: evaluasi.namaPelatihan || '',
              tempat: evaluasi.tempat || 'Mojokerto',
              tanggal: formatDateForInput(evaluasi.tanggal),
              yangMenilai: evaluasi.yangMenilai || '',
            });
            
            if (evaluasi.tujuanPelatihan && Array.isArray(evaluasi.tujuanPelatihan)) {
              const tujuan = [...evaluasi.tujuanPelatihan];
              while (tujuan.length < 5) tujuan.push('');
              setTujuanPelatihan(tujuan.slice(0, 5));
            }
            
            if (evaluasi.proficiencyRows && Array.isArray(evaluasi.proficiencyRows)) {
              const rows = evaluasi.proficiencyRows.map((row: any, index: number) => ({
                id: (index + 1).toString(),
                pengetahuan: row.pengetahuan || '',
                keterampilan: row.keterampilan || '',
                sebelum: row.sebelum || '',
                sesudah: row.sesudah || '',
              }));
              while (rows.length < 5) {
                rows.push({
                  id: (rows.length + 1).toString(),
                  pengetahuan: '',
                  keterampilan: '',
                  sebelum: '',
                  sesudah: '',
                });
              }
              setProficiencyRows(rows.slice(0, 5));
            }
            
            if (evaluasi.harapanKomentar && Array.isArray(evaluasi.harapanKomentar)) {
              const harapan = [...evaluasi.harapanKomentar];
              while (harapan.length < 5) harapan.push('');
              setHarapanKomentar(harapan.slice(0, 5));
            }
          }
        }
      } catch (err) {
        // No existing Evaluasi, continue with new form
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terapisId) {
      alert('Pilih terapis terlebih dahulu!');
      return;
    }
    
    if (!formData.noDokumen || !formData.tglBerlaku || !formData.nama || !formData.departemen) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }
    
    try {
      // Prepare data for API
      const evaluasiData = {
        terapisId: terapisId,
        noDokumen: formData.noDokumen,
        revisi: formData.revisi || '0',
        tglBerlaku: formData.tglBerlaku,
        nama: formData.nama,
        departemen: formData.departemen,
        divisi: formData.divisi || undefined,
        jabatan: formData.jabatan || undefined,
        tglPelaksanaan: formData.tglPelaksanaan || undefined,
        sifatPelatihan: formData.sifatPelatihan,
        namaPelatihan: formData.namaPelatihan || undefined,
        tempat: formData.tempat || 'Mojokerto',
        tanggal: formData.tanggal || undefined,
        yangMenilai: formData.yangMenilai || undefined,
        tujuanPelatihan: tujuanPelatihan.filter(t => t.trim()),
        proficiencyRows: proficiencyRows.map(row => ({
          pengetahuan: row.pengetahuan,
          keterampilan: row.keterampilan,
          sebelum: row.sebelum,
          sesudah: row.sesudah,
        })),
        harapanKomentar: harapanKomentar.filter(h => h.trim()),
      };

      // If editing, include ID
      if (evaluasiId) {
        (evaluasiData as any).id = evaluasiId;
      }

      await evaluasiAPI.createOrUpdate(evaluasiData);
      alert('Form Evaluasi berhasil disimpan!');
      navigate(`/detail-terapis/${terapisId}`);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan form Evaluasi');
      console.error('Error saving Evaluasi:', err);
    }
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
                        { id: '1', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
                        { id: '2', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
                        { id: '3', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
                        { id: '4', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
                        { id: '5', pengetahuan: '', keterampilan: '', sebelum: '', sesudah: '' },
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

