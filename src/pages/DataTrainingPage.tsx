import { useState, useEffect, Fragment, type FC } from 'react';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { trainingAPI } from '@/services/api';

import './DataTrainingPage.css';

export interface TrainingModule {
  id: string;
  category: 'BASIC' | 'TECHNICAL' | 'MANAGERIAL' | 'HSE';
  moduleName: string;
  durasi: string;
  classField: string;
  trainer: string;
  targetTrainee: 'P' | 'A';
  weeks: Set<number>; // Set of week numbers (1-52) when training is scheduled
  year: number; // Year for the schedule
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingModuleAPI {
  id: string;
  category: 'BASIC' | 'TECHNICAL' | 'MANAGERIAL' | 'HSE';
  moduleName: string;
  durasi: string;
  classField: string;
  trainer: string;
  targetTrainee: 'P' | 'A';
  scheduledWeeks: number[]; // Array of week numbers (1-52) for backend
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'Nopember', 'Desember'
];

// Distribusi minggu per bulan sesuai kalender: 4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4
const WEEKS_PER_MONTH = [4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4];
const TOTAL_WEEKS = 52;

// Helper function to get month for a week number (for future use)
// const getMonthForWeek = (week: number): number => {
//   let currentWeek = 1;
//   for (let month = 0; month < MONTHS.length; month++) {
//     const weeksInMonth = WEEKS_PER_MONTH[month];
//     if (week >= currentWeek && week < currentWeek + weeksInMonth) {
//       return month;
//     }
//     currentWeek += weeksInMonth;
//   }
//   return 11; // Default to December
// };

// Helper function to get week ranges for each month
const getWeekRanges = (): Array<{ month: number; monthName: string; startWeek: number; endWeek: number; weeks: number[] }> => {
  const ranges: Array<{ month: number; monthName: string; startWeek: number; endWeek: number; weeks: number[] }> = [];
  let currentWeek = 1;
  
  for (let month = 0; month < MONTHS.length; month++) {
    const weeksInMonth = WEEKS_PER_MONTH[month];
    const weeks = Array.from({ length: weeksInMonth }, (_, i) => currentWeek + i);
    ranges.push({
      month,
      monthName: MONTHS[month],
      startWeek: currentWeek,
      endWeek: currentWeek + weeksInMonth - 1,
      weeks,
    });
    currentWeek += weeksInMonth;
  }
  
  return ranges;
};

export const DataTrainingPage: FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<'BASIC' | 'TECHNICAL' | 'MANAGERIAL' | 'HSE' | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [formData, setFormData] = useState({
    category: 'BASIC' as TrainingModule['category'],
    moduleName: '',
    durasi: '',
    classField: '',
    trainer: '',
    targetTrainee: 'P' as 'P' | 'A',
  });

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load from API
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await trainingAPI.getModules({ year: selectedYear });
        if (response.success && response.data && (response.data as any).modules) {
          const modulesData = (response.data as any).modules;
          // Convert weeks array to Set for frontend
          const modulesWithSets = modulesData.map((m: any) => ({
            id: m.id,
            category: m.category,
            moduleName: m.moduleName,
            durasi: m.durasi,
            classField: m.classField,
            trainer: m.trainer,
            targetTrainee: m.targetTrainee,
            weeks: new Set(m.weeks || []),
            year: m.year || selectedYear,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          }));
          setModules(modulesWithSets);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data training');
        console.error('Error loading training modules:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [selectedYear]);

  // Helper functions untuk backend integration tersedia di DataTrainingPage.api.ts
  // Uncomment ketika backend sudah siap

  // Helper function to get week range for a month (for future use)
  // const getWeekRange = (monthIndex: number): [number, number] => {
  //   let startWeek = 1;
  //   for (let i = 0; i < monthIndex; i++) {
  //     startWeek += WEEKS_PER_MONTH[i];
  //   }
  //   const endWeek = startWeek + WEEKS_PER_MONTH[monthIndex] - 1;
  //   return [startWeek, endWeek];
  // };

  const handleAddModule = () => {
    setEditingModule(null);
    setFormData({
      category: 'BASIC',
      moduleName: '',
      durasi: '',
      classField: '',
      trainer: '',
      targetTrainee: 'P',
    });
    setShowForm(true);
  };

  const handleEditModule = (module: TrainingModule) => {
    setEditingModule(module);
    setFormData({
      category: module.category,
      moduleName: module.moduleName,
      durasi: module.durasi,
      classField: module.classField,
      trainer: module.trainer,
      targetTrainee: module.targetTrainee,
    });
    setShowForm(true);
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus modul training ini?')) {
      return;
    }

    try {
      await trainingAPI.delete(id);
      setModules(modules.filter((m) => m.id !== id));
      alert('Modul training berhasil dihapus');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus modul training');
      console.error('Error deleting module:', err);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moduleName.trim()) {
      alert('Nama modul training harus diisi!');
      return;
    }

    try {
      const moduleData = {
        category: formData.category,
        moduleName: formData.moduleName,
        durasi: formData.durasi,
        classField: formData.classField,
        trainer: formData.trainer,
        targetTrainee: formData.targetTrainee,
        year: selectedYear,
        weeks: editingModule ? Array.from(editingModule.weeks) : [],
      };

      if (editingModule) {
        // Update existing module
        await trainingAPI.update(editingModule.id, moduleData);
        setModules(
          modules.map((m) =>
            m.id === editingModule.id
              ? { ...m, ...formData, updatedAt: new Date().toISOString() }
              : m
          )
        );
        alert('Modul training berhasil diupdate');
      } else {
        // Create new module
        const response = await trainingAPI.create(moduleData);
        if (response.success && response.data) {
          const data = response.data as any;
          const newModule: TrainingModule = {
            id: data.id || data.module?.id || Date.now().toString(),
            ...formData,
            weeks: new Set(),
            year: selectedYear,
            createdAt: data.createdAt || data.module?.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || data.module?.updatedAt,
          };
          setModules([...modules, newModule]);
          alert('Modul training berhasil ditambahkan');
        }
      }

      setShowForm(false);
      setEditingModule(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan modul training');
      console.error('Error saving module:', err);
    }
  };

  const toggleWeek = async (moduleId: string, week: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newWeeks = new Set(module.weeks);
    if (newWeeks.has(week)) {
      newWeeks.delete(week);
    } else {
      newWeeks.add(week);
    }

    // Update local state immediately for better UX
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, weeks: newWeeks, updatedAt: new Date().toISOString() };
        }
        return m;
      })
    );

    // Update in backend
    try {
      await trainingAPI.update(moduleId, {
        category: module.category,
        moduleName: module.moduleName,
        durasi: module.durasi,
        classField: module.classField,
        trainer: module.trainer,
        targetTrainee: module.targetTrainee,
        year: module.year,
        weeks: Array.from(newWeeks), // Backend expects 'weeks', not 'scheduledWeeks'
      });
    } catch (err: any) {
      console.error('Error updating week schedule:', err);
      // Revert on error
      setModules(
        modules.map((m) => {
          if (m.id === moduleId) {
            return { ...m, weeks: module.weeks };
          }
          return m;
        })
      );
      alert('Gagal memperbarui jadwal training');
    }
  };

  const filteredModules = selectedCategory === 'ALL'
    ? modules
    : modules.filter((m) => m.category === selectedCategory);

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, TrainingModule[]>);

  if (showForm) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader 
            title={editingModule ? "Edit Modul Training" : "Tambah Modul Training"}
            subtitle="Kelola modul training"
            icon="fas fa-graduation-cap"
            iconColor="linear-gradient(135deg, #34C759 0%, #50C878 100%)"
          />

          <div className="page-content">
            <form onSubmit={handleSubmitForm} className="training-form">
              <div className="form-group">
                <label className="form-label">Kategori Training <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TrainingModule['category'] })}
                  required
                >
                  <option value="BASIC">BASIC TRAINING</option>
                  <option value="TECHNICAL">TECHNICAL TRAINING</option>
                  <option value="MANAGERIAL">MANAGERIAL TRAINING</option>
                  <option value="HSE">HSE TRAINING</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Modul Training <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.moduleName}
                  onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  required
                  placeholder="Masukkan nama modul training"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Durasi (jam)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.durasi}
                  onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                  placeholder="Contoh: 8 jam"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class/Field</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.classField}
                  onChange={(e) => setFormData({ ...formData, classField: e.target.value })}
                  placeholder="Contoh: Class atau Field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trainer</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                  placeholder="Nama trainer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Trainee <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.targetTrainee}
                  onChange={(e) => setFormData({ ...formData, targetTrainee: e.target.value as 'P' | 'A' })}
                  required
                >
                  <option value="P">P (Present)</option>
                  <option value="A">A (Absent)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingModule ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>

          <BottomNavigation />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Jadwal Training" 
          subtitle={`Tahun ${selectedYear}`}
          icon="fas fa-graduation-cap"
          iconColor="linear-gradient(135deg, #34C759 0%, #50C878 100%)"
        />

        <div className="page-content">
          {error && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Memuat data training...</p>
            </div>
          ) : (
            <>
              {/* Calendar Navigation */}
              <div className="menu-section">
            <div className="calendar-nav">
              <button className="btn-nav" onClick={() => setSelectedYear(selectedYear - 1)}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="year-display">{selectedYear}</div>
              <button className="btn-nav" onClick={() => setSelectedYear(selectedYear + 1)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="category-filter">
              <button
                className={`filter-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                Semua
              </button>
              <button
                className={`filter-btn ${selectedCategory === 'BASIC' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('BASIC')}
              >
                BASIC
              </button>
              <button
                className={`filter-btn ${selectedCategory === 'TECHNICAL' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('TECHNICAL')}
              >
                TECHNICAL
              </button>
              <button
                className={`filter-btn ${selectedCategory === 'MANAGERIAL' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('MANAGERIAL')}
              >
                MANAGERIAL
              </button>
              <button
                className={`filter-btn ${selectedCategory === 'HSE' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('HSE')}
              >
                HSE
              </button>
            </div>

            <button className="btn btn-primary btn-add-module" onClick={handleAddModule}>
              <i className="fas fa-plus"></i> Tambah Modul Training
            </button>
          </div>

          {/* Training Schedule Table */}
          <div className="menu-section">
            <div className="table-container-wrapper">
              <div className="table-container">
                <table className="training-schedule-table">
                  <thead>
                    <tr>
                      <th rowSpan={3} className="col-no">No</th>
                      <th rowSpan={3} className="col-module">Training Module</th>
                      <th colSpan={4} rowSpan={2} className="col-planning">PLANNING</th>
                      <th colSpan={TOTAL_WEEKS} className="col-month-week">MONTH/WEEK</th>
                    </tr>
                    <tr>
                      {getWeekRanges().map((range) => (
                        <th
                          key={range.month}
                          colSpan={range.weeks.length}
                          className="col-month-header"
                        >
                          {range.monthName}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="col-durasi">Durasi (jam)</th>
                      <th className="col-class">Class/Field</th>
                      <th className="col-trainer">Trainer</th>
                      <th className="col-target">Target Trainee</th>
                      {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
                        <th key={week} className="col-week">
                          {week}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedModules).map(([category, categoryModules]) => (
                      <Fragment key={category}>
                        <tr className="category-header">
                          <td colSpan={6} className="category-cell">
                            {category} TRAINING
                          </td>
                          <td colSpan={TOTAL_WEEKS}></td>
                        </tr>
                        {categoryModules.map((module, index) => (
                          <tr key={module.id} className="module-row">
                            <td className="col-no">{index + 1}</td>
                            <td className="col-module">
                              <div className="module-name-cell">
                                <span>{module.moduleName}</span>
                                <div className="module-actions">
                                  <button
                                    className="btn-icon btn-edit"
                                    onClick={() => handleEditModule(module)}
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDeleteModule(module.id)}
                                    title="Hapus"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="col-durasi">{module.durasi || '-'}</td>
                            <td className="col-class">{module.classField || '-'}</td>
                            <td className="col-trainer">{module.trainer || '-'}</td>
                            <td className={`col-target target-${module.targetTrainee}`}>
                              {module.targetTrainee}
                            </td>
                            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
                              <td
                                key={week}
                                className={`col-week ${module.weeks.has(week) ? 'scheduled' : ''}`}
                                onClick={() => toggleWeek(module.id, week)}
                                title={`Week ${week}`}
                              >
                                {module.weeks.has(week) ? '✓' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    {filteredModules.length === 0 && (
                      <tr>
                        <td colSpan={6 + TOTAL_WEEKS} className="empty-table">
                          <div className="empty-state">
                            <i className="fas fa-calendar"></i>
                            <p>Belum ada modul training. Klik "Tambah Modul Training" untuk menambah.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};
