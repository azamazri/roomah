# PHASE 2: IMPLEMENTATION - GETTING STARTED GUIDE

## 🎯 Overview

Phase 2 implementation terbagi dalam 8 task utama:
1. ✅ **Setup Environment & Configuration** (DONE)
2. ⏳ **Run Database Migrations** (IN PROGRESS)
3. ⏳ **Implement Backend Server Actions - Auth & Profile**
4. ⏳ **Implement Backend Server Actions - Taaruf & Payment**
5. ⏳ **Setup Integration Points**
6. ⏳ **Implement Security Measures**
7. ⏳ **Write Backend Tests**
8. ⏳ **Verification & Documentation**

---

## ✅ TASK 1 COMPLETED: Setup Environment & Configuration

### What's Been Created:

1. **Migration Files (3/18):**
   - ✅ `supabase/migrations/20250116_01_create_enums.sql`
   - ✅ `supabase/migrations/20250116_02_create_core_tables.sql`
   - ✅ `supabase/migrations/20250116_03_create_cv_tables.sql`

2. **Migration Runner Script:**
   - ✅ `scripts/run-migrations.js` - Automated migration execution

3. **Documentation:**
   - ✅ `supabase/migrations/README.md` - Migration guide

### Environment Variables (Already Configured):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fvqcwphjgftadhbqkpss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Midtrans (Sandbox)
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
MIDTRANS_IS_PROD=false
```

---

## ⏳ TASK 2: Run Database Migrations

### Option 1: Manual via Supabase Dashboard (RECOMMENDED untuk kontrol penuh)

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/fvqcwphjgftadhbqkpss/sql/new

2. **Run migrations in order:**
   
   **Step 1: Create Enums**
   ```bash
   # Copy content dari: supabase/migrations/20250116_01_create_enums.sql
   # Paste ke SQL Editor → Run
   ```

   **Step 2: Create Core Tables**
   ```bash
   # Copy content dari: supabase/migrations/20250116_02_create_core_tables.sql
   # Paste ke SQL Editor → Run
   ```

   **Step 3: Create CV Tables**
   ```bash
   # Copy content dari: supabase/migrations/20250116_03_create_cv_tables.sql
   # Paste ke SQL Editor → Run
   ```

3. **Verify migrations:**
   ```sql
   -- Check tables created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;

   -- Check enums created
   SELECT typname FROM pg_type 
   WHERE typnamespace = 'public'::regnamespace
   ORDER BY typname;

   -- Check sequences initialized
   SELECT * FROM public.sequences;
   ```

### Option 2: Automated via Script (Setelah dotenv installed)

```bash
# Install dotenv if needed
npm install dotenv

# Run migration script
node scripts/run-migrations.js
```

### Remaining Migrations to Create:

Anda perlu membuat 15 migration files berikut (saya sudah buat template 3 pertama):

```
📁 supabase/migrations/
├── ✅ 20250116_01_create_enums.sql
├── ✅ 20250116_02_create_core_tables.sql
├── ✅ 20250116_03_create_cv_tables.sql
├── ⏳ 20250116_04_create_taaruf_tables.sql  ← CREATE THIS
├── ⏳ 20250116_05_create_wallet_tables.sql  ← CREATE THIS
├── ⏳ 20250116_06_create_audit_tables.sql   ← CREATE THIS
├── ⏳ 20250116_07_create_indexes.sql        ← CREATE THIS (38 indexes)
├── ⏳ 20250116_08_create_functions.sql      ← CREATE THIS (7 functions + 5 triggers)
├── ⏳ 20250116_09_create_views.sql          ← CREATE THIS (MV + balance view)
├── ⏳ 20250116_10_seed_provinces.sql        ← CREATE THIS (38 provinsi)
├── ⏳ 20250116_11_enable_rls.sql            ← CREATE THIS
├── ⏳ 20250116_12_create_helper_functions.sql  ← CREATE THIS (3 RLS helpers)
├── ⏳ 20250116_13_create_rls_profiles.sql   ← CREATE THIS
├── ⏳ 20250116_14_create_rls_cv.sql         ← CREATE THIS
├── ⏳ 20250116_15_create_rls_taaruf.sql     ← CREATE THIS
├── ⏳ 20250116_16_create_rls_wallet.sql     ← CREATE THIS
├── ⏳ 20250116_17_create_rls_misc.sql       ← CREATE THIS
└── ⏳ 20250116_18_test_rls.sql              ← CREATE THIS
```

**Template ada di:** `docs/phase1-persiapan/01-DATABASE-SCHEMA-DESIGN.md` dan `02-RLS-POLICIES-DESIGN.md`

---

## 🚀 TASK 3-4: Implement Backend Server Actions

### Required Folder Structure:

```
📁 features/
├── 📁 auth/
│   ├── 📁 server/
│   │   ├── actions.ts        ← Server Actions (register, login, logout, verify OTP)
│   │   └── queries.ts        ← Data fetching functions
│   ├── 📁 schemas/
│   │   └── index.ts          ← Zod validation schemas
│   └── 📁 types/
│       └── index.ts          ← TypeScript types
│
├── 📁 cv/
│   ├── 📁 server/
│   │   ├── actions.ts        ← CV CRUD operations
│   │   └── queries.ts
│   ├── 📁 schemas/
│   │   └── index.ts
│   └── 📁 types/
│       └── index.ts
│
├── 📁 candidates/
│   ├── 📁 server/
│   │   ├── actions.ts        ← Browse candidates, ajukan taaruf
│   │   └── queries.ts
│   └── ...
│
├── 📁 taaruf/
│   ├── 📁 server/
│   │   ├── actions.ts        ← Accept/reject, finish session
│   │   └── queries.ts
│   └── ...
│
├── 📁 payments/
│   ├── 📁 server/
│   │   ├── actions.ts        ← Create order, check balance
│   │   └── queries.ts
│   └── ...
│
└── 📁 admin/
    ├── 📁 server/
    │   ├── actions.ts        ← Approve/reject CV, ban user
    │   └── queries.ts
    └── ...
```

### Server Action Pattern Template:

```typescript
// features/auth/server/actions.ts
'use server';

import { z } from 'zod';
import { supabaseAction } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';

// Schema
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
});

// Action
export async function registerUser(input: z.infer<typeof RegisterSchema>) {
  // 1. Validate input
  const validated = RegisterSchema.parse(input);
  
  // 2. Get Supabase client (can mutate cookies)
  const supabase = await supabaseAction();
  
  // 3. Auth check (if needed)
  // const { data: { user } } = await supabase.auth.getUser();
  
  // 4. Business logic
  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        full_name: validated.full_name,
      },
    },
  });
  
  if (error) {
    return {
      success: false,
      error: error.message,
      correlationId: generateCorrelationId(),
    };
  }
  
  // 5. Create profile
  await supabase.from('profiles').insert({
    user_id: data.user!.id,
    email: validated.email,
    full_name: validated.full_name,
  });
  
  // 6. Cache invalidation
  revalidateTag('auth');
  
  // 7. Return success
  return {
    success: true,
    data: { userId: data.user!.id },
  };
}
```

---

## 🔐 TASK 5: Setup Integration Points

### Supabase Client Utilities:

```typescript
// lib/supabase/server.ts (for Server Actions)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseAction() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// lib/supabase/service.ts (for privileged operations)
import { createClient } from '@supabase/supabase-js';

export function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

### Midtrans Integration:

```typescript
// lib/midtrans/server.ts
import midtransClient from 'midtrans-client';

export function getMidtransSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PROD === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const crypto = require('crypto');
  const input = orderId + statusCode + grossAmount + serverKey;
  return crypto.createHash('sha512').update(input).digest('hex');
}
```

---

## 🛡️ TASK 6: Security Measures

### Rate Limiting (via Upstash Redis):

```typescript
// lib/rate-limit/index.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const taarufRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
  analytics: true,
  prefix: 'ratelimit:taaruf',
});
```

### CAPTCHA Integration:

```typescript
// lib/captcha/verify.ts
export async function verifyCaptcha(token: string): Promise<boolean> {
  // Use Google reCAPTCHA v3 or hCaptcha
  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  );
  
  const data = await response.json();
  return data.success && data.score > 0.5; // Threshold for v3
}
```

---

## ✅ TASK 7-8: Testing & Verification

### Test Structure:

```
📁 __tests__/
├── 📁 unit/
│   ├── auth.test.ts
│   ├── cv.test.ts
│   └── taaruf.test.ts
│
├── 📁 integration/
│   ├── onboarding-flow.test.ts
│   ├── taaruf-flow.test.ts
│   └── payment-flow.test.ts
│
└── 📁 e2e/
    ├── register-to-cv.spec.ts
    ├── browse-to-taaruf.spec.ts
    └── payment.spec.ts
```

### Run Tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type check
npm run type-check

# Full validation
npm run validate
```

---

## 📋 CHECKLIST: What to Do Next

### Immediate Actions:

1. **Complete Remaining Migrations (15 files):**
   - [ ] Copy SQL from Phase 1 docs
   - [ ] Create migration files 04-18
   - [ ] Run via Supabase Dashboard SQL Editor

2. **Verify Database:**
   - [ ] Check all 14 tables created
   - [ ] Verify 38 indexes exist
   - [ ] Confirm RLS enabled on all tables
   - [ ] Test provinces seeded (38 rows)

3. **Setup Supabase Utilities:**
   - [ ] Create `lib/supabase/server.ts`
   - [ ] Create `lib/supabase/service.ts`
   - [ ] Create `lib/supabase/client.ts` (for client components)

4. **Implement Server Actions (Priority Order):**
   - [ ] Auth (register, login, onboarding)
   - [ ] CV (CRUD operations)
   - [ ] Candidates (browse, ajukan taaruf)
   - [ ] Taaruf (accept/reject, finish)
   - [ ] Payments (create order, webhook)
   - [ ] Admin (approve CV, ban user)

5. **Setup Integrations:**
   - [ ] Midtrans SDK
   - [ ] Sentry error tracking
   - [ ] Rate limiting (Upstash Redis - optional, bisa nanti)

6. **Write Tests:**
   - [ ] Unit tests untuk business logic
   - [ ] Integration tests untuk flows
   - [ ] E2E tests untuk critical journeys

---

## 🆘 Need Help?

**Documentation References:**
- Phase 1 Design: `docs/phase1-persiapan/`
- Database Schema: `01-DATABASE-SCHEMA-DESIGN.md`
- RLS Policies: `02-RLS-POLICIES-DESIGN.md`
- Backend Architecture: `03-08-COMPREHENSIVE-DESIGN.md`

**Supabase Resources:**
- Dashboard: https://supabase.com/dashboard/project/fvqcwphjgftadhbqkpss
- SQL Editor: https://supabase.com/dashboard/project/fvqcwphjgftadhbqkpss/sql
- Docs: https://supabase.com/docs

**Migration Help:**
- Migration README: `supabase/migrations/README.md`
- Migration Runner: `scripts/run-migrations.js`

---

## 🎯 Success Criteria

Phase 2 selesai ketika:

- ✅ All 18 migrations executed successfully
- ✅ All tables & indexes created
- ✅ RLS policies enabled & tested
- ✅ Server Actions implemented untuk all features
- ✅ Integration points configured (Supabase, Midtrans, Sentry)
- ✅ Tests written & passing (unit + integration + E2E)
- ✅ Type checking passing
- ✅ Lint passing
- ✅ Local development works end-to-end

---

**Current Status:** Task 1 Complete, Task 2 In Progress
**Next Step:** Complete remaining 15 migration files & run them via Supabase Dashboard

Good luck! 🚀
