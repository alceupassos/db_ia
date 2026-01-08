// import { createClient } from '@supabase/supabase-js'; // Not used
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Supabase client not used in this script - SQL must be run manually
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
// );

async function runMigration() {
    console.log('📝 Starting Unified Migration...');

    const sql = `
    -- 1. Table for AI Knowledge Base
    CREATE TABLE IF NOT EXISTS ai_known_queries (
        name TEXT PRIMARY KEY,
        filename TEXT,
        raw_sql TEXT NOT NULL,
        explanation TEXT,
        business_domain TEXT,
        suggested_schema JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Table for Sync Jobs orchestration
    CREATE TABLE IF NOT EXISTS sync_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query_name TEXT NOT NULL REFERENCES ai_known_queries(name),
        status TEXT NOT NULL DEFAULT 'pending', -- pending, running, success, failed
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Enable Realtime for sync_jobs
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'sync_jobs'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE sync_jobs;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add to publication. Ensure you have permissions or the publication exists.';
    END $$;
    `;

    console.log('⚠️ Please execute the following SQL in your Supabase Dashboard SQL Editor (Supabase JS does not support raw DDL by default):');
    console.log('------------------------------------------------------------');
    console.log(sql);
    console.log('------------------------------------------------------------');
    console.log('\n💡 After running the SQL above, you can proceed to run:');
    console.log('1. node scripts/ingest-knowledge.mjs  (to populate the AI knowledge)');
    console.log('2. cd infra/bridge && node index.js   (to start the listener)');
}

runMigration();
