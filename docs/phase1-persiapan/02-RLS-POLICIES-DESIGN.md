# 2. ROW LEVEL SECURITY (RLS) POLICIES DESIGN
## Complete RLS Policy Matrix & Performance Optimization

### Security Model Philosophy

**Deny-by-Default Principle:**
- All tables have RLS enabled by default (no implicit access)
- Explicit policies grant access per operation (SELECT, INSERT, UPDATE, DELETE)
- Guest vs Authenticated vs Admin role separation
- Anti-enumeration patterns (generic error messages)

**Performance-First Design:**
- Wrapped functions untuk complex policy logic (avoid inline subqueries)
- Proper indexing untuk support policy conditions
- Security definer functions untuk elevated privileges
- Field exposure matrix (public vs private data)

---

## RLS Policy Matrix (Complete Overview)

| Table | Role | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|------|--------|--------|--------|--------|-------|
| **profiles** | Guest | ❌ | ❌ | ❌ | ❌ | No access |
| | Authenticated | ✅ (own) | ❌ | ✅ (own) | ❌ | Can read/update own profile |
| | Admin | ✅ (all) | ❌ | ✅ (all) | ❌ | Full read/update access |
| **onboarding_verifications** | Guest | ❌ | ❌ | ❌ | ❌ | Strict privacy |
| | Authenticated | ✅ (own) | ✅ (own) | ✅ (own) | ❌ | Owner-only access |
| | Admin | ❌ | ❌ | ❌ | ❌ | No admin access (privacy) |
| **cv_data** | Guest | ❌ | ❌ | ❌ | ❌ | Use MV instead |
| | Authenticated | ✅ (own) | ✅ (own) | ✅ (own) | ❌ | Full CRUD own CV |
| | Admin | ✅ (all) | ❌ | ✅ (approval) | ❌ | Can review & approve |
| **cv_details** | Guest | ❌ | ❌ | ❌ | ❌ | Private data |
| | Authenticated | ✅ (own) | ✅ (own) | ✅ (own) | ❌ | Owner-only |
| | Admin | ✅ (all) | ❌ | ❌ | ❌ | Read-only for support |
| **approved_candidates_v** | Guest | ✅ (public) | N/A | N/A | N/A | Public listing |
| | Authenticated | ✅ (filtered) | N/A | N/A | N/A | Opposite gender only |
| | Admin | ✅ (all) | N/A | N/A | N/A | Full access |
| **taaruf_requests** | Guest | ❌ | ❌ | ❌ | ❌ | Auth required |
| | Authenticated | ✅ (own) | ✅ (guarded) | ✅ (respond) | ❌ | Can view/create/respond |
| | Admin | ✅ (all) | ❌ | ❌ | ❌ | Read-only monitoring |
| **taaruf_sessions** | Guest | ❌ | ❌ | ❌ | ❌ | Auth required |
| | Authenticated | ✅ (participant) | ✅ (via trigger) | ✅ (finish) | ❌ | Participants only |
| | Admin | ✅ (all) | ❌ | ❌ | ❌ | Read-only monitoring |
| **wallet_ledger_entries** | Guest | ❌ | ❌ | ❌ | ❌ | Auth required |
| | Authenticated | ✅ (own) | ❌ | ❌ | ❌ | Read-only balance check |
| | Admin | ✅ (all) | ❌ | ❌ | ❌ | Audit & support |
| | Service Role | ✅ (all) | ✅ (system) | ❌ | ❌ | Server-only mutations |
| **koin_topup_orders** | Guest | ❌ | ❌ | ❌ | ❌ | Auth required |
| | Authenticated | ✅ (own) | ✅ (own) | ❌ | ❌ | Can create & view |
| | Admin | ✅ (all) | ❌ | ❌ | ❌ | Monitoring & support |
| | Service Role | ✅ (all) | ❌ | ✅ (webhook) | ❌ | Webhook updates |
| **sequences** | All | ❌ | ❌ | ❌ | ❌ | Function-only access |
| | Service Role | ✅ (all) | ✅ (seed) | ✅ (increment) | ❌ | Managed via functions |
| **provinces** | All | ✅ (all) | ❌ | ❌ | ❌ | Public master data |
| **admin_actions_audit** | Guest | ❌ | ❌ | ❌ | ❌ | Admin-only |
| | Authenticated | ❌ | ❌ | ❌ | ❌ | Admin-only |
| | Admin | ✅ (all) | ✅ (own) | ❌ | ❌ | Append-only audit log |

---

## Helper Functions (Security Definer)

### 1. `is_admin()`
Check if current user is admin.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND is_admin = true
  );
$$;

-- Comments
COMMENT ON FUNCTION public.is_admin() IS 
  'Security definer function - checks if current user has admin privileges';
```

**Performance:** 
- Uses `auth.uid()` (indexed user_id)
- Simple EXISTS check (fast boolean result)
- STABLE hint untuk query planner optimization

---

### 2. `get_user_gender()`
Get current authenticated user's gender (for opposite gender filtering).

```sql
CREATE OR REPLACE FUNCTION public.get_user_gender()
RETURNS gender_enum
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT gender 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

-- Comments
COMMENT ON FUNCTION public.get_user_gender() IS 
  'Returns authenticated user gender for opposite gender filtering in candidate listing';
```

**Performance:**
- Direct lookup via indexed user_id
- Returns NULL if not set (handled in policy)
- STABLE untuk caching within transaction

---

### 3. `can_ajukan_taaruf(uuid, uuid)`
Business guard function untuk validate Taaruf proposal.

```sql
CREATE OR REPLACE FUNCTION public.can_ajukan_taaruf(
  from_user_id uuid,
  to_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  from_cv_status cv_status_enum;
  from_gender gender_enum;
  to_gender gender_enum;
  from_balance int;
  has_active_taaruf boolean;
  taaruf_cost_cents int := 500; -- 5 koin (tunable via site_settings)
BEGIN
  -- Check 1: Not same user
  IF from_user_id = to_user_id THEN
    RETURN FALSE;
  END IF;

  -- Check 2: From user's CV must be APPROVED
  SELECT cd.status, cd.gender 
  INTO from_cv_status, from_gender
  FROM public.cv_data cd
  WHERE cd.user_id = from_user_id;

  IF from_cv_status IS NULL OR from_cv_status != 'APPROVED' THEN
    RETURN FALSE;
  END IF;

  -- Check 3: To user's CV must be APPROVED
  SELECT cd.gender 
  INTO to_gender
  FROM public.cv_data cd
  WHERE cd.user_id = to_user_id
    AND cd.status = 'APPROVED';

  IF to_gender IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check 4: Must be opposite gender
  IF from_gender = to_gender THEN
    RETURN FALSE;
  END IF;

  -- Check 5: From user must have sufficient balance
  SELECT COALESCE(balance_cents, 0)
  INTO from_balance
  FROM public.wallet_balances_v
  WHERE user_id = from_user_id;

  IF from_balance < taaruf_cost_cents THEN
    RETURN FALSE;
  END IF;

  -- Check 6: From user must not have active taaruf
  SELECT EXISTS (
    SELECT 1 
    FROM public.taaruf_sessions 
    WHERE (user_a = from_user_id OR user_b = from_user_id)
      AND status = 'ACTIVE'
  ) INTO has_active_taaruf;

  IF has_active_taaruf THEN
    RETURN FALSE;
  END IF;

  -- All checks passed
  RETURN TRUE;
END;
$$;

-- Comments
COMMENT ON FUNCTION public.can_ajukan_taaruf(uuid, uuid) IS 
  'Comprehensive business guard - validates all prerequisites for ta\'aruf proposal';
```

**Performance Considerations:**
- Early returns untuk fail-fast optimization
- Uses indexed lookups (user_id, status)
- Partial index on `taaruf_sessions(user_a/b, status='ACTIVE')` critical
- Wrapped dalam function untuk avoid inline subqueries di policy

---

## Table-by-Table RLS Policies

### 1. **profiles**

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Authenticated users can update own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Admins can update any profile (e.g. ban users)
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Comments
COMMENT ON POLICY "profiles_select_own" ON public.profiles IS 
  'Users can read their own profile data';
COMMENT ON POLICY "profiles_select_admin" ON public.profiles IS 
  'Admins have full read access for user management';
```

**Index Requirements:**
- ✅ `profiles(user_id)` - PK, auto-indexed
- ✅ `profiles(is_admin)` - Partial index WHERE is_admin=true recommended

**Anti-Enumeration:**
- Query for non-existent user returns empty set (no error disclosure)
- Profile existence not exposed via RLS errors

---

### 2. **onboarding_verifications**

```sql
-- Enable RLS
ALTER TABLE public.onboarding_verifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Owner-only SELECT
CREATE POLICY "onboarding_select_own"
  ON public.onboarding_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Owner-only INSERT
CREATE POLICY "onboarding_insert_own"
  ON public.onboarding_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Owner-only UPDATE
CREATE POLICY "onboarding_update_own"
  ON public.onboarding_verifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- NO ADMIN ACCESS (strict privacy)

-- Comments
COMMENT ON POLICY "onboarding_select_own" ON public.onboarding_verifications IS 
  'Strict owner-only access - not even admin can view 5Q answers';
```

**Security Notes:**
- ❌ No admin access (privacy-first design)
- ✅ Owner can view/update own 5Q answers
- ✅ Application layer handles negative answer popup logic

---

### 3. **cv_data**

```sql
-- Enable RLS
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view own CV
CREATE POLICY "cv_select_own"
  ON public.cv_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all CVs (for verification)
CREATE POLICY "cv_select_admin"
  ON public.cv_data
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Authenticated users can insert own CV
CREATE POLICY "cv_insert_own"
  ON public.cv_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Authenticated users can update own CV (except status)
CREATE POLICY "cv_update_own"
  ON public.cv_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() 
    AND (OLD.status = NEW.status)  -- Cannot self-approve
  );

-- Policy 5: Admins can update CV for approval workflow
CREATE POLICY "cv_update_admin"
  ON public.cv_data
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Comments
COMMENT ON POLICY "cv_update_own" ON public.cv_data IS 
  'Users can update CV content but cannot change status (admin-only)';
COMMENT ON POLICY "cv_update_admin" ON public.cv_data IS 
  'Admins can approve/revise CV and update status';
```

**Index Requirements:**
- ✅ `cv_data(user_id)` - PK
- ✅ `cv_data(status)` - For admin filtering

**Business Rules:**
- Users cannot self-approve CV (OLD.status = NEW.status check)
- Status transitions managed by admin
- Candidate code generation via trigger (not user-editable)

---

### 4. **cv_details**

```sql
-- Enable RLS
ALTER TABLE public.cv_details ENABLE ROW LEVEL SECURITY;

-- Policy 1: Owner-only SELECT
CREATE POLICY "cv_details_select_own"
  ON public.cv_details
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admin read-only (support purposes)
CREATE POLICY "cv_details_select_admin"
  ON public.cv_details
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Owner-only INSERT
CREATE POLICY "cv_details_insert_own"
  ON public.cv_details
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Owner-only UPDATE
CREATE POLICY "cv_details_update_own"
  ON public.cv_details
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments
COMMENT ON POLICY "cv_details_select_admin" ON public.cv_details IS 
  'Admin read-only access for user support (not exposed in public listing)';
```

**Privacy Protection:**
- Extended CV categories (family, ibadah, criteria, marriage plan) never exposed in public listing
- Admin access read-only (cannot modify user's detailed CV)

---

### 5. **approved_candidates_v** (Materialized View)

```sql
-- Enable RLS on MV
ALTER MATERIALIZED VIEW public.approved_candidates_v ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view all (guest browsing)
CREATE POLICY "approved_candidates_select_public"
  ON public.approved_candidates_v
  FOR SELECT
  TO anon, authenticated
  USING (true);  -- All approved candidates visible

-- Alternative: Opposite gender filtering for authenticated users
-- (Comment out above policy and use this instead)
/*
CREATE POLICY "approved_candidates_select_filtered"
  ON public.approved_candidates_v
  FOR SELECT
  TO authenticated
  USING (
    gender_label != (
      CASE public.get_user_gender()
        WHEN 'IKHWAN' THEN 'Ikhwan'
        WHEN 'AKHWAT' THEN 'Akhwat'
        ELSE NULL
      END
    )
  );
*/

-- Comments
COMMENT ON POLICY "approved_candidates_select_public" ON public.approved_candidates_v IS 
  'Public listing for guest and authenticated users - gender filtering applied in application layer';
```

**Implementation Decision:**
- Option A: RLS allows all, application filters by opposite gender (recommended untuk avoid policy complexity)
- Option B: RLS enforces opposite gender filtering (requires `get_user_gender()` function call per query)

**Performance:**
- MV pre-computed (no JOIN overhead)
- Composite index supports multi-filter queries
- Application-layer filtering more flexible untuk guest (can choose gender)

---

### 6. **taaruf_requests**

```sql
-- Enable RLS
ALTER TABLE public.taaruf_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view requests they sent or received
CREATE POLICY "taaruf_requests_select_own"
  ON public.taaruf_requests
  FOR SELECT
  TO authenticated
  USING (
    from_user = auth.uid() OR 
    to_user = auth.uid()
  );

-- Policy 2: Admins can view all (monitoring)
CREATE POLICY "taaruf_requests_select_admin"
  ON public.taaruf_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Users can create requests (with business guards)
CREATE POLICY "taaruf_requests_insert_guarded"
  ON public.taaruf_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user = auth.uid()  -- Must be from current user
    AND public.can_ajukan_taaruf(from_user, to_user)  -- Business guards
  );

-- Policy 4: Receiver can update (accept/reject)
CREATE POLICY "taaruf_requests_update_receiver"
  ON public.taaruf_requests
  FOR UPDATE
  TO authenticated
  USING (to_user = auth.uid())  -- Only receiver can decide
  WITH CHECK (
    to_user = auth.uid()
    AND status IN ('ACCEPTED', 'REJECTED')  -- Only these transitions allowed
  );

-- Comments
COMMENT ON POLICY "taaruf_requests_insert_guarded" ON public.taaruf_requests IS 
  'Comprehensive business guards: CV approved + opposite gender + sufficient koin + no active taaruf';
COMMENT ON POLICY "taaruf_requests_update_receiver" ON public.taaruf_requests IS 
  'Only receiver can accept/reject - sender cannot cancel';
```

**Index Requirements:**
- ✅ `taaruf_requests(from_user, status)`
- ✅ `taaruf_requests(to_user, status)`
- ✅ Composite index supports efficient lookups

**Business Logic:**
- `can_ajukan_taaruf()` function wraps all guards (CV, gender, koin, active taaruf)
- Sender cannot cancel (simplicity - wait for response or expiration)
- Receiver can only set status to ACCEPTED atau REJECTED

---

### 7. **taaruf_sessions**

```sql
-- Enable RLS
ALTER TABLE public.taaruf_sessions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Participants can view their sessions
CREATE POLICY "taaruf_sessions_select_participant"
  ON public.taaruf_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_a = auth.uid() OR 
    user_b = auth.uid()
  );

-- Policy 2: Admins can view all (monitoring)
CREATE POLICY "taaruf_sessions_select_admin"
  ON public.taaruf_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: System can insert (via trigger on taaruf_requests.ACCEPTED)
-- Note: Actual INSERT happens via service_role, not user role

-- Policy 4: Participants can finish session
CREATE POLICY "taaruf_sessions_update_finish"
  ON public.taaruf_sessions
  FOR UPDATE
  TO authenticated
  USING (
    (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'ACTIVE'
  )
  WITH CHECK (
    (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'FINISHED'  -- Can only transition to FINISHED
  );

-- Comments
COMMENT ON POLICY "taaruf_sessions_update_finish" ON public.taaruf_sessions IS 
  'Either participant can finish active session - triggers cleanup logic';
```

**Index Requirements:**
- ✅ `taaruf_sessions(user_a, status)`
- ✅ `taaruf_sessions(user_b, status)`
- ✅ Partial unique indexes enforce single active session per user

**Lifecycle:**
- INSERT via service_role (trigger on taaruf_requests acceptance)
- UPDATE via authenticated users (finish session)
- Partial unique index prevents multiple active sessions

---

### 8. **wallet_ledger_entries**

```sql
-- Enable RLS
ALTER TABLE public.wallet_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view own ledger (read-only balance check)
CREATE POLICY "ledger_select_own"
  ON public.wallet_ledger_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all (audit & support)
CREATE POLICY "ledger_select_admin"
  ON public.wallet_ledger_entries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Service role can INSERT (system-only mutations)
-- Note: No policy needed - service_role bypasses RLS

-- Comments
COMMENT ON POLICY "ledger_select_own" ON public.wallet_ledger_entries IS 
  'Read-only access - users cannot modify ledger (immutability guaranteed)';
```

**Security Model:**
- Users: Read-only (balance check via `wallet_balances_v`)
- Admin: Read-only (audit trail)
- Service Role: INSERT-only (bypasses RLS via elevated privileges)

**Immutability:**
- No UPDATE/DELETE policies (append-only log)
- INSERT restricted to service_role
- Balance calculated via aggregation (no direct manipulation)

---

### 9. **koin_topup_orders**

```sql
-- Enable RLS
ALTER TABLE public.koin_topup_orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view own orders
CREATE POLICY "orders_select_own"
  ON public.koin_topup_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all (monitoring & support)
CREATE POLICY "orders_select_admin"
  ON public.koin_topup_orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Users can create own orders
CREATE POLICY "orders_insert_own"
  ON public.koin_topup_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Service role can UPDATE (webhook callbacks)
-- Note: No policy needed - service_role bypasses RLS

-- Comments
COMMENT ON POLICY "orders_insert_own" ON public.koin_topup_orders IS 
  'Users can create payment orders - status updates via webhook (service_role)';
```

**Payment Flow:**
1. User creates order (INSERT via authenticated role)
2. Midtrans webhook updates status (UPDATE via service_role)
3. Ledger entry created (INSERT via service_role dengan idempotency)

**Index Requirements:**
- ✅ `koin_topup_orders(user_id, created_at DESC)` - For user history
- ✅ `koin_topup_orders(order_id)` - PK, webhook lookups

---

### 10. **sequences**

```sql
-- Enable RLS
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;

-- NO USER POLICIES (function-only access)

-- Service role manages via functions:
-- - generate_candidate_code(gender)
-- - generate_taaruf_code()

-- Comments
COMMENT ON TABLE public.sequences IS 
  'Managed exclusively via security definer functions - no direct user access';
```

**Access Control:**
- Functions use SECURITY DEFINER untuk elevated privileges
- Atomic increment via `SELECT ... FOR UPDATE`
- No user-facing policies (implementation detail)

---

### 11. **provinces**

```sql
-- Enable RLS
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access (master data)
CREATE POLICY "provinces_select_public"
  ON public.provinces
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Comments
COMMENT ON POLICY "provinces_select_public" ON public.provinces IS 
  'Public master data - no restrictions on read access';
```

**Rationale:**
- Master data (38 provinces) is public knowledge
- Read-only untuk all roles (no INSERT/UPDATE/DELETE by users)
- Seeded via migration, managed by admin via SQL directly

---

### 12. **admin_actions_audit**

```sql
-- Enable RLS
ALTER TABLE public.admin_actions_audit ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can view audit log
CREATE POLICY "audit_select_admin"
  ON public.admin_actions_audit
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 2: Admins can insert audit entries (via triggers)
CREATE POLICY "audit_insert_admin"
  ON public.admin_actions_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Comments
COMMENT ON POLICY "audit_insert_admin" ON public.admin_actions_audit IS 
  'Admins can only log their own actions - prevents impersonation';
```

**Audit Integrity:**
- Admins can only insert with their own admin_id (no impersonation)
- No UPDATE/DELETE (immutable audit trail)
- Permanent retention untuk compliance

---

## Field Exposure Matrix (Public vs Private)

### Public Fields (exposed in `approved_candidates_v`)
✅ candidate_code  
✅ gender_label  
✅ occupation  
✅ age (calculated)  
✅ province (general)  
✅ education level  
✅ income_bracket  
✅ height_cm, weight_kg  
✅ disease_history (short)  

### Private Fields (owner + admin only)
❌ full_name (until Taaruf active)  
❌ birth_date (exact date)  
❌ alamat lengkap  
❌ email/contact details  
❌ 5Q verification answers  
❌ cv_details (family, ibadah, criteria, marriage plan)  
❌ ledger transaction details  

**Rationale:**
- Public listing shows enough info untuk initial interest
- Full profile unlocked setelah Taaruf accepted
- Privacy-first design (progressive disclosure)

---

## Performance Optimization Checklist

✅ **Wrapped Functions:**
- `is_admin()` - Avoid inline subquery di policy
- `get_user_gender()` - Cached within transaction (STABLE)
- `can_ajukan_taaruf()` - Complex guards wrapped untuk readability

✅ **Index Support:**
- All policies use indexed columns (user_id, status, gender)
- Partial indexes untuk selective queries (ACTIVE sessions, APPROVED CVs)
- Composite indexes untuk multi-condition policies

✅ **Security Definer:**
- Functions run dengan elevated privileges (avoid permission errors)
- STABLE hint untuk query planner optimization
- Early returns di guard functions (fail-fast)

✅ **Anti-Enumeration:**
- Generic error messages (no "user not found" vs "unauthorized")
- Empty result sets untuk non-existent resources
- Consistent response times (no timing attacks)

---

## Testing RLS Policies

### Test Script Template

```sql
-- Test as authenticated user
BEGIN;
  SET LOCAL request.jwt.claim.sub = '<user_uuid>';
  
  -- Test SELECT own data
  SELECT * FROM public.profiles WHERE user_id = '<user_uuid>';
  -- Expected: 1 row
  
  -- Test SELECT other's data
  SELECT * FROM public.profiles WHERE user_id != '<user_uuid>';
  -- Expected: 0 rows (denied by policy)
  
  -- Test UPDATE own data
  UPDATE public.profiles SET full_name = 'Test' WHERE user_id = '<user_uuid>';
  -- Expected: Success
  
  -- Test UPDATE other's data
  UPDATE public.profiles SET full_name = 'Hack' WHERE user_id != '<user_uuid>';
  -- Expected: 0 rows affected (policy blocks)
  
ROLLBACK;

-- Test as admin
BEGIN;
  SET LOCAL request.jwt.claim.sub = '<admin_uuid>';
  SET LOCAL request.jwt.claim.is_admin = 'true';
  
  -- Test SELECT all
  SELECT COUNT(*) FROM public.profiles;
  -- Expected: All rows visible
  
ROLLBACK;

-- Test as guest (anon)
BEGIN;
  SET ROLE anon;
  
  -- Test public MV
  SELECT COUNT(*) FROM public.approved_candidates_v;
  -- Expected: All approved candidates
  
  -- Test private table
  SELECT COUNT(*) FROM public.profiles;
  -- Expected: 0 rows (RLS blocks)
  
ROLLBACK;
```

### Automated RLS Test Suite

```bash
# Run with pytest + Supabase client
python tests/integration/test_rls_policies.py

# Test matrix:
# - Guest role × all tables
# - Authenticated role × all tables × own vs other's data
# - Admin role × all tables
# - Service role × restricted operations
```

---

## RLS Policy Rollback Plan

If RLS policies cause performance issues or unexpected behavior:

```sql
-- Disable RLS per table (emergency only)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop specific policy
DROP POLICY "policy_name" ON public.table_name;

-- Re-enable after fix
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... (recreate policy);
```

**Monitoring:**
- Track query performance before/after RLS enable
- Monitor Supabase logs untuk policy-related errors
- Alert on unusual access patterns (audit log analysis)

---

## Migration File Order (RLS-specific)

1. `20241201_11_enable_rls.sql` - Enable RLS on all tables
2. `20241201_12_create_helper_functions.sql` - is_admin(), get_user_gender(), can_ajukan_taaruf()
3. `20241201_13_create_rls_policies_profiles.sql` - Profiles policies
4. `20241201_14_create_rls_policies_cv.sql` - CV & CV details policies
5. `20241201_15_create_rls_policies_taaruf.sql` - Taaruf requests & sessions policies
6. `20241201_16_create_rls_policies_wallet.sql` - Wallet & payment policies
7. `20241201_17_create_rls_policies_misc.sql` - Provinces, audit, sequences policies
8. `20241201_18_test_rls_policies.sql` - Automated test suite

---

**END OF DELIVERABLE 2: RLS POLICIES DESIGN**

Next: Deliverable 3 - DATABASE FUNCTIONS & TRIGGERS DESIGN
