-- Fix taaruf_sessions id column - Handle IDENTITY column
-- Run this in Supabase SQL Editor

-- The column is already an IDENTITY column, so we need to check if it's configured correctly

-- Step 1: Check current identity status
SELECT 
  table_name,
  column_name,
  data_type,
  column_default,
  is_identity,
  identity_generation
FROM information_schema.columns
WHERE table_name = 'taaruf_sessions' AND column_name = 'id';

-- Step 2: If identity_generation is NULL or not 'ALWAYS', we need to add IDENTITY
-- If column is IDENTITY but not generating, we may need to drop and recreate

-- OPTION A: If column is NOT identity, add it as GENERATED ALWAYS AS IDENTITY
-- Uncomment and run if needed:
-- ALTER TABLE taaruf_sessions 
-- ALTER COLUMN id DROP DEFAULT,
-- ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;

-- OPTION B: If column is already IDENTITY but somehow broken, restart it
-- Get the current max id and restart sequence
DO $$
DECLARE
    max_id bigint;
BEGIN
    -- Get current max id
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM taaruf_sessions;
    
    -- Restart identity sequence to max_id + 1
    -- This uses the underlying sequence for IDENTITY column
    EXECUTE format('ALTER TABLE taaruf_sessions ALTER COLUMN id RESTART WITH %s', max_id + 1);
END $$;

-- Step 3: Verify the fix
SELECT 
  table_name,
  column_name,
  data_type,
  column_default,
  is_identity,
  identity_generation
FROM information_schema.columns
WHERE table_name = 'taaruf_sessions' AND column_name = 'id';
