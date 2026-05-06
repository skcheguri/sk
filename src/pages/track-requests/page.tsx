import { useState } from 'react';
import { Link } from 'react-router-dom';
import { myRequests } from '@/mocks/maintenance';

const maintenanceCategories = [
  { id: 'plumbing', label: 'Plumbing', desc: 'Leaks, drains, pipes & water pressure', icon: 'ri-water-flash-line', color: 'bg-brand/10 text-brand', badge: 'Most Common', badgeColor: 'bg-brand/10 text-brand' },
  { id: 'electrical', label: 'Electrical', desc: 'Power, switches, wiring & circuits', icon: 'ri-flashlight-line', color: 'bg-amber-50 text-amber-600', badge: 'High Priority', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'water', label: 'Water Supply', desc: 'Supply issues, tank, seepage & meter', icon: 'ri-drop-line', color: 'bg-teal-50 text-teal-600', badge: '', badgeColor: '' },
  { id: 'elevator', label: 'Elevator / Lift', desc: 'Lift breakdown, doors & alarms', icon: 'ri-building-line', color: 'bg-red-50 text-red-600', badge: 'Urgent', badgeColor: 'bg-red-100 text-red-600' },
  { id: 'carpentry', label: 'Carpentry', desc: 'Doors, windows, locks & furniture', icon: 'ri-hammer-line', color: 'bg-orange-50 text-orange-600', badge: '', badgeColor: '' },
  { id: 'painting', label: 'Painting & Walls', desc: 'Peeling, cracks, damp stains & mould', icon: 'ri-brush-line', color: 'bg-pink-50 text-pink-600', badge: '', badgeColor: '' },
  { id: 'ac', label: 'AC & Appliances', desc: 'AC, geyser, fans & inverter issues', icon: 'ri-temp-cold-line', color: 'bg-sky-50 text-sky-600', badge: '', badgeColor: '' },
  { id: 'security', label: 'Security Systems', desc: 'CCTV, intercom, gates & access cards', icon: 'ri-shield-keyhole-line', color: 'bg-indigo-50 text-indigo-600', badge: '', badgeColor: '' },
  { id: 'housekeeping', label: 'Housekeeping', desc: 'Cleaning, pests, garbage & common areas', icon: 'ri-service-line', color: 'bg-green-50 text-green-600', badge: '', badgeColor: '' },
  { id: 'other', label: 'Other Issue', desc: 'Anything not listed above', icon: 'ri-more-line', color: 'bg-gray-100 text-gray-600', badge: '', badgeColor: '' },
];

type RequestStatus = 'all' | 'in_progress' | 'pending' | 'resolved';

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const urgencyConfig: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-green-600',
};

export default function TrackRequests() {
  const [filter, setFilter] = useState<RequestStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(myRequests[0].id);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({ issue: '', description: '', urgency: 'medium', preferredTime: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRequest = () => {
    if (!selectedCategory || !requestForm.issue.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowNewRequest(false);
      setSelectedCategory(null);
      setRequestForm({ issue: '', description: '', urgency: 'medium', preferredTime: '' });
    }, 2500);
  };

  const filtered = filter === 'all' ? myRequests : myRequests.filter((r) => r.status === filter);
  const selected = myRequests.find((r) => r.id === selectedId) || null;

  const counts = {
    all: myRequests.length,
    in_progress: myRequests.filter((r) => r.status === 'in_progress').length,
    pending: myRequests.filter((r) => r.status === 'pending').length,
    resolved: myRequests.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-offwhite pt-20">
      {/* Header */}
      <section className="bg-white py-10 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Link to="/tenant-profile" className="text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer">My Dashboard</Link>
              <i className="ri-arrow-right-s-line text-gray-300" />
              <span className="text-sm text-charcoal font-medium">Track My Requests</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Track My Requests</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor the status and progress of all your maintenance requests.</p>
              </div>
              <button
                onClick={() => { setShowNewRequest(true); setSelectedCategory(null); setSubmitted(false); }}
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line" />
                </div>
                New Request
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {([
                { key: 'all', label: 'Total', icon: 'ri-list-check-2', color: 'text-charcoal' },
                { key: 'in_progress', label: 'In Progress', icon: 'ri-loader-4-line', color: 'text-blue-600' },
                { key: 'pending', label: 'Pending', icon: 'ri-time-line', color: 'text-gray-500' },
                { key: 'resolved', label: 'Resolved', icon: 'ri-checkbox-circle-line', color: 'text-green-600' },
              ] as { key: RequestStatus; label: string; icon: string; color: string }[]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilter(s.key)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${filter === s.key ? 'border-brand bg-brand/5' : 'border-gray-100 bg-white hover:border-brand/30'}`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center mb-2 ${s.color}`}>
                    <i className={`${s.icon} text-lg`} />
                  </div>
                  <p className="text-2xl font-bold text-charcoal">{counts[s.key]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-charcoal">Request Maintenance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your property manager gets notified instantly and will respond within 24 hours.</p>
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
                  <p className="text-sm text-gray-500 text-center">Your maintenance request has been raised. You&apos;ll receive a confirmation shortly.</p>
                </div>
              ) : !selectedCategory ? (
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-4">Select a category to get started</p>
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-charcoal">{cat.label}</span>
                            {cat.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badgeColor}`}>{cat.badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{cat.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Back + selected category */}
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
                      placeholder="e.g. Kitchen tap is leaking continuously"
                      className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Describe the issue in detail — when it started, how severe it is..."
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
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
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

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setShowNewRequest(false); setSelectedCategory(null); }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      disabled={!requestForm.issue.trim()}
                      className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <section className="py-8">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Request list */}
              <div className="lg:col-span-2 space-y-3">
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-3">
                      <i className="ri-inbox-line text-gray-400 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-500">No requests found</p>
                  </div>
                ) : (
                  filtered.map((req) => {
                    const sc = statusConfig[req.status] || statusConfig.pending;
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedId(req.id)}
                        className={`w-full text-left bg-white rounded-2xl p-4 border transition-all cursor-pointer ${selectedId === req.id ? 'border-brand ring-1 ring-brand/20' : 'border-gray-100 hover:border-brand/30'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand/10 flex-shrink-0">
                              <i className={`${req.icon} text-brand text-lg`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-charcoal">{req.category}</p>
                              <p className="text-xs text-gray-500">{req.issue}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <i className="ri-hashtag text-xs" />{req.id}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <i className="ri-map-pin-line text-xs" />{req.flat}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <i className="ri-calendar-line text-xs" />{req.date}
                          </span>
                          <span className={`text-[11px] font-semibold capitalize ${urgencyConfig[req.urgency]}`}>
                            {req.urgency}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${req.status === 'resolved' ? 'bg-green-500 w-full' : req.status === 'in_progress' ? 'bg-brand w-3/4' : req.status === 'acknowledged' ? 'bg-amber-400 w-2/5' : 'bg-gray-300 w-1/5'}`}
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
                {selected ? (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Detail header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand/10 flex-shrink-0">
                          <i className={`${selected.icon} text-brand text-2xl`} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-charcoal">{selected.category} — {selected.issue}</h2>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400">{selected.id}</span>
                            <span className="text-xs text-gray-400">{selected.flat}</span>
                            <span className={`text-xs font-semibold capitalize ${urgencyConfig[selected.urgency]}`}>{selected.urgency} urgency</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${statusConfig[selected.status]?.color}`}>
                        {statusConfig[selected.status]?.label}
                      </span>
                    </div>

                    <div className="px-6 py-5 space-y-6">
                      {/* Description */}
                      {selected.description && (
                        <div>
                          <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">Description</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
                        </div>
                      )}

                      {/* Photos */}
                      {selected.photos.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-2">Attached Photos</p>
                          <div className="flex gap-2 flex-wrap">
                            {selected.photos.map((url, i) => (
                              <div key={i} className="w-24 h-20 rounded-xl overflow-hidden border border-gray-100">
                                <img src={url} alt={`photo-${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assigned technician */}
                      {selected.assignedTo && (
                        <div className="bg-brand/5 rounded-xl p-4 flex items-center gap-3 border border-brand/10">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-brand/20 flex-shrink-0">
                            <i className="ri-user-settings-line text-brand text-lg" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Assigned Technician</p>
                            <p className="text-sm font-bold text-charcoal">{selected.assignedTo}</p>
                            {selected.assignedContact && (
                              <p className="text-xs text-brand mt-0.5">{selected.assignedContact}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div>
                        <p className="text-xs font-bold text-charcoal uppercase tracking-wide mb-4">Progress Timeline</p>
                        <div className="space-y-0">
                          {selected.timeline.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${step.done ? 'bg-brand border-brand' : 'bg-white border-gray-200'}`}>
                                  {step.done ? (
                                    <i className="ri-check-line text-white text-sm" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                  )}
                                </div>
                                {idx < selected.timeline.length - 1 && (
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

                      {/* Details row */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="text-sm font-medium text-charcoal mt-0.5">{selected.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Preferred Time</p>
                          <p className="text-sm font-medium text-charcoal mt-0.5">{selected.preferredTime}</p>
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
          </div>
        </div>
      </section>
    </div>
  );
}
