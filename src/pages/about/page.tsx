export default function About() {
  const values = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trust & Safety',
      description: 'We verify every landlord and property listing to ensure a safe and transparent rental experience for all users.',
    },
    {
      icon: 'ri-heart-line',
      title: 'Community First',
      description: 'We believe renters deserve a supportive community where they can share experiences and help each other.',
    },
    {
      icon: 'ri-lightbulb-line',
      title: 'Innovation',
      description: 'We continuously develop new tools and features to make renting easier, more transparent, and more efficient.',
    },
    {
      icon: 'ri-equalizer-line',
      title: 'Fairness',
      description: 'We advocate for fair rental practices and empower renters with the knowledge and tools they need.',
    },
  ];

  const team = [
    {
      name: 'Jennifer Walsh',
      role: 'Founder & CEO',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%20portrait%20confident%20smile%20business%20attire%20neutral%20background%20executive&width=200&height=200&seq=401&orientation=squarish',
    },
    {
      name: 'Michael Torres',
      role: 'Head of Product',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20headshot%20portrait%20friendly%20smile%20business%20casual%20neutral%20background%20young%20professional&width=200&height=200&seq=402&orientation=squarish',
    },
    {
      name: 'Aisha Patel',
      role: 'Community Lead',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%20portrait%20warm%20smile%20business%20casual%20neutral%20background%20south%20asian&width=200&height=200&seq=403&orientation=squarish',
    },
    {
      name: 'David Kim',
      role: 'Tech Lead',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20asian%20man%20headshot%20portrait%20friendly%20smile%20business%20casual%20neutral%20background%20glasses&width=200&height=200&seq=404&orientation=squarish',
    },
  ];

  return (
    <div className="min-h-screen bg-offwhite pt-20">
      {/* Header */}
      <section className="bg-white py-12 md:py-16 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal">About Us</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              We are on a mission to transform the rental experience for millions of renters worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Our Mission</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Bhavan was founded in 2025 with a simple belief: renting a home in India should be straightforward, transparent, and empowering. We saw too many renters struggling with opaque processes, unresponsive landlords, and a lack of community support.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Today, we are building the most renter-friendly platform in India. From verified listings in Mumbai, Bangalore, and Delhi to digital rent management and a thriving community, we are here to make your rental journey smooth from start to finish.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-brand">50K+</div>
                    <p className="text-sm text-gray-500 mt-1">Active Renters</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand">12K+</div>
                    <p className="text-sm text-gray-500 mt-1">Verified Listings</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand">98%</div>
                    <p className="text-sm text-gray-500 mt-1">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="https://readdy.ai/api/search-image?query=diverse%20team%20of%20professionals%20collaborating%20in%20modern%20office%20space%20warm%20natural%20lighting%20friendly%20atmosphere%20tech%20startup%20culture&width=600&height=450&seq=40&orientation=landscape"
                  alt="Our team"
                  className="rounded-2xl shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Our Values</h2>
              <p className="mt-3 text-gray-600">The principles that guide everything we do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-offwhite rounded-2xl p-6 text-center hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-4">
                    <div className="w-7 h-7 flex items-center justify-center">
                      <i className={`${value.icon} text-brand text-xl`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal">{value.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Meet the Team</h2>
              <p className="mt-3 text-gray-600">The people behind Bhavan</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto"
                  />
                  <h3 className="mt-4 text-lg font-semibold text-charcoal">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}