import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface SavedListingState {
  savedIds: string[];
  saving: boolean;
  error: string | null;
  save: (listingId: string) => Promise<void>;
  unsave: (listingId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSaveListing(userId: string | undefined): SavedListingState {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedIds = useCallback(async () => {
    if (!userId) {
      setSavedIds([]);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error: dbError } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId);

    if (dbError) {
      setError(dbError.message);
      setSavedIds([]);
    } else {
      setSavedIds((data ?? []).map((d) => d.listing_id));
      setError(null);
    }
  }, [userId]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  const save = useCallback(
    async (listingId: string) => {
      if (!userId) return;

      const supabase = getSupabase();
      if (!supabase) return;

      setSaving(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('saved_listings')
        .insert({ user_id: userId, listing_id: listingId });

      if (dbError) {
        setError(dbError.message);
      } else {
        setSavedIds((prev) => [...prev, listingId]);
      }

      setSaving(false);
    },
    [userId]
  );

  const unsave = useCallback(
    async (listingId: string) => {
      if (!userId) return;

      const supabase = getSupabase();
      if (!supabase) return;

      setSaving(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      if (dbError) {
        setError(dbError.message);
      } else {
        setSavedIds((prev) => prev.filter((id) => id !== listingId));
      }

      setSaving(false);
    },
    [userId]
  );

  const refresh = useCallback(async () => {
    await fetchSavedIds();
  }, [fetchSavedIds]);

  return {
    savedIds,
    saving,
    error,
    save,
    unsave,
    refresh,
  };
}
