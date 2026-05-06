import { useState } from 'react';
import { Link } from 'react-router-dom';
import { landlordRequests } from '@/mocks/maintenance';

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'acknowledged' | 'resolved';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100' },
  acknowledged: { label: 'Acknowledged', color: 'text-amber-700', bg: 'bg-amber-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  resolved: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-100' },
};

const urgencyConfig: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-red-600', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'text-green-600', dot: 'bg-green-500' },
};

const technicians = ['Ravi Kumar (Plumber)', 'Suresh Electricals', 'CoolAir Services', 'Ramesh Carpentry', 'Building Maintenance', 'QuickFix Team'];

interface RequestCardProps {
  req: typeof landlordRequests[0];
  onStatusChange: (id: string, status: string) => void;
  onAssign: (id: string, tech: string) => void;
}

function RequestCard({ req, onStatusChange, onAssign }: RequestCardProps) {
  const [showAssign, setShowAssign] = useState(false);
  const sc = statusConfig[req.status] || statusConfig.pending;
  const uc = urgencyConfig[req.urgency] || urgencyConfig.low;

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${req.urgency === 'high' && req.status !== 'resolved' ? 'border-red-100' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 ${req.urgency === 'high' ? 'bg-red-50' : 'bg-brand/10'}`}>
            <i className={`${req.icon} text-xl ${req.urgency === 'high' ? 'text-red-500' : 'text-brand'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-charcoal">{req.category} — {req.issue}</p>
              {req.urgency === 'high' && req.status !== 'resolved' && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">URGENT</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-gray-400">{req.id}</span>
              <span className="text-xs text-gray-500 font-medium">{req.flat}</span>
              <span className="text-xs text-gray-400">{req.tenant}</span>
              <span className="text-xs text-gray-400">{req.date}</span>
            </div>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.bg} ${sc.color}`}>
          {sc.label}
        </span>
      </div>

      {req.description && (
        <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">{req.description}</p>
      )}

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className={`text-xs font-semibold flex items-center gap-1 ${uc.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${uc.dot}`} />
          {uc.label} Priority
        </span>
        {req.photos > 0 && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <i className="ri-image-line text-xs" />{req.photos} photo{req.photos > 1 ? 's' : ''}
          </span>
        )}
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <i className="ri-time-line text-xs" />{req.preferredTime}
        </span>
      </div>

      {/* Assigned technician */}
      {req.assignedTo && (
        <div className="mt-3 flex items-center gap-2 bg-brand/5 rounded-xl px-3 py-2 border border-brand/10">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-user-settings-line text-brand text-sm" />
          </div>
          <span className="text-xs text-charcoal font-medium">{req.assignedTo}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {/* Status change */}
        {req.status !== 'resolved' && (
          <>
            {req.status === 'pending' && (
              <button
                onClick={() => onStatusChange(req.id, 'acknowledged')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Acknowledge
              </button>
            )}
            {(req.status === 'acknowledged' || req.status === 'pending') && (
              <button
                onClick={() => onStatusChange(req.id, 'in_progress')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Mark In Progress
              </button>
            )}
            {req.status === 'in_progress' && (
              <button
                onClick={() => onStatusChange(req.id, 'resolved')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Mark Resolved
              </button>
            )}
          </>
        )}

        {/* Assign technician */}
        {req.status !== 'resolved' && (
          <div className="relative">
            <button
              onClick={() => setShowAssign((v) => !v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-user-add-line text-xs" />
              {req.assignedTo ? 'Reassign' : 'Assign Technician'}
            </button>
            {showAssign && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 min-w-[200px] py-1">
                {technicians.map((t) => (
                  <button
                    key={t}
                    onClick={() => { onAssign(req.id, t); setShowAssign(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-brand/5 transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {req.status === 'resolved' && (
          <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
            <i className="ri-checkbox-circle-line" /> Resolved
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandlordDashboard() {
  const [requests, setRequests] = useState(landlordRequests);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'urgency'>('urgency');

  const handleStatusChange = (id: string, status: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const handleAssign = (id: string, tech: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, assignedTo: tech } : r));
  };

  const filtered = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.urgency as keyof typeof order] ?? 2) - (order[b.urgency as keyof typeof order] ?? 2);
      }
      return 0;
    });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    acknowledged: requests.filter((r) => r.status === 'acknowledged').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  };

  const urgentCount = requests.filter((r) => r.urgency === 'high' && r.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-offwhite pt-20">
      {/* Header */}
      <section className="bg-white py-10 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Link to="/owner-profile" className="text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer">Owner Profile</Link>
              <i className="ri-arrow-right-s-line text-gray-300" />
              <span className="text-sm text-charcoal font-medium">Maintenance Dashboard</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Maintenance Dashboard</h1>
                  {urgentCount > 0 && (
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                      {urgentCount} Urgent
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">Manage and respond to all tenant maintenance requests across your properties.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'urgency')}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-brand cursor-pointer"
                >
                  <option value="urgency">Sort by Urgency</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              {([
                { key: 'all', label: 'All Requests', icon: 'ri-list-check-2', color: 'text-charcoal', bg: 'bg-gray-100' },
                { key: 'pending', label: 'Pending', icon: 'ri-time-line', color: 'text-gray-600', bg: 'bg-gray-100' },
                { key: 'acknowledged', label: 'Acknowledged', icon: 'ri-eye-line', color: 'text-amber-600', bg: 'bg-amber-100' },
                { key: 'in_progress', label: 'In Progress', icon: 'ri-loader-4-line', color: 'text-blue-600', bg: 'bg-blue-100' },
                { key: 'resolved', label: 'Resolved', icon: 'ri-checkbox-circle-line', color: 'text-green-600', bg: 'bg-green-100' },
              ] as { key: FilterStatus; label: string; icon: string; color: string; bg: string }[]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilter(s.key)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${filter === s.key ? 'border-brand bg-brand/5' : 'border-gray-100 bg-white hover:border-brand/30'}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg mb-2 ${s.bg}`}>
                    <i className={`${s.icon} ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold text-charcoal">{counts[s.key]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <div className="w-full px-4 md:px-8 lg:px-12 pt-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                <i className="ri-alarm-warning-line text-red-500 text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">{urgentCount} urgent request{urgentCount > 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} immediate attention</p>
                <p className="text-xs text-red-500 mt-0.5">High-priority issues are affecting tenants&apos; daily life. Please respond within 2 hours.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request grid */}
      <section className="py-6">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-charcoal">
                {filtered.length} request{filtered.length !== 1 ? 's' : ''}
                {filter !== 'all' && <span className="text-gray-400 font-normal"> · {statusConfig[filter]?.label || 'All'}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'in_progress', 'resolved'] as FilterStatus[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-200 hover:border-brand/40'}`}
                  >
                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== 'all' && <span className="ml-1 opacity-70">({counts[f]})</span>}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <i className="ri-inbox-line text-gray-400 text-2xl" />
                </div>
                <p className="text-sm text-gray-500">No requests in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
