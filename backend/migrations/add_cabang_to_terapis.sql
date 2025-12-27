-- Migration: Add cabang column to terapis table
-- Cabang can be 'Batu Aji' or 'Tiban' or NULL (optional)
-- Date: 2024
-- Requires: 001_initial_schema.sql must be run first

-- Check if terapis table exists before altering
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'terapis') THEN
        -- Drop column if exists (data loss is acceptable)
        ALTER TABLE terapis DROP COLUMN IF EXISTS cabang;

        -- Add cabang column
        ALTER TABLE terapis 
        ADD COLUMN cabang VARCHAR(50) CHECK (cabang IN ('Batu Aji', 'Tiban') OR cabang IS NULL);

        -- Add comment
        COMMENT ON COLUMN terapis.cabang IS 'Cabang terapis: Batu Aji atau Tiban (optional)';
    ELSE
        RAISE NOTICE 'Table terapis does not exist. Please run 001_initial_schema.sql first.';
    END IF;
END $$;

