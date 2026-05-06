import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useOwnerRateLimit } from '@/hooks/useOwnerRateLimit';
import QRCodeModal from './components/QRCodeModal';
import EditListingModal from './components/EditListingModal';
import RentalAgreementModal from './components/RentalAgreementModal';
import NotificationBell from './components/NotificationBell';
import RequestsTab from './components/RequestsTab';
import InquiriesTab from './components/InquiriesTab';
import ChatTab from './components/ChatTab';
import { useOwnerListings, type ListingFromDB } from '@/hooks/useListings';
import ChannelPreferences from '@/pages/notifications/components/ChannelPreferences';
import { useToast } from '@/hooks/useToast';

type ProfileTab = 'overview' | 'properties' | 'listings' | 'tenants' | 'inquiries' | 'messages' | 'requests' | 'documents' | 'billing' | 'settings';

function formatINR(num: number): string {
  return `\u20b9${num.toLocaleString('en-IN')}`;
}

function NotificationToggle({ label, desc, defaultOn = false, activeColor = 'bg-amber-500' }: { label: string; desc: string; defaultOn?: boolean; activeColor?: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${on ? activeColor : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// For new users: no mock rental agreements
const rentalAgreements: any[] = [];

function getUnitsByProperty(_propertyId: string) {
  return [];
}

function getPropertyRentTotal(_propertyId: string) {
  return 0;
}

interface Property {
  id: string;
  name: string;
  address: string;
  image: string;
  status: string;
  listingIds: string[];
}

export default function OwnerProfile() {
  const { user, updateProfile } = useAuth();
  const { isPro, plan, status, nextBillingDate, isInGracePeriod, isInTrial, trialDaysLeft, totalSpent, billingHistory, cancelSubscription, toggleAutoRenew } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);

  // Real data hooks for new users (empty initially)
  const { listings: myListingsFromDB, loading: listingsLoading } = useOwnerListings(user?.id);

  const [qrModalListing, setQrModalListing] = useState<ListingFromDB | null>(null);
  const [editModalListing, setEditModalListing] = useState<ListingFromDB | null>(null);
  const [deleteListing, setDeleteListing] = useState<ListingFromDB | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deactivatedIds, setDeactivatedIds] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const { addToast } = useToast();
  const { inquiry, chat, community } = useOwnerRateLimit(user?.id);

  const [formName, setFormName] = useState(user?.name ?? '');
  const [formPhone, setFormPhone] = useState(user?.phone ?? '');
  const [formEmail, setFormEmail] = useState(user?.email ?? '');
  const [formDob, setFormDob] = useState(user?.dateOfBirth ?? '');
  const [formOccupation, setFormOccupation] = useState(user?.occupation ?? '');
  const [formEmergency, setFormEmergency] = useState(user?.emergencyContact ?? '');
  const [formMoveIn, setFormMoveIn] = useState(user?.moveInDate ?? '');
  const [formFlat, setFormFlat] = useState(user?.currentFlat ?? '');

  const [properties, setProperties] = useState<Property[]>([]);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>();
  const [listingsFilterProperty, setListingsFilterProperty] = useState<string | null>(null);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [viewAgreementTenantId, setViewAgreementTenantId] = useState<string | null>(null);

  const startEditProperty = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropertyForm({ ...prop });
  };

  const cancelEditProperty = () => {
    setEditingPropertyId(null);
    setPropertyForm({});
  };

  const saveEditProperty = () => {
    if (!editingPropertyId || !propertyForm?.name || !propertyForm?.address) return;
    setProperties((prev) =>
      prev.map((p) =>
        p.id === editingPropertyId
          ? {
              ...p,
              name: propertyForm.name ?? p.name,
              address: propertyForm.address ?? p.address,
            }
          : p
      )
    );
    setEditingPropertyId(null);
    setPropertyForm({});
    addToast('Property updated successfully', 'success');
  };

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

  const pendingInquiries = 0; // No inquiries for new users

  const handleSave = async () => {
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
    setEditMode(false);
    addToast('Profile updated successfully', 'success');
  };

  const tenantRows: any[] = []; // Empty for new users
  const totalIncome = `\u20b9${0}`; // No income for new users
  const urgentRequests = 0; // No requests for new users
  const pendingRequests = 0; // No pending requests for new users

  const tabs: { id: ProfileTab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'ri-home-4-line' },
    { id: 'properties', label: 'Properties', icon: 'ri-building-line' },
    { id: 'listings', label: 'My Listings', icon: 'ri-list-check-3' },
    { id: 'tenants', label: 'Tenants', icon: 'ri-group-line', badge: tenantRows.length },
    { id: 'inquiries', label: 'Inquiries', icon: 'ri-message-3-line', badge: pendingInquiries },
    { id: 'messages', label: 'Messages', icon: 'ri-chat-3-line' },
    { id: 'requests', label: 'Requests', icon: 'ri-tools-line', badge: pendingRequests },
    { id: 'documents', label: 'Documents', icon: 'ri-folder-line' },
    { id: 'billing', label: 'Billing', icon: 'ri-bill-line' },
    { id: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ];

  const myListings = myListingsFromDB
    .filter((l) => !deletedIds.has(l.id))
    .filter((l) => {
      if (!listingsFilterProperty) return true;
      const prop = properties.find((p) => p.id === listingsFilterProperty);
      return prop ? prop.listingIds.includes(l.id) : true;
    });

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        <QRCodeModal listing={qrModalListing} onClose={() => setQrModalListing(null)} />
        {viewAgreementTenantId && (
          <RentalAgreementModal
            agreement={rentalAgreements.find((a) => a.tenantId === viewAgreementTenantId) ?? null}
            tenantName={tenantRows.find((t) => t.id === viewAgreementTenantId)?.name ?? ''}
            onClose={() => setViewAgreementTenantId(null)}
          />
        )}
        <EditListingModal
          listing={editModalListing}
          onClose={() => setEditModalListing(null)}
          onSave={(updated) => { setEditModalListing(null); }}
        />

        {/* Delete listing modal */}
        {deleteListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteListing(null)} />
            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <i className="ri-delete-bin-line text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-charcoal text-center mb-2">Delete Listing?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete <strong className="text-charcoal">{deleteListing.title}</strong>? This action <strong>cannot be undone</strong>.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteListing(null)} className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  onClick={() => { setDeletedIds((prev) => new Set(prev).add(deleteListing.id)); addToast('Listing deleted successfully', 'success'); setDeleteListing(null); }}
                  className="flex-1 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete property modal */}
        {deletePropertyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeletePropertyId(null)} />
            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <i className="ri-delete-bin-line text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-charcoal text-center mb-2">Delete Property?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete <strong className="text-charcoal">{properties.find((p) => p.id === deletePropertyId)?.name}</strong>? All associated listings will also be removed.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeletePropertyId(null)} className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  onClick={() => { setProperties((prev) => prev.filter((p) => p.id !== deletePropertyId)); addToast('Property deleted successfully', 'success'); setDeletePropertyId(null); }}
                  className="flex-1 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="h-32 md:h-44 relative overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=aerial%20view%20residential%20apartment%20complex%20buildings%20India%20urban%20city%20skyline%20property%20management%20real%20estate%20overview&width=1200&height=300&seq=owner-cover-1&orientation=landscape"
              alt="cover"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 relative">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 border-4 border-white flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-amber-600">{initials}</span>
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
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Property Owner</span>
                    {isPro && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        <i className="ri-vip-crown-line text-[10px]" /> Pro
                      </span>
                    )}
                    {!isPro && (
                      <Link to="/subscription" className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                        <i className="ri-sparkling-line text-[10px]" /> Upgrade
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Member since {user.joinedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-1">
                <NotificationBell />
                <Link to="/list-property" className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-add-line text-sm" /> List Property
                </Link>
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-edit-line text-sm" /> Edit
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">Save Changes</button>
                  </>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Total Properties', value: String(properties.length), icon: 'ri-building-line', color: 'text-amber-600' },
                { label: 'Active Listings', value: String(myListings.length), icon: 'ri-list-check-3', color: 'text-brand' },
                { label: 'Monthly Income', value: totalIncome, icon: 'ri-money-rupee-circle-line', color: 'text-green-600' },
                { label: 'Urgent Requests', value: String(urgentRequests), icon: 'ri-alarm-warning-line', color: urgentRequests > 0 ? 'text-red-500' : 'text-gray-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#f9f9f7] rounded-xl p-3">
                  <div className="w-7 h-7 flex items-center justify-center mb-1.5">
                    <i className={`${stat.icon} text-base ${stat.color}`} />
                  </div>
                  <p className="text-sm font-bold text-charcoal">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription banners */}
        {isInTrial && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
                <i className="ri-vip-crown-line text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-amber-700">
                Pro trial active — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left. <Link to="/subscription" className="underline">Upgrade now</Link> to keep Pro access.
              </p>
            </div>
          </div>
        )}
        {isInGracePeriod && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
                <i className="ri-error-warning-line text-red-600" />
              </div>
              <p className="text-sm font-semibold text-red-700">
                Payment failed — update your payment method within 7 days to keep Pro access.
              </p>
            </div>
            <Link to="/subscription" className="text-sm font-bold text-red-600 hover:text-red-700 whitespace-nowrap flex items-center gap-1">
              Update Payment <i className="ri-arrow-right-line" />
            </Link>
          </div>
        )}

        {/* Urgent alert */}
        {urgentRequests > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 flex-shrink-0">
                <i className="ri-alarm-warning-line text-red-600" />
              </div>
              <p className="text-sm font-semibold text-red-700">
                {urgentRequests} urgent maintenance request{urgentRequests > 1 ? 's' : ''} need your attention
              </p>
            </div>
            <button onClick={() => setActiveTab('requests')} className="text-sm font-bold text-red-600 hover:text-red-700 whitespace-nowrap flex items-center gap-1 cursor-pointer">
              View Requests <i className="ri-arrow-right-line" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1.5 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveChatRequestId(null); }}
              className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 md:flex-1 ${
                activeTab === tab.id ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-user-line text-amber-600" />
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
                        <input type={field.type || 'text'} value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
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
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 flex-shrink-0 mt-0.5">
                          <i className={`${field.icon} text-sm text-amber-600`} />
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
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Verification */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-charcoal mb-4">Verification Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email Verified', done: true, icon: 'ri-mail-check-line' },
                    { label: 'Phone Verified', done: !!user.phone, icon: 'ri-smartphone-line' },
                    { label: 'Aadhaar Verified', done: user.verified, icon: 'ri-shield-check-line' },
                    { label: 'Property Documents', done: true, icon: 'ri-file-text-line' },
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
                        <Link to="/aadhaar-verify" className="text-xs text-amber-600 font-semibold hover:text-amber-700 whitespace-nowrap">Verify</Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-charcoal mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { to: '/list-property', icon: 'ri-home-4-line', label: 'List a Property', color: 'bg-amber-50 text-amber-600' },
                    { to: '/rent-payment', icon: 'ri-money-rupee-circle-line', label: 'Rent Payments', color: 'bg-red-50 text-red-500' },
                    { to: '/rental-agreements', icon: 'ri-file-list-3-line', label: 'Rental Agreements', color: 'bg-orange-50 text-orange-600' },
                    { to: '/rent-receipts', icon: 'ri-file-text-line', label: 'Rent Receipts', color: 'bg-orange-50 text-orange-600' },
                    { to: '/tax-forms', icon: 'ri-government-line', label: 'Tax Forms', color: 'bg-blue-50 text-blue-600' },
                    { to: '/feedback', icon: 'ri-star-line', label: 'View Reviews', color: 'bg-brand/10 text-brand' },
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

              {/* Pending actions */}
              {pendingRequests > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-notification-3-line text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-amber-800">Action Required</h3>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    You have <strong>{pendingRequests} pending</strong> maintenance requests waiting for acknowledgement.
                  </p>
                  <button onClick={() => setActiveTab('requests')} className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer whitespace-nowrap">
                    Review Now <i className="ri-arrow-right-line" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal">My Properties</h2>
              <Link to="/list-property" className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-add-line" /> Add Property
              </Link>
            </div>

            {properties.map((prop) => (
              <div key={prop.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                    <img src={prop.image} alt={prop.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-5 flex-1">
                    {editingPropertyId === prop.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Property Name</label>
                          <input type="text" value={propertyForm?.name ?? ''} onChange={(e) => setPropertyForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-[#f9f9f7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                          <input type="text" value={propertyForm?.address ?? ''} onChange={(e) => setPropertyForm((prev) => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2 bg-[#f9f9f7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={cancelEditProperty} className="flex-1 px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                          <button onClick={saveEditProperty} className="flex-1 px-3 py-2 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap">Save Changes</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const propUnits = getUnitsByProperty(prop.id);
                          const occupiedCount = propUnits.filter((u) => u.status === 'occupied').length;
                          const vacantCount = propUnits.filter((u) => u.status === 'vacant').length;
                          const totalUnits = propUnits.length;
                          const monthlyIncome = getPropertyRentTotal(prop.id);
                          const allOccupied = occupiedCount === totalUnits && totalUnits > 0;
                          return (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-base font-bold text-charcoal">{prop.name}</h3>
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                    <i className="ri-map-pin-line text-xs" /> {prop.address}
                                  </p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${allOccupied ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {occupiedCount}/{totalUnits} occupied
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 mt-4">
                                {[
                                  { label: 'Total Units', value: String(totalUnits) },
                                  { label: 'Occupied', value: String(occupiedCount) },
                                  { label: 'Vacant', value: String(vacantCount) },
                                ].map((s) => (
                                  <div key={s.label} className="bg-[#f9f9f7] rounded-xl p-3 text-center">
                                    <p className="text-sm font-bold text-charcoal">{s.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Unit Breakdown</p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border border-gray-100 rounded-xl overflow-hidden">
                                    <thead>
                                      <tr className="bg-[#f9f9f7]">
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Unit</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Tenant</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rent</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Maint.</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Agreement</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Payment</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {propUnits.map((u) => (
                                        <tr key={u.id} className="border-t border-gray-50">
                                          <td className="px-3 py-2 text-xs font-medium text-charcoal">{u.unit_number}</td>
                                          <td className="px-3 py-2">
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${u.status === 'occupied' ? 'bg-green-50 text-green-600' : u.status === 'vacant' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                                              {u.status}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-500">{u.tenant_name ?? '—'}</td>
                                          <td className="px-3 py-2 text-xs font-medium text-charcoal">₹{u.rent_amount.toLocaleString('en-IN')}</td>
                                          <td className="px-3 py-2 text-xs text-gray-500">₹{u.maintenance_charge.toLocaleString('en-IN')}</td>
                                          <td className="px-3 py-2">
                                            {u.agreement_generated ? (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">Yes</span>
                                            ) : (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            {u.last_payment_status ? (
                                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${u.last_payment_status === 'paid' ? 'bg-green-50 text-green-600' : u.last_payment_status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {u.last_payment_status}
                                              </span>
                                            ) : (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                      {propUnits.length === 0 && (
                                        <tr><td colSpan={7} className="px-3 py-3 text-xs text-gray-400 text-center">No units added yet</td></tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500">Total monthly income: <span className="font-semibold text-charcoal">₹{monthlyIncome.toLocaleString('en-IN')}</span></p>
                                  <p className="text-xs text-gray-500">Total maintenance: <span className="font-semibold text-charcoal">₹{propUnits.reduce((s, u) => s + u.maintenance_charge, 0).toLocaleString('en-IN')}</span></p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <button onClick={() => startEditProperty(prop)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                                  <i className="ri-edit-line text-xs" /> Edit
                                </button>
                                <button onClick={() => { setListingsFilterProperty(prop.id); setActiveTab('listings'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap">
                                  <i className="ri-eye-line text-xs" /> View Listings
                                </button>
                                <button onClick={() => setDeletePropertyId(prop.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
                                  <i className="ri-delete-bin-line text-xs" /> Delete
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-charcoal">My Listings</h2>
                <p className="text-sm text-gray-500 mt-0.5">{myListings.length} active listings on Bhavan</p>
              </div>
              <Link to="/list-property" className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-add-line text-sm" /> Add Listing
              </Link>
            </div>

            {/* Property filter pills */}
            {properties.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 mr-1">Filter by property:</span>
                <button
                  onClick={() => setListingsFilterProperty(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${!listingsFilterProperty ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  All
                </button>
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => setListingsFilterProperty(prop.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${listingsFilterProperty === prop.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {prop.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-200 transition-all group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${deactivatedIds.has(listing.id) ? 'bg-gray-500 text-white' : 'bg-green-500 text-white'}`}>
                      <i className={`${deactivatedIds.has(listing.id) ? 'ri-close-circle-fill' : 'ri-checkbox-circle-fill'} text-[10px]`} /> {deactivatedIds.has(listing.id) ? 'Inactive' : 'Active'}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button onClick={() => setEditModalListing(listing)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer">
                        <i className="ri-edit-line text-amber-600 text-sm" />
                      </button>
                      <button onClick={() => navigate(`/listings/${listing.id}`)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer">
                        <i className="ri-eye-line text-gray-600 text-sm" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                        {listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-charcoal leading-snug">{listing.title}</h3>
                      <p className="text-sm font-bold text-amber-600 whitespace-nowrap">₹{listing.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <i className="ri-map-pin-line text-xs" /> {listing.location}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-hotel-bed-line text-xs" />{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} BHK`}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-drop-line text-xs" /> {listing.bathrooms} Bath
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="ri-ruler-line text-xs" /> {listing.area} sqft
                      </span>
                      {listing.furnished && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <i className="ri-checkbox-circle-line text-xs" /> Furnished
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { label: 'Views', value: '187', icon: 'ri-eye-line' },
                        { label: 'Inquiries', value: '14', icon: 'ri-message-3-line' },
                        { label: 'Saves', value: '32', icon: 'ri-bookmark-line' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-[#f9f9f7] rounded-xl p-2.5 text-center">
                          <div className="w-5 h-5 flex items-center justify-center mx-auto mb-1">
                            <i className={`${stat.icon} text-xs text-amber-600`} />
                          </div>
                          <p className="text-sm font-bold text-charcoal">{stat.value}</p>
                          <p className="text-[10px] text-gray-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => setEditModalListing(listing)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-edit-line text-xs" /> Edit
                      </button>
                      <button onClick={() => setQrModalListing(listing)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-qr-code-line text-xs" /> QR Code
                      </button>
                      <button onClick={() => { setDeactivatedIds((prev) => { const next = new Set(prev); if (next.has(listing.id)) next.delete(listing.id); else next.add(listing.id); return next; }); addToast(deactivatedIds.has(listing.id) ? 'Listing activated' : 'Listing deactivated', 'success'); }} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${deactivatedIds.has(listing.id) ? 'border-green-100 text-green-600 hover:bg-green-50' : 'border-gray-200 text-charcoal hover:border-amber-400 hover:text-amber-600'}`}>
                        <i className={`${deactivatedIds.has(listing.id) ? 'ri-play-circle-line' : 'ri-pause-circle-line'} text-xs`} /> {deactivatedIds.has(listing.id) ? 'Activate' : 'Deactivate'}
                      </button>
                      <button onClick={() => setDeleteListing(listing)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-delete-bin-line text-xs" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {myListings.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                  <i className="ri-home-4-line text-2xl text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No listings yet</h3>
                <p className="text-sm text-gray-500 mb-5">List your property to start receiving tenant inquiries.</p>
                <Link to="/list-property" className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                  List a Property
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal">Active Tenants ({tenantRows.length})</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tenant</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Flat</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Property</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rent</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Lease End</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Payment</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Agreement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantRows.map((t) => {
                      const agreement = rentalAgreements.find((a) => a.tenantId === t.id);
                      return (
                        <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-[#f9f9f7] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-amber-600">{t.name[0]}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                                {t.verified && (
                                  <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                                    <i className="ri-shield-check-fill text-[10px]" /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-charcoal font-medium">{t.flat}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{t.property}</td>
                          <td className="px-5 py-4 text-sm font-bold text-charcoal">{t.rent}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{t.leaseEnd}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Active</span>
                          </td>
                          <td className="px-5 py-4">
                            {(() => {
                              const tenantPayStatuses: Record<string, string> = {
                                t1: 'Paid',
                                t2: 'Failed',
                                t3: 'Paid',
                                t4: 'Paid',
                                t5: 'Reconciled',
                              };
                              const payColors: Record<string, string> = {
                                Paid: 'bg-green-50 text-green-600',
                                Failed: 'bg-red-50 text-red-600',
                                Reconciled: 'bg-blue-50 text-blue-600',
                              };
                              const s = tenantPayStatuses[t.id] ?? 'Pending';
                              return (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payColors[s] ?? 'bg-amber-50 text-amber-600'}`}>
                                  {s}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-5 py-4">
                            {agreement ? (
                              <button onClick={() => setViewAgreementTenantId(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer whitespace-nowrap">
                                <i className="ri-file-text-line text-xs" /> View
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Not generated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && <InquiriesTab onOpenChat={(id) => { setActiveChatRequestId(id); setActiveTab('messages'); }} />}

        {activeTab === 'messages' && <ChatTab initialRequestId={activeChatRequestId} />}

        {activeTab === 'requests' && <RequestsTab />}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Generator Tools */}
            <div>
              <h2 className="text-base font-bold text-charcoal mb-4">Document Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { to: '/rental-agreements', icon: 'ri-file-list-3-line', label: 'Rental Agreement Generator', desc: 'Create & share legally valid rental agreements', color: 'bg-orange-50 text-orange-600' },
                  { to: '/rent-receipts', icon: 'ri-file-text-line', label: 'Rent Receipt Generator', desc: 'Generate formatted rent receipts instantly', color: 'bg-amber-50 text-amber-600' },
                  { to: '/tax-forms', icon: 'ri-government-line', label: 'Tax & Legal Forms', desc: 'Income tax, TDS & HRA declaration forms', color: 'bg-teal-50 text-teal-600' },
                ].map((tool) => (
                  <Link key={tool.to} to={tool.to} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-amber-200 transition-all group">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-3 ${tool.color}`}>
                      <i className={`${tool.icon} text-lg`} />
                    </div>
                    <h3 className="text-sm font-bold text-charcoal mb-1">{tool.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:text-amber-700">
                      Open Tool <i className="ri-arrow-right-line" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Agreements */}
            <div>
              <h2 className="text-base font-bold text-charcoal mb-4">Rental Agreements</h2>
              {rentalAgreements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                    <i className="ri-file-list-3-line text-2xl text-amber-500" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal mb-2">No agreements yet</h3>
                  <p className="text-sm text-gray-500 mb-5">Generate your first rental agreement using the tool above.</p>
                  <Link to="/rental-agreements" className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                    Create Agreement
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Agreement #</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tenant</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Property</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Lease Period</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rent</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                          <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rentalAgreements.map((ag) => (
                          <tr key={ag.id} className="border-b border-gray-50 last:border-0 hover:bg-[#f9f9f7] transition-colors">
                            <td className="px-5 py-4 text-sm font-medium text-charcoal">{ag.agreementNumber}</td>
                            <td className="px-5 py-4 text-sm text-charcoal">{ag.tenantName}</td>
                            <td className="px-5 py-4 text-sm text-gray-500">{ag.propertyAddress}</td>
                            <td className="px-5 py-4 text-sm text-gray-500">{ag.leaseStart} – {ag.leaseEnd}</td>
                            <td className="px-5 py-4 text-sm font-bold text-charcoal">{formatINR(ag.monthlyRent)}</td>
                            <td className="px-5 py-4">
                              {ag.sharedWithTenant ? (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Sent to Tenant</span>
                              ) : (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewAgreementTenantId(ag.tenantId)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <i className="ri-eye-line text-xs" /> View
                                </button>
                                {!ag.sharedWithTenant && (
                                  <button
                                    onClick={() => {
                                      ag.sharedWithTenant = true;
                                      addToast('Agreement shared with tenant', 'success');
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    <i className="ri-share-forward-line text-xs" /> Share
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-4xl space-y-6">
            {/* Plan Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-charcoal">Current Plan</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isPro ? `Pro (${plan === 'pro_monthly' ? 'Monthly' : 'Annual'})` : 'Free Forever'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isPro ? (
                    <>
                      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                        <i className="ri-checkbox-circle-fill text-xs" /> Active
                      </span>
                      {status === 'cancelled' && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                          Cancels at period end
                        </span>
                      )}
                    </>
                  ) : (
                    <Link to="/subscription" className="px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                      Upgrade to Pro
                    </Link>
                  )}
                </div>
              </div>

              {isPro && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#f9f9f7] rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium">Next Billing Date</p>
                    <p className="text-sm font-bold text-charcoal mt-1">
                      {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="bg-[#f9f9f7] rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium">Total Spent</p>
                    <p className="text-sm font-bold text-charcoal mt-1">₹{(totalSpent / 100).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-[#f9f9f7] rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium">Auto-Renewal</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={async () => {
                          const sub = await toggleAutoRenew(true);
                          if (!sub.error) addToast('Auto-renewal enabled', 'success');
                        }}
                        className="text-sm font-semibold text-green-600 flex items-center gap-1 cursor-pointer"
                      >
                        On <i className="ri-toggle-fill text-green-500 text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isPro && (
                <div className="bg-[#f9f9f7] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50">
                    <i className="ri-sparkling-line text-sm text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Unlock Pro Features</p>
                    <p className="text-xs text-gray-500">Unlimited listings, analytics, bulk receipts, and priority support.</p>
                  </div>
                  <Link to="/subscription" className="ml-auto px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4">Billing History</h2>
              {billingHistory.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                    <i className="ri-bill-line text-2xl text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No invoices yet. They will appear here after your first payment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Invoice #</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Period</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((inv) => (
                        <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-[#f9f9f7] transition-colors">
                          <td className="px-4 py-3.5 text-sm font-medium text-charcoal">{inv.invoice_number}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">
                            {inv.plan === 'pro_monthly' ? 'Pro Monthly' : inv.plan === 'pro_annual' ? 'Pro Annual' : 'Free'}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">
                            {new Date(inv.billing_period_start).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-bold text-charcoal">
                            ₹{(inv.total_amount / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              inv.status === 'paid' ? 'bg-green-50 text-green-600' :
                              inv.status === 'failed' ? 'bg-red-50 text-red-600' :
                              inv.status === 'refunded' ? 'bg-amber-50 text-amber-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap">
                              <i className="ri-download-line text-xs" /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subscription Actions */}
            {isPro && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-charcoal mb-4">Subscription Settings</h2>
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      const { error } = await cancelSubscription();
                      if (error) addToast(error, 'error');
                      else addToast('Subscription cancelled. You\'ll keep Pro access until the end of your billing period.', 'success');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50">
                        <i className="ri-close-circle-line text-sm text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600">Cancel Subscription</p>
                        <p className="text-xs text-gray-400">You\'ll keep Pro access until the end of your current period</p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <NotificationToggle label="New Maintenance Requests" desc="Get notified when tenants submit requests" defaultOn activeColor="bg-amber-500" />
                <NotificationToggle label="Rent Payment Alerts" desc="When rent is paid or overdue" defaultOn activeColor="bg-amber-500" />
                <NotificationToggle label="Lease Expiry Reminders" desc="Alert 60 days before lease expiry" defaultOn activeColor="bg-amber-500" />
                <NotificationToggle label="New Tenant Inquiries" desc="When someone inquires about your listing" defaultOn activeColor="bg-amber-500" />
                <NotificationToggle label="Platform Updates" desc="Tips, guides and platform updates" activeColor="bg-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-signal-tower-line text-amber-600" />
                </div>
                Delivery Channels
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose how you receive each type of notification. If push fails, SMS and email fallbacks activate automatically.
              </p>
              <ChannelPreferences />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4">Security</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f9f9f7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50">
                      <i className="ri-lock-password-line text-sm text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-charcoal">Change Password</p>
                      <p className="text-xs text-gray-400">Last changed 2 months ago</p>
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

            {/* Activity Rate Limits */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-shield-check-line text-amber-600" />
                </div>
                Activity Rate Limits
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                These limits prevent spam and ensure fair usage across the platform. All limits reset automatically.
              </p>
              <div className="space-y-4">
                {/* Inquiry Responses */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50">
                        <i className="ri-message-3-line text-xs text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Inquiry Responses</p>
                        <p className="text-[11px] text-gray-400">Approve or decline connection requests</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${inquiry.canSend ? 'text-green-600' : 'text-red-500'}`}>
                      {inquiry.dailyRemaining} / 50 daily
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${inquiry.dailyRemaining === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${inquiry.dailyCount + inquiry.dailyRemaining > 0 ? (inquiry.dailyRemaining / (inquiry.dailyRemaining + inquiry.dailyCount)) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{inquiry.weeklyRemaining} / 200 weekly remaining</p>
                </div>

                {/* Chat Messages */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50">
                        <i className="ri-chat-3-line text-xs text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Chat Messages</p>
                        <p className="text-[11px] text-gray-400">Messages to approved prospects</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${chat.canSend ? 'text-green-600' : 'text-red-500'}`}>
                      {chat.dailyRemaining} / 100 daily
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${chat.dailyRemaining === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${chat.dailyCount + chat.dailyRemaining > 0 ? (chat.dailyRemaining / (chat.dailyRemaining + chat.dailyCount)) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{chat.weeklyRemaining} / 500 weekly remaining</p>
                </div>

                {/* Community Posts */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50">
                        <i className="ri-discuss-line text-xs text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Community Posts</p>
                        <p className="text-[11px] text-gray-400">Discussions, advice and reviews</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${community.canSend ? 'text-green-600' : 'text-red-500'}`}>
                      {community.dailyRemaining} / 5 daily
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${community.dailyRemaining === 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${community.dailyCount + community.dailyRemaining > 0 ? (community.dailyRemaining / (community.dailyRemaining + community.dailyCount)) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{community.weeklyRemaining} / 15 weekly remaining</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <h2 className="text-base font-bold text-red-600 mb-4">Danger Zone</h2>
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
        )}
      </div>
    </div>
  );
}
