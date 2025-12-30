# CEPALAB OS - Environment Setup

To run this system, you need to configure the following environment variables:

## Frontend (.env.local)

```bash
GOOGLE_API_KEY=AIzaSyA3lhjHSOniR1YuZhebxsLFIovlfErKWPQ
NEXT_PUBLIC_SUPABASE_URL=https://uoqzxsfdxlqpbujsklfn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_N0YPhbqwlL5X8CoXHfSEHw_xFEpqPGa

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcXp4c2ZkeGxxcGJ1anNrbGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NDMxNSwiZXhwIjoyMDgyMzYwMzE1fQ.7CJL8Zkzijib2uyBPYsdXzJXIdG3WgW3DpnquRUtYUI
```

## Infrastructure (infra/.env)

```bash
VPN_USER=alceu
VPN_PASS=abc123..
MSSQL_HOST=104.234.224.238
MSSQL_PORT=1445
MSSQL_USER=angrax
MSSQL_PASS=G8f!qP2m#R7sVd1x
MSSQL_DATABASE=sgc
SUPABASE_URL=https://supabase.angra.io
SUPABASE_KEY=your_service_role_key
```
