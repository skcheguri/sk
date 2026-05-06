import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConnected } from '@/lib/supabase';

export interface CommunityPostFromDB {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'discussion' | 'advice' | 'review' | 'event' | 'general';
  created_at: string;
  updated_at: string;
  author?: {
    name: string | null;
    avatar_url: string | null;
  };
}

export interface CommunityCommentFromDB {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    name: string | null;
    avatar_url: string | null;
  };
}

interface UseCommunityReturn {
  posts: CommunityPostFromDB[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCommunity(category?: string): UseCommunityReturn {
  const [posts, setPosts] = useState<CommunityPostFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
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

    let query = supabase
      .from('community_posts')
      .select('*, author:users!community_posts_author_id_fkey(name, avatar_url)')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      setError(dbError.message);
      setPosts([]);
    } else {
      setPosts((data as CommunityPostFromDB[]) ?? []);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refresh: fetchPosts };
}

export async function createCommunityPost(postData: {
  author_id: string;
  title: string;
  content: string;
  category: string;
}): Promise<{ data: CommunityPostFromDB | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'Supabase not connected' };

  const { data, error } = await supabase
    .from('community_posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as CommunityPostFromDB, error: null };
}