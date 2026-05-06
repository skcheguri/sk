import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMaintenanceRequests, useCreateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useTenantConnectionRequests } from '@/hooks/useConnectionRequests';

const maintenanceCategories = [
  { id: 'plumbing', label: 'Plumbing', icon: 'ri-drop-line', color: 'bg-brand/10 text-brand' },
  { id: 'electrical', label: 'Electrical', icon: 'ri-flashlight-line', color: 'bg-amber-50 text-amber-600' },
  { id: 'water', label: 'Water Supply', icon: 'ri-water-flash-line', color: 'bg-teal-50 text-teal-600' },
  { id: 'elevator', label: 'Elevator', icon: 'ri-arrow-up-down-line', color: 'bg-red-50 text-red-600' },
  { id: 'carpentry', label: 'Carpentry', icon: 'ri-hammer-line', color: 'bg-orange-50 text-orange-600' },
  { id: 'painting', label: 'Painting', icon: 'ri-brush-line', color: 'bg-pink-50 text-pink-600' },
  { id: 'ac', label: 'AC & Appliances', icon: 'ri-temp-cold-line', color: 'bg-sky-50 text-sky-600' },
  { id: 'security', label: 'Security', icon: 'ri-shield-keyhole-line', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'housekeeping', label: 'Housekeeping', icon: 'ri-service-line', color: 'bg-green-50 text-green-600' },
  { id: 'other', label: 'Other', icon: 'ri-more-line', color: 'bg-gray-100 text-gray-600' },
];

function getCategoryIcon(category: string): string {
  const cat = maintenanceCategories.find((c) => c.id === category.toLowerCase());
  return cat?.icon ?? 'ri-tools-line';
}

function getCategoryColor(category: string): string {
  const cat = maintenanceCategories.find((c) => c.id === category.toLowerCase());
  return cat?.color ?? 'bg-gray-100 text-gray-600';
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  in_progress: { label: 'In Progress', color: 'bg-brand/10 text-brand', dot: 'bg-brand' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const urgencyConfig: Record<string, { color: string; dot: string }> = {
  high: { color: 'text-red-600', dot: 'bg-red-500' },
  medium: { color: 'text-amber-600', dot: 'bg-amber-400' },
  low: { color: 'text-green-600', dot: 'bg-green-500' },
};

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function buildTimeline(req: { status: string; created_at: string; updated_at: string; resolved_at: string | null }) {
  const steps = [
    { status: 'Submitted', note: 'Request received and logged.', key: 'submitted' },
    { status: 'Acknowledged', note: 'Property manager reviewed your request.', key: 'acknowledged' },
    { status: 'In Progress', note: 'Technician assigned and working on the issue.', key: 'in_progress' },
    { status: 'Resolved', note: 'Issue fixed and verified.', key: 'resolved' },
  ];

  const statusOrder: Record<string, number> = {
    pending: 0,
    acknowledged: 1,
    in_progress: 2,
    resolved: 3,
  };

  const current = statusOrder[req.status] ?? 0;

  return steps.map((step, idx) => {
    const done = idx <= current;
    let date: string | null = null;
    if (done) {
      if (idx === 0) date = formatDate(req.created_at);
      else if (idx === 3 && req.resolved_at) date = formatDate(req.resolved_at);
      else date = formatDate(req.updated_at);
    }
    return { ...step, done, date };
  });
}

const statusLabels = {
  pending: 'Pending Review',
  approved: 'Approved',
  declined: 'Declined',
} as const;

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-green-50 text-green-700 border-green-100',
  declined: 'bg-red-50 text-red-500 border-red-100',
} as const;

interface Props {
  tenantId: string;
}

export default function RequestsTab({ tenantId }: Props) {
  const [subTab, setSubTab] = useState<'maintenance' | 'inquiries'>('maintenance');
  const [maintFilter, setMaintFilter] = useState<'all' | 'in_progress' | 'pending' | 'resolved'>('all');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const { requests: maintRequests, loading: maintLoading, refresh: refreshMaint } = useMaintenanceRequests(tenantId);
  const { create: createMaint, creating: creatingMaint } = useCreateMaintenanceRequest();
  const { requests: inquiryRequests, loading: inquiryLoading } = useTenantConnectionRequests(tenantId);

  const [selectedMaintId, setSelectedMaintId] = useState<string | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({ issue: '', description: '', urgency: 'medium' as const, preferredTime: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitRequest = async () => {
    if (!selectedCategory || !requestForm.issue.trim()) return;
    setSubmitError(null);

    const { error } = await createMaint({
      tenant_id: tenantId,
      property_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // fallback property
      category: selectedCategory,
      title: requestForm.issue,
      description: requestForm.description,
      priority: requestForm.urgency,
      unit: 'B-204', // fallback unit, ideally from user profile
      preferred_time: requestForm.preferredTime,
    });

    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitted(true);
    refreshMaint();
    setTimeout(() => {
      setSubmitted(false);
      setShowNewRequest(false);
      setSelectedCategory(null);
      setRequestForm({ issue: '', description: '', urgency: 'medium', preferredTime: '' });
    }, 2500);
  };

  const maintFiltered = maintFilter === 'all'
    ? maintRequests
    : maintRequests.filter((r) => r.status === maintFilter);

  const selectedMaint = maintRequests.find((r) => r.id === selectedMaintId) || null;

  const inquiryFiltered = inquiryFilter === 'all'
    ? inquiryRequests
    : inquiryRequests.filter((r) => r.status === inquiryFilter);

  const maintCounts = {
    all: maintRequests.length,
    in_progress: maintRequests.filter((r) => r.status === 'in_progress').length,
    pending: maintRequests.filter((r) => r.status === 'pending').length,
    resolved: maintRequests.filter((r) => r.status === 'resolved').length,
  };

  // Auto-select first on load
  if (maintRequests.length > 0 && !selectedMaintId) {
    setSelectedMaintId(maintRequests[0].id);
  }

  return (
    <div className="space-y-5">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
        <button
          onClick={() => setSubTab('maintenance')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'maintenance' ? 'bg-brand text-white' : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
          }`}
        >
          <i className="ri-tools-line text-sm mr-1.5" /> Maintenance ({maintRequests.length})
        </button>
        <button
          onClick={() => setSubTab('inquiries')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'inquiries' ? 'bg-brand text-white' : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
          }`}
        >
          <i className="ri-user-received-line text-sm mr-1.5" /> Inquiries ({inquiryRequests.length})
        </button>
      </div>

      {subTab === 'maintenance' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { key: 'all' as const, label: 'Total', icon: 'ri-list-check-2', color: 'text-charcoal' },
              { key: 'in_progress' as const, label: 'In Progress', icon: 'ri-loader-4-line', color: 'text-blue-600' },
              { key: 'pending' as const, label: 'Pending', icon: 'ri-time-line', color: 'text-gray-500' },
              { key: 'resolved' as const, label: 'Resolved', icon: 'ri-checkbox-circle-line', color: 'text-green-600' },
            ]).map((s) => (
              <button
                key={s.key}
                onClick={() => setMaintFilter(s.key)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  maintFilter === s.key ? 'border-brand bg-brand/5' : 'border-gray-100 bg-white hover:border-brand/30'
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center mb-2 ${s.color}`}>
                  <i className={`${s.icon} text-lg`} />
                </div>
                <p className="text-2xl font-bold text-charcoal">{maintCounts[s.key]}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>

          {maintLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line animate-spin text-brand text-3xl" />
              </div>
              <p className="text-gray-500 text-sm">Loading maintenance requests...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Request list */}
              <div className="lg:col-span-2 space-y-3">
                {maintFiltered.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-3">
                      <i className="ri-inbox-line text-gray-400 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-500">No requests found</p>
                  </div>
                ) : (
                  maintFiltered.map((req) => {
                    const sc = statusConfig[req.status] || statusConfig.pending;
                    const uc = urgencyConfig[req.priority] || urgencyConfig.low;
                    const icon = getCategoryIcon(req.category);
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedMaintId(req.id)}
                        className={`w-full text-left bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                          selectedMaintId === req.id ? 'border-brand ring-1 ring-brand/20' : 'border-gray-100 hover:border-brand/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand/10 flex-shrink-0">
                              <i className={`${icon} text-brand text-lg`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-charcoal">{req.category}</p>
                              <p className="text-xs text-gray-500">{req.title}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="text-[11px] text-gray-400">{req.id.slice(0, 8)}</span>
                          <span className="text-[11px] text-gray-400">{req.unit || 'N/A'}</span>
                          <span className="text-[11px] text-gray-400">{timeAgo(req.created_at)}</span>
                          <span className={`text-[11px] font-semibold capitalize ${uc.color}`}>{req.priority}</span>
                        </div>
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                req.status === 'resolved' ? 'bg-green-500 w-full' :
                                req.status === 'in_progress' ? 'bg-brand w-3/4' :
                                req.status === 'acknowledged' ? 'bg-amber-400 w-2/5' :
                                'bg-gray-300 w-1/5'
                              }`}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-3">
                {selectedMaint ? (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand/10 flex-shrink-0">
                          <i className={`${getCategoryIcon(selectedMaint.category)} text-brand text-2xl`} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-charcoal">{selectedMaint.category} — {selectedMaint.title}</h2>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400">{selectedMaint.id.slice(0, 12)}</span>
                            <span className="text-xs text-gray-400">{selectedMaint.unit || 'N/A'}</span>
                            <span className={`text-xs font-semibold capitalize ${urgencyConfig[selectedMaint.priority]?.color || 'text-gray-500'}`}>{selectedMaint.priority} urgency</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${statusConfig[selectedMaint.status]?.color}`}>
                        {statusConfig[selectedMaint.status]?.label}
                      </span>
                    </div>

                    <div className="px-6 py-5 space-y-6">
                      {selectedMaint.description && (
                        <div>
                          <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">Description</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedMaint.description}</p>
                        </div>
                      )}
                      {selectedMaint.landlord_notes && (
                        <div className="bg-brand/5 rounded-xl p-4 border border-brand/10">
                          <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-1">Landlord Notes</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedMaint.landlord_notes}</p>
                        </div>
                      )}
                      {selectedMaint.images.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">Attached Photos</p>
                          <div className="flex gap-2 flex-wrap">
                            {selectedMaint.images.map((url, i) => (
                              <div key={i} className="w-24 h-20 rounded-xl overflow-hidden border border-gray-100">
                                <img src={url} alt={`photo-${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-4">Progress Timeline</p>
                        <div className="space-y-0">
                          {buildTimeline(selectedMaint).map((step, idx, arr) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${step.done ? 'bg-brand border-brand' : 'bg-white border-gray-200'}`}>
                                  {step.done ? <i className="ri-check-line text-white text-sm" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                </div>
                                {idx < arr.length - 1 && (
                                  <div className={`w-0.5 h-10 mt-1 ${step.done ? 'bg-brand/30' : 'bg-gray-100'}`} />
                                )}
                              </div>
                              <div className="pb-8">
                                <p className={`text-sm font-semibold ${step.done ? 'text-charcoal' : 'text-gray-400'}`}>{step.status}</p>
                                {step.date && <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>}
                                <p className={`text-xs mt-1 leading-relaxed ${step.done ? 'text-gray-500' : 'text-gray-300'}`}>{step.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="text-sm font-medium text-charcoal mt-0.5">{formatDate(selectedMaint.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Preferred Time</p>
                          <p className="text-sm font-medium text-charcoal mt-0.5">{selectedMaint.preferred_time || 'Any time'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                      <i className="ri-file-search-line text-gray-400 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-500">Select a request to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Request FAB */}
          <button
            onClick={() => { setShowNewRequest(true); setSelectedCategory(null); setSubmitted(false); setSubmitError(null); }}
            className="fixed bottom-8 right-8 z-40 flex items-center gap-2 bg-brand text-white font-semibold px-5 py-3 rounded-full hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line" /> New Request
          </button>
        </div>
      )}

      {subTab === 'inquiries' && (
        <div className="space-y-5">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
            {(['all', 'pending', 'approved', 'declined'] as const).map((f) => {
              const count = f === 'all' ? inquiryRequests.length : inquiryRequests.filter((r) => r.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setInquiryFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    inquiryFilter === f ? 'bg-brand text-white' : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          {inquiryLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line animate-spin text-brand text-3xl" />
              </div>
              <p className="text-gray-500 text-sm">Loading inquiries...</p>
            </div>
          ) : inquiryFiltered.length > 0 ? (
            <div className="space-y-4">
              {inquiryFiltered.map((req) => (
                <div key={req.id} className={`bg-white rounded-2xl border p-5 ${statusStyles[req.status]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20India%20residential%20complex%20warm%20tones&width=200&height=200&seq=listing-${req.listingId}&orientation=squarish`}
                          alt={req.listingTitle}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{req.listingTitle}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <i className="ri-map-pin-line text-[10px]" /> {req.listingLocation}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ₹{req.listingPrice.toLocaleString('en-IN')}/mo · Sent {timeAgo(req.requestedAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 bg-white/80">
                      {statusLabels[req.status]}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-white/60 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">Your message:</p>
                    <p className="text-sm text-charcoal leading-relaxed">&ldquo;{req.prospectMessage}&rdquo;</p>
                  </div>
                  {req.status === 'approved' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 font-medium">
                      <i className="ri-checkbox-circle-fill text-sm" />
                      Owner approved! You can now chat and schedule a visit.
                    </div>
                  )}
                  {req.status === 'declined' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
                      <i className="ri-close-circle-line text-sm" />
                      This request was not approved. Browse other listings.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                <i className="ri-inbox-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-charcoal mb-2">No inquiries here</h3>
              <p className="text-sm text-gray-500">Browse listings and send connection requests to property owners.</p>
              <Link
                to="/listings"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap"
              >
                <i className="ri-search-line text-sm" /> Browse Listings
              </Link>
            </div>
          )}
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-charcoal">Request Maintenance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your property manager gets notified instantly.</p>
              </div>
              <button onClick={() => { setShowNewRequest(false); setSelectedCategory(null); setSubmitted(false); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
                    <i className="ri-checkbox-circle-fill text-green-500 text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal">Request Submitted!</h3>
                  <p className="text-sm text-gray-500 text-center">Your maintenance request has been raised.</p>
                </div>
              ) : !selectedCategory ? (
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-4">Select a category</p>
                  <div className="grid grid-cols-2 gap-3">
                    {maintenanceCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer text-left group"
                      >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${cat.color}`}>
                          <i className={`${cat.icon} text-lg`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-charcoal">{cat.label}</span>
                          <p className="text-xs text-gray-400 mt-0.5">Maintenance issue</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedCategory(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                      <i className="ri-arrow-left-line text-gray-500" />
                    </button>
                    {(() => {
                      const cat = maintenanceCategories.find((c) => c.id === selectedCategory);
                      return cat ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${cat.color}`}>
                            <i className={`${cat.icon} text-sm`} />
                          </div>
                          <span className="text-sm font-bold text-charcoal">{cat.label}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Issue Summary <span className="text-red-400">*</span></label>
                    <input
                      value={requestForm.issue}
                      onChange={(e) => setRequestForm({ ...requestForm, issue: e.target.value })}
                      placeholder="e.g. Kitchen tap is leaking"
                      className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{requestForm.description.length}/500</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Urgency</label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preferred Time</label>
                      <input
                        value={requestForm.preferredTime}
                        onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
                        placeholder="e.g. Weekday mornings"
                        className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                      />
                    </div>
                  </div>
                  {submitError && (
                    <p className="text-xs text-red-500">{submitError}</p>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setShowNewRequest(false); setSelectedCategory(null); }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      disabled={!requestForm.issue.trim() || creatingMaint}
                      className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {creatingMaint ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
