import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { listings as mockListings } from '@/mocks/listings';
import type { ListingCategory } from '@/mocks/listings';

export default function Listings() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<ListingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [bedrooms, setBedrooms] = useState('all');
  const [furnished, setFurnished] = useState('all');
  const [parking, setParking] = useState('all');
  const [maxGuests, setMaxGuests] = useState('all');

  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings: dbListings, loading: dbLoading } = useListings(
    activeCategory === 'all' ? undefined : activeCategory
  );
  const isAadhaarVerified = user?.verified ?? false;

  const useDb = dbListings.length > 0 || dbLoading;

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat === 'vacation' || cat === 'residential' || cat === 'commercial') {
      setActiveCategory(cat as ListingCategory);
    }
  }, [searchParams]);

  const isVacation = activeCategory === 'vacation';

  const displayListings = useDb
    ? dbListings.map((l) => ({
        id: l.id,
        category: (l.category ?? 'residential') as ListingCategory,
        title: l.title,
        description: l.description ?? '',
        price: l.price,
        location: l.location ?? l.city ?? 'Unknown',
        bedrooms: l.bedrooms ?? 0,
        bathrooms: l.bathrooms ?? 1,
        area: l.area_sqft ?? 0,
        property_type: l.property_type ?? 'apartment',
        images: l.images && l.images.length > 0 ? l.images : ['https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20clean%20minimal%20architecture%20urban%20residential%20complex&width=800&height=600&seq=listing-fallback&orientation=landscape'],
        landlord_name: l.owner?.name ?? 'Bhavan Owner',
        landlord_avatar: l.owner?.avatar_url ?? 'https://readdy.ai/api/search-image?query=generic%20professional%20user%20avatar%20icon%20flat%20minimal%20neutral%20background&width=80&height=80&seq=avatar-fallback&orientation=squarish',
        furnished: l.furnished ?? false,
        parking: 'none',
        verified: l.verified ?? false,
        amenities: l.amenities ?? [],
        owner_id: l.owner_id,
        price_unit: l.category === 'vacation' ? 'night' : undefined,
        max_guests: undefined as number | undefined,
        created_at: l.created_at,
      }))
    : mockListings;

  const filteredListings = displayListings.filter((listing) => {
    const matchesCategory = activeCategory === 'all' || listing.category === activeCategory;

    const matchesSearch =
      searchQuery === '' ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = propertyType === 'all' || listing.property_type === propertyType;

    const matchesPrice = isVacation
      ? priceRange === 'all' ||
        (priceRange === 'under1000' && listing.price < 3000) ||
        (priceRange === '1000-1500' && listing.price >= 3000 && listing.price <= 6000) ||
        (priceRange === 'over2500' && listing.price > 6000)
      : priceRange === 'all' ||
        (priceRange === 'under1000' && listing.price < 15000) ||
        (priceRange === '1000-1500' && listing.price >= 15000 && listing.price <= 30000) ||
        (priceRange === '1500-2500' && listing.price > 30000 && listing.price <= 50000) ||
        (priceRange === 'over2500' && listing.price > 50000);

    const matchesBedrooms =
      bedrooms === 'all' ||
      (bedrooms === '0' && listing.bedrooms === 0) ||
      (bedrooms === '1' && listing.bedrooms === 1) ||
      (bedrooms === '2' && listing.bedrooms === 2) ||
      (bedrooms === '3+' && listing.bedrooms >= 3);

    const matchesFurnished =
      furnished === 'all' ||
      (furnished === 'yes' && listing.furnished === true) ||
      (furnished === 'no' && listing.furnished === false);

    const matchesParking =
      parking === 'all' ||
      (parking === '2-wheeler' && (listing.parking === '2-wheeler' || listing.parking === 'both')) ||
      (parking === '4-wheeler' && (listing.parking === '4-wheeler' || listing.parking === 'both')) ||
      (parking === 'both' && listing.parking === 'both');

    const matchesGuests =
      !isVacation ||
      maxGuests === 'all' ||
      (listing.max_guests &&
        ((maxGuests === '2' && listing.max_guests <= 2) ||
         (maxGuests === '4' && listing.max_guests <= 4) ||
         (maxGuests === '6' && listing.max_guests <= 6) ||
         (maxGuests === '8+' && listing.max_guests >= 8)));

    return matchesCategory && matchesSearch && matchesType && matchesPrice && matchesBedrooms && matchesFurnished && matchesParking && matchesGuests;
  });

  return (
    <div className="min-h-screen bg-offwhite pt-20">
      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-3">
            {([
              { key: 'all', label: 'All Properties', icon: 'ri-building-line' },
              { key: 'residential', label: 'Residential', icon: 'ri-home-5-line' },
              { key: 'commercial', label: 'Commercial', icon: 'ri-building-4-line' },
              { key: 'vacation', label: 'Vacation Rentals', icon: 'ri-sun-line' },
            ] as { key: ListingCategory | 'all'; label: string; icon: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key);
                  setPropertyType('all');
                  setPriceRange('all');
                  setBedrooms('all');
                  setMaxGuests('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.key
                    ? tab.key === 'vacation'
                      ? 'bg-rose-500 text-white'
                      : 'bg-brand text-white'
                    : 'text-gray-500 hover:text-charcoal hover:bg-gray-100'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={tab.icon} />
                </div>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeCategory === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {displayListings.filter((l) => tab.key === 'all' || l.category === tab.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aadhaar Verification Banner */}
      {user && !isAadhaarVerified && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="w-full px-4 md:px-8 lg:px-12 py-3">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-800">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-shield-keyhole-line text-amber-600" />
                </div>
                <p className="text-sm font-medium">
                  <strong>Aadhaar verification required</strong> to book property visits and sign rental agreements.
                </p>
              </div>
              <Link
                to="/aadhaar-verify"
                className="flex-shrink-0 bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Verify Now — It&apos;s Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="bg-white py-6 md:py-8 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
              {activeCategory === 'vacation' ? 'Vacation Rentals' : activeCategory === 'commercial' ? 'Commercial Properties' : activeCategory === 'residential' ? 'Residential Listings' : 'Browse Listings'}
            </h1>
            <p className="mt-2 text-gray-600">
              {activeCategory === 'vacation'
                ? 'Discover handpicked holiday homes across India — listed directly by verified owners'
                : 'Find your perfect rental from our verified properties'}
            </p>
            {useDb && (
              <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                <i className="ri-database-2-line" /> Live from database
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white py-6 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={isVacation ? 'Search by destination or property name...' : 'Search by location or property name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none transition-colors ${
                    isVacation ? 'focus:ring-2 focus:ring-rose-300' : 'focus:ring-2 focus:ring-brand/30'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {isVacation ? (
                    <>
                      <option value="villa">Villa / Bhavan</option>
                      <option value="cottage">Cottage / Cabin</option>
                      <option value="beach-house">Beach House</option>
                      <option value="farmhouse">Farmhouse</option>
                    </>
                  ) : (
                    <>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                    </>
                  )}
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                >
                  <option value="all">{isVacation ? 'Any Nightly Rate' : 'Any Price'}</option>
                  {isVacation ? (
                    <>
                      <option value="under1000">Under ₹3,000/night</option>
                      <option value="1000-1500">₹3,000 – ₹6,000/night</option>
                      <option value="over2500">Over ₹6,000/night</option>
                    </>
                  ) : (
                    <>
                      <option value="under1000">Under ₹15,000</option>
                      <option value="1000-1500">₹15,000 – ₹30,000</option>
                      <option value="1500-2500">₹30,000 – ₹50,000</option>
                      <option value="over2500">Over ₹50,000</option>
                    </>
                  )}
                </select>

                {isVacation ? (
                  <select
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Guests</option>
                    <option value="2">Up to 2 Guests</option>
                    <option value="4">Up to 4 Guests</option>
                    <option value="6">Up to 6 Guests</option>
                    <option value="8+">8+ Guests</option>
                  </select>
                ) : (
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Beds</option>
                    <option value="0">Studio</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3+">3+ Beds</option>
                  </select>
                )}

                {!isVacation && (
                  <select
                    value={furnished}
                    onChange={(e) => setFurnished(e.target.value)}
                    className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">Furnishing</option>
                    <option value="yes">Furnished</option>
                    <option value="no">Unfurnished</option>
                  </select>
                )}

                {!isVacation && (
                  <select
                    value={parking}
                    onChange={(e) => setParking(e.target.value)}
                    className="px-4 py-3 bg-lightgray rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">Parking</option>
                    <option value="2-wheeler">2-Wheeler</option>
                    <option value="4-wheeler">4-Wheeler</option>
                    <option value="both">Both (2W + 4W)</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-8 md:py-12">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
            </p>

            {dbLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-brand text-2xl" />
                </div>
                <p className="text-gray-500">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-lightgray rounded-full mb-4">
                  <i className="ri-search-line text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal">No properties found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    data-product-shop
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      {listing.verified && (
                        <span className="absolute top-3 left-3 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-white/90 text-charcoal text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {listing.property_type}
                      </span>
                    </div>
                    <div className="p-5">
                      {listing.category === 'vacation' ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-rose-500 font-bold text-xl">₹{listing.price.toLocaleString('en-IN')}</span>
                          <span className="text-gray-400 text-sm">/night</span>
                        </div>
                      ) : (
                        <div className="text-brand font-bold text-xl">₹{listing.price.toLocaleString('en-IN')}/mo</div>
                      )}
                      <h3 className="mt-1 text-lg font-semibold text-charcoal">{listing.title}</h3>
                      <div className="mt-2 flex items-center gap-1 text-gray-500 text-sm">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-map-pin-line text-xs" />
                        </div>
                        {listing.location}
                      </div>

                      {listing.category === 'vacation' ? (
                        <>
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-group-line text-xs" /></div>
                              {'max_guests' in listing && listing.max_guests ? `Up to ${listing.max_guests} guests` : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-hotel-bed-line text-xs" /></div>
                              {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-drop-line text-xs" /></div>
                              {listing.bathrooms} Bath{listing.bathrooms > 1 ? 's' : ''}
                            </span>
                          </div>
                          {listing.amenities && listing.amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {listing.amenities.slice(0, 3).map((a: string) => (
                                <span key={a} className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-medium">{a}</span>
                              ))}
                              {listing.amenities.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">+{listing.amenities.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {listing.furnished && (
                              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-sofa-line text-xs" /></div>
                                Furnished
                              </span>
                            )}
                            {listing.parking === '2-wheeler' && (
                              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-motorbike-line text-xs" /></div>
                                2W Parking
                              </span>
                            )}
                            {listing.parking === '4-wheeler' && (
                              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-car-line text-xs" /></div>
                                4W Parking
                              </span>
                            )}
                            {listing.parking === 'both' && (
                              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-parking-line text-xs" /></div>
                                2W + 4W Parking
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-hotel-bed-line text-xs" /></div>
                              {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-drop-line text-xs" /></div>
                              {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-ruler-line text-xs" /></div>
                              {listing.area} sq ft
                            </span>
                          </div>
                        </>
                      )}
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={listing.landlord_avatar}
                              alt={listing.landlord_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-charcoal">{listing.landlord_name}</p>
                                <div className="w-4 h-4 flex items-center justify-center" title="Aadhaar Verified Owner">
                                  <i className="ri-shield-check-fill text-green-500 text-xs" />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">Aadhaar Verified Owner</p>
                            </div>
                          </div>
                        </div>
                        {user ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/listings/${listing.id}`);
                            }}
                            className={`w-full text-white text-sm font-medium px-4 py-2.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                              listing.category === 'vacation'
                                ? 'bg-rose-500 hover:bg-rose-600'
                                : 'bg-brand hover:bg-brand-dark'
                            }`}
                          >
                            {listing.category === 'vacation' ? 'View Stay' : 'View Details'}
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full flex items-center justify-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-full transition-colors whitespace-nowrap ${
                              listing.category === 'vacation'
                                ? 'bg-rose-500 hover:bg-rose-600'
                                : 'bg-brand hover:bg-brand-dark'
                            }`}
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-login-circle-line" />
                            </div>
                            Sign In to Connect
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
