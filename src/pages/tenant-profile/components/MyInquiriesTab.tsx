import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantConnectionRequests } from '@/hooks/useConnectionRequests';
import { useContactRateLimit } from '@/hooks/useContactRateLimit';
import { useToast } from '@/hooks/useToast';

export type RequestStatus = 'pending' | 'approved' | 'declined';

const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved — Chat Unlocked',
  declined: 'Declined',
};

const statusStyles: Record<RequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-green-50 text-green-700 border-green-100',
  declined: 'bg-red-50 text-red-500 border-red-100',
};

const statusIcons: Record<RequestStatus, string> = {
  pending: 'ri-time-line',
  approved: 'ri-checkbox-circle-fill',
  declined: 'ri-close-circle-line',
};

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MyInquiriesTab() {
  const { user } = useAuth();
  const contactRate = useContactRateLimit(user?.id);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitSubmitted, setVisitSubmitted] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitEmail, setVisitEmail] = useState('');
  const [visitNote, setVisitNote] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitError, setVisitError] = useState('');
  const [activeReq, setActiveReq] = useState<{ listingTitle: string; listingLocation: string; listingPrice: number; requestedAt: string; listingId: string; status: RequestStatus } | null>(null);
  const { addToast } = useToast();

  const { requests, loading } = useTenantConnectionRequests(user?.id);

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  ];
  const today = new Date().toISOString().split('T')[0];

  const openVisitModal = (req: typeof activeReq) => {
    if (!req) return;
    setActiveReq(req);
    setVisitOpen(true);
    setVisitDate('');
    setVisitTime('');
    setVisitName(user?.name ?? '');
    setVisitPhone(user?.phone ?? '');
    setVisitEmail(user?.email ?? '');
    setVisitNote('');
    setVisitError('');
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate || !visitTime || !visitName || !visitPhone || !visitEmail) {
      setVisitError('Please fill in all required fields.');
      return;
    }
    setVisitError('');
    setVisitSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setVisitSubmitted(true);
      setVisitOpen(false);
      addToast('Visit scheduled! We\'ll confirm shortly.', 'success');
      setTimeout(() => setVisitSubmitted(false), 5000);
    } finally {
      setVisitSubmitting(false);
    }
  };

  const filterTabs: { id: RequestStatus | 'all'; label: string }[] = [
    { id: 'all', label: `All (${requests.length})` },
    { id: 'pending', label: `Pending (${requests.filter((r) => r.status === 'pending').length})` },
    { id: 'approved', label: `Approved (${requests.filter((r) => r.status === 'approved').length})` },
    { id: 'declined', label: 'Declined' },
  ];

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-brand text-xl" />
          <span className="text-sm text-gray-500">Loading your requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Visit booked toast */}
      {visitSubmitted && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <i className="ri-calendar-check-line" /> Visit scheduled! We&apos;ll confirm shortly.
        </div>
      )}

      {/* Rate limit status bar */}
      {contactRate.canSend && (
        <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand/10 flex-shrink-0">
              <i className="ri-user-received-line text-brand text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">Contact Limits</p>
              <p className="text-xs text-gray-500">
                {contactRate.dailyRemaining} of {user ? 5 : 3} daily contacts remaining · {contactRate.weeklyRemaining} of {user ? 20 : 10} weekly contacts remaining
                {contactRate.isServerEnforced && <span className="ml-1 text-green-600 font-medium">· Server-enforced</span>}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-brand bg-white px-3 py-1.5 rounded-full whitespace-nowrap">
            {contactRate.dailyRemaining} today · {contactRate.weeklyRemaining} this week
          </span>
        </div>
      )}

      {!contactRate.canSend && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
            <i className="ri-error-warning-line text-red-500 text-sm" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Contact limit reached</p>
            <p className="text-xs text-red-600 mt-0.5">{contactRate.limitReason}</p>
            {contactRate.isServerEnforced && (
              <p className="text-xs text-gray-500 mt-0.5">This limit is enforced server-side and cannot be bypassed.</p>
            )}
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {visitOpen && activeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-charcoal">Schedule a Visit</h3>
                <p className="text-xs text-gray-400 mt-0.5">{activeReq.listingTitle}</p>
              </div>
              <button onClick={() => setVisitOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>
            <form data-readdy-form id="inquiries-visit-form" onSubmit={handleVisitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Preferred Date <span className="text-red-400">*</span></label>
                  <input type="date" name="date" min={today} value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Preferred Time <span className="text-red-400">*</span></label>
                  <select name="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer">
                    <option value="">Select time</option>
                    {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" name="name" placeholder="Your full name" value={visitName} onChange={(e) => setVisitName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={visitPhone} onChange={(e) => setVisitPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email <span className="text-red-400">*</span></label>
                <input type="email" name="email" placeholder="your@email.com" value={visitEmail} onChange={(e) => setVisitEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Note <span className="text-gray-300">(optional)</span></label>
                <textarea name="note" placeholder="Any questions?" value={visitNote} onChange={(e) => setVisitNote(e.target.value)} rows={3} maxLength={500}
                  className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
              </div>
              {visitError && <p className="text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line" /> {visitError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setVisitOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Cancel
                </button>
                <button type="submit" disabled={visitSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60">
                  {visitSubmitting ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-calendar-check-line" />}
                  {visitSubmitting ? 'Booking...' : 'Confirm Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-charcoal">My Connection Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track the status of your requests to property owners</p>
        </div>
        <Link
          to="/listings"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-search-line text-sm" /> Browse More
        </Link>
      </div>

      {/* How it works */}
      <div className="bg-[#f9f9f7] border border-gray-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand/10 flex-shrink-0">
          <i className="ri-shield-check-line text-brand text-sm" />
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">How it works</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            You send a request to the owner. They review your profile and decide to approve or decline. Once approved, you can chat directly through Bhavan. Your phone number stays private throughout.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filter === tab.id ? 'bg-brand text-white' : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((req) => (
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
                <div className="flex items-center gap-1 text-xs font-bold flex-shrink-0">
                  <i className={`${statusIcons[req.status]} text-sm`} />
                  <span className="hidden sm:inline">{statusLabels[req.status]}</span>
                </div>
              </div>

              {/* My message preview */}
              <div className="mt-3 p-3 bg-white/60 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">Your message:</p>
                <p className="text-sm text-charcoal leading-relaxed">&ldquo;{req.prospectMessage}&rdquo;</p>
              </div>

              {/* Status-specific actions */}
              {req.status === 'pending' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                  <i className="ri-time-line" />
                  The owner is reviewing your request. You&apos;ll be notified once they respond.
                </div>
              )}

              {req.status === 'approved' && (
                <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                    <i className="ri-checkbox-circle-fill text-sm" />
                    Owner approved! You can now chat and schedule a visit.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openVisitModal(req)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-calendar-check-line text-xs" /> Schedule Visit
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-message-3-line text-xs" /> Open Chat
                    </button>
                  </div>
                </div>
              )}

              {req.status === 'declined' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                  <i className="ri-close-circle-line" />
                  This request was not approved. Browse other listings to find your perfect home.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-[#f9f9f7] rounded-full">
            <i className="ri-inbox-line text-2xl text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-charcoal mb-2">No requests here</h3>
          <p className="text-sm text-gray-500">
            {filter === 'pending' ? 'You have no pending requests.' : `No ${filter} requests yet.`}
          </p>
          <Link
            to="/listings"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap"
          >
            <i className="ri-search-line text-sm" /> Browse Listings
          </Link>
        </div>
      )}
    </div>
  );
}
