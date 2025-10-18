# Roomah Database Migrations

## Migration Execution Order

Migrations must be executed in this exact order:

### Phase 1: Schema Foundation (01-06)
1. ✅ `20250116_01_create_enums.sql` - All enum types
2. ✅ `20250116_02_create_core_tables.sql` - profiles, provinces, sequences
3. ✅ `20250116_03_create_cv_tables.sql` - cv_data, cv_details
4. ⏳ `20250116_04_create_taaruf_tables.sql` - taaruf_requests, taaruf_sessions
5. ⏳ `20250116_05_create_wallet_tables.sql` - koin_topup_orders, wallet_ledger_entries
6. ⏳ `20250116_06_create_audit_tables.sql` - admin_actions_audit

### Phase 2: Indexes & Performance (07-08)
7. ⏳ `20250116_07_create_indexes.sql` - All indexes (38 total)
8. ⏳ `20250116_08_create_functions.sql` - Helper functions & triggers

### Phase 3: Views & Seeds (09-10)
9. ⏳ `20250116_09_create_views.sql` - Materialized view & balance view
10. ⏳ `20250116_10_seed_provinces.sql` - Indonesia provinces data (38 rows)

### Phase 4: Security (11-17)
11. ⏳ `20250116_11_enable_rls.sql` - Enable RLS on all tables
12. ⏳ `20250116_12_create_helper_functions.sql` - is_admin(), get_user_gender(), can_ajukan_taaruf()
13. ⏳ `20250116_13_create_rls_profiles.sql` - RLS for profiles & onboarding
14. ⏳ `20250116_14_create_rls_cv.sql` - RLS for CV tables
15. ⏳ `20250116_15_create_rls_taaruf.sql` - RLS for taaruf tables
16. ⏳ `20250116_16_create_rls_wallet.sql` - RLS for wallet & payments
17. ⏳ `20250116_17_create_rls_misc.sql` - RLS for provinces, audit, sequences

### Phase 5: Testing (18)
18. ⏳ `20250116_18_test_rls.sql` - Automated RLS test suite

---

## How to Run Migrations

### Option 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref fvqcwphjgftadhbqkpss

# Run all migrations
supabase db push

# Or run specific migration
supabase db push --include-migrations "20250116_01_create_enums"
```

### Option 2: Supabase Dashboard SQL Editor
1. Go to https://supabase.com/dashboard/project/fvqcwphjgftadhbqkpss/sql
2. Copy-paste migration content in order
3. Click "Run" for each migration

### Option 3: Direct PostgreSQL Connection
```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.fvqcwphjgftadhbqkpss.supabase.co:5432/postgres" -f supabase/migrations/20250116_01_create_enums.sql
```

---

## Pre-Migration Checklist

- [ ] Backup existing database (if any)
  ```bash
  supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify Supabase project connection
- [ ] Check free tier limits (500MB database)
- [ ] Review migration order (dependencies matter!)

---

## Post-Migration Validation

After running all migrations, verify:

```sql
-- Check all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all indexes created
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check materialized view
SELECT * FROM pg_matviews WHERE schemaname = 'public';

-- Check provinces seeded
SELECT COUNT(*) FROM public.provinces; -- Should be 38

-- Check sequences initialized
SELECT * FROM public.sequences;
```

---

## Rollback Plan

If migration fails, run DOWN migrations in reverse order.

### Emergency Rollback (Nuclear Option)
```sql
-- WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;
```

---

## Troubleshooting

### Error: "type already exists"
```sql
-- Check existing types
SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace;

-- Drop and recreate if needed
DROP TYPE IF EXISTS public.gender_enum CASCADE;
```

### Error: "relation already exists"
```sql
-- Check existing tables
\dt public.*

-- Drop specific table if needed
DROP TABLE IF EXISTS public.profiles CASCADE;
```

### Error: "permission denied"
Ensure you're using the service_role key for migrations, not anon key.

---

## Migration Status Tracking

Created: 3 / 18 migrations
- ✅ 01_create_enums.sql
- ✅ 02_create_core_tables.sql
- ✅ 03_create_cv_tables.sql
- ⏳ Remaining 15 migrations in progress...

---

Last Updated: 2025-01-16
