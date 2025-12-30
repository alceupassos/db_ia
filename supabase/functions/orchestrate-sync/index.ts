import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
    try {
        const { query_name } = await req.json();

        if (!query_name) {
            return new Response(JSON.stringify({ error: 'Missing query_name' }), { status: 400 });
        }

        // Insert a new job into the sync_jobs table
        const { data, error } = await supabase
            .from('sync_jobs')
            .insert({ query_name, status: 'pending' })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ message: 'Job dispatched', job_id: data.id }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
