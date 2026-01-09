-- ============================================
-- FORMS TABLE SCHEMA FOR SUPABASE
-- ============================================
-- This script creates the forms table with JSONB storage
-- for flexible form schemas and optimistic locking support.
-- 
-- Run this in your Supabase SQL Editor to set up the database.
-- ============================================

-- Create forms table with JSONB for flexible schema storage
CREATE TABLE forms (
  -- Primary identifier (auto-generated UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Human-readable form name
  name TEXT NOT NULL,
  
  -- Full form schema stored as JSONB
  -- WHY JSONB?
  -- 1. Flexible schema - forms can evolve without migrations
  -- 2. Queryable - can search within JSON using PostgreSQL operators
  -- 3. Validated - invalid JSON rejected at database level
  -- 4. Indexed - GIN indexes enable fast JSON queries
  -- 5. Binary storage - more efficient than text JSON
  schema JSONB NOT NULL,
  
  -- Version number for optimistic locking (prevents concurrent edit conflicts)
  version INTEGER DEFAULT 1 NOT NULL,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Optional: constraint to ensure schema is valid JSON object
  CONSTRAINT valid_schema CHECK (jsonb_typeof(schema) = 'object')
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for sorting by most recently updated
CREATE INDEX idx_forms_updated_at ON forms(updated_at DESC);

-- Optional: GIN index for querying within JSONB schema
-- Uncomment if you need to search for specific fields/types within schemas
-- CREATE INDEX idx_forms_schema_gin ON forms USING GIN (schema);

-- ============================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Increment version on update for optimistic locking
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at and version
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Currently disabled for simplicity (no auth required)
-- To enable auth later, uncomment these:

-- Enable RLS
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (for public forms)
-- CREATE POLICY "Allow anonymous read access" ON forms
--   FOR SELECT
--   TO anon
--   USING (true);

-- Allow anonymous write access (for saving forms without auth)
-- CREATE POLICY "Allow anonymous write access" ON forms
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- Allow anonymous update access
-- CREATE POLICY "Allow anonymous update access" ON forms
--   FOR UPDATE
--   TO anon
--   USING (true);

-- ============================================
-- SAMPLE QUERY EXAMPLES
-- ============================================

-- List all forms (metadata only)
-- SELECT id, name, updated_at FROM forms ORDER BY updated_at DESC;

-- Get single form with full schema
-- SELECT * FROM forms WHERE id = 'your-uuid-here';

-- Search for forms containing specific field types
-- SELECT name FROM forms WHERE schema @> '{"fields": [{"type": "email"}]}';

-- Count total forms
-- SELECT COUNT(*) FROM forms;
