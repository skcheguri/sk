import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConnected } from '@/lib/supabase';

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  property_id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  images: string[];
  landlord_notes: string | null;
  unit: string | null;
  preferred_time: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateMaintenanceRequestInput {
  tenant_id: string;
  property_id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  unit?: string;
  preferred_time?: string;
}

export function useMaintenanceRequests(tenantId: string | undefined) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!isSupabaseConnected() || !tenantId) {
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: dbError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(dbError.message);
      setRequests([]);
    } else {
      setRequests((data as MaintenanceRequest[]) ?? []);
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const refresh = fetchRequests;

  return { requests, loading, error, refresh };
}

export function useCreateMaintenanceRequest() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    input: CreateMaintenanceRequestInput
  ): Promise<{ data: MaintenanceRequest | null; error: string | null }> => {
    if (!isSupabaseConnected()) {
      return { data: null, error: 'Supabase not connected' };
    }
    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: 'Supabase not connected' };
    }

    setCreating(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('maintenance_requests')
      .insert({
        tenant_id: input.tenant_id,
        property_id: input.property_id,
        category: input.category,
        title: input.title,
        description: input.description,
        priority: input.priority,
        unit: input.unit || null,
        preferred_time: input.preferred_time || null,
        status: 'pending',
        images: [],
      })
      .select('*')
      .single();

    setCreating(false);

    if (dbError) {
      setError(dbError.message);
      return { data: null, error: dbError.message };
    }

    return { data: data as MaintenanceRequest, error: null };
  }, []);

  return { create, creating, error };
}

export function useOwnerMaintenanceRequests(ownerId: string | undefined) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!isSupabaseConnected() || !ownerId) {
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get property IDs owned by this owner
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);

    if (propError || !properties || properties.length === 0) {
      setError(propError?.message || 'No properties found');
      setRequests([]);
      setLoading(false);
      return;
    }

    const propertyIds = properties.map((p: { id: string }) => p.id);

    const { data, error: dbError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(dbError.message);
      setRequests([]);
    } else {
      setRequests((data as MaintenanceRequest[]) ?? []);
    }
    setLoading(false);
  }, [ownerId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = useCallback(async (
    id: string,
    status: 'acknowledged' | 'in_progress' | 'resolved',
    notes?: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConnected()) return { error: 'Supabase not connected' };
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase not connected' };

    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (notes !== undefined) updates.landlord_notes = notes;

    const { error: dbError } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id);

    if (dbError) return { error: dbError.message };
    await fetchRequests();
    return { error: null };
  }, [fetchRequests]);

  return { requests, loading, error, refresh: fetchRequests, updateStatus };
}