# ✅ DATABASE VERIFICATION CHECKLIST

## Run these queries in Supabase SQL Editor to confirm everything is ready:

### 1. Verify Tables (should be 11)
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Output:**
```
admin_actions_audit
cv_data
cv_details
koin_topup_orders
onboarding_verifications
profiles
provinces
sequences
taaruf_requests
taaruf_sessions
wallet_ledger_entries
```

---

### 2. Verify Materialized View (should be 1)
```sql
SELECT matviewname FROM pg_matviews 
WHERE schemaname = 'public';
```

**Expected Output:**
```
approved_candidates_v
```

---

### 3. Verify Regular Views (should be 1)
```sql
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewowner::regrole::text = 'postgres';
```

**Expected Output:**
```
wallet_balances_v
```

---

### 4. Verify Enums (should be 9)
```sql
SELECT typname FROM pg_type 
WHERE typnamespace = 'public'::regnamespace 
AND typtype = 'e'
ORDER BY typname;
```

**Expected Output:**
```
cv_status_enum
education_enum
gender_enum
income_bracket_enum
ledger_reason
ledger_type
payment_status
taaruf_request_status
taaruf_session_status
```

---

### 5. Verify Functions (should be 10+)
```sql
SELECT proname FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
ORDER BY proname;
```

**Expected Output (at minimum):**
```
can_ajukan_taaruf
cleanup_expired_taaruf_requests
cv_admin_audit_trigger_fn
cv_approval_trigger_fn
generate_candidate_code
generate_taaruf_code
get_user_gender
is_admin
refresh_approved_candidates
update_updated_at
```

---

### 6. Verify Triggers (should be 7)
```sql
SELECT tablename, triggername FROM pg_trigger 
WHERE NOT tgisinternal
ORDER BY tablename, triggername;
```

**Expected Output:**
```
cv_data               cv_admin_audit_trigger
cv_data               cv_approval_trigger
cv_data               cv_data_updated_at
cv_details            cv_details_updated_at
koin_topup_orders     koin_topup_orders_updated_at
onboarding_verifications onboarding_verifications_updated_at
profiles              profiles_updated_at
```

---

### 7. Verify Indexes (should be 40+)
```sql
SELECT COUNT(*) as total_indexes FROM pg_indexes 
WHERE schemaname = 'public';
```

**Expected Output:**
```
40+ indexes
```

---

### 8. Verify RLS Enabled (should be 11)
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;
```

**Expected Output:**
```
admin_actions_audit
cv_data
cv_details
koin_topup_orders
onboarding_verifications
profiles
provinces
sequences
taaruf_requests
taaruf_sessions
wallet_ledger_entries
```

---

### 9. Verify RLS Policies (should be 30+)
```sql
SELECT COUNT(*) as total_policies FROM pg_policies 
WHERE schemaname = 'public';
```

**Expected Output:**
```
30+ policies
```

---

### 10. Verify Provinces Seeded (should be 38)
```sql
SELECT COUNT(*) as province_count FROM public.provinces;
```

**Expected Output:**
```
38
```

---

### 11. Verify Sequences Initialized (should be 3)
```sql
SELECT seq_key, last_number FROM public.sequences;
```

**Expected Output:**
```
CANDIDATE_IKHWAN  0
CANDIDATE_AKHWAT  0
TAARUF            0
```

---

## Summary Query (All in One)

```sql
SELECT 
  'Tables' as metric, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'Views', COUNT(*)
FROM pg_views 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Materialized Views', COUNT(*)
FROM pg_matviews 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Functions', COUNT(*)
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'

UNION ALL

SELECT 
  'Triggers', COUNT(*)
FROM pg_trigger 
WHERE NOT tgisinternal

UNION ALL

SELECT 
  'Indexes', COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'RLS Policies', COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Provinces', COUNT(*)
FROM public.provinces

ORDER BY metric;
```

---

## ✅ ALL CLEAR?

If all queries above return expected results, your database is **100% production-ready**! 🎉

Next step: **Backend Implementation - Server Actions**
