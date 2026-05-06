import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getSupabase, isSupabaseConnected } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'tenant' | 'owner' | 'admin' | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  avatar: string | null;
  phone: string | null;
  joinedAt: string;
  aadhaarLast4?: string;
  // Tenant-specific
  currentFlat?: string;
  landlordName?: string;
  leaseEnd?: string;
  dateOfBirth?: string;
  occupation?: string;
  emergencyContact?: string;
  moveInDate?: string;
  // Owner-specific
  totalProperties?: number;
  totalTenants?: number;
  ownedListings?: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string, role: 'tenant' | 'owner') => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: 'tenant' | 'owner') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: string | null }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function dbRoleToAppRole(role: string | null): UserRole {
  if (role === 'tenant') return 'tenant';
  if (role === 'owner' || role === 'landlord') return 'owner';
  if (role === 'admin') return 'admin';
  return null;
}

function appRoleToDbRole(role: 'tenant' | 'owner' | 'admin'): string {
  return role;
}

async function buildAuthUser(supabaseUser: User): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  if (error || !profile) {
    // Fallback when profile hasn't synced yet
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: dbRoleToAppRole(supabaseUser.user_metadata?.role) || 'tenant',
      verified: false,
      avatar: supabaseUser.user_metadata?.avatar_url || null,
      phone: supabaseUser.phone || null,
      joinedAt: new Date(supabaseUser.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  return {
    id: profile.id,
    name: profile.name || 'User',
    email: profile.email || '',
    role: dbRoleToAppRole(profile.role),
    verified: profile.verified_aadhaar || false,
    avatar: profile.avatar_url || null,
    phone: profile.phone || null,
    joinedAt: new Date(profile.created_at).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    }),
  };
}

// ── Context ────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Provider ─────────────────────────────────────────────────────────────

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (sessionUser: User | null) => {
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const authUser = await buildAuthUser(sessionUser);
    setUser(authUser);
    setLoading(false);
  }, []);

  // Session check + auth listener
  useEffect(() => {
    if (!isSupabaseConnected()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      refreshUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      refreshUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signIn = async (email: string, password: string, _role: 'tenant' | 'owner'): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase not connected' };
    if (!password) return { error: 'Password is required for email sign in' };

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (data.user) {
      const authUser = await buildAuthUser(data.user);
      setUser(authUser);
    }
    setLoading(false);
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'tenant' | 'owner'
  ): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase not connected' };
    if (!password) return { error: 'Password is required for email sign up' };

    setLoading(true);

    const dbRole = appRoleToDbRole(role);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: dbRole },
      },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (data.user) {
      const authUser = await buildAuthUser(data.user);
      setUser(authUser);
    }
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase || !user) return { error: 'Not authenticated' };

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.role !== undefined) dbUpdates.role = appRoleToDbRole(updates.role as 'tenant' | 'owner' | 'admin');

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('users').update(dbUpdates).eq('id', user.id);
      if (error) return { error: error.message };
    }

    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    return { error: null };
  };

  return { user, loading, signIn, signUp, signOut, updateProfile };
}