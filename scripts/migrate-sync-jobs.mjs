
async function runMigration() {
    console.log('📝 Running Migration: sync_jobs...');

    const sql = `
    CREATE TABLE IF NOT EXISTS sync_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query_name TEXT NOT NULL REFERENCES ai_known_queries(name),
        status TEXT NOT NULL DEFAULT 'pending',
        result_data JSONB,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable Realtime
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
    END $$;
  `;

    // Note: Supabase JS client doesn't have a direct 'query' method for raw SQL
    // unless we use a custom RPC or the SQL API is enabled. 
    // However, for this blueprint, we assume the user might have to run it in the dashboard 
    // OR we use the 'postgres' package if available.

    console.log('⚠️ Please execute the following SQL in your Supabase Dashboard SQL Editor:');
    console.log(sql);
}

runMigration();
