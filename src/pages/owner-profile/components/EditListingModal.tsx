import { useState, useEffect } from 'react';
import { listings, type Listing } from '@/mocks/listings';
import { useToast } from '@/hooks/useToast';

interface EditListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSave: (updated: Listing) => void;
}

const cities = [
  'Mumbai', 'Bangalore', 'New Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
];

const amenitiesList = [
  { key: 'WiFi', icon: 'ri-wifi-line' },
  { key: 'AC', icon: 'ri-temp-cold-line' },
  { key: 'Gym', icon: 'ri-run-line' },
  { key: 'Security', icon: 'ri-shield-check-line' },
  { key: 'Lift', icon: 'ri-arrow-up-down-line' },
  { key: 'Power Backup', icon: 'ri-flashlight-line' },
  { key: '24/7 Water', icon: 'ri-drop-line' },
  { key: 'Pet Friendly', icon: 'ri-bear-smile-line' },
  { key: 'Balcony', icon: 'ri-building-line' },
  { key: 'Parking', icon: 'ri-car-line' },
];

export default function EditListingModal({ listing, onClose, onSave }: EditListingModalProps) {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [form, setForm] = useState({
    title: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    description: '',
    furnished: false,
    parking: '',
    amenities: [] as string[],
  });

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        price: String(listing.price),
        bedrooms: String(listing.bedrooms),
        bathrooms: String(listing.bathrooms),
        area: String(listing.area),
        location: listing.location,
        description: listing.description,
        furnished: listing.furnished,
        parking: listing.parking,
        amenities: listing.amenities ?? [],
      });
      setCharCount(listing.description.length);
    }
  }, [listing]);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (key: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setSaving(true);

    // Update the mock data array in-place so it persists across navigation
    const idx = listings.findIndex((l) => l.id === listing.id);
    if (idx !== -1) {
      listings[idx] = {
        ...listings[idx],
        title: form.title,
        price: Number(form.price) || listings[idx].price,
        bedrooms: Number(form.bedrooms) || listings[idx].bedrooms,
        bathrooms: Number(form.bathrooms) || listings[idx].bathrooms,
        area: Number(form.area) || listings[idx].area,
        location: form.location,
        description: form.description,
        furnished: form.furnished,
        parking: form.parking,
        amenities: form.amenities,
      };
    }

    setTimeout(() => {
      setSaving(false);
      onSave(listings[idx]);
      addToast('Listing updated successfully', 'success');
      onClose();
    }, 600);
  };

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <i className="ri-edit-line text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal">Edit Listing</h3>
              <p className="text-xs text-gray-400">Update your property details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Property Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Price + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly Rent (₹)</label>
              <input
                type="number"
                required
                min={1000}
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
              <select
                required
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c} value={`${c}`}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bedrooms + Bathrooms + Area */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">BHK</label>
              <select
                required
                value={form.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
              >
                <option value="0">Studio</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bath</label>
              <select
                required
                value={form.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Area (sqft)</label>
              <input
                type="number"
                required
                min={50}
                value={form.area}
                onChange={(e) => handleChange('area', e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          {/* Parking */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Parking</label>
            <select
              value={form.parking}
              onChange={(e) => handleChange('parking', e.target.value)}
              className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
            >
              <option value="none">No Parking</option>
              <option value="2-wheeler">2-Wheeler Only</option>
              <option value="4-wheeler">4-Wheeler Only</option>
              <option value="both">Both 2W &amp; 4W</option>
            </select>
          </div>

          {/* Furnished toggle */}
          <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-xl">
            <div className="flex items-center gap-2">
              <i className="ri-sofa-line text-amber-600 text-sm" />
              <span className="text-sm font-medium text-charcoal">Furnished</span>
            </div>
            <button
              type="button"
              onClick={() => handleChange('furnished', !form.furnished)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.furnished ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.furnished ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((a) => {
                const active = form.amenities.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAmenity(a.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <i className={`${a.icon} text-xs`} />
                    {a.key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              required
              rows={4}
              maxLength={500}
              value={form.description}
              onChange={(e) => {
                handleChange('description', e.target.value);
                setCharCount(e.target.value.length);
              }}
              className="w-full px-4 py-3 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
            <p className={`text-xs mt-1 text-right ${charCount >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {charCount}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 rounded-full bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-1.5">
                  <i className="ri-loader-4-line animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}