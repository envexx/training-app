-- Database Schema for Training App
-- PostgreSQL Version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel: requirement
-- Menyimpan data requirement terapis sebelum diterima
-- NOTE: created_by dan updated_by akan ditambahkan FK constraint setelah users dibuat
CREATE TABLE IF NOT EXISTS requirement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    lulusan VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255) NOT NULL,
    tanggal_requirement DATE NOT NULL,
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requirement_nama ON requirement(nama);
CREATE INDEX IF NOT EXISTS idx_requirement_lulusan ON requirement(lulusan);

-- 2. Tabel: terapis
-- Menyimpan data terapis
CREATE TABLE IF NOT EXISTS terapis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    lulusan VARCHAR(255) NOT NULL,
    tanggal_requirement DATE NOT NULL,
    mulai_kontrak DATE,
    end_kontrak DATE,
    alamat TEXT,
    no_telp VARCHAR(50),
    email VARCHAR(255),
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_terapis_nama ON terapis(nama);
CREATE INDEX IF NOT EXISTS idx_terapis_lulusan ON terapis(lulusan);

-- 3. Tabel: tna (Training Need Analysis)
-- Relasi 1:1 dengan terapis
CREATE TABLE IF NOT EXISTS tna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    terapis_id UUID NOT NULL UNIQUE,
    no_dokumen VARCHAR(255) NOT NULL,
    revisi VARCHAR(50) DEFAULT '0',
    tgl_berlaku DATE NOT NULL,
    unit VARCHAR(255) NOT NULL,
    departement VARCHAR(255) NOT NULL,
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tna_terapis FOREIGN KEY (terapis_id) REFERENCES terapis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tna_terapis_id ON tna(terapis_id);
CREATE INDEX IF NOT EXISTS idx_tna_no_dokumen ON tna(no_dokumen);

-- 4. Tabel: tna_training_rows
CREATE TABLE IF NOT EXISTS tna_training_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tna_id UUID NOT NULL,
    jenis_topik VARCHAR(255),
    alasan TEXT,
    peserta VARCHAR(255),
    rencana_pelaksanaan VARCHAR(255),
    budget_biaya VARCHAR(255),
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tna_training_rows_tna FOREIGN KEY (tna_id) REFERENCES tna(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tna_training_rows_tna_id ON tna_training_rows(tna_id);

-- 5. Tabel: tna_approval
CREATE TABLE IF NOT EXISTS tna_approval (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tna_id UUID NOT NULL UNIQUE,
    diajukan_oleh VARCHAR(255),
    direview_oleh VARCHAR(255),
    disetujui_oleh_1 VARCHAR(255),
    disetujui_oleh_2 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tna_approval_tna FOREIGN KEY (tna_id) REFERENCES tna(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tna_approval_tna_id ON tna_approval(tna_id);

-- 6. Tabel: evaluasi
-- Relasi 1:1 dengan terapis
CREATE TABLE IF NOT EXISTS evaluasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    terapis_id UUID NOT NULL UNIQUE,
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
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluasi_terapis FOREIGN KEY (terapis_id) REFERENCES terapis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluasi_terapis_id ON evaluasi(terapis_id);
CREATE INDEX IF NOT EXISTS idx_evaluasi_no_dokumen ON evaluasi(no_dokumen);

-- 7. Tabel: evaluasi_tujuan_pelatihan
CREATE TABLE IF NOT EXISTS evaluasi_tujuan_pelatihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluasi_id UUID NOT NULL,
    urutan INT NOT NULL CHECK (urutan >= 1 AND urutan <= 5),
    tujuan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluasi_tujuan_evaluasi FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE,
    CONSTRAINT unique_evaluasi_urutan UNIQUE (evaluasi_id, urutan)
);

CREATE INDEX IF NOT EXISTS idx_evaluasi_tujuan_evaluasi_id ON evaluasi_tujuan_pelatihan(evaluasi_id);

-- 8. Tabel: evaluasi_proficiency
CREATE TABLE IF NOT EXISTS evaluasi_proficiency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluasi_id UUID NOT NULL,
    urutan INT NOT NULL CHECK (urutan >= 1 AND urutan <= 5),
    pengetahuan TEXT,
    keterampilan TEXT,
    sebelum VARCHAR(50),
    sesudah VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluasi_proficiency_evaluasi FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluasi_proficiency_evaluasi_id ON evaluasi_proficiency(evaluasi_id);

-- 9. Tabel: evaluasi_harapan_komentar
CREATE TABLE IF NOT EXISTS evaluasi_harapan_komentar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluasi_id UUID NOT NULL,
    urutan INT NOT NULL CHECK (urutan >= 1 AND urutan <= 5),
    harapan_komentar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluasi_harapan_evaluasi FOREIGN KEY (evaluasi_id) REFERENCES evaluasi(id) ON DELETE CASCADE,
    CONSTRAINT unique_evaluasi_harapan_urutan UNIQUE (evaluasi_id, urutan)
);

CREATE INDEX IF NOT EXISTS idx_evaluasi_harapan_evaluasi_id ON evaluasi_harapan_komentar(evaluasi_id);

-- 10. Tabel: training_modules
CREATE TABLE IF NOT EXISTS training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('BASIC', 'TECHNICAL', 'MANAGERIAL', 'HSE')),
    module_name VARCHAR(255) NOT NULL,
    durasi VARCHAR(100),
    class_field VARCHAR(255),
    trainer VARCHAR(255),
    target_trainee VARCHAR(1) NOT NULL DEFAULT 'P' CHECK (target_trainee IN ('P', 'A')),
    year INT NOT NULL,
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_modules_category ON training_modules(category);
CREATE INDEX IF NOT EXISTS idx_training_modules_year ON training_modules(year);
CREATE INDEX IF NOT EXISTS idx_training_modules_category_year ON training_modules(category, year);

-- 11. Tabel: training_scheduled_weeks
CREATE TABLE IF NOT EXISTS training_scheduled_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL,
    week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_scheduled_weeks_module FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    CONSTRAINT unique_module_week UNIQUE (module_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_training_scheduled_weeks_module_id ON training_scheduled_weeks(module_id);
CREATE INDEX IF NOT EXISTS idx_training_scheduled_weeks_week_number ON training_scheduled_weeks(week_number);

-- 12. Tabel: roles
-- Menyimpan role/peran pengguna
-- NOTE: created_by dan updated_by tanpa FK constraint karena users belum dibuat
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb, -- Custom permissions dalam format JSON
    is_system BOOLEAN DEFAULT FALSE, -- System roles tidak bisa dihapus
    created_by UUID, -- Will reference users(id) after users table is created
    updated_by UUID, -- Will reference users(id) after users table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- 13. Tabel: users
-- Menyimpan data pengguna
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password (bcrypt)
    email VARCHAR(255),
    full_name VARCHAR(255),
    role_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_by UUID, -- Self-reference, will add FK constraint after table is created
    updated_by UUID, -- Self-reference, will add FK constraint after table is created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Insert default admin role
INSERT INTO roles (name, description, permissions, is_system) VALUES
('admin', 'Administrator - Full Access', '{"all": true}'::jsonb, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Note: Default admin user should be created via migration script or manually
-- Password: admin123 (must be changed after first login)
-- To create manually, use bcrypt to hash password and insert:
-- INSERT INTO users (username, password_hash, email, full_name, role_id) VALUES
-- ('admin', '$2b$10$...', 'admin@training.app', 'System Administrator', 
--  (SELECT id FROM roles WHERE name = 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_terapis_updated_at BEFORE UPDATE ON terapis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirement_updated_at BEFORE UPDATE ON requirement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tna_updated_at BEFORE UPDATE ON tna
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tna_approval_updated_at BEFORE UPDATE ON tna_approval
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluasi_updated_at BEFORE UPDATE ON evaluasi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Tabel: audit_logs
-- Menyimpan log semua operasi CRUD untuk audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'READ')),
    user_id UUID, -- Will reference users(id) after users table is created
    username VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add foreign key constraints for created_by and updated_by after users table is created
-- This ensures all tables can reference users(id)
DO $$
BEGIN
    -- Roles constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roles_created_by') THEN
        ALTER TABLE roles ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roles_updated_by') THEN
        ALTER TABLE roles ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Users self-reference constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_created_by') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_updated_by') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Requirement constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_requirement_created_by') THEN
        ALTER TABLE requirement ADD CONSTRAINT fk_requirement_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_requirement_updated_by') THEN
        ALTER TABLE requirement ADD CONSTRAINT fk_requirement_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Terapis constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_terapis_created_by') THEN
        ALTER TABLE terapis ADD CONSTRAINT fk_terapis_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_terapis_updated_by') THEN
        ALTER TABLE terapis ADD CONSTRAINT fk_terapis_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- TNA constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tna_created_by') THEN
        ALTER TABLE tna ADD CONSTRAINT fk_tna_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tna_updated_by') THEN
        ALTER TABLE tna ADD CONSTRAINT fk_tna_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Evaluasi constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_evaluasi_created_by') THEN
        ALTER TABLE evaluasi ADD CONSTRAINT fk_evaluasi_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_evaluasi_updated_by') THEN
        ALTER TABLE evaluasi ADD CONSTRAINT fk_evaluasi_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Training modules constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_training_modules_created_by') THEN
        ALTER TABLE training_modules ADD CONSTRAINT fk_training_modules_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_training_modules_updated_by') THEN
        ALTER TABLE training_modules ADD CONSTRAINT fk_training_modules_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
    END IF;

    -- Audit logs constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_logs_user_id') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;

