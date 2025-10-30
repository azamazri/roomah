-- Diagnostic SQL: Check taaruf_sessions id column identity status
-- Run this first to understand the current state

-- Check 1: Basic column information
SELECT 
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable,
  is_identity,
  identity_generation,
  identity_start,
  identity_increment
FROM information_schema.columns
WHERE table_name = 'taaruf_sessions' AND column_name = 'id';

-- Check 2: Look for associated sequences
SELECT 
  schemaname,
  sequencename,
  last_value,
  start_value,
  increment_by,
  max_value,
  min_value,
  cache_size,
  cycle
FROM pg_sequences
WHERE sequencename LIKE '%taaruf_sessions%';

-- Check 3: Check current data in table
SELECT 
  COUNT(*) as total_records,
  MAX(id) as max_id,
  MIN(id) as min_id
FROM taaruf_sessions;

-- Check 4: Test if we can insert without specifying id
-- This will fail if identity is not working
-- Uncomment to test (will create dummy record):
/*
INSERT INTO taaruf_sessions (user_a, user_b, taaruf_code, status)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'TEST-001',
  'ACTIVE'
)
RETURNING id, taaruf_code;
*/
