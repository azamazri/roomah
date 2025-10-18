-- =====================================================
-- Migration: 03 - Create CV Tables
-- Description: cv_data and cv_details tables
-- Author: Roomah Development Team
-- Date: 2025-01-16
-- =====================================================

-- =====================================================
-- Table: cv_data (CV Master Data)
-- =====================================================
CREATE TABLE public.cv_data (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status public.cv_status_enum NOT NULL DEFAULT 'DRAFT',
  allow_public boolean NOT NULL DEFAULT true,
  candidate_code text UNIQUE,
  last_reviewed_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  last_reviewed_at timestamptz,
  
  -- Snapshot fields from profiles (for consistency)
  gender public.gender_enum,
  full_name text,
  birth_date date,
  province_id smallint REFERENCES public.provinces(id) ON DELETE SET NULL,
  education public.education_enum,
  occupation text,
  
  -- Category: Kondisi Fisik
  income_bracket public.income_bracket_enum,
  height_cm int CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)),
  weight_kg int CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 30 AND 200)),
  disease_history text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT cv_approved_must_have_code CHECK (
    (status = 'APPROVED' AND candidate_code IS NOT NULL) OR
    (status != 'APPROVED' AND candidate_code IS NULL)
  )
);

COMMENT ON TABLE public.cv_data IS 'CV master data with 6 categories - single source of truth for candidate listing';
COMMENT ON COLUMN public.cv_data.candidate_code IS 'Auto-generated via trigger on status=APPROVED (IKHWAN/AKHWAT + sequence)';
COMMENT ON COLUMN public.cv_data.allow_public IS 'User preference for visibility in candidate listing';
COMMENT ON COLUMN public.cv_data.income_bracket IS 'Includes SAAT_TAARUF option for privacy';
COMMENT ON COLUMN public.cv_data.gender IS 'Snapshot from profiles - denormalized for MV performance';
COMMENT ON COLUMN public.cv_data.birth_date IS 'Snapshot from profiles.dob';

-- =====================================================
-- Table: cv_details (Extended CV in JSONB)
-- =====================================================
CREATE TABLE public.cv_details (
  user_id uuid PRIMARY KEY REFERENCES public.cv_data(user_id) ON DELETE CASCADE,
  
  -- Category: Latar Belakang Keluarga
  family_background jsonb,
  
  -- Category: Ibadah
  worship_profile jsonb,
  
  -- Category: Kriteria Pasangan
  spouse_criteria jsonb,
  
  -- Category: Rencana Pernikahan
  marriage_plan jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.cv_details IS 'Extended CV categories in JSONB for flexibility and privacy';
COMMENT ON COLUMN public.cv_details.family_background IS 'parent_status: HIDUP_KEDUANYA|YATIM|PIATU|YATIM_PIATU, parent_occupation, sibling_order, sibling_total';
COMMENT ON COLUMN public.cv_details.worship_profile IS 'salat_status: TERJAGA|KADANG|BELUM_ISTIQOMAH, quran_ability: LANCAR|BELAJAR|BELUM_BISA, fasting, other_ibadah[]';
COMMENT ON COLUMN public.cv_details.spouse_criteria IS 'age_range, education, income, location, other_criteria[] (max 3 items)';
COMMENT ON COLUMN public.cv_details.marriage_plan IS 'marriage_year, living_plan, vision (max 20 words), mission (max 20 words)';
