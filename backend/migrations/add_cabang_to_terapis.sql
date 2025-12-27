-- Migration: Add cabang column to terapis table
-- Cabang can be 'Batu Aji' or 'Tiban' or NULL (optional)
-- Date: 2024

-- Drop column if exists (data loss is acceptable)
ALTER TABLE terapis DROP COLUMN IF EXISTS cabang;

-- Add cabang column
ALTER TABLE terapis 
ADD COLUMN cabang VARCHAR(50) CHECK (cabang IN ('Batu Aji', 'Tiban') OR cabang IS NULL);

-- Add comment
COMMENT ON COLUMN terapis.cabang IS 'Cabang terapis: Batu Aji atau Tiban (optional)';

