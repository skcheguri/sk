import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { verifiedUsers, type VerifiedUser } from '@/mocks/verification';
import { useToast } from '@/hooks/useToast';

interface VerificationRequest {
  id: string;
  userName: string;
  userRole: string;
  aadhaarName: string;
  aadhaarNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
  matchScore: number;
  documentUrl: string;
}

const mockRequests: VerificationRequest[] = [
  {
    id: 'vreq-001',
    userName: 'Sanjay Rao',
    userRole: 'owner',
    aadhaarName: 'Sanjay Kumar Rao',
    aadhaarNumber: '**** **** 4821',
    submittedAt: '2026-05-02T08:30:00Z',
    status: 'pending',
    rejectionReason: '',
    matchScore: 87,
    documentUrl: '',
  },
  {
    id: 'vreq-002',
    userName: 'Divya Menon',
    userRole: 'renter',
    aadhaarName: 'Divya Krishnan Menon',
    aadhaarNumber: '**** **** 9157',
    submittedAt: '2026-05-01T16:45:00Z',
    status: 'pending',
    rejectionReason: '',
    matchScore: 94,
    documentUrl: '',
  },
  {
    id: 'vreq-003',
    userName: 'Faisal Khan',
    userRole: 'owner',
    aadhaarName: 'Faisal Ahmed Khan',
    aadhaarNumber: '**** **** 2203',
    submittedAt: '2026-04-30T11:20:00Z',
    status: 'rejected',
    rejectionReason: 'Image too blurry — all 4 corners not visible.',
    matchScore: 45,
    documentUrl: '',
  },
  {
    id: 'vreq-004',
    userName: 'Lakshmi Narayan',
    userRole: 'renter',
    aadhaarName: 'Lakshmi Devi Narayan',
    aadhaarNumber: '**** **** 6674',
    submittedAt: '2026-04-28T09:10:00Z',
    status: 'approved',
    rejectionReason: '',
    matchScore: 96,
    documentUrl: '',
  },
];

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [requests, setRequests] = useState<VerificationRequest[]>([...mockRequests]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filtered = requests.filter((r) => (filter === 'all' ? true : r.status === filter));

  const updateStatus = (id: string, status: VerificationRequest['status'], reason = '') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, rejectionReason: reason } : r))
    );
    setExpandedId(null);
    addToast(`Verification ${status}`, 'success');
  };

  const statusBadge = {
    pending: 'bg-amber-50 text-amber-600',
    approved: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-600',
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-xs text-gray-400 hover:text-charcoal transition-colors">← Admin Dashboard</Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Aadhaar Verification</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve Aadhaar identity submissions.</p>
          </div>
        </div>

        {/* Verified users summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <p className="text-sm font-bold text-charcoal mb-3">Verified Users</p>
          <div className="flex flex-wrap gap-3">
            {verifiedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 bg-[#f9f9f7] rounded-full px-3 py-1.5">
                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-medium text-charcoal">{u.name}</span>
                <span className="text-[10px] text-gray-400">**** {u.aadhaarLast4}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
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
                  {requests.filter((r) => r.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                <i className="ri-shield-user-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-charcoal mb-2">No requests</h3>
              <p className="text-sm text-gray-500">All Aadhaar submissions have been processed.</p>
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
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.userRole === 'owner' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {r.userRole === 'owner' ? 'Landlord' : 'Tenant'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-charcoal mb-1">{r.userName}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                        <p>Aadhaar Name: <span className="font-medium text-charcoal">{r.aadhaarName}</span></p>
                        <p>Aadhaar Number: <span className="font-medium text-charcoal">{r.aadhaarNumber}</span></p>
                        <p>Match Score: <span className={`font-bold ${r.matchScore >= 80 ? 'text-green-600' : r.matchScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{r.matchScore}%</span></p>
                        <p>Submitted: <span className="font-medium text-charcoal">{new Date(r.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
                      </div>
                      {r.rejectionReason && (
                        <p className="text-xs text-red-500 mt-2">Reason: {r.rejectionReason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="flex-shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer whitespace-nowrap"
                    >
                      {expandedId === r.id ? 'Close' : 'Review'}
                    </button>
                  </div>

                  {expandedId === r.id && r.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(r.id, 'approved')}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Approve Verification
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected', 'Name mismatch — profile name differs from Aadhaar.')}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject — Name Mismatch
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected', 'Image too blurry — all 4 corners not visible.')}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject — Blurry Image
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected', 'Aadhaar number failed UIDAI checksum validation.')}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject — Invalid Aadhaar
                        </button>
                      </div>
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