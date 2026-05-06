import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const sharedMenuItems = [
  { to: '/feedback', icon: 'ri-star-line', label: 'My Reviews', highlight: '' as const },
  { to: '/community', icon: 'ri-discuss-line', label: 'Community Forum', highlight: '' as const },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isPro } = useSubscription();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome ? 'bg-white shadow-sm' : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-charcoal' : 'text-white';


  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';
  const roleLabel = isOwner ? 'Property Owner' : 'Tenant';
  const roleColor = isOwner ? 'text-amber-600 bg-amber-50' : 'text-brand bg-brand/10';
  const profilePath = isOwner ? '/owner-profile' : '/tenant-profile';

  const navLinks = [
    { to: '/listings', label: 'Browse Listings' },
    ...(isTenant ? [] : [{ to: '/list-property', label: 'List Property' }]),
    { to: '/how-it-works', label: 'How It Works' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
              }
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 0);
            }}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <img
              src="https://storage.readdy-site.link/project_files/2a4bc4d8-2b56-4cda-b6f5-ac9c2ebbfa8f/4ea9883a-4467-42fc-9416-153bac5fcc0f_log.png?v=6dcc801a33c8ab9acb1484d2408c7c4a"
              alt="Bhavan"
              className="h-8 w-8 object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => {
                  if (location.pathname === link.to) {
                    e.preventDefault();
                  }
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 0);
                }}
                className={`text-sm font-medium hover:text-brand transition-colors whitespace-nowrap ${
                  location.pathname === link.to ? 'text-brand' : textColor
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-full border border-gray-200 hover:border-brand/40 bg-white transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-brand">{initials}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-charcoal leading-tight">{user.name.split(' ')[0]}</p>
                    <p className={`text-[10px] font-medium leading-tight ${user.role === 'owner' ? 'text-amber-600' : 'text-brand'}`}>{roleLabel}</p>
                  </div>
                  {user.verified && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-shield-check-fill text-green-500 text-sm" />
                    </div>
                  )}
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={profileOpen ? 'ri-arrow-up-s-line text-gray-400 text-sm' : 'ri-arrow-down-s-line text-gray-400 text-sm'} />
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    {/* Profile header */}
                    <Link to={profilePath} className="block px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-brand">{initials}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal">{user.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
                            {user.verified && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                                <i className="ri-shield-check-fill text-[10px]" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Shared items */}
                    <div className="py-2 border-b border-gray-100">
                      {sharedMenuItems.map((item) => (
                        <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${
                            item.highlight === 'green' ? 'bg-green-50' : 'bg-brand/10'
                          }`}>
                            <i className={`${item.icon} text-sm ${item.highlight === 'green' ? 'text-green-600' : 'text-brand'}`} />
                          </div>
                          <span className="text-sm text-charcoal font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Owner-specific items */}
                    {isOwner && (
                      <div className="py-2 border-b border-gray-100">
                        <Link to="/subscription" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${isPro ? 'bg-amber-50' : 'bg-brand/10'}`}>
                            <i className={`ri-vip-crown-line text-sm ${isPro ? 'text-amber-600' : 'text-brand'}`} />
                          </div>
                          <span className="text-sm text-charcoal font-medium">
                            {isPro ? 'Pro Plan' : 'Upgrade to Pro'}
                          </span>
                        </Link>
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                          <i className="ri-logout-box-r-line text-sm text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium hover:text-brand transition-colors whitespace-nowrap ${textColor}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-brand-dark transition-colors whitespace-nowrap"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i className={`ri-${mobileOpen ? 'close' : 'menu'}-line text-2xl`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-charcoal text-sm font-medium py-2.5 border-b border-gray-50 last:border-0"
                onClick={(e) => {
                  if (location.pathname === link.to) {
                    e.preventDefault();
                  }
                  setMobileOpen(false);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 0);
                }}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="pt-3 border-t border-gray-100 mt-2">
                <Link to={profilePath} className="flex items-center gap-3 px-1 py-3 mb-2 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand">{initials}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-charcoal">{user.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
                      {user.verified && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                          <i className="ri-shield-check-fill text-[10px]" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {sharedMenuItems.map((item) => (
                  <Link key={item.to} to={item.to} className="flex items-center gap-3 py-2 text-sm text-charcoal font-medium" onClick={() => setMobileOpen(false)}>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${
                      item.highlight === 'green' ? 'bg-green-50' : 'bg-brand/10'
                    }`}>
                      <i className={`${item.icon} text-sm ${item.highlight === 'green' ? 'text-green-600' : 'text-brand'}`} />
                    </div>
                    {item.label}
                  </Link>
                ))}

                {isOwner && (
                  <Link to="/subscription" className="flex items-center gap-3 py-2.5 text-sm text-charcoal font-medium border-t border-gray-50 mt-1" onClick={() => setMobileOpen(false)}>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${isPro ? 'bg-amber-50' : 'bg-brand/10'}`}>
                      <i className={`ri-vip-crown-line text-sm ${isPro ? 'text-amber-600' : 'text-brand'}`} />
                    </div>
                    {isPro ? 'Pro Plan' : 'Upgrade to Pro'}
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 py-2.5 text-sm text-gray-500 font-medium w-full mt-1 cursor-pointer"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                    <i className="ri-logout-box-r-line text-sm text-gray-500" />
                  </div>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-3 mt-2">
                <Link
                  to="/login"
                  className="text-charcoal text-sm font-medium py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-full text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
