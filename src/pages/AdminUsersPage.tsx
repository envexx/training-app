import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { usersAPI, rolesAPI, authAPI } from '@/services/api';

import './AdminUsersPage.css';

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export const AdminUsersPage: FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User & { password: string; confirmPassword: string }>>({
    username: '',
    email: '',
    fullName: '',
    roleName: '',
    password: '',
    confirmPassword: '',
    isActive: true,
  });
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      if (response.success && response.data.roles) {
        setRoles(response.data.roles);
      }
    } catch (err: any) {
      console.error('Error loading roles:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getAll();
      if (response.success && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      roleName: '',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email || '',
      fullName: user.fullName || '',
      roleName: user.roleName,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      alert('User berhasil dihapus');
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user');
      console.error('Error deleting user:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.roleName) {
      alert('Username dan Role wajib diisi!');
      return;
    }

    // For new user, password is required
    if (!editingId) {
      if (!formData.password) {
        alert('Password wajib diisi untuk user baru!');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password minimal 6 karakter!');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Password dan Konfirmasi Password tidak sama!');
        return;
      }
    }

    try {
      if (editingId) {
        // Update existing user
        await usersAPI.update(editingId, {
          email: formData.email,
          fullName: formData.fullName,
          roleName: formData.roleName,
          isActive: formData.isActive,
        });
        alert('User berhasil diupdate');
      } else {
        // Create new user - need to find roleId from roleName
        const selectedRole = roles.find(r => r.name.toLowerCase() === formData.roleName?.toLowerCase());
        if (!selectedRole) {
          alert('Role tidak ditemukan!');
          return;
        }

        await authAPI.register({
          username: formData.username!,
          password: formData.password!,
          email: formData.email,
          fullName: formData.fullName,
          roleId: selectedRole.id,
        });
        alert('User berhasil dibuat');
      }

      await loadUsers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        roleName: '',
        password: '',
        confirmPassword: '',
        isActive: true,
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan user');
      console.error('Error saving user:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      roleName: '',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
  };

  if (showForm) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader
            title={editingId ? 'Edit User' : 'Tambah User'}
            subtitle="Kelola data user"
            icon="fas fa-users-cog"
            iconColor="linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)"
          />
          <div className="page-content">
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label className="form-label">
                  Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingId}
                />
                {editingId && <small className="form-hint">Username tidak bisa diubah</small>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Role <span className="required">*</span>
                </label>
                <select
                  className="form-input"
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingId && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingId}
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Konfirmasi Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required={!editingId}
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ marginLeft: '8px' }}>Active</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Simpan'}
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
          title="Kelola User"
          subtitle="Manage semua user & supervisor"
          icon="fas fa-users-cog"
          iconColor="linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)"
        />
        <div className="page-content">
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Daftar User</h2>
              <button className="btn btn-primary btn-add" onClick={handleAdd}>
                <i className="fas fa-plus"></i> Tambah User
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
                <button onClick={loadUsers} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}>
                  Coba Lagi
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>Belum ada data user</p>
              </div>
            ) : (
              <div className="users-list">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar" style={{ backgroundColor: user.isActive ? '#34C759' : '#999' }}>
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-info">
                        <h3 className="user-name">{user.username}</h3>
                        <p className="user-role">{user.roleName}</p>
                        {user.fullName && <p className="user-fullname">{user.fullName}</p>}
                        {user.email && <p className="user-email">{user.email}</p>}
                      </div>
                      <div className="user-status">
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="user-actions">
                      <button className="btn-action btn-edit" onClick={() => handleEdit(user)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(user.id)}>
                        <i className="fas fa-trash"></i> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <BottomNavigation />
      </div>
    </Page>
  );
};

