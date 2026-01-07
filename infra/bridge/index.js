import sql from 'mssql';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });
dotenv.config(); // Fallback to local .env

const mssqlConfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASS,
    server: process.env.MSSQL_HOST || process.env.MSSQL_SERVER,
    port: parseInt(process.env.MSSQL_PORT || '1445'),
    database: process.env.MSSQL_DATABASE,
    options: {
        encrypt: process.env.MSSQL_ENCRYPT === 'true',
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Cepalab Bridge Active - Listening for Sync Jobs...');

// Listen for new sync jobs
supabase
    .channel('sync_jobs_channel')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sync_jobs',
        filter: 'status=eq.pending'
    }, async (payload) => {
        const job = payload.new;
        console.log(`[JOB] Received job ${job.id} for query: ${job.query_name}`);
        await executeJob(job);
    })
    .subscribe();

async function executeJob(job) {
    let pool;
    try {
        // 1. Update status to running
        await supabase
            .from('sync_jobs')
            .update({ status: 'running', updated_at: new Date() })
            .eq('id', job.id);

        // 2. Get the raw SQL from the knowledge base
        const { data: qData, error: qError } = await supabase
            .from('ai_known_queries')
            .select('raw_sql, name')
            .eq('name', job.query_name)
            .single();

        if (qError || !qData) throw new Error(`Query ${job.query_name} not found in knowledge base`);

        // 3. Connect to MSSQL and execute
        pool = await sql.connect(mssqlConfig);
        console.log(`[SQL] Executing ${job.query_name}...`);
        const result = await pool.request().query(qData.raw_sql);

        if (result.recordset && result.recordset.length > 0) {
            console.log(`[DATA] Fetched ${result.recordset.length} rows.`);

            // 4. Determine target table (convention: dump_name)
            const targetTable = `dump_${job.query_name.toLowerCase()}`;

            // Upsert into Supabase (Assume the table exists)
            const { error: uError } = await supabase
                .from(targetTable)
                .upsert(result.recordset);

            if (uError) throw uError;
        }

        // 5. Update job to success
        await supabase
            .from('sync_jobs')
            .update({ status: 'success', updated_at: new Date() })
            .eq('id', job.id);

        console.log(`✅ Job ${job.id} completed successfully.`);

    } catch (err) {
        console.error(`❌ Job ${job.id} failed:`, err.message);
        await supabase
            .from('sync_jobs')
            .update({
                status: 'failed',
                error_message: err.message,
                updated_at: new Date()
            })
            .eq('id', job.id);
    } finally {
        if (pool) await pool.close();
    }
}
