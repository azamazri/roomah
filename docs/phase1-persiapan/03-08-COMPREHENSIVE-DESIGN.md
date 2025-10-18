# DELIVERABLES 3-8: COMPREHENSIVE DESIGN
## Complete Backend Architecture, Integration, Security, Migration & Testing

---

# 3. DATABASE FUNCTIONS & TRIGGERS DESIGN

## Core Functions

### 1. **Sequence Generation Functions**

```sql
-- Generate candidate code (IKHWAN1, AKHWAT1, etc.)
CREATE OR REPLACE FUNCTION public.generate_candidate_code(p_gender gender_enum)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seq_key text;
  v_next_num bigint;
  v_code text;
BEGIN
  -- Determine sequence key
  v_seq_key := 'CANDIDATE_' || p_gender::text;
  
  -- Atomic increment
  UPDATE public.sequences
  SET last_number = last_number + 1,
      updated_at = now()
  WHERE seq_key = v_seq_key
  RETURNING last_number INTO v_next_num;
  
  -- Format code
  v_code := p_gender::text || v_next_num::text;
  
  RETURN v_code;
END;
$$;

-- Generate taaruf code (TAARUF1, TAARUF2, etc.)
CREATE OR REPLACE FUNCTION public.generate_taaruf_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_num bigint;
BEGIN
  UPDATE public.sequences
  SET last_number = last_number + 1,
      updated_at = now()
  WHERE seq_key = 'TAARUF'
  RETURNING last_number INTO v_next_num;
  
  RETURN 'TAARUF' || v_next_num::text;
END;
$$;
```

**Design Decisions:**
- Atomic increment via `SELECT FOR UPDATE` (race condition protection)
- SECURITY DEFINER untuk bypass RLS
- Returns formatted code untuk immediate use

---

### 2. **Timestamp Auto-Update Trigger**

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cv_data_updated_at
  BEFORE UPDATE ON public.cv_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... (apply to all relevant tables)
```

**Purpose:** Automatically update `updated_at` timestamp on every UPDATE operation.

---

### 3. **CV Approval Trigger (Candidate Code Generation)**

```sql
CREATE OR REPLACE FUNCTION public.on_cv_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only generate code when status changes to APPROVED
  IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
    -- Generate candidate code based on gender
    NEW.candidate_code := public.generate_candidate_code(NEW.gender);
    
    -- Refresh materialized view (enqueue job)
    PERFORM public.enqueue_mv_refresh('approved_candidates_v');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER cv_approval_trigger
  BEFORE UPDATE ON public.cv_data
  FOR EACH ROW
  WHEN (NEW.status = 'APPROVED')
  EXECUTE FUNCTION on_cv_approved();
```

**Workflow:**
1. Admin approves CV (status → APPROVED)
2. Trigger generates candidate code via sequence
3. MV refresh enqueued (event-driven)

---

### 4. **Taaruf Acceptance Trigger (Create Session)**

```sql
CREATE OR REPLACE FUNCTION public.on_taaruf_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_taaruf_code text;
BEGIN
  -- Only when status changes to ACCEPTED
  IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN
    -- Generate taaruf code
    v_taaruf_code := public.generate_taaruf_code();
    
    -- Create taaruf session
    INSERT INTO public.taaruf_sessions (user_a, user_b, taaruf_code, status)
    VALUES (NEW.from_user, NEW.to_user, v_taaruf_code, 'ACTIVE');
    
    -- Deduct koin from sender (via ledger)
    INSERT INTO public.wallet_ledger_entries (
      user_id, type, amount_cents, reason, idempotency_key
    ) VALUES (
      NEW.from_user,
      'DEBIT',
      500, -- 5 koin (tunable)
      'TAARUF_COST',
      'taaruf:' || NEW.id || ':DEBIT'
    )
    ON CONFLICT (idempotency_key) DO NOTHING; -- Idempotency
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER taaruf_acceptance_trigger
  AFTER UPDATE ON public.taaruf_requests
  FOR EACH ROW
  WHEN (NEW.status = 'ACCEPTED')
  EXECUTE FUNCTION on_taaruf_accepted();
```

**Workflow:**
1. Receiver accepts Taaruf request
2. Trigger creates active session with TAARUF code
3. Deduct koin from sender (idempotent ledger entry)

---

### 5. **Admin Action Audit Trigger**

```sql
CREATE OR REPLACE FUNCTION public.audit_cv_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log CV status changes by admin
  IF NEW.status != OLD.status THEN
    INSERT INTO public.admin_actions_audit (
      admin_id,
      action,
      target_table,
      target_id,
      details,
      correlation_id
    ) VALUES (
      NEW.last_reviewed_by,
      'CV_STATUS_CHANGE',
      'cv_data',
      NEW.user_id::text,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', now()
      ),
      current_setting('request.correlation_id', true)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER cv_admin_audit_trigger
  AFTER UPDATE ON public.cv_data
  FOR EACH ROW
  WHEN (NEW.status != OLD.status AND NEW.last_reviewed_by IS NOT NULL)
  EXECUTE FUNCTION audit_cv_admin_action();
```

**Purpose:** Automatic audit logging for admin CV approval/rejection actions.

---

### 6. **Materialized View Refresh Queue**

```sql
-- Queue table untuk MV refresh jobs
CREATE TABLE public.mv_refresh_queue (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  mv_name text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  enqueued_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error_message text
);

-- Enqueue function
CREATE OR REPLACE FUNCTION public.enqueue_mv_refresh(p_mv_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.mv_refresh_queue (mv_name, status)
  VALUES (p_mv_name, 'PENDING')
  ON CONFLICT DO NOTHING; -- Avoid duplicate jobs
END;
$$;

-- Process function (called by scheduled job or Netlify function)
CREATE OR REPLACE FUNCTION public.process_mv_refresh_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job RECORD;
BEGIN
  FOR v_job IN 
    SELECT * FROM public.mv_refresh_queue 
    WHERE status = 'PENDING' 
    ORDER BY enqueued_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      -- Mark as processing
      UPDATE public.mv_refresh_queue
      SET status = 'PROCESSING', processed_at = now()
      WHERE id = v_job.id;
      
      -- Refresh MV
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.' || v_job.mv_name;
      
      -- Mark as completed
      UPDATE public.mv_refresh_queue
      SET status = 'COMPLETED'
      WHERE id = v_job.id;
    EXCEPTION WHEN OTHERS THEN
      -- Log error
      UPDATE public.mv_refresh_queue
      SET status = 'FAILED', error_message = SQLERRM
      WHERE id = v_job.id;
    END;
  END LOOP;
END;
$$;
```

**Refresh Strategy:**
- Event-driven: Enqueue on CV approval
- Scheduled fallback: Cron job calls `process_mv_refresh_queue()` every 5 minutes
- Handles failures gracefully (retry or manual intervention)

---

## Cleanup Functions

### 7. **Expired Taaruf Requests Cleanup**

```sql
CREATE OR REPLACE FUNCTION public.cleanup_expired_taaruf_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.taaruf_requests
  SET status = 'EXPIRED', decided_at = now()
  WHERE status = 'PENDING'
    AND expires_at < now();
END;
$$;

-- Schedule via pg_cron (if available) or Netlify Functions
-- SELECT cron.schedule('cleanup-expired-taaruf', '*/30 * * * *', 'SELECT public.cleanup_expired_taaruf_requests()');
```

**Schedule:** Every 30 minutes untuk mark expired requests.

---

# 4. BACKEND ARCHITECTURE DESIGN

## Server Actions Structure (Mutations)

### File Organization (Feature-based)

```
features/
├── auth/
│   └── server/
│       └── actions.ts
│         - registerUser(data): Register via Google OAuth + nonce
│         - loginUser(data): Login existing users
│         - submitOnboarding5Q(data): Submit 5Q verification
│         - submitOnboardingCV(data): Submit CV (optional)
│         - completeOnboarding(): Mark onboarding complete
│
├── cv/
│   └── server/
│       └── actions.ts
│         - createOrUpdateCV(data): UPSERT CV data
│         - updateCVVisibility(allow_public): Toggle public visibility
│         - getMyCV(): Fetch own CV for editing
│
├── candidates/
│   └── server/
│       └── actions.ts
│         - ajukanTaaruf(to_user_id): Submit Taaruf request (with guards)
│
├── taaruf/
│   └── server/
│       └── actions.ts
│         - respondToTaaruf(request_id, status, reason?): Accept/reject
│         - finishTaarufSession(session_id): Mark session as finished
│
├── payments/
│   └── server/
│       └── actions.ts
│         - createPaymentOrder(amount_cents): Create Midtrans order
│         - getBalance(): Fetch current koin balance
│
└── admin/
    └── server/
        └── actions.ts
          - approveCV(user_id, notes?): Approve CV → generate code
          - rejectCV(user_id, reason): Reject CV → notify user
          - banUser(user_id, reason): Ban/suspend user
```

### Example Server Action Implementation

```typescript
// features/cv/server/actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { supabaseAction } from '@/lib/supabase/server';
import { cvSchema } from '../schemas/cv';

export async function createOrUpdateCV(data: z.infer<typeof cvSchema>) {
  // 1. Validate input
  const validated = cvSchema.parse(data);
  
  // 2. Get authenticated user
  const supabase = await supabaseAction();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }
  
  // 3. Normalize text (Capitalize Each Word)
  const normalized = {
    ...validated,
    full_name: capitalizeEachWord(validated.full_name),
    occupation: capitalizeEachWord(validated.occupation),
    // ... other fields
  };
  
  // 4. UPSERT CV data
  const { error } = await supabase
    .from('cv_data')
    .upsert({
      user_id: user.id,
      ...normalized,
      status: 'REVIEW', // Submit for review
    });
  
  if (error) {
    return { error: error.message };
  }
  
  // 5. Revalidate cache
  revalidateTag('my-cv');
  
  return { success: true };
}

function capitalizeEachWord(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

**Pattern:**
- ✅ Input validation with Zod
- ✅ Auth check via Supabase
- ✅ Business logic (normalization)
- ✅ Database operation
- ✅ Cache invalidation
- ✅ Error handling with correlation ID

---

## Data Queries Structure (Reads)

### RSC Data Fetching

```typescript
// features/candidates/server/queries.ts
import { supabaseServer } from '@/lib/supabase/server';

export async function getApprovedCandidates(filters: CandidateFilters) {
  const supabase = await supabaseServer();
  
  // 1. Base query
  let query = supabase
    .from('approved_candidates_v')
    .select('*');
  
  // 2. Apply filters
  if (filters.gender) {
    query = query.eq('gender_label', filters.gender);
  }
  
  if (filters.min_age && filters.max_age) {
    query = query.gte('age', filters.min_age).lte('age', filters.max_age);
  }
  
  if (filters.province) {
    query = query.eq('province', filters.province);
  }
  
  if (filters.education) {
    query = query.eq('education', filters.education);
  }
  
  // 3. Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 6;
  const offset = (page - 1) * limit;
  
  query = query.range(offset, offset + limit - 1);
  
  // 4. Execute
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return {
    candidates: data || [],
    total: count || 0,
    page,
    limit,
  };
}
```

### TanStack Query Integration

```typescript
// features/candidates/hooks/use-candidates.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getCandidatesAction } from '../server/actions';

export function useCandidates(filters: CandidateFilters) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => getCandidatesAction(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## API Routes Design

### 1. **Midtrans Webhook** (`app/api/webhooks/midtrans/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { supabaseService } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse payload
    const payload = await request.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = payload;
    
    // 2. Verify signature
    const isValid = verifyMidtransSignature({
      order_id,
      status_code,
      gross_amount,
      signature_key,
    });
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // 3. Rate limiting check (multi-layer)
    await checkWebhookRateLimit(request);
    
    // 4. Update order status
    const supabase = supabaseService(); // Service role
    await supabase
      .from('koin_topup_orders')
      .update({
        status: mapMidtransStatus(transaction_status),
        raw_midtrans: payload,
        updated_at: new Date().toISOString(),
        settled_at: transaction_status === 'settlement' ? new Date().toISOString() : null,
      })
      .eq('order_id', order_id);
    
    // 5. Create ledger entry (idempotent)
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const order = await getOrder(order_id);
      
      await supabase
        .from('wallet_ledger_entries')
        .insert({
          user_id: order.user_id,
          type: 'CREDIT',
          amount_cents: order.amount_cents,
          reason: 'TOPUP',
          linked_order_id: order_id,
          idempotency_key: `order:${order_id}:CREDIT`,
        })
        .onConflict('idempotency_key')
        .ignore(); // Idempotency
    }
    
    // 6. Revalidate balance cache
    revalidateTag(`balance-${order.user_id}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function mapMidtransStatus(status: string): string {
  const mapping = {
    'capture': 'SETTLEMENT',
    'settlement': 'SETTLEMENT',
    'pending': 'PENDING',
    'deny': 'CANCEL',
    'cancel': 'CANCEL',
    'expire': 'EXPIRE',
    'refund': 'REFUND',
    'chargeback': 'CHARGEBACK',
  };
  return mapping[status] || 'PENDING';
}
```

**Security Layers:**
- ✅ Signature verification (SHA512)
- ✅ Multi-layer rate limiting (global/IP/order)
- ✅ Idempotency via unique constraint
- ✅ Service role for privileged operations

---

### 2. **OAuth Callback** (`app/api/auth/callback/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAction } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (code) {
    const supabase = await supabaseAction();
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Redirect to appropriate page (onboarding or dashboard)
  return NextResponse.redirect(new URL('/onboarding/verifikasi', request.url));
}
```

---

# 5. INTEGRATION POINTS MAPPING

## Supabase Integration

### Auth Configuration

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseAction() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}

export function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

### Storage Buckets Setup

```sql
-- Avatars bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false);

-- RLS policy untuk avatars
CREATE POLICY "avatar_upload_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatar_view_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Realtime Subscriptions

```typescript
// features/notifications/hooks/use-notifications.ts
'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const supabase = supabaseBrowser();
    
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'taaruf_requests',
          filter: `to_user=eq.${userId}`,
        },
        (payload) => {
          // Handle new Taaruf request
          setNotifications(prev => [...prev, payload.new]);
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [userId]);
  
  return notifications;
}
```

---

## External Services Integration

### Midtrans Payment Gateway

```typescript
// lib/midtrans.ts
import crypto from 'crypto';

export function verifyMidtransSignature(params: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}) {
  const serverKey = process.env.MIDTRANS_IS_PROD === 'true'
    ? process.env.MIDTRANS_SERVER_KEY_PROD
    : process.env.MIDTRANS_SERVER_KEY;
  
  if (!serverKey) return false;
  
  const raw = params.order_id + params.status_code + params.gross_amount + serverKey;
  const hash = crypto.createHash('sha512').update(raw).digest('hex');
  
  return hash === params.signature_key;
}

export async function createSnapTransaction(order: {
  order_id: string;
  amount: number;
  customer: { email: string; name: string };
}) {
  const snap = new midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PROD === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });
  
  const parameter = {
    transaction_details: {
      order_id: order.order_id,
      gross_amount: order.amount,
    },
    customer_details: order.customer,
  };
  
  const transaction = await snap.createTransaction(parameter);
  return transaction.token; // Snap token
}
```

### Sentry Error Tracking

```typescript
// lib/observability/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (!process.env.SENTRY_DSN) return;
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // PII-safe logging (strip sensitive data)
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.Authorization;
      }
      return event;
    },
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    tags: {
      correlation_id: context?.correlation_id,
    },
    extra: context,
  });
}
```

---

## Frontend ↔ Backend Integration Contract

### API Response Format

```typescript
// Unified response type
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; correlation_id?: string };

// Example usage
export async function ajukanTaaruf(to_user_id: string): Promise<ApiResponse<{ request_id: string }>> {
  try {
    // ... business logic
    return { success: true, data: { request_id: '123' } };
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to submit ta\'aruf request',
      correlation_id: getCorrelationId(),
    };
  }
}
```

### Error Response Handling

```typescript
// Client-side error handling
import { toast } from 'sonner';

async function handleAjukanTaaruf(userId: string) {
  const result = await ajukanTaaruf(userId);
  
  if (!result.success) {
    toast.error(result.error, {
      description: result.correlation_id 
        ? `Request ID: ${result.correlation_id}` 
        : undefined,
    });
    return;
  }
  
  toast.success('Ta\'aruf request sent successfully!');
}
```

---

# 6. SECURITY & COMPLIANCE CHECKLIST

## Rate Limiting Strategy

### Multi-Layer Implementation

```typescript
// lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Layer 1: Global rate limiting
export const globalRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests/min globally
  analytics: true,
});

// Layer 2: Per-IP rate limiting
export const ipRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests/min per IP
});

// Layer 3: Per-user rate limiting
export const userRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests/min per user
});

// Layer 4: Action-specific rate limiting
export const taarufRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(3, '1 h'), // 3 Taaruf requests per hour
});
```

### CAPTCHA Implementation

```typescript
// lib/security/captcha.ts
export async function checkProgressiveCaptcha(userId: string, failCount: number) {
  // Progressive CAPTCHA after failed attempts
  if (failCount >= 3) {
    return { required: true, provider: 'hcaptcha' };
  }
  
  return { required: false };
}
```

---

## Data Privacy & Compliance

### Field Exposure Matrix Implementation

```typescript
// lib/security/field-exposure.ts
export function sanitizeProfile(profile: Profile, viewer: 'guest' | 'owner' | 'admin' | 'taaruf_partner') {
  if (viewer === 'guest') {
    // Public listing fields only
    return {
      candidate_code: profile.candidate_code,
      gender: profile.gender,
      age: calculateAge(profile.birth_date),
      province: profile.province,
      education: profile.education,
      occupation: profile.occupation,
      income_bracket: profile.income_bracket,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
    };
  }
  
  if (viewer === 'taaruf_partner') {
    // After Taaruf accepted, reveal more
    return {
      ...sanitizeProfile(profile, 'guest'),
      full_name: profile.full_name,
      birth_date: profile.birth_date,
      // ... (progressive disclosure)
    };
  }
  
  if (viewer === 'owner' || viewer === 'admin') {
    // Full profile
    return profile;
  }
  
  return {};
}
```

### Cookie Consent

```typescript
// components/cookie-consent.tsx
'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [consent, setConsent] = useState<'necessary' | 'analytics' | 'all' | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored) setConsent(stored as any);
  }, []);
  
  const handleConsent = (level: typeof consent) => {
    setConsent(level);
    localStorage.setItem('cookie-consent', level!);
    
    // Initialize analytics if consented
    if (level === 'analytics' || level === 'all') {
      initializeGA4();
    }
  };
  
  if (consent) return null;
  
  return (
    <div className="cookie-consent">
      {/* Cookie consent UI */}
    </div>
  );
}
```

---

# 7. MIGRATION STRATEGY

## Migration Script Structure

```
supabase/migrations/
├── 20241201_01_create_enums.sql
├── 20241201_02_create_core_tables.sql
├── 20241201_03_create_cv_tables.sql
├── 20241201_04_create_taaruf_tables.sql
├── 20241201_05_create_wallet_tables.sql
├── 20241201_06_create_audit_tables.sql
├── 20241201_07_create_indexes.sql
├── 20241201_08_create_triggers.sql
├── 20241201_09_create_views.sql
├── 20241201_10_seed_provinces.sql
├── 20241201_11_enable_rls.sql
├── 20241201_12_create_helper_functions.sql
├── 20241201_13_create_rls_policies_profiles.sql
├── 20241201_14_create_rls_policies_cv.sql
├── 20241201_15_create_rls_policies_taaruf.sql
├── 20241201_16_create_rls_policies_wallet.sql
├── 20241201_17_create_rls_policies_misc.sql
└── 20241201_18_test_rls_policies.sql
```

### Rollback Plan

```sql
-- Each migration has corresponding DOWN migration
-- Example: 20241201_01_create_enums_down.sql

DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS ledger_reason CASCADE;
DROP TYPE IF EXISTS ledger_type CASCADE;
DROP TYPE IF EXISTS taaruf_session_status CASCADE;
DROP TYPE IF EXISTS taaruf_request_status CASCADE;
DROP TYPE IF EXISTS cv_status_enum CASCADE;
DROP TYPE IF EXISTS education_enum CASCADE;
DROP TYPE IF EXISTS income_bracket_enum CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
```

### Testing Checklist Before Production

```bash
# 1. Schema validation
npm run db:validate

# 2. RLS policies testing
npm run test:rls

# 3. Performance testing
npm run test:performance

# 4. Smoke tests
npm run test:smoke

# 5. Backup before apply
supabase db dump -f backup_pre_migration.sql

# 6. Apply migration
supabase db push

# 7. Verify success
npm run test:integration
```

---

# 8. TESTING & VALIDATION PLAN

## Database Testing

### Schema Validation

```typescript
// tests/database/schema.test.ts
describe('Database Schema', () => {
  test('All tables exist', async () => {
    const tables = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    expect(tables).toContain('profiles');
    expect(tables).toContain('cv_data');
    expect(tables).toContain('taaruf_requests');
    // ...
  });
  
  test('Foreign keys are valid', async () => {
    // Test FK constraints
  });
  
  test('Indexes exist', async () => {
    // Test critical indexes
  });
});
```

### RLS Policies Testing

```typescript
// tests/database/rls.test.ts
describe('RLS Policies', () => {
  test('Guest cannot access profiles', async () => {
    const supabase = createClient({ role: 'anon' });
    const { data } = await supabase.from('profiles').select('*');
    expect(data).toHaveLength(0);
  });
  
  test('User can only view own profile', async () => {
    const supabase = createClient({ userId: 'user-123' });
    const { data } = await supabase.from('profiles').select('*');
    expect(data).toHaveLength(1);
    expect(data[0].user_id).toBe('user-123');
  });
  
  test('Admin can view all profiles', async () => {
    const supabase = createClient({ userId: 'admin-123', isAdmin: true });
    const { data } = await supabase.from('profiles').select('*');
    expect(data.length).toBeGreaterThan(1);
  });
});
```

---

## Backend Testing

### Server Actions Testing

```typescript
// tests/server/actions/taaruf.test.ts
describe('Ta\'aruf Actions', () => {
  test('ajukanTaaruf succeeds with valid prerequisites', async () => {
    // Setup: User with approved CV, sufficient koin, no active taaruf
    const result = await ajukanTaaruf('target-user-id');
    expect(result.success).toBe(true);
  });
  
  test('ajukanTaaruf fails with insufficient koin', async () => {
    // Setup: User with 0 koin
    const result = await ajukanTaaruf('target-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toContain('insufficient');
  });
  
  test('ajukanTaaruf fails with unapproved CV', async () => {
    // Setup: User with CV status=DRAFT
    const result = await ajukanTaaruf('target-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toContain('CV');
  });
  
  test('ajukanTaaruf fails with active taaruf', async () => {
    // Setup: User already has active taaruf session
    const result = await ajukanTaaruf('target-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toContain('active');
  });
});
```

---

## E2E Testing

### Critical User Flows

```typescript
// e2e/onboarding.spec.ts
test('Complete onboarding flow', async ({ page }) => {
  // 1. Register
  await page.goto('/register');
  await page.click('button:has-text("Sign in with Google")');
  // ... OAuth flow
  
  // 2. 5Q Verification
  await page.goto('/onboarding/verifikasi');
  await page.click('input[name="q1"][value="true"]');
  await page.click('input[name="q2"][value="true"]');
  await page.click('input[name="q3"][value="true"]');
  await page.click('input[name="q4"][value="true"]');
  await page.click('input[name="q5"][value="true"]');
  await page.click('button:has-text("Lanjut")');
  
  // 3. CV (optional)
  await page.goto('/onboarding/cv');
  await page.click('button:has-text("Lewati")');
  
  // 4. Selesai
  await page.goto('/onboarding/selesai');
  await page.click('button:has-text("Selesai")');
  
  // Verify redirect to /cv-saya
  await expect(page).toHaveURL('/cv-saya');
});

test('Ta\'aruf end-to-end flow', async ({ page }) => {
  // 1. Browse candidates
  await page.goto('/cari-jodoh');
  await expect(page.locator('.candidate-card')).toHaveCount(6);
  
  // 2. Click ajukan taaruf
  await page.click('.candidate-card:first-child button:has-text("Ajukan")');
  
  // 3. Verify appears in CV Dikirim
  await page.goto('/riwayat-taaruf?tab=dikirim');
  await expect(page.locator('.request-item')).toHaveCount(1);
  await expect(page.locator('.request-status')).toHaveText('Menunggu Persetujuan');
  
  // 4. Receiver accepts (simulate)
  // ... (switch to receiver account)
  await page.goto('/riwayat-taaruf?tab=masuk');
  await page.click('button:has-text("Terima")');
  
  // 5. Verify taaruf active
  await page.goto('/riwayat-taaruf?tab=aktif');
  await expect(page.locator('.taaruf-code')).toContainText('TAARUF');
});
```

---

## Performance Testing

```typescript
// tests/performance/candidate-listing.test.ts
test('Candidate listing loads in <500ms', async () => {
  const start = performance.now();
  
  const response = await fetch('/api/candidates?limit=6');
  const data = await response.json();
  
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(500);
  expect(data.candidates).toHaveLength(6);
});
```

---

## Success Criteria Summary

✅ **Database:**
- All tables created with proper constraints
- RLS policies deny unauthorized access
- Indexes improve query performance (<100ms for listing)
- MV refreshes within acceptable timeframe (<1min)

✅ **Backend:**
- Server Actions validate input with Zod
- Business guards prevent invalid operations
- Idempotency prevents duplicate transactions
- Error responses include correlation IDs

✅ **Integration:**
- Midtrans webhook handles all payment statuses
- Google OAuth works dengan nonce handling
- Supabase Storage RLS protects avatars
- Realtime subscriptions deliver notifications

✅ **Security:**
- Rate limiting prevents abuse
- CAPTCHA triggers after failures
- Field exposure matrix enforced
- Audit trail captures admin actions

✅ **Testing:**
- RLS policies tested per role
- E2E tests cover critical flows
- Performance benchmarks met
- Load testing validates free tier limits

---

**END OF PHASE 1: PERSIAPAN**

All 8 deliverables completed. Ready for **Phase 2: IMPLEMENTATION**.
