import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { communityPosts } from '@/mocks/community';
import { useToast } from '@/hooks/useToast';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar: string;
  category: string;
  replies: number;
  likes: number;
  created_at: string;
  reported?: boolean;
  report_reason?: string;
  report_count?: number;
  hidden?: boolean;
}

export default function AdminCommunityPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([...communityPosts]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'hidden'>('all');

  // Temporarily bypassed role check for preview
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-red-100 rounded-full">
            <i className="ri-shield-cross-line text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">This area is restricted to admin users only.</p>
          <Link to="/" className="bg-brand text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const filtered = posts.filter((p) => {
    if (filter === 'flagged') return p.reported && !p.hidden;
    if (filter === 'hidden') return p.hidden;
    return true;
  });

  const toggleHide = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p))
    );
    const post = posts.find((p) => p.id === id);
    addToast(post?.hidden ? 'Post restored' : 'Post hidden', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-xs text-gray-400 hover:text-charcoal transition-colors">← Admin Dashboard</Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Community Moderation</h1>
            <p className="text-sm text-gray-500 mt-1">Review flagged posts and enforce community guidelines.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['all', 'flagged', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                filter === f ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 hover:text-charcoal border border-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {posts.filter((p) => (f === 'flagged' ? p.reported && !p.hidden : p.hidden)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Posts list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                <i className="ri-discuss-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-charcoal mb-2">Nothing to moderate</h3>
              <p className="text-sm text-gray-500">All community content is clean for this filter.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden ${p.hidden ? 'border-red-100 opacity-70' : 'border-gray-100'}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={p.author_avatar} alt={p.author_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-charcoal">{p.author_name}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">{p.category}</span>
                        {p.reported && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            <i className="ri-flag-line text-[10px]" /> {p.report_count} reports
                          </span>
                        )}
                        {p.hidden && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Hidden</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {p.replies} replies · {p.likes} likes</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-charcoal mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{p.content}</p>

                  {p.report_reason && (
                    <div className="mt-3 bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-600">
                        <span className="font-semibold">Report reason:</span> {p.report_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => toggleHide(p.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        p.hidden
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {p.hidden ? 'Restore Post' : 'Hide Post'}
                    </button>
                    {!p.hidden && p.reported && (
                      <button
                        onClick={() => {
                          setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, reported: false, report_reason: undefined, report_count: 0 } : x)));
                          addToast('Reports dismissed', 'success');
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Dismiss Reports
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}