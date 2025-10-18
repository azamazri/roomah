# 🚀 BACKEND IMPLEMENTATION ROADMAP

## Phase 2 Progress: Database ✅ → Backend ⏳

---

## 📊 Overview

Backend implementation terbagi menjadi 3 bagian:

1. **Setup Utilities** (1-2 jam)
   - Supabase client utilities
   - Error handling & correlation IDs
   - Type definitions

2. **Implement Server Actions** (4-6 jam)
   - Auth flow
   - CV management
   - Candidate browsing
   - Taaruf workflow
   - Payment integration
   - Admin operations

3. **Integration & Testing** (3-4 jam)
   - Midtrans payment gateway
   - Sentry error tracking
   - Rate limiting
   - Test coverage

---

## ✅ PART 1: Setup Utilities (Start Here!)

### Step 1.1: Create Supabase Client Files

Create these 3 files in `lib/supabase/`:

**File: `lib/supabase/server.ts`** (for Server Actions)
```typescript
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
```

**File: `lib/supabase/service.ts`** (for privileged operations)
```typescript
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

**File: `lib/supabase/client.ts`** (for browser components)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function supabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Step 1.2: Create Error Handler

**File: `lib/utils/error-handler.ts`**
```typescript
import * as Sentry from '@sentry/nextjs';
import { v4 as uuidv4 } from 'uuid';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId: string;
}

export function generateCorrelationId(): string {
  return uuidv4();
}

export async function handleError(error: unknown, context: string) {
  const correlationId = generateCorrelationId();

  Sentry.captureException(error, {
    tags: {
      context,
      correlationId,
    },
  });

  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    correlationId,
  };
}
```

### Step 1.3: Create Type Definitions

**File: `types/api.ts`**
```typescript
// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId: string;
}

// Auth types
export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// CV types
export interface CreateCVInput {
  gender: 'IKHWAN' | 'AKHWAT';
  full_name: string;
  birth_date: string;
  province_id: number;
  education: 'SMA_SMK' | 'D3' | 'S1' | 'S2' | 'S3';
  occupation: string;
  income_bracket: 'SAAT_TAARUF' | '0_2' | '2_5' | '5_10' | '10_PLUS';
  height_cm: number;
  weight_kg: number;
  disease_history?: string;
}

// Taaruf types
export interface AjukanTaarufInput {
  to_user: string; // UUID
}

// Payment types
export interface CreateTopupInput {
  amount_cents: number; // Amount in sen (x100 of rupiah)
}
```

---

## ⏳ PART 2: Server Actions (Implementation)

### Step 2.1: Auth Server Actions

**File: `features/auth/server/actions.ts`**

Key actions to implement:
- `registerUser(input)` - Register baru
- `loginUser(input)` - Login
- `verifyOTP(otp)` - Verify email
- `logoutUser()` - Logout
- `getCurrentUser()` - Get session user
- `updatePassword(input)` - Update password

### Step 2.2: CV Server Actions

**File: `features/cv/server/actions.ts`**

Key actions:
- `getCVData()` - Get user's CV
- `createCVData(input)` - Create CV
- `updateCVData(input)` - Update CV
- `submitCVForReview()` - Submit CV untuk approval
- `getCVStatus()` - Get CV status

### Step 2.3: Candidates Server Actions

**File: `features/candidates/server/actions.ts`**

Key actions:
- `browseCandidates(filter)` - Get candidate listing
- `getCandidateDetail(candidateCode)` - Get detail
- `searchCandidates(query)` - Search candidates

### Step 2.4: Taaruf Server Actions

**File: `features/taaruf/server/actions.ts`**

Key actions:
- `ajukanTaaruf(input)` - Propose Taaruf
- `acceptTaaruf(requestId)` - Accept proposal
- `rejectTaaruf(requestId)` - Reject proposal
- `getTaarufSessions()` - Get active sessions
- `finishTaaruf(sessionId)` - Finish session

### Step 2.5: Payment Server Actions

**File: `features/payments/server/actions.ts`**

Key actions:
- `createTopupOrder(input)` - Create payment order
- `getWalletBalance()` - Get user balance
- `handleMidtransWebhook(payload)` - Webhook handler

### Step 2.6: Admin Server Actions

**File: `features/admin/server/actions.ts`**

Key actions:
- `approveCVData(userId)` - Approve CV
- `rejectCVData(userId, reason)` - Reject CV
- `banUser(userId)` - Ban user
- `getAuditLog()` - Get audit trail

---

## 🔌 PART 3: Integration

### Step 3.1: Midtrans SDK Setup

**File: `lib/midtrans/index.ts`**
```typescript
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
  grossAmount: string
): string {
  const crypto = require('crypto');
  const input = orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY!;
  return crypto.createHash('sha512').update(input).digest('hex');
}
```

### Step 3.2: Sentry Setup

**File: `lib/sentry/index.ts`**
```typescript
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### Step 3.3: Rate Limiting (Optional - can add later)

**File: `lib/rate-limit/index.ts`**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const taarufRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:taaruf',
});
```

---

## 📋 Implementation Sequence

**Day 1: Setup Utilities**
- [ ] Create Supabase client files (server.ts, service.ts, client.ts)
- [ ] Create error handler
- [ ] Create type definitions

**Day 2: Auth & Core Actions**
- [ ] Implement auth Server Actions
- [ ] Implement CV Server Actions
- [ ] Implement candidates Server Actions

**Day 3: Taaruf & Payments**
- [ ] Implement taaruf Server Actions
- [ ] Implement payment Server Actions
- [ ] Setup Midtrans integration

**Day 4: Admin & Integration**
- [ ] Implement admin Server Actions
- [ ] Setup Sentry
- [ ] Setup rate limiting (optional)
- [ ] Write unit tests

**Day 5: Testing & Verification**
- [ ] Integration testing
- [ ] E2E testing
- [ ] Performance testing
- [ ] Bug fixes & optimization

---

## 🎯 Success Criteria for Backend

✅ All Server Actions working  
✅ Supabase auth integration  
✅ Midtrans payment processing  
✅ Sentry error tracking  
✅ RLS policies enforcing security  
✅ Unit tests passing  
✅ Integration tests passing  
✅ E2E tests for critical flows  

---

## 📞 Next Steps

**Ready to start backend implementation?**

1. Create the 3 Supabase client files (lib/supabase/)
2. Create error handler (lib/utils/)
3. Create type definitions (types/)
4. Then start with auth Server Actions

**I can help you create these files now, or would you like to do it step-by-step?**

---

## 📚 Reference

- Supabase SSR: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- RLS: https://supabase.com/docs/guides/auth/row-level-security
