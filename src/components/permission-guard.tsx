'use client';

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

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
