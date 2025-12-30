-- Create Knowledge Base for AI Queries
CREATE TABLE IF NOT EXISTS ai_known_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    raw_sql TEXT NOT NULL,
    explanation TEXT,
    suggested_schema JSONB,
    business_domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_known_queries ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (and service role)
CREATE POLICY "Allow read for everyone" ON ai_known_queries FOR SELECT USING (true);
