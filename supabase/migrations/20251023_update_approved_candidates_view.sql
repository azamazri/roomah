-- =====================================================
-- Migration: Update Approved Candidates View
-- Description: Menambahkan birth_date, marital_status, full_name ke materialized view
-- Date: 2025-10-23
-- =====================================================

-- Drop dan recreate materialized view dengan field tambahan
DROP MATERIALIZED VIEW IF EXISTS public.approved_candidates_v CASCADE;

CREATE MATERIALIZED VIEW public.approved_candidates_v AS
SELECT
  cd.user_id,
  cd.candidate_code,
  cd.full_name,
  cd.birth_date,
  cd.marital_status,
  CASE WHEN COALESCE(cd.gender, p.gender) = 'IKHWAN' 
    THEN 'MALE' 
    ELSE 'FEMALE' 
  END as gender_label,
  COALESCE(cd.occupation, p.occupation) as occupation,
  EXTRACT(YEAR FROM AGE(COALESCE(cd.birth_date, p.dob)))::int as age,
  COALESCE(pr.name, 'N/A') as province,
  COALESCE(cd.province_id, p.province_id) as province_id,
  COALESCE(cd.education, p.education) as education,
  cd.income_bracket,
  cd.height_cm,
  cd.weight_kg,
  cd.disease_history,
  p.avatar_url as avatar_path,
  cd.updated_at as cv_updated_at
FROM public.cv_data cd
JOIN public.profiles p ON p.user_id = cd.user_id
LEFT JOIN public.provinces pr ON pr.id = COALESCE(cd.province_id, p.province_id)
WHERE cd.status = 'APPROVED'
  AND cd.allow_public = true;

-- Recreate indexes
CREATE UNIQUE INDEX approved_candidates_user_id_idx ON public.approved_candidates_v (user_id);
CREATE INDEX approved_candidates_gender_idx ON public.approved_candidates_v (gender_label);
CREATE INDEX approved_candidates_age_idx ON public.approved_candidates_v (age);
CREATE INDEX approved_candidates_province_idx ON public.approved_candidates_v (province);
CREATE INDEX approved_candidates_education_idx ON public.approved_candidates_v (education);

-- Refresh view dengan data terbaru
REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;

COMMENT ON MATERIALIZED VIEW public.approved_candidates_v IS 
  'Materialized view untuk approved candidates dengan birth_date, marital_status, dan full_name';
