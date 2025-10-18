# 1. DATABASE SCHEMA DESIGN
## Complete ERD & Table Definitions

### Entity Relationship Diagram (Text-based)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│   - id (PK)     │
│   - email       │
│   - provider    │
└────────┬────────┘
         │
         │ 1:1
         ↓
┌──────────────────────────────┐
│        profiles              │
│  - user_id (PK, FK)          │
│  - email                     │
│  - full_name                 │
│  - gender (enum)             │
│  - dob (date)                │
│  - province_id (FK)          │
│  - education (enum)          │
│  - occupation                │
│  - avatar_path               │
│  - is_admin (boolean)        │
│  - registered_at (timestamp) │
│  - created_at, updated_at    │
└────────┬─────────────────────┘
         │
         ├──────────────────────────────┐
         │                              │
         │ 1:1                          │ 1:1
         ↓                              ↓
┌──────────────────────────┐   ┌───────────────────────────┐
│ onboarding_verifications │   │        cv_data            │
│  - user_id (PK, FK)      │   │  - user_id (PK, FK)       │
│  - q1, q2, q3, q4, q5    │   │  - status (enum)          │
│  - committed (boolean)   │   │  - allow_public (boolean) │
│  - created_at            │   │  - candidate_code (unique)│
│  - updated_at            │   │  - last_reviewed_by (FK)  │
└──────────────────────────┘   │  - last_reviewed_at       │
                               │  --- CV FIELDS ---        │
                               │  - gender (enum)          │
                               │  - full_name              │
                               │  - birth_date (date)      │
                               │  - province_id (FK)       │
                               │  - education (enum)       │
                               │  - occupation             │
                               │  - income_bracket (enum)  │
                               │  - height_cm, weight_kg   │
                               │  - disease_history        │
                               │  - created_at, updated_at │
                               └─────────┬─────────────────┘
                                         │
                                         │ 1:1
                                         ↓
                               ┌────────────────────────────┐
                               │      cv_details            │
                               │  - user_id (PK, FK)        │
                               │  - worship_profile (jsonb) │
                               │  - spouse_criteria (jsonb) │
                               │  - marriage_plan (jsonb)   │
                               │  - family_background(jsonb)│
                               │  - created_at, updated_at  │
                               └────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           approved_candidates_v (MATERIALIZED VIEW)     │
│  - user_id                                              │
│  - candidate_code                                       │
│  - gender_label                                         │
│  - occupation, age, province                            │
│  - education, income_bracket                            │
│  - height_cm, weight_kg, disease_history                │
│  (Source: cv_data JOIN profiles WHERE status=APPROVED   │
│   AND allow_public=true)                                │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│    taaruf_requests       │
│  - id (PK, serial)       │
│  - from_user (FK)        │
│  - to_user (FK)          │
│  - status (enum)         │
│  - reason_reject         │
│  - created_at            │
│  - decided_at            │
│  - expires_at            │
│  UNIQUE(from_user,to_user)│
└────────┬─────────────────┘
         │
         │ N:1 (when accepted)
         ↓
┌──────────────────────────┐
│    taaruf_sessions       │
│  - id (PK, serial)       │
│  - user_a (FK)           │
│  - user_b (FK)           │
│  - status (enum)         │
│  - taaruf_code (unique)  │
│  - started_at            │
│  - ended_at              │
└──────────────────────────┘

┌──────────────────────────┐
│       sequences          │
│  - seq_key (PK)          │
│    ('CANDIDATE_IKHWAN',  │
│     'CANDIDATE_AKHWAT',  │
│     'TAARUF')            │
│  - last_number (bigint)  │
│  - updated_at            │
└──────────────────────────┘

┌──────────────────────────────┐
│     koin_topup_orders        │
│  - order_id (PK)             │
│  - user_id (FK)              │
│  - amount_cents (int)        │
│  - payment_type              │
│  - status (enum)             │
│  - snap_token                │
│  - raw_midtrans (jsonb)      │
│  - created_at, updated_at    │
│  - settled_at                │
└────────┬─────────────────────┘
         │
         │ 1:N (idempotent link)
         ↓
┌──────────────────────────────┐
│    wallet_ledger_entries     │
│  - id (PK, serial)           │
│  - user_id (FK)              │
│  - type (enum: CREDIT/DEBIT) │
│  - amount_cents (int)        │
│  - reason (enum)             │
│  - linked_order_id (FK)      │
│  - idempotency_key (UNIQUE)  │
│  - created_at                │
└──────────────────────────────┘
         │
         │ Aggregate to
         ↓
┌──────────────────────────────┐
│     wallet_balances_v        │
│         (VIEW)               │
│  - user_id                   │
│  - balance_cents             │
│    = SUM(CREDIT) - SUM(DEBIT)│
└──────────────────────────────┘

┌──────────────────────────────┐
│       provinces              │
│  - id (PK, smallint)         │
│  - name (unique)             │
└──────────────────────────────┘

┌──────────────────────────────┐
│    admin_actions_audit       │
│  - id (PK, serial)           │
│  - admin_id (FK)             │
│  - action                    │
│  - target_table              │
│  - target_id                 │
│  - details (jsonb)           │
│  - created_at                │
└──────────────────────────────┘
```

---

## Complete Table Definitions

### 1. **auth.users** (Supabase Managed)
Built-in Supabase Auth table - tidak perlu custom schema.

**Key Columns:**
- `id` (uuid, PK): User identifier
- `email` (text): User email
- `provider` (text): Auth provider (email/google)
- `encrypted_password`: Hashed password
- `email_confirmed_at`: Email verification timestamp

---

### 2. **profiles**
**Purpose:** Extended user profile data

```sql
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  gender gender_enum,  -- 'IKHWAN' | 'AKHWAT'
  dob date,
  province_id smallint REFERENCES public.provinces(id),
  education education_enum,  -- 'SMA_SMK' | 'D3' | 'S1' | 'S2' | 'S3'
  occupation text,
  avatar_path text,  -- Storage path ke Supabase Storage
  is_admin boolean NOT NULL DEFAULT false,
  registered_at timestamptz,  -- Set saat onboarding complete
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_gender ON public.profiles(gender) WHERE gender IS NOT NULL;
CREATE INDEX idx_profiles_province ON public.profiles(province_id) WHERE province_id IS NOT NULL;
CREATE INDEX idx_profiles_registered ON public.profiles(registered_at) WHERE registered_at IS NOT NULL;

-- Trigger untuk auto-update timestamps
CREATE TRIGGER profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE public.profiles IS 'Extended user profile data beyond Supabase Auth';
COMMENT ON COLUMN public.profiles.registered_at IS 'Set after onboarding completion (5Q + optional CV)';
COMMENT ON COLUMN public.profiles.is_admin IS 'Superadmin flag - requires provider=email (Google OAuth blocked)';
```

**Design Decisions:**
- ✅ Linked to `auth.users` dengan CASCADE delete
- ✅ `registered_at` nullable karena set setelah onboarding complete
- ✅ CV-related fields (gender, dob, province, education, occupation) duplicated di `cv_data` untuk snapshot consistency
- ✅ Admin role via boolean flag (granular permissions di `admin_roles` table jika perlu scale)

---

### 3. **onboarding_verifications**
**Purpose:** 5Q verification tracking (sensitive data)

```sql
CREATE TABLE public.onboarding_verifications (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  q1 boolean NOT NULL,
  q2 boolean NOT NULL,
  q3 boolean NOT NULL,
  q4 boolean NOT NULL,
  q5 boolean NOT NULL,
  committed boolean NOT NULL DEFAULT false,  -- User setuju lanjut meski ada negatif
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger
CREATE TRIGGER onboarding_verifications_updated_at 
  BEFORE UPDATE ON public.onboarding_verifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE public.onboarding_verifications IS 'Sensitive 5Q readiness verification data - strict RLS owner-only';
COMMENT ON COLUMN public.onboarding_verifications.committed IS 'User commitment to continue despite negative answers';
```

**Design Decisions:**
- ✅ Owner-only RLS (no admin access untuk privacy)
- ✅ `committed` flag untuk track consent meski ada jawaban negatif
- ✅ No soft delete - permanent record untuk audit compliance

---

### 4. **cv_data**
**Purpose:** CV master data (6 categories combined)

```sql
CREATE TABLE public.cv_data (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status cv_status_enum NOT NULL DEFAULT 'DRAFT',  -- 'DRAFT'|'REVIEW'|'REVISI'|'APPROVED'
  allow_public boolean NOT NULL DEFAULT true,
  candidate_code text UNIQUE,  -- Auto-generated on APPROVED: IKHWAN1, AKHWAT1
  last_reviewed_by uuid REFERENCES public.profiles(user_id),
  last_reviewed_at timestamptz,
  
  -- Snapshot fields dari profiles (untuk consistency)
  gender gender_enum,
  full_name text,
  birth_date date,
  province_id smallint REFERENCES public.provinces(id),
  education education_enum,
  occupation text,
  
  -- Category: Kondisi Fisik
  income_bracket income_bracket_enum,  -- 'SAAT_TAARUF'|'0_2'|'2_5'|'5_10'|'10_PLUS'
  height_cm int CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)),
  weight_kg int CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 30 AND 200)),
  disease_history text,  -- Short text saja
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT cv_approved_must_have_code CHECK (
    (status = 'APPROVED' AND candidate_code IS NOT NULL) OR
    (status != 'APPROVED' AND candidate_code IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_cv_status ON public.cv_data(status);
CREATE INDEX idx_cv_candidate_code ON public.cv_data(candidate_code) WHERE candidate_code IS NOT NULL;
CREATE INDEX idx_cv_gender ON public.cv_data(gender) WHERE gender IS NOT NULL;
CREATE INDEX idx_cv_province ON public.cv_data(province_id) WHERE province_id IS NOT NULL;
CREATE INDEX idx_cv_public_approved ON public.cv_data(user_id) 
  WHERE status = 'APPROVED' AND allow_public = true;  -- Untuk MV refresh performance

-- Trigger
CREATE TRIGGER cv_data_updated_at 
  BEFORE UPDATE ON public.cv_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE public.cv_data IS 'CV master data dengan 6 categories - single source of truth for candidate listing';
COMMENT ON COLUMN public.cv_data.candidate_code IS 'Auto-generated via trigger on status=APPROVED (IKHWAN/AKHWAT + sequence)';
COMMENT ON COLUMN public.cv_data.allow_public IS 'User preference untuk visibility di candidate listing';
COMMENT ON COLUMN public.cv_data.income_bracket IS 'Includes SAAT_TAARUF option untuk privacy';
```

**Design Decisions:**
- ✅ Denormalized design - snapshot fields untuk avoid JOIN overhead di MV
- ✅ Check constraint untuk enforce business rule (approved = has code)
- ✅ Partial index untuk optimize public listing queries
- ✅ No soft delete - CV data permanent dengan status tracking

---

### 5. **cv_details**
**Purpose:** Extended CV data (4 remaining categories) dalam JSONB untuk flexibility

```sql
CREATE TABLE public.cv_details (
  user_id uuid PRIMARY KEY REFERENCES public.cv_data(user_id) ON DELETE CASCADE,
  
  -- Category: Latar Belakang Keluarga
  family_background jsonb,  -- { parent_status, parent_occupation, sibling_order, sibling_total }
  
  -- Category: Ibadah
  worship_profile jsonb,  -- { salat_status, quran_ability, fasting, other_ibadah[] }
  
  -- Category: Kriteria Pasangan
  spouse_criteria jsonb,  -- { age_range, education, income, location, other_criteria[] }
  
  -- Category: Rencana Pernikahan
  marriage_plan jsonb,  -- { marriage_year, living_plan, vision, mission }
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index untuk JSONB queries (jika perlu search)
CREATE INDEX idx_cv_details_family ON public.cv_details USING GIN (family_background);
CREATE INDEX idx_cv_details_worship ON public.cv_details USING GIN (worship_profile);

-- Trigger
CREATE TRIGGER cv_details_updated_at 
  BEFORE UPDATE ON public.cv_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE public.cv_details IS 'Extended CV categories in JSONB for flexibility and privacy';
COMMENT ON COLUMN public.cv_details.family_background IS 'parent_status: HIDUP_KEDUANYA|YATIM|PIATU|YATIM_PIATU';
COMMENT ON COLUMN public.cv_details.worship_profile IS 'salat_status: TERJAGA|KADANG|BELUM_ISTIQOMAH, quran_ability: LANCAR|BELAJAR|BELUM_BISA';
COMMENT ON COLUMN public.cv_details.spouse_criteria IS 'Flexible criteria with repeater support (max 3 items)';
COMMENT ON COLUMN public.cv_details.marriage_plan IS 'Vision/mission max 20 words each';
```

**Example JSONB Structure:**
```json
{
  "family_background": {
    "parent_status": "HIDUP_KEDUANYA",
    "parent_occupation": "Guru",
    "sibling_order": 1,
    "sibling_total": 3
  },
  "worship_profile": {
    "salat_status": "TERJAGA",
    "quran_ability": "LANCAR",
    "fasting": "Puasa Senin dan Kamis",
    "other_ibadah": ["Tahajjud rutin", "Kajian mingguan"]
  },
  "spouse_criteria": {
    "age_range": "25-30",
    "education": "S1",
    "income": "2_5",
    "location": "Jakarta",
    "other_criteria": ["Hafiz", "Suka traveling"]
  },
  "marriage_plan": {
    "marriage_year": 2027,
    "living_plan": "Ikut suami",
    "vision": "Membangun keluarga sakinah mawaddah warahmah",
    "mission": "Mendidik anak-anak dengan nilai-nilai Islam"
  }
}
```

**Design Decisions:**
- ✅ JSONB untuk flexibility (tidak perlu alter table untuk field baru)
- ✅ GIN index untuk fast JSONB queries jika perlu filtering
- ✅ Validation di application layer (Zod schemas)
- ✅ Tidak exposed di public listing (privacy protection)

---

### 6. **approved_candidates_v** (Materialized View)
**Purpose:** Public candidate listing - single source of truth

```sql
CREATE MATERIALIZED VIEW public.approved_candidates_v AS
SELECT
  cd.user_id,
  cd.candidate_code,
  CASE WHEN COALESCE(cd.gender, p.gender) = 'IKHWAN' 
    THEN 'Ikhwan' 
    ELSE 'Akhwat' 
  END as gender_label,
  COALESCE(cd.occupation, p.occupation) as occupation,
  EXTRACT(YEAR FROM AGE(COALESCE(cd.birth_date, p.dob)))::int as age,
  COALESCE(pr.name, 'N/A') as province,
  COALESCE(cd.education, p.education) as education,
  cd.income_bracket,
  cd.height_cm,
  cd.weight_kg,
  cd.disease_history,
  cd.updated_at as cv_updated_at
FROM public.cv_data cd
JOIN public.profiles p ON p.user_id = cd.user_id
LEFT JOIN public.provinces pr ON pr.id = COALESCE(cd.province_id, p.province_id)
WHERE cd.status = 'APPROVED'
  AND cd.allow_public = true;

-- Unique index untuk REFRESH CONCURRENTLY (required)
CREATE UNIQUE INDEX ON public.approved_candidates_v (user_id);

-- Additional indexes untuk filtering performance
CREATE INDEX idx_approved_gender ON public.approved_candidates_v (gender_label);
CREATE INDEX idx_approved_province ON public.approved_candidates_v (province);
CREATE INDEX idx_approved_education ON public.approved_candidates_v (education);
CREATE INDEX idx_approved_age ON public.approved_candidates_v (age);

-- Composite index untuk common filter combinations
CREATE INDEX idx_approved_filter_combo ON public.approved_candidates_v 
  (gender_label, age, province, education);

-- Comments
COMMENT ON MATERIALIZED VIEW public.approved_candidates_v IS 
  'Public candidate listing - refreshed on CV approval events + scheduled fallback';
```

**Refresh Strategy:**
```sql
-- Event-driven refresh (after CV approval)
REFRESH MATERIALIZED VIEW CONCURRENTLY public.approved_candidates_v;

-- Fallback: Scheduled refresh via pg_cron atau Netlify Functions
-- Schedule: Every 5 minutes during peak hours, hourly off-peak
```

**Design Decisions:**
- ✅ Materialized untuk performance (avoid expensive JOINs pada setiap listing request)
- ✅ UNIQUE index untuk support REFRESH CONCURRENTLY (zero downtime)
- ✅ Composite index untuk optimize multi-filter queries
- ✅ Event-driven refresh (ideal) + scheduled fallback (reliability)
- ✅ Size monitoring: atomic swap jika >500MB, partitioning jika >1GB

---

### 7. **taaruf_requests**
**Purpose:** Taaruf proposal tracking

```sql
CREATE TABLE public.taaruf_requests (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  from_user uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status taaruf_request_status NOT NULL DEFAULT 'PENDING',  
    -- 'PENDING'|'ACCEPTED'|'REJECTED'|'EXPIRED'
  reason_reject text,
  created_at timestamptz DEFAULT now(),
  decided_at timestamptz,
  expires_at timestamptz DEFAULT (now() + INTERVAL '7 days'),
  
  UNIQUE(from_user, to_user),
  CHECK (from_user != to_user)
);

-- Indexes
CREATE INDEX idx_taaruf_from_user ON public.taaruf_requests(from_user, status);
CREATE INDEX idx_taaruf_to_user ON public.taaruf_requests(to_user, status);
CREATE INDEX idx_taaruf_expires_at ON public.taaruf_requests(expires_at) 
  WHERE status = 'PENDING';  -- Untuk cleanup job

-- Comments
COMMENT ON TABLE public.taaruf_requests IS 'Ta\'aruf proposals dengan 7-day expiration';
COMMENT ON COLUMN public.taaruf_requests.expires_at IS 'Auto-rejected via scheduled job after expiration';
COMMENT ON CONSTRAINT taaruf_requests_from_user_to_user_key ON public.taaruf_requests IS 
  'Prevent duplicate proposals between same pair';
```

**Design Decisions:**
- ✅ UNIQUE constraint untuk prevent duplicate proposals
- ✅ Self-referential FK dengan check constraint (tidak bisa ajukan ke diri sendiri)
- ✅ Partial index untuk optimize cleanup job
- ✅ Status EXPIRED via scheduled job (auto-reject after 7 days)

---

### 8. **taaruf_sessions**
**Purpose:** Active Taaruf sessions dengan kode tracking

```sql
CREATE TABLE public.taaruf_sessions (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_a uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status taaruf_session_status NOT NULL DEFAULT 'ACTIVE',  -- 'ACTIVE'|'FINISHED'
  taaruf_code text UNIQUE NOT NULL,  -- Auto-generated: TAARUF1, TAARUF2, ...
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  
  CHECK (user_a != user_b)
);

-- Indexes
CREATE INDEX idx_taaruf_sessions_user_a ON public.taaruf_sessions(user_a, status);
CREATE INDEX idx_taaruf_sessions_user_b ON public.taaruf_sessions(user_b, status);
CREATE INDEX idx_taaruf_sessions_code ON public.taaruf_sessions(taaruf_code);

-- Partial index untuk active session check (business guard)
CREATE UNIQUE INDEX idx_taaruf_active_user_a ON public.taaruf_sessions(user_a) 
  WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX idx_taaruf_active_user_b ON public.taaruf_sessions(user_b) 
  WHERE status = 'ACTIVE';

-- Comments
COMMENT ON TABLE public.taaruf_sessions IS 'Active ta\'aruf sessions - only one active per user';
COMMENT ON COLUMN public.taaruf_sessions.taaruf_code IS 'Auto-generated via trigger: TAARUF + sequence';
COMMENT ON INDEX idx_taaruf_active_user_a IS 'Enforce single active taaruf per user (business rule)';
```

**Design Decisions:**
- ✅ Partial unique indexes untuk enforce "only one active taaruf per user" rule
- ✅ `taaruf_code` auto-generated via trigger saat creation
- ✅ Both participants indexed untuk efficient participant lookups

---

### 9. **sequences**
**Purpose:** Centralized sequence management untuk candidate & taaruf codes

```sql
CREATE TABLE public.sequences (
  seq_key text PRIMARY KEY,  -- 'CANDIDATE_IKHWAN' | 'CANDIDATE_AKHWAT' | 'TAARUF'
  last_number bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Seed initial values
INSERT INTO public.sequences (seq_key, last_number) VALUES
  ('CANDIDATE_IKHWAN', 0),
  ('CANDIDATE_AKHWAT', 0),
  ('TAARUF', 0);

-- Index
CREATE INDEX idx_sequences_updated ON public.sequences(updated_at);

-- Comments
COMMENT ON TABLE public.sequences IS 'Centralized sequence counters untuk code generation dengan atomic increment';
COMMENT ON COLUMN public.sequences.seq_key IS 'Sequence identifier: CANDIDATE_IKHWAN, CANDIDATE_AKHWAT, TAARUF';
```

**Design Decisions:**
- ✅ Centralized management (easier monitoring dan reset)
- ✅ Separate sequences untuk IKHWAN/AKHWAT (business requirement)
- ✅ Atomic increment via `SELECT FOR UPDATE` di function
- ✅ `updated_at` untuk tracking sequence activity

---

### 10. **koin_topup_orders**
**Purpose:** Midtrans payment order tracking

```sql
CREATE TABLE public.koin_topup_orders (
  order_id text PRIMARY KEY,  -- Generated client-side: user_id + timestamp
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  payment_type text,  -- 'bank_transfer', 'credit_card', 'qris', 'gopay', dll
  status payment_status NOT NULL DEFAULT 'PENDING',  
    -- 'PENDING'|'SETTLEMENT'|'CANCEL'|'EXPIRE'|'REFUND'|'CHARGEBACK'
  snap_token text,  -- Midtrans Snap token
  raw_midtrans jsonb,  -- Full webhook payload untuk forensic
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  settled_at timestamptz
);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.koin_topup_orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.koin_topup_orders(status);
CREATE INDEX idx_orders_settled_at ON public.koin_topup_orders(settled_at) 
  WHERE settled_at IS NOT NULL;

-- Trigger
CREATE TRIGGER koin_topup_orders_updated_at 
  BEFORE UPDATE ON public.koin_topup_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE public.koin_topup_orders IS 'Midtrans payment orders - linked to ledger via idempotency';
COMMENT ON COLUMN public.koin_topup_orders.raw_midtrans IS 'Full webhook payload for audit and dispute resolution';
COMMENT ON COLUMN public.koin_topup_orders.amount_cents IS 'Amount in Indonesian Rupiah sen (x100)';
```

**Design Decisions:**
- ✅ `order_id` as PK (Midtrans requirement untuk idempotency)
- ✅ `raw_midtrans` JSONB untuk full audit trail
- ✅ Status follows Midtrans status codes (alignment)
- ✅ `settled_at` separate dari `updated_at` untuk financial reporting

---

### 11. **wallet_ledger_entries**
**Purpose:** Ledger-first transaction log (single source of truth untuk balance)

```sql
CREATE TABLE public.wallet_ledger_entries (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type ledger_type NOT NULL,  -- 'CREDIT' | 'DEBIT'
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  reason ledger_reason NOT NULL,  
    -- 'TOPUP'|'TAARUF_COST'|'ADJUSTMENT'|'REFUND'|'CHARGEBACK'
  linked_order_id text REFERENCES public.koin_topup_orders(order_id) ON DELETE SET NULL,
  idempotency_key text NOT NULL UNIQUE,  
    -- Format: "order:{order_id}:CREDIT" atau "taaruf:{request_id}:DEBIT"
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ledger_user_id ON public.wallet_ledger_entries(user_id, created_at DESC);
CREATE INDEX idx_ledger_type_reason ON public.wallet_ledger_entries(type, reason);
CREATE INDEX idx_ledger_order_id ON public.wallet_ledger_entries(linked_order_id) 
  WHERE linked_order_id IS NOT NULL;
CREATE INDEX idx_ledger_idempotency ON public.wallet_ledger_entries(idempotency_key);

-- Comments
COMMENT ON TABLE public.wallet_ledger_entries IS 
  'Ledger-first transaction log - balance calculated as SUM(CREDIT) - SUM(DEBIT)';
COMMENT ON COLUMN public.wallet_ledger_entries.idempotency_key IS 
  'Prevents duplicate credit/debit entries - format: "{source}:{id}:{type}"';
COMMENT ON COLUMN public.wallet_ledger_entries.linked_order_id IS 
  'Optional link to payment order for reconciliation';
```

**Design Decisions:**
- ✅ Append-only ledger (no UPDATE/DELETE) untuk immutability
- ✅ Idempotency key prevents double-credit/debit (race condition protection)
- ✅ Balance calculated via aggregation (no direct balance column)
- ✅ `created_at` only (no update timestamp untuk immutability)

---

### 12. **wallet_balances_v** (View)
**Purpose:** Calculated balance view dari ledger aggregation

```sql
CREATE OR REPLACE VIEW public.wallet_balances_v AS
SELECT 
  user_id,
  COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount_cents ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount_cents ELSE 0 END), 0) 
    AS balance_cents
FROM public.wallet_ledger_entries
GROUP BY user_id;

-- Comments
COMMENT ON VIEW public.wallet_balances_v IS 
  'Real-time balance calculation - balance = SUM(CREDIT) - SUM(DEBIT)';
```

**Design Decisions:**
- ✅ View (bukan MV) untuk real-time balance accuracy
- ✅ Single query untuk balance check (efficient)
- ✅ No caching (balance must be always accurate)

---

### 13. **provinces**
**Purpose:** Indonesia provinces master data

```sql
CREATE TABLE public.provinces (
  id smallint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- Index
CREATE INDEX idx_provinces_name ON public.provinces(name);

-- Comments
COMMENT ON TABLE public.provinces IS 'Indonesia provinces master data from BPS (Badan Pusat Statistik)';
```

**Seed Data:** Will be populated via migration with official BPS province list (38 provinces)

---

### 14. **admin_actions_audit**
**Purpose:** Admin action audit trail untuk compliance

```sql
CREATE TABLE public.admin_actions_audit (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  action text NOT NULL,  -- 'CV_APPROVED', 'CV_REJECTED', 'USER_BANNED', dll
  target_table text,
  target_id text,
  details jsonb,  -- Additional context
  correlation_id text,  -- X-Request-ID untuk tracing
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_admin_id ON public.admin_actions_audit(admin_id, created_at DESC);
CREATE INDEX idx_audit_action ON public.admin_actions_audit(action, created_at DESC);
CREATE INDEX idx_audit_target ON public.admin_actions_audit(target_table, target_id);
CREATE INDEX idx_audit_correlation ON public.admin_actions_audit(correlation_id) 
  WHERE correlation_id IS NOT NULL;

-- Comments
COMMENT ON TABLE public.admin_actions_audit IS 
  'Admin action audit trail - permanent retention untuk compliance';
COMMENT ON COLUMN public.admin_actions_audit.correlation_id IS 
  'Links audit entry to request via X-Request-ID for debugging';
```

**Design Decisions:**
- ✅ Append-only (no UPDATE/DELETE)
- ✅ `admin_id` nullable dengan ON DELETE SET NULL (preserve audit jika admin deleted)
- ✅ JSONB details untuk flexible audit data
- ✅ Correlation ID untuk end-to-end request tracing

---

## Database Enums

```sql
-- Gender
CREATE TYPE gender_enum AS ENUM ('IKHWAN', 'AKHWAT');

-- Income bracket (safe labels)
CREATE TYPE income_bracket_enum AS ENUM (
  'SAAT_TAARUF',  -- Will disclose during Taaruf
  '0_2',          -- 0-2 juta/bulan
  '2_5',          -- 2-5 juta/bulan
  '5_10',         -- 5-10 juta/bulan
  '10_PLUS'       -- >10 juta/bulan
);

-- Education
CREATE TYPE education_enum AS ENUM ('SMA_SMK', 'D3', 'S1', 'S2', 'S3');

-- CV Status (no REJECTED untuk avoid dead-end)
CREATE TYPE cv_status_enum AS ENUM ('DRAFT', 'REVIEW', 'REVISI', 'APPROVED');

-- Taaruf Request Status (no CANCELLED untuk simplicity)
CREATE TYPE taaruf_request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- Taaruf Session Status (no CANCELLED untuk simplicity)
CREATE TYPE taaruf_session_status AS ENUM ('ACTIVE', 'FINISHED');

-- Ledger Type
CREATE TYPE ledger_type AS ENUM ('CREDIT', 'DEBIT');

-- Ledger Reason
CREATE TYPE ledger_reason AS ENUM (
  'TOPUP',
  'TAARUF_COST',
  'ADJUSTMENT',
  'REFUND',
  'CHARGEBACK'
);

-- Payment Status (aligned dengan Midtrans)
CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'SETTLEMENT',
  'CANCEL',
  'EXPIRE',
  'REFUND',
  'CHARGEBACK'
);
```

---

## Data Normalization Strategy

**3NF Compliance:**
- ✅ Profiles: User data atomized
- ✅ CV: Denormalized intentionally untuk MV performance (trade-off accepted)
- ✅ Provinces: Separate master table
- ✅ Sequences: Separate table untuk centralized management
- ✅ Ledger: Append-only log (no redundancy)

**Denormalization Trade-offs:**
- `cv_data` contains snapshot fields dari `profiles` → Acceptable untuk avoid expensive JOINs di MV refresh
- `approved_candidates_v` materializes JOIN results → Performance optimization untuk public listing

---

## Index Strategy Summary

| Table | Index Type | Purpose | Estimated Selectivity |
|-------|-----------|---------|----------------------|
| `profiles` | B-tree on gender, province | Filter candidates | High (50% gender, 5% province) |
| `cv_data` | Partial on status=APPROVED | MV refresh optimization | Medium (10-20% approved) |
| `approved_candidates_v` | Composite (gender, age, province, education) | Multi-filter queries | High (complex filters) |
| `taaruf_requests` | Partial on status=PENDING | Cleanup job efficiency | Low (most decided quickly) |
| `taaruf_sessions` | Unique partial on ACTIVE | Business rule enforcement | Very High (1 active/user max) |
| `wallet_ledger_entries` | B-tree on user_id, created_at | Balance calculation | High (per-user aggregation) |

**Free Tier Optimization:**
- Total indexes: ~30 (acceptable untuk 500MB storage limit)
- Materialized view: ~10-50MB (untuk 1000 candidates estimate)
- Ledger growth: ~100 bytes/entry × 10K transactions = 1MB (negligible)

---

## Audit Trail Columns

All transactional tables include:
- `created_at timestamptz DEFAULT now()`: Record creation timestamp
- `updated_at timestamptz DEFAULT now()`: Last modification timestamp (via trigger)

Additional audit columns:
- `cv_data.last_reviewed_by, last_reviewed_at`: Admin who reviewed CV
- `koin_topup_orders.settled_at`: Payment settlement timestamp
- `taaruf_requests.decided_at`: When request was accepted/rejected
- `admin_actions_audit.*`: Complete audit trail untuk admin actions

---

## Soft Delete Strategy

**No Soft Delete for Most Tables:**
- Profiles/CV: Hard delete on account closure (cascade)
- Taaruf: Status-based tracking (no need soft delete)
- Ledger: Append-only (immutable)
- Audit: Permanent retention

**Rationale:**
- Simplifies RLS policies
- Reduces index overhead
- GDPR-compliant via hard delete (right to be forgotten)
- Audit trail persists independently (admin actions preserved)

---

## Performance Optimization Checklist

✅ Composite indexes untuk common filter combinations  
✅ Partial indexes untuk selective queries (APPROVED CV, ACTIVE taaruf)  
✅ Materialized view untuk expensive JOINs (candidate listing)  
✅ Denormalized snapshot fields di CV untuk avoid JOIN overhead  
✅ Ledger-first model dengan aggregation view (no balance column drift)  
✅ Regional configuration (ap-southeast-1) untuk latency optimization  
✅ Connection pooling awareness (free tier limits)  

---

## Migration File Order

1. `20241201_01_create_enums.sql` - Define all enum types
2. `20241201_02_create_core_tables.sql` - Profiles, provinces, sequences
3. `20241201_03_create_cv_tables.sql` - CV data & details
4. `20241201_04_create_taaruf_tables.sql` - Requests & sessions
5. `20241201_05_create_wallet_tables.sql` - Orders & ledger
6. `20241201_06_create_audit_tables.sql` - Admin audit
7. `20241201_07_create_indexes.sql` - All indexes
8. `20241201_08_create_triggers.sql` - Timestamps & audit triggers
9. `20241201_09_create_views.sql` - Balance & MV
10. `20241201_10_seed_data.sql` - Provinces & initial sequences

---

**END OF DELIVERABLE 1: DATABASE SCHEMA DESIGN**

Next: Deliverable 2 - RLS POLICIES DESIGN
