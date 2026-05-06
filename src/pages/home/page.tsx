import { Link } from 'react-router-dom';
import { useListings } from '@/hooks/useListings';
import { listings as mockListings, vacationListings as mockVacationListings } from '@/mocks/listings';
import { useCommunity } from '@/hooks/useCommunity';
import { testimonials } from '@/mocks/community';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const { listings: dbListings, loading: listingsLoading } = useListings();
  const { posts: dbPosts, loading: postsLoading } = useCommunity();

  const useDbListings = dbListings.length > 0;
  const useDbPosts = dbPosts.length > 0;

  const featuredListings = useDbListings
    ? dbListings.filter((l) => l.category === 'residential').slice(0, 3)
    : mockListings.filter((l) => l.category === 'residential').slice(0, 3);

  const featuredVacation = useDbListings
    ? dbListings.filter((l) => l.category === 'vacation').slice(0, 3)
    : mockVacationListings.slice(0, 3);

  const featuredPosts = useDbPosts
    ? dbPosts.slice(0, 3)
    : [];

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=bright%20modern%20apartment%20interior%20large%20windows%20natural%20light%20streaming%20warm%20wood%20floors%20minimalist%20decor%20living%20room%20cozy%20welcoming%20atmosphere%20high%20quality%20photography&width=1400&height=700&seq=10&orientation=landscape"
            alt="Modern apartment interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Find Your<br />
              Next Home<br />
              With Confidence
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-lg leading-relaxed">
              Connect with verified landlords across India, manage your rent seamlessly, and join a supportive renter community
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/listings"
                className="bg-brand text-white font-medium px-8 py-3.5 rounded-full hover:bg-brand-dark transition-colors text-center whitespace-nowrap"
              >
                Browse Listings
              </Link>
              <Link
                to="/signup"
                className="bg-white text-charcoal font-medium px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors text-center whitespace-nowrap"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-12 right-12 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-shield-check-line text-brand text-sm" />
                </div>
              </div>
              <span className="text-sm font-medium text-charcoal">Verified Listings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-file-list-3-line text-brand text-sm" />
                </div>
              </div>
              <span className="text-sm font-medium text-charcoal">Digital Rent Agreement Tools</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-group-line text-brand text-sm" />
                </div>
              </div>
              <span className="text-sm font-medium text-charcoal">Tenant Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-lightgray py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white border border-brand text-brand text-xs font-semibold rounded-full uppercase tracking-wide">
              Trusted by 50,000+ Renters
            </span>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-charcoal">
              Why Renters<br />Choose Our Platform
            </h2>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '50K+', label: 'Active Renters' },
                { number: '4.9', label: 'Average Rating', star: true },
                { number: '24/7', label: 'Support Available' },
                { number: '100%', label: 'Verified Landlords' },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <div className="text-4xl md:text-5xl font-bold text-brand">
                    {stat.number}
                    {stat.star && <span className="text-2xl ml-1">★</span>}
                  </div>
                  <p className="mt-2 text-sm md:text-base font-medium text-charcoal">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-white py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Featured Properties</h2>
              <p className="mt-3 text-gray-600">Discover verified rental listings from trusted landlords</p>
              {useDbListings && (
                <p className="mt-1 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <i className="ri-database-2-line" /> Live from database
                </p>
              )}
            </div>

            {listingsLoading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-brand text-2xl" />
                </div>
                <p className="text-gray-500">Loading featured properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredListings.map((listing) => {
                  const isDb = 'owner' in listing;
                  const images = isDb ? (listing.images && listing.images.length > 0 ? listing.images : ['https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20clean%20minimal%20architecture%20urban%20residential%20complex&width=800&height=600&seq=listing-fallback&orientation=landscape']) : listing.images;
                  const landlordName = isDb ? (listing.owner?.name ?? 'Bhavan Owner') : listing.landlord_name;
                  const landlordAvatar = isDb ? (listing.owner?.avatar_url ?? 'https://readdy.ai/api/search-image?query=generic%20professional%20user%20avatar%20icon%20flat%20minimal%20neutral%20background&width=80&height=80&seq=avatar-fallback&orientation=squarish') : listing.landlord_avatar;
                  const location = isDb ? (listing.location ?? listing.city ?? 'Unknown') : listing.location;
                  const bedrooms = isDb ? (listing.bedrooms ?? 0) : listing.bedrooms;
                  const bathrooms = isDb ? (listing.bathrooms ?? 1) : listing.bathrooms;
                  const area = isDb ? (listing.area_sqft ?? 0) : listing.area;
                  const price = listing.price;
                  const title = listing.title;
                  const propertyType = isDb ? (listing.property_type ?? 'apartment') : listing.property_type;
                  const verified = isDb ? (listing.verified ?? false) : listing.verified;
                  const id = listing.id;

                  return (
                    <Link
                      key={id}
                      to={`/listings/${id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
                      data-product-shop
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={images[0]}
                          alt={title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        {verified && (
                          <span className="absolute top-3 left-3 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 text-charcoal text-xs font-semibold px-3 py-1 rounded-full capitalize">
                          {propertyType}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="text-brand font-bold text-xl">₹{price.toLocaleString('en-IN')}/mo</div>
                        <h3 className="mt-1 text-lg font-semibold text-charcoal">{title}</h3>
                        <div className="mt-2 flex items-center gap-1 text-gray-500 text-sm">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-map-pin-line text-xs" />
                          </div>
                          {location}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-hotel-bed-line text-xs" />
                            </div>
                            {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-drop-line text-xs" />
                            </div>
                            {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-ruler-line text-xs" />
                            </div>
                            {area} sq ft
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center gap-3">
                          <img
                            src={landlordAvatar}
                            alt={landlordName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-charcoal">{landlordName}</p>
                            <p className="text-xs text-gray-500">Verified Landlord</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 text-brand font-medium hover:gap-3 transition-all"
              >
                View All Listings
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vacation Rentals Section */}
      <section className="bg-[#fdf8f5] py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 text-rose-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-sun-line" />
                  </div>
                  Holiday Stays
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-charcoal">
                  Vacation Rentals<br />
                  <span className="text-rose-500">Across India</span>
                </h2>
                <p className="mt-3 text-gray-600 max-w-lg">
                  From Goa beach villas to Himalayan cottages — discover handpicked holiday homes listed directly by verified owners.
                </p>
              </div>
              <Link
                to="/listings?category=vacation"
                className="flex-shrink-0 inline-flex items-center gap-2 text-rose-500 font-medium hover:gap-3 transition-all whitespace-nowrap"
              >
                View All Vacation Rentals
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line" />
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVacation.map((listing) => {
                const isDb = 'owner' in listing;
                const images = isDb ? (listing.images && listing.images.length > 0 ? listing.images : ['https://readdy.ai/api/search-image?query=beautiful%20beachfront%20villa%20Goa%20India%20private%20pool%20tropical%20palm%20trees%20luxury%20vacation%20rental%20sunset&width=800&height=600&seq=vacation-fallback&orientation=landscape']) : listing.images;
                const landlordName = isDb ? (listing.owner?.name ?? 'Bhavan Owner') : listing.landlord_name;
                const landlordAvatar = isDb ? (listing.owner?.avatar_url ?? 'https://readdy.ai/api/search-image?query=generic%20professional%20user%20avatar%20icon%20flat%20minimal%20neutral%20background&width=80&height=80&seq=avatar-fallback&orientation=squarish') : listing.landlord_avatar;
                const location = isDb ? (listing.location ?? listing.city ?? 'Unknown') : listing.location;
                const price = listing.price;
                const title = listing.title;
                const propertyType = isDb ? (listing.property_type ?? 'villa') : listing.property_type;
                const verified = isDb ? (listing.verified ?? false) : listing.verified;
                const id = listing.id;
                const maxGuests = isDb ? undefined : (listing as typeof mockVacationListings[0]).max_guests;
                const amenities = isDb ? (listing.amenities ?? []) : ((listing as typeof mockVacationListings[0]).amenities ?? []);

                return (
                  <Link
                    key={id}
                    to={`/listings/${id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-rose-100 hover:border-rose-200 transition-all duration-300"
                    data-product-shop
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {verified && (
                        <span className="absolute top-3 left-3 bg-white/90 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <i className="ri-shield-check-fill text-xs" />
                          Verified
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                          {propertyType}
                        </span>
                        {maxGuests && (
                          <span className="bg-white/90 text-charcoal text-xs font-semibold px-3 py-1 rounded-full">
                            Up to {maxGuests} guests
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-rose-500 font-bold text-xl">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-400 text-sm">/night</span>
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-charcoal leading-snug line-clamp-2">{title}</h3>
                      <div className="mt-2 flex items-center gap-1 text-gray-500 text-sm">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-map-pin-line text-xs" />
                        </div>
                        {location}
                      </div>
                      {amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {amenities.slice(0, 3).map((a: string) => (
                            <span key={a} className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-medium">{a}</span>
                          ))}
                          {amenities.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">+{amenities.length - 3} more</span>
                          )}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t flex items-center gap-3">
                        <img
                          src={landlordAvatar}
                          alt={landlordName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-charcoal">{landlordName}</p>
                          <p className="text-xs text-gray-500">Verified Owner</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'ri-sun-line', label: 'Beach Villas', color: 'bg-amber-50 text-amber-600' },
                { icon: 'ri-landscape-line', label: 'Hill Retreats', color: 'bg-green-50 text-green-600' },
                { icon: 'ri-water-flash-line', label: 'Houseboats', color: 'bg-sky-50 text-sky-600' },
                { icon: 'ri-plant-line', label: 'Farmhouses', color: 'bg-rose-50 text-rose-600' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to="/listings?category=vacation"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${item.color}`}>
                    <i className={`${item.icon} text-lg`} />
                  </div>
                  <span className="text-sm font-medium text-charcoal">{item.label}</span>
                  <div className="ml-auto w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-gray-400 text-xs" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Preview */}
      <section className="bg-white py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Join Our Renter Community</h2>
              <p className="mt-3 text-gray-600">Connect with fellow tenants, share experiences, and get support</p>
              {useDbPosts && (
                <p className="mt-1 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <i className="ri-database-2-line" /> Live from database
                </p>
              )}
            </div>

            {postsLoading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-brand text-2xl" />
                </div>
                <p className="text-gray-500">Loading community posts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(featuredPosts.length > 0 ? featuredPosts : displayTestimonials).map((item) => {
                  const isPost = 'content' in item;
                  if (isPost) {
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-brand">{(item.author?.name ?? 'U')[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal text-sm">{item.author?.name ?? 'Community Member'}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-charcoal mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">&ldquo;{item.content}&rdquo;</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                          <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-charcoal text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 text-brand font-medium hover:gap-3 transition-all"
              >
                Explore Community
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-line" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rent Management Preview */}
      <section className="bg-brand-light py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 border border-brand text-brand text-xs font-semibold rounded-full uppercase tracking-wide">
                  Coming Soon
                </span>
                <h2 className="mt-6 text-3xl md:text-4xl font-bold text-charcoal">
                  Manage Your Rent<br />Digitally
                </h2>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Say goodbye to paper clutter. Our digital rent management tools help you track payments, submit maintenance requests, and store important documents all in one place.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-check-line text-brand" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal">Document Storage</h4>
                      <p className="text-sm text-gray-600 mt-1">Securely store and access your rent agreement, receipts, and communications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-check-line text-brand" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal">Payment Tracking</h4>
                      <p className="text-sm text-gray-600 mt-1">Never miss a payment with automated reminders and history</p>
                    </div>
                  </div>
                </div>
                <Link
                  to={user ? '/tenant-profile' : '/how-it-works'}
                  className="inline-block mt-8 bg-brand text-white font-medium px-8 py-3.5 rounded-full hover:bg-brand-dark transition-colors"
                >
                  {user ? 'Go to Dashboard' : 'Learn More'}
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=digital%20dashboard%20interface%20mockup%20lease%20management%20app%20modern%20UI%20design%20clean%20minimalist%20warm%20terracotta%20accents%20document%20management%20payment%20tracking&width=600&height=450&seq=20&orientation=landscape"
                  alt="Rent management dashboard"
                  className="rounded-2xl shadow-xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* List Property CTA */}
      <section className="bg-white py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden relative">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20apartment%20building%20exterior%20India%20urban%20architecture%20clean%20minimalist%20facade%20warm%20afternoon%20sunlight%20residential%20complex%20premium%20housing&width=1200&height=400&seq=55&orientation=landscape"
                alt="List your property"
                className="w-full h-[320px] md:h-[380px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
              <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-10 gap-8">
                <div className="text-white max-w-lg">
                  <span className="inline-block px-3 py-1 bg-brand/80 text-white text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                    For Property Owners
                  </span>
                  <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                    Have a Property<br />to Rent Out?
                  </h2>
                  <p className="mt-3 text-white/80 text-sm md:text-base leading-relaxed">
                    List your property for free and connect with thousands of verified tenants across India. Only verified property owners can list — no subletting allowed.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    {['No broker fees', 'Verified tenants', 'Free listing'].map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 text-sm text-white/90">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-check-line text-brand text-xs" />
                        </div>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Link
                    to="/list-property"
                    className="bg-brand text-white font-semibold px-8 py-3.5 rounded-full hover:bg-brand-dark transition-colors text-center whitespace-nowrap"
                  >
                    List as Owner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=happy%20person%20in%20modern%20apartment%20warm%20natural%20lighting%20cozy%20living%20space%20comfortable%20home%20atmosphere%20high%20quality%20lifestyle%20photography&width=1400&height=500&seq=30&orientation=landscape"
            alt="Happy renter"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">
            Start Your Rental Journey Today
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-xl mx-auto">
            Create your free account and access thousands of verified rental listings in minutes
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 mt-8 bg-charcoal text-white font-medium px-8 py-4 rounded-full hover:bg-black transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-home-5-line text-white text-sm" />
              </div>
            </div>
            Create Free Account
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-right-up-line" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}