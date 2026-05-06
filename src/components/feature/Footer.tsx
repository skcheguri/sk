import { Link } from 'react-router-dom';

export default function Footer() {
  const columns = [
    {
      title: 'For Renters',
      links: [
        { to: '/listings', label: 'Browse Listings' },
        { to: '/tenant-profile', label: 'My Dashboard' },
        { to: '/community', label: 'Community Forum' },
        { to: '/feedback', label: 'Reviews & Feedback' },
      ],
    },
    {
      title: 'For Landlords',
      links: [
        { to: '/list-property', label: 'List Property' },
        { to: '/owner-profile', label: 'Owner Dashboard' },
        { to: '/aadhaar-verify', label: 'Verification Process' },
        { to: '/how-it-works', label: 'How It Works' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About Us' },
        { to: '/how-it-works', label: 'How It Works' },
        { to: '/aadhaar-verify', label: 'Trust & Safety' },
        { to: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/about', label: 'Terms of Service' },
        { to: '/about', label: 'Privacy Policy' },
        { to: '/about', label: 'Cookie Policy' },
        { to: '/about', label: 'Accessibility' },
      ],
    },
  ];

  return (
    <footer className="bg-charcoal text-white">
      <div className="w-full px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-base font-semibold mb-4">{col.title}</h4>
              <div className="w-10 h-0.5 bg-brand mb-4" />
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="https://storage.readdy-site.link/project_files/2a4bc4d8-2b56-4cda-b6f5-ac9c2ebbfa8f/4ea9883a-4467-42fc-9416-153bac5fcc0f_log.png?v=6dcc801a33c8ab9acb1484d2408c7c4a"
              alt="Bhavan"
              className="h-8 w-8 object-contain"
            />
            <div>
              <span className="text-xl font-bold">Bhavan</span>
              <p className="text-xs text-gray-400 mt-0.5">Empowering Indian renters since 2025</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <p className="text-sm text-gray-400">&copy; 2025 Bhavan. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" rel="nofollow">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-linkedin-fill text-lg" />
                </div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" rel="nofollow">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-twitter-x-fill text-lg" />
                </div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" rel="nofollow">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-instagram-line text-lg" />
                </div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" rel="nofollow">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-facebook-fill text-lg" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}