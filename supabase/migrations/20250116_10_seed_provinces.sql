-- =====================================================
-- Migration: 10 - Seed Provinces Data
-- Description: Indonesia provinces from BPS (Badan Pusat Statistik)
-- Total: 38 provinces
-- Date: 2025-01-16
-- =====================================================

INSERT INTO public.provinces (name) VALUES
  ('Aceh'),
  ('Bali'),
  ('Banten'),
  ('Bengkulu'),
  ('DI Yogyakarta'),
  ('DKI Jakarta'),
  ('Gorontalo'),
  ('Jambi'),
  ('Jawa Barat'),
  ('Jawa Tengah'),
  ('Jawa Timur'),
  ('Kalimantan Barat'),
  ('Kalimantan Selatan'),
  ('Kalimantan Tengah'),
  ('Kalimantan Timur'),
  ('Kalimantan Utara'),
  ('Kepulauan Bangka Belitung'),
  ('Kepulauan Riau'),
  ('Lampung'),
  ('Maluku'),
  ('Maluku Utara'),
  ('Nusa Tenggara Barat'),
  ('Nusa Tenggara Timur'),
  ('Papua'),
  ('Papua Barat'),
  ('Papua Barat Daya'),
  ('Papua Pegunungan'),
  ('Papua Selatan'),
  ('Papua Tengah'),
  ('Riau'),
  ('Sulawesi Barat'),
  ('Sulawesi Selatan'),
  ('Sulawesi Tengah'),
  ('Sulawesi Tenggara'),
  ('Sulawesi Utara'),
  ('Sumatera Barat'),
  ('Sumatera Selatan'),
  ('Sumatera Utara')
ON CONFLICT (name) DO NOTHING;

-- Verify count
DO $$
DECLARE
  province_count int;
BEGIN
  SELECT COUNT(*) INTO province_count FROM public.provinces;
  
  IF province_count != 38 THEN
    RAISE WARNING 'Expected 38 provinces, found %', province_count;
  ELSE
    RAISE NOTICE '✓ Successfully seeded 38 provinces';
  END IF;
END $$;
