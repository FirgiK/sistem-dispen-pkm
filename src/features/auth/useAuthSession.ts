import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { AuthProfile, PermissionId } from '../../types/auth';

interface AccessData {
  profile: AuthProfile | null;
  roles: string[];
  permissions: Set<string>;
}

const EMPTY_ACCESS: AccessData = {
  profile: null,
  roles: [],
  permissions: new Set(),
};

function mapAuthErrorMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email atau kata sandi salah.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email akun belum dikonfirmasi.';
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Gagal terhubung ke server autentikasi. Periksa koneksi internet.';
  }
  return 'Gagal masuk ke dashboard. Silakan coba lagi.';
}

async function fetchUserAccess(authUser: User): Promise<AccessData> {
  if (!supabase) return EMPTY_ACCESS;

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_active')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError || !profileRow) {
    return EMPTY_ACCESS;
  }

  const profile: AuthProfile = {
    id: profileRow.id,
    email: profileRow.email,
    fullName: profileRow.full_name || profileRow.email,
    isActive: Boolean(profileRow.is_active),
  };

  if (!profile.isActive) {
    return { profile, roles: [], permissions: new Set() };
  }

  const { data: userRoleRows, error: rolesError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', authUser.id);

  if (rolesError || !userRoleRows || userRoleRows.length === 0) {
    return { profile, roles: [], permissions: new Set() };
  }

  const roleIds = userRoleRows.map((row) => row.role_id as string);

  const { data: permRows, error: permError } = await supabase
    .from('role_permissions')
    .select('permission')
    .in('role_id', roleIds);

  if (permError || !permRows) {
    return { profile, roles: roleIds, permissions: new Set() };
  }

  const permissions = new Set(permRows.map((row) => row.permission as string));
  return { profile, roles: roleIds, permissions };
}

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessData>(EMPTY_ACCESS);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;

    async function loadInitialSession() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          setAuthError('Gagal memeriksa sesi login.');
          setUser(null);
          setAccess(EMPTY_ACCESS);
          return;
        }

        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const nextAccess = await fetchUserAccess(sessionUser);
          if (isMounted) setAccess(nextAccess);
        } else {
          setAccess(EMPTY_ACCESS);
        }
      } catch {
        if (isMounted) {
          setAuthError('Gagal memeriksa sesi login.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const nextAccess = await fetchUserAccess(sessionUser);
          if (isMounted) setAccess(nextAccess);
        } else {
          setAccess(EMPTY_ACCESS);
        }
        if (isMounted) setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Konfigurasi Supabase belum tersedia.' };
    }

    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const friendly = mapAuthErrorMessage(error.message);
      setAuthError(friendly);
      return { error: friendly };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setAccess(EMPTY_ACCESS);
    setAuthError(null);
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionId): boolean => access.permissions.has(permission),
    [access.permissions],
  );

  return {
    isSupabaseConfigured,
    user,
    profile: access.profile,
    roles: access.roles,
    permissions: access.permissions,
    hasPermission,
    isLoading,
    authError,
    signIn,
    signOut,
  };
}
