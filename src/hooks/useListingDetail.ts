import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConnected } from '@/lib/supabase';
import { listings as mockListings, type Listing, type ListingCategory } from '@/mocks/listings';

export function useListingDetail(id: string | undefined): {
  listing: Listing | null;
  loading: boolean;
  error: string | null;
} {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Check mock data first (for seeded demo listings)
    const mock = mockListings.find((l) => l.id === id);
    if (mock) {
      setListing(mock);
      setLoading(false);
      return;
    }

    if (!isSupabaseConnected()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('listings')
      .select('*, owner:users!listings_owner_id_fkey(name, avatar_url, verified_aadhaar)')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle();

    if (dbError) {
      setError(dbError.message);
      setListing(null);
    } else if (data) {
      const db = data as Record<string, unknown>;
      const owner = (db.owner ?? {}) as Record<string, unknown>;

      const mapped: Listing = {
        id: String(db.id),
        category: (db.category ?? 'residential') as ListingCategory,
        title: String(db.title ?? ''),
        description: String(db.description ?? ''),
        price: Number(db.price ?? 0),
        price_unit: (db.category as string) === 'vacation' ? 'night' : undefined,
        location: String(db.location ?? db.city ?? 'Unknown'),
        bedrooms: Number(db.bedrooms ?? 0),
        bathrooms: Number(db.bathrooms ?? 1),
        area: Number(db.area_sqft ?? 0),
        property_type: String(db.property_type ?? 'apartment'),
        images:
          Array.isArray(db.images) && (db.images as string[]).length > 0
            ? (db.images as string[])
            : [
                'https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20clean%20minimal%20architecture%20urban%20residential%20complex&width=800&height=600&seq=listing-fallback&orientation=landscape',
              ],
        landlord_name: owner.name ? String(owner.name) : 'Bhavan Owner',
        landlord_avatar: owner.avatar_url
          ? String(owner.avatar_url)
          : 'https://readdy.ai/api/search-image?query=generic%20professional%20user%20avatar%20icon%20flat%20minimal%20neutral%20background&width=80&height=80&seq=avatar-fallback&orientation=squarish',
        furnished: Boolean(db.furnished ?? false),
        parking: 'none',
        verified: Boolean(db.verified ?? false),
        amenities: Array.isArray(db.amenities) ? (db.amenities as string[]) : [],
        owner_id: String(db.owner_id ?? ''),
        created_at: String(db.created_at ?? ''),
        nearby: [],
      };
      setListing(mapped);
    } else {
      setListing(null);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return { listing, loading, error };
}