'use client';

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function PermissionGuard({ 
  children, 
  permission, 
  fallback 
}: PermissionGuardProps) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_permission', {
          user_id_param: user.id,
          permission_code_param: permission
        });

        if (error) {
          console.error('Error checking permission:', error);
          setHasPermission(false);
        } else {
          setHasPermission(data || false);
        }
      } catch (err) {
        console.error('Error checking permission:', err);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [user, permission]);

  if (loading) return null;
  if (!hasPermission) return <>{fallback || null}</>;

  return <>{children}</>;
}
