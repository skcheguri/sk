import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockBrokerReports } from '@/mocks/broker-reports';
import { mockSoftBlockStates } from '@/mocks/soft-block-states';
import { communityPosts } from '@/mocks/community';

interface AdminCard {
  title: string;
  count: number;
  icon: string;
  color: string;
  to: string;
  description: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

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

  const activeBlocks = mockSoftBlockStates.filter((s) => s.active).length;
  const pendingReports = mockBrokerReports.filter((r) => !r.resolved).length;
  const flaggedPosts = communityPosts.filter((p) => p.reported).length;

  const cards: AdminCard[] = [
    {
      title: 'Broker Reports',
      count: pendingReports,
      icon: 'ri-flag-2-line',
      color: 'bg-red-50 text-red-600',
      to: '/admin/broker-reports',
      description: 'Review and resolve flagged broker reports from landlords.',
    },
    {
      title: 'Aadhaar Verification',
      count: 12,
      icon: 'ri-shield-user-line',
      color: 'bg-amber-50 text-amber-600',
      to: '/admin/verification',
      description: 'Verify or reject submitted Aadhaar verification requests.',
    },
    {
      title: 'Community Moderation',
      count: flaggedPosts,
      icon: 'ri-discuss-line',
      color: 'bg-blue-50 text-blue-600',
      to: '/admin/community',
      description: 'Moderate community posts and comments flagged by users.',
    },
    {
      title: 'Soft Blocks',
      count: activeBlocks,
      icon: 'ri-lock-line',
      color: 'bg-purple-50 text-purple-600',
      to: '/admin/broker-reports',
      description: 'View and manage active account restrictions.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600">Admin</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage trust & safety, verifications, and community content.</p>
          </div>
          <div className="relative">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2">
              <i className="ri-search-line text-gray-400 text-sm" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all admin sections..."
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-amber-200 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${card.color}`}>
                  <i className={`${card.icon} text-lg`} />
                </div>
                {card.count > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                    {card.count} pending
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-charcoal mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-charcoal mb-4">Recent Admin Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Broker report reviewed', target: 'Rohan Verma', by: 'System', time: '2 hours ago', icon: 'ri-flag-2-line', color: 'text-red-500' },
              { action: 'Aadhaar verified', target: 'Priya Sharma', by: 'Admin', time: '5 hours ago', icon: 'ri-shield-check-line', color: 'text-green-500' },
              { action: 'Community post removed', target: 'Spam listing promotion', by: 'Admin', time: '1 day ago', icon: 'ri-delete-bin-line', color: 'text-gray-500' },
              { action: 'Soft block lifted', target: 'Arjun Nair', by: 'System', time: '2 days ago', icon: 'ri-lock-unlock-line', color: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f9f9f7] transition-colors">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0">
                  <i className={`${item.icon} ${item.color} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">
                    {item.action} — <span className="font-semibold">{item.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {item.by} · {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}