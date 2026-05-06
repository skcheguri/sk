import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockBrokerReports, type BrokerReport } from '@/mocks/broker-reports';
import { mockSoftBlockStates } from '@/mocks/soft-block-states';
import { useToast } from '@/hooks/useToast';

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';

const reasonLabels: Record<BrokerReport['reason'], string> = {
  broker_agent: 'Broker / Agent',
  asked_commission: 'Asked Commission',
  shared_competing_listing: 'Shared Competing Listing',
  refused_identity: 'Refused Identity',
  other: 'Other',
};

const statusBadge: Record<BrokerReport['status'], string> = {
  pending: 'bg-amber-50 text-amber-600',
  reviewed: 'bg-blue-50 text-blue-600',
  resolved: 'bg-green-50 text-green-600',
  dismissed: 'bg-gray-100 text-gray-500',
};

export default function AdminBrokerReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [reports, setReports] = useState<BrokerReport[]>([...mockBrokerReports]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

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

  const filtered = reports.filter((r) => (filter === 'all' ? true : r.status === filter));

  const updateStatus = (id: string, status: BrokerReport['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, admin_note: noteDraft || r.admin_note, updated_at: new Date().toISOString() } : r))
    );
    setExpandedId(null);
    setNoteDraft('');
    addToast(`Report marked as ${status}`, 'success');
  };

  const activeBlocks = mockSoftBlockStates.filter((s) => s.active);

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-xs text-gray-400 hover:text-charcoal transition-colors">← Admin Dashboard</Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Broker Reports</h1>
            <p className="text-sm text-gray-500 mt-1">Review, investigate and resolve landlord-reported broker activity.</p>
          </div>
        </div>

        {/* Soft block summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50">
              <i className="ri-lock-line text-purple-600 text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">{activeBlocks.length} Active Soft Block{activeBlocks.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500">Tenants currently restricted from sending inquiries.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as StatusFilter[]).map((f) => (
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
                  {reports.filter((r) => r.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                <i className="ri-flag-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-charcoal mb-2">No reports found</h3>
              <p className="text-sm text-gray-500">All broker reports have been handled for this filter.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {reasonLabels[r.reason]}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-charcoal mb-1">
                        Tenant: <span className="font-semibold">{r.tenant_name}</span> · Reported by <span className="font-semibold">{r.owner_name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Listing: {r.listing_title} · {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.reason_text}</p>
                    </div>
                    <button
                      onClick={() => { setExpandedId(expandedId === r.id ? null : r.id); setNoteDraft(r.admin_note); }}
                      className="flex-shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer whitespace-nowrap"
                    >
                      {expandedId === r.id ? 'Close' : 'Review'}
                    </button>
                  </div>

                  {/* Admin action panel */}
                  {expandedId === r.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Admin Note</label>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        maxLength={500}
                        placeholder="Add investigation notes, evidence links, or resolution rationale..."
                        className="w-full px-3 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                        rows={3}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-right">{noteDraft.length}/500</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(['reviewed', 'resolved', 'dismissed'] as BrokerReport['status'][]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(r.id, s)}
                            disabled={r.status === s}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              r.status === s
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : s === 'resolved'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : s === 'dismissed'
                                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.admin_note && expandedId !== r.id && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Admin note:</span> {r.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}