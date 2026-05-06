import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSavedListings } from '@/hooks/useListings';
import { useRentPayment } from '@/hooks/useRentPayment';
import NotificationBell from '@/pages/owner-profile/components/NotificationBell';
import { useToast } from '@/hooks/useToast';
import RequestsTab from './components/RequestsTab';

import { useBrokerReport } from '@/hooks/useBrokerReport';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import ChannelPreferences from '@/pages/notifications/components/ChannelPreferences';
import SoftBlockModal from '@/pages/listing-detail/components/SoftBlockModal';

type ProfileTab = 'overview' | 'saved' | 'requests' | 'documents' | 'settings' | 'payments';

function NotificationToggle({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${on ? 'bg-brand' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function TenantProfile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const { addToast } = useToast();
  const { listings: savedListingsFromDB, loading: savedLoading, refresh: refreshSaved } = useSavedListings(user?.id);
  const brokerReport = useBrokerReport(user?.id);
  const [softBlockModalOpen, setSoftBlockModalOpen] = useState(false);
  const navigate = useNavigate();

  const { requests: maintRequestsFromDB } = useMaintenanceRequests(user?.id);
  const {
    tenantPayments,
    mandates: userMandates,
    getMandateForTenant,
  } = useRentPayment();

  const myPayments = user?.id ? tenantPayments(user.id) : [];
  const myMandate = user?.id ? getMandateForTenant(user.id) : null;

  const [formName, setFormName] = useState(user?.name ?? '');
  const [formPhone, setFormPhone] = useState(user?.phone ?? '');
  const [formEmail, setFormEmail] = useState(user?.email ?? '');
  const [formDob, setFormDob] = useState(user?.dateOfBirth ?? '');
  const [formOccupation, setFormOccupation] = useState(user?.occupation ?? '');
  const [formEmergency, setFormEmergency] = useState(user?.emergencyContact ?? '');
  const [formMoveIn, setFormMoveIn] = useState(user?.moveInDate ?? '');
  const [formFlat, setFormFlat] = useState(user?.currentFlat ?? '');

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
            <i className="ri-user-line text-2xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">Not signed in</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to view your profile.</p>
          <Link to="/login" className="bg-brand text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name: formName,
      phone: formPhone,
      email: formEmail,
      dateOfBirth: formDob,
      occupation: formOccupation,
      emergencyContact: formEmergency,
      moveInDate: formMoveIn,
      currentFlat: formFlat,
    });
    setSaving(false);
    setEditMode(false);
  };

  const handleUnsave = async (id: string, title: string) => {
    if (!user?.id) return;
    const supabase = (await import('@/lib/supabase')).getSupabase();
    if (!supabase) return;
    const { error: dbError } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', id);
    if (dbError) {
      addToast('Failed to remove listing', 'error');
      return;
    }
    refreshSaved();
    addToast(`"${title}" removed from saved listings`, 'success');
  };

  const tabs: { id: ProfileTab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'ri-home-4-line' },
    { id: 'saved', label: 'Saved Listings', icon: 'ri-bookmark-line', badge: savedListingsFromDB.length },
    { id: 'requests', label: 'Requests', icon: 'ri-tools-line' },
    { id: 'documents', label: 'Documents', icon: 'ri-file-text-line' },
    { id: 'payments', label: 'Rent Payment', icon: 'ri-money-rupee-circle-line' },
    { id: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ];

  // Count upcoming rent due
  const today = new Date();
  const rentDueDay = 5;
  const daysUntilRentDue = rentDueDay - today.getDate() > 0 ? rentDueDay - today.getDate() : 30 + rentDueDay - today.getDate();

  // Maintenance counts
  const activeMaint = maintRequestsFromDB.filter((r) => r.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 md:h-44 relative overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20architecture%20clean%20minimal%20warm%20tones%20urban%20India%20residential%20complex%20beautiful%20facade&width=1200&height=300&seq=tenant-cover-1&orientation=landscape"
              alt="cover"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 relative">
              {/* Avatar */}
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-brand/20 border-4 border-white flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-brand">{initials}</span>
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-charcoal">{user.name}</h1>
                    {user.verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                        <i className="ri-shield-check-fill text-xs" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Tenant · Member since {user.joinedAt}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pb-1">
                <NotificationBell />
                {!editMode ? (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setFormName(user.name);
                      setFormPhone(user.phone ?? '');
                      setFormEmail(user.email);
                      setFormDob(user.dateOfBirth ?? '');
                      setFormOccupation(user.occupation ?? '');
                      setFormEmergency(user.emergencyContact ?? '');
                      setFormMoveIn(user.moveInDate ?? '');
                      setFormFlat(user.currentFlat ?? '');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line text-sm" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { handleSave(); addToast('Profile updated successfully', 'success'); }}
                      className="px-4 py-2 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Broker soft-block warning */}
            {brokerReport.isSoftBlocked && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
                    <i className="ri-error-warning-line text-red-600" />
                  </div>
                  <p className="text-sm font-semibold text-red-700">
                    Account restricted — owners reported suspicious activity
                  </p>
                </div>
                <button onClick={() => setSoftBlockModalOpen(true)} className="text-sm font-bold text-red-600 hover:text-red-700 whitespace-nowrap flex items-center gap-1 cursor-pointer">
                  Resolve <i className="ri-arrow-right-line" />
                </button>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
              {[
                { label: 'Current Flat', value: user.currentFlat || 'Not set', icon: 'ri-home-4-line', color: 'text-brand', tab: 'overview' as ProfileTab },
                { label: 'Saved Listings', value: String(savedListingsFromDB.length), icon: 'ri-bookmark-line', color: 'text-green-600', tab: 'saved' as ProfileTab },
                { label: 'Active Requests', value: String(activeMaint), icon: 'ri-tools-line', color: 'text-orange-500', tab: 'requests' as ProfileTab },
              ].map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setActiveTab(stat.tab)}
                  className="bg-[#f9f9f7] rounded-xl p-3 text-left hover:bg-brand/5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 flex items-center justify-center mb-1.5">
                    <i className={`${stat.icon} text-base ${stat.color}`} />
                  </div>
                  <p className="text-sm font-bold text-charcoal">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </button>
              ))}
              <button
                onClick={() => navigate('/rent-payment')}
                className="bg-[#f9f9f7] rounded-xl p-3 text-left hover:bg-brand/5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 flex items-center justify-center mb-1.5">
                  <i className="ri-money-rupee-circle-line text-base text-red-500" />
                </div>
                <p className="text-sm font-bold text-charcoal">Pay Rent</p>
                <p className="text-xs text-gray-500 mt-0.5">{daysUntilRentDue <= 3 ? `${daysUntilRentDue}d left` : 'Rent Payment'}</p>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1.5 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 md:flex-1 ${
                activeTab === tab.id
                  ? 'bg-brand text-white'
                  : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-brand' : 'bg-brand text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-user-line text-brand" />
                  </div>
                  Personal Information
                </h2>
                {editMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: formName, setter: setFormName },
                      { label: 'Email', value: formEmail, setter: setFormEmail, type: 'email' },
                      { label: 'Phone', value: formPhone, setter: setFormPhone },
                      { label: 'Date of Birth', value: formDob, setter: setFormDob },
                      { label: 'Occupation', value: formOccupation, setter: setFormOccupation },
                      { label: 'Emergency Contact', value: formEmergency, setter: setFormEmergency },
                      { label: 'Move-In Date', value: formMoveIn, setter: setFormMoveIn },
                      { label: 'Current Flat', value: formFlat, setter: setFormFlat },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: user.name, icon: 'ri-user-line' },
                      { label: 'Email', value: user.email, icon: 'ri-mail-line' },
                      { label: 'Phone', value: user.phone ?? 'Not added', icon: 'ri-phone-line' },
                      { label: 'Date of Birth', value: user.dateOfBirth ?? 'Not added', icon: 'ri-cake-line' },
                      { label: 'Occupation', value: user.occupation ?? 'Not added', icon: 'ri-briefcase-line' },
                      { label: 'Emergency Contact', value: user.emergencyContact ?? 'Not added', icon: 'ri-contacts-book-line' },
                      { label: 'Current Flat', value: user.currentFlat ?? 'Not added', icon: 'ri-home-4-line' },
                      { label: 'Move-In Date', value: user.moveInDate ?? 'Not added', icon: 'ri-calendar-check-line' },
                      { label: 'Aadhaar', value: user.aadhaarLast4 ? `XXXX XXXX ${user.aadhaarLast4}` : 'Not verified', icon: 'ri-shield-user-line' },
                      { label: 'Member Since', value: user.joinedAt, icon: 'ri-time-line' },
                    ].map((field) => (
                      <div key={field.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand/10 flex-shrink-0 mt-0.5">
                          <i className={`${field.icon} text-sm text-brand`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">{field.label}</p>
                          <p className="text-sm font-semibold text-charcoal mt-0.5">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Flat Card - only show if set */}
              {user.currentFlat && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-home-4-line text-brand" />
                    </div>
                    Current Flat
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f9f9f7] rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium">Property</p>
                      <p className="text-sm font-bold text-charcoal mt-1">Prestige Towers</p>
                      <p className="text-xs text-gray-500 mt-0.5">Koramangala, Bangalore</p>
                    </div>
                    <div className="bg-[#f9f9f7] rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium">Flat / Unit</p>
                      <p className="text-sm font-bold text-charcoal mt-1">{user.currentFlat}</p>
                      <p className="text-xs text-gray-500 mt-0.5">2 BHK · 1150 sqft</p>
                    </div>
                    <div className="bg-[#f9f9f7] rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium">Landlord</p>
                      <p className="text-sm font-bold text-charcoal mt-1">Suresh Patel</p>
                      <p className="text-xs text-gray-500 mt-0.5">+91-98450-12345</p>
                    </div>
                    <div className="bg-[#f9f9f7] rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium">Lease Period</p>
                      <p className="text-sm font-bold text-charcoal mt-1">Jan 2025 — Dec 2026</p>
                      <p className="text-xs text-gray-500 mt-0.5">11 months remaining</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Verification Status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-charcoal mb-4">Verification Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email Verified', done: true, icon: 'ri-mail-check-line' },
                    { label: 'Phone Verified', done: !!user.phone, icon: 'ri-smartphone-line' },
                    { label: 'Aadhaar Verified', done: user.verified, icon: 'ri-shield-check-line' },
                    { label: 'Rental Agreement', done: false, icon: 'ri-file-text-line' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${item.done ? 'bg-green-50' : 'bg-gray-100'}`}>
                          <i className={`${item.icon} text-sm ${item.done ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <span className="text-sm text-charcoal font-medium">{item.label}</span>
                      </div>
                      {item.done ? (
                        <i className="ri-checkbox-circle-fill text-green-500 text-base" />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-charcoal mb-4">Quick Actions</h3>
                <div className="space-y-1">
                  {[
                    { to: '/rent-payment', icon: 'ri-money-rupee-circle-line', label: 'Pay Rent', color: 'bg-red-50 text-red-500' },
                    { to: '/aadhaar-verify', icon: 'ri-shield-check-line', label: 'Aadhaar Verify', color: 'bg-green-50 text-green-600' },
                    { to: '/feedback', icon: 'ri-star-line', label: 'Write a Review', color: 'bg-orange-50 text-orange-500' },
                    { to: '/community', icon: 'ri-discuss-line', label: 'Community Forum', color: 'bg-teal-50 text-teal-600' },
                  ].map((action) => (
                    <Link key={action.to} to={action.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f9f9f7] transition-colors cursor-pointer">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${action.color}`}>
                        <i className={`${action.icon} text-sm`} />
                      </div>
                      <span className="text-sm font-medium text-charcoal">{action.label}</span>
                      <div className="w-4 h-4 flex items-center justify-center ml-auto">
                        <i className="ri-arrow-right-s-line text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Lease countdown - only if flat is set */}
              {user.currentFlat && (
                <button
                  onClick={() => setLeaseModalOpen(true)}
                  className="w-full text-left bg-amber-50 border border-amber-100 rounded-2xl p-5 hover:border-amber-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-calendar-event-line text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-amber-800">Lease Renewal</h3>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Your lease expires in <strong>December 2026</strong>. Contact your landlord at least 2 months before to discuss renewal terms.
                  </p>
                  <div className="mt-3 text-xs font-semibold text-amber-700 flex items-center gap-1 group-hover:text-amber-800 whitespace-nowrap">
                    Open Details <i className="ri-arrow-right-line" />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-charcoal">Saved Listings</h2>
                <p className="text-sm text-gray-500 mt-0.5">{savedListingsFromDB.length} properties bookmarked</p>
              </div>
              <Link to="/listings" className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-search-line text-sm" /> Browse More
              </Link>
            </div>
            {savedLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-loader-4-line animate-spin text-brand text-3xl" />
                </div>
                <p className="text-gray-500 text-sm">Loading saved listings...</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedListingsFromDB.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand/30 transition-all group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <button
                      onClick={() => handleUnsave(listing.id, listing.title)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer group"
                      title="Remove from saved"
                    >
                      <i className="ri-bookmark-fill text-brand text-sm group-hover:hidden" />
                      <i className="ri-close-line text-red-500 text-sm hidden group-hover:flex" />
                    </button>
                    {listing.verified && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                        <i className="ri-shield-check-fill text-[10px]" /> Verified
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                        {(listing.property_type ?? 'apartment').charAt(0).toUpperCase() + (listing.property_type ?? 'apartment').slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-charcoal leading-snug">{listing.title}</h3>
                      <p className="text-sm font-bold text-brand whitespace-nowrap">₹{listing.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <i className="ri-map-pin-line text-xs" /> {listing.location ?? listing.city ?? 'Unknown'}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-hotel-bed-line text-xs" />
                        {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} BHK`}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-drop-line text-xs" /> {listing.bathrooms ?? 1} Bath
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-ruler-line text-xs" /> {listing.area_sqft ?? 0} sqft
                      </span>
                      {listing.furnished && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <i className="ri-checkbox-circle-line text-xs" /> Furnished
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-2 flex-1">
                        <img src={listing.owner?.avatar_url ?? 'https://readdy.ai/api/search-image?query=generic%20professional%20user%20avatar%20icon%20flat%20minimal%20neutral%20background&width=80&height=80&seq=avatar-fallback&orientation=squarish'} alt={listing.owner?.name ?? 'Owner'} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{listing.owner?.name ?? 'Owner'}</span>
                      </div>
                      <Link
                        to={`/listings/${listing.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors cursor-pointer whitespace-nowrap"
                      >
                        View <i className="ri-arrow-right-line text-xs" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            {savedListingsFromDB.length === 0 && !savedLoading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                  <i className="ri-bookmark-line text-2xl text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No saved listings yet</h3>
                <p className="text-sm text-gray-500 mb-5">Browse properties and bookmark the ones you like.</p>
                <Link to="/listings" className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
                  Browse Listings
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && <RequestsTab tenantId={user.id} />}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* My Rental Agreements */}
            <div>
              <h2 className="text-base font-bold text-charcoal mb-1">My Rental Agreements</h2>
              <p className="text-sm text-gray-500 mb-3">Agreements shared by your landlord</p>
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                  <i className="ri-file-list-3-line text-2xl text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No agreements yet</h3>
                <p className="text-sm text-gray-500 mb-5">Agreements will appear here once your landlord shares them.</p>
                <Link to="/rental-agreements" className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                  Browse Agreements
                </Link>
              </div>
            </div>

            {/* Rent Receipts */}
            <div>
              <h2 className="text-base font-bold text-charcoal mb-1">Rent Receipts</h2>
              <p className="text-sm text-gray-500 mb-3">Receipts generated by your landlord</p>
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-green-50 rounded-full">
                  <i className="ri-receipt-line text-2xl text-green-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No receipts yet</h3>
                <p className="text-sm text-gray-500 mb-5">Receipts will appear here once generated.</p>
                <Link to="/rent-receipts" className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
                  Generate Receipts
                </Link>
              </div>
            </div>

            {/* Tax & Legal Forms */}
            <div>
              <h2 className="text-base font-bold text-charcoal mb-1">Tax &amp; Legal Forms</h2>
              <p className="text-sm text-gray-500 mb-3">Documents for your tax filing and legal compliance</p>
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-teal-50 rounded-full">
                  <i className="ri-government-line text-2xl text-teal-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No documents yet</h3>
                <p className="text-sm text-gray-500 mb-5">Generate tax and legal forms once your rent payments begin.</p>
                <Link to="/tax-forms" className="bg-teal-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors whitespace-nowrap">
                  Generate Documents
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Rent Due Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-money-rupee-circle-line text-brand" />
                  </div>
                  Rent Summary
                </h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${daysUntilRentDue <= 3 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {daysUntilRentDue <= 3 ? 'Due Soon' : 'On Track'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#f9f9f7] rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium">Monthly Rent</p>
                  <p className="text-xl font-bold text-charcoal mt-1">₹22,000</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due on 5th of every month</p>
                </div>
                <div className="bg-[#f9f9f7] rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium">Days Until Due</p>
                  <p className="text-xl font-bold text-charcoal mt-1">{daysUntilRentDue} days</p>
                  <p className="text-xs text-gray-500 mt-0.5">Next: 5 May 2026</p>
                </div>
                <div className="bg-[#f9f9f7] rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium">Property</p>
                  <p className="text-xl font-bold text-charcoal mt-1">Prestige Towers</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.currentFlat || 'Not set'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link to="/rent-payment" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap">
                  <i className="ri-qr-code-line" /> Pay Rent Now
                </Link>
                <Link to="/rent-payment?tab=autopay" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors whitespace-nowrap">
                  <i className="ri-refresh-line" /> Setup AutoPay
                </Link>
              </div>
            </div>

            {/* UPI AutoPay Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-refresh-line text-brand" />
                </div>
                UPI AutoPay
              </h2>
              {myMandate ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#f9f9f7] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${myMandate.status === 'active' ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <i className={`ri-smartphone-line text-lg ${myMandate.status === 'active' ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{myMandate.upi_id}</p>
                        <p className="text-xs text-gray-500">{myMandate.bank_account}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${myMandate.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {myMandate.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-[#f9f9f7] rounded-xl">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-gray-100 rounded-full">
                    <i className="ri-refresh-line text-xl text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-charcoal mb-1">No AutoPay setup</p>
                  <p className="text-xs text-gray-500 mb-4">Enable UPI AutoPay to pay rent automatically every month</p>
                  <Link to="/rent-payment?tab=autopay" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
                    <i className="ri-add-line" /> Setup AutoPay
                  </Link>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-history-line text-brand" />
                  </div>
                  Payment History
                </h2>
                <Link to="/rent-payment?tab=history" className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors whitespace-nowrap flex items-center gap-1">
                  View All <i className="ri-arrow-right-line" />
                </Link>
              </div>
              {myPayments.length > 0 ? (
                <div className="space-y-2">
                  {myPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3.5 bg-[#f9f9f7] rounded-xl hover:bg-brand/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                          payment.status === 'paid' ? 'bg-green-50' :
                          payment.status === 'failed' ? 'bg-red-50' :
                          payment.status === 'reconciled' ? 'bg-blue-50' :
                          'bg-amber-50'
                        }`}>
                          <i className={`${
                            payment.payment_mode === 'upi_autopay' ? 'ri-refresh-line' :
                            payment.payment_mode === 'upi_qr' ? 'ri-qr-code-line' :
                            payment.payment_mode === 'bank_transfer' ? 'ri-bank-line' :
                            'ri-hand-coin-line'
                          } text-sm ${
                            payment.status === 'paid' ? 'text-green-600' :
                            payment.status === 'failed' ? 'text-red-600' :
                            payment.status === 'reconciled' ? 'text-blue-600' :
                            'text-amber-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-charcoal">₹{payment.amount.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {' · '}
                            {payment.payment_mode === 'upi_autopay' ? 'UPI AutoPay' :
                             payment.payment_mode === 'upi_qr' ? 'UPI QR' :
                             payment.payment_mode === 'bank_transfer' ? 'Bank Transfer' :
                             'Offline'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-50 text-green-600' :
                        payment.status === 'failed' ? 'bg-red-50 text-red-600' :
                        payment.status === 'reconciled' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#f9f9f7] rounded-xl">
                  <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                    <i className="ri-history-line text-2xl text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No payment history yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <NotificationToggle label="Maintenance Updates" desc="Get notified when your request status changes" defaultOn />
                <NotificationToggle label="Rent Reminders" desc="Monthly reminder before rent due date" defaultOn />
                <NotificationToggle label="Lease Renewal Alerts" desc="Alert 60 days before lease expiry" defaultOn />
                <NotificationToggle label="Community Posts" desc="New posts in your area" />
                <NotificationToggle label="Promotional Emails" desc="Tips, guides and platform updates" />
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-signal-tower-line text-brand" />
                </div>
                Delivery Channels
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose how you receive each type of notification. If push fails, SMS and email fallbacks activate automatically.
              </p>
              <ChannelPreferences />
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4">Security</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f9f9f7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand/10">
                      <i className="ri-lock-password-line text-sm text-brand" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-charcoal">Change Password</p>
                      <p className="text-xs text-gray-400">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f9f9f7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50">
                      <i className="ri-smartphone-line text-sm text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-charcoal">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400">Add extra security to your account</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400" />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <h2 className="text-base font-bold text-red-600 mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors cursor-pointer text-left">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 flex-shrink-0">
                    <i className="ri-delete-bin-line text-sm text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600">Delete Account</p>
                    <p className="text-xs text-gray-400">Permanently remove your account and all data</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lease Renewal Modal */}
      {leaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setLeaseModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-amber-50 p-5 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-100">
                    <i className="ri-calendar-event-line text-lg text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Lease Renewal</h3>
                    <p className="text-xs text-gray-500">{user.currentFlat || 'Not set'}, Prestige Towers, Bangalore</p>
                  </div>
                </div>
                <button
                  onClick={() => setLeaseModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[{ value: '243', label: 'Days Left' }, { value: '8', label: 'Months' }, { value: 'Oct', label: 'Renew By' }].map((item) => (
                  <div key={item.label} className="bg-[#f9f9f7] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-charcoal">{item.value}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lease Start</span>
                  <span className="font-medium text-charcoal">1 January 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lease End</span>
                  <span className="font-medium text-charcoal">31 December 2026</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Monthly Rent</span>
                  <span className="font-medium text-charcoal">₹22,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-medium text-charcoal">₹44,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Landlord</span>
                  <span className="font-medium text-charcoal">Suresh Patel</span>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <Link to="/rental-agreements" onClick={() => setLeaseModalOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap">
                  <i className="ri-file-text-line" /> Open Rental Agreements
                </Link>
                <button
                  onClick={() => { setReminderSet(true); setTimeout(() => { setReminderSet(false); setLeaseModalOpen(false); }, 1500); }}
                  disabled={reminderSet}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors whitespace-nowrap disabled:opacity-70"
                >
                  {reminderSet ? <><i className="ri-check-line" /> Reminder Set</> : <><i className="ri-notification-3-line" /> Set Renewal Reminder</>}
                </button>
                <button onClick={() => setLeaseModalOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-charcoal transition-colors whitespace-nowrap cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}