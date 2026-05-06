export type FeedbackRole = 'owner_on_renter' | 'renter_on_owner';

export interface FeedbackEntry {
  id: string;
  role: FeedbackRole;
  reviewer_name: string;
  reviewer_avatar: string;
  subject_name: string;
  subject_avatar: string;
  property: string;
  location: string;
  tenancy_period: string;
  overall_rating: number;
  answers: { question: string; value: boolean | null }[];
  comment: string;
  created_at: string;
}

export const ownerOnRenterQuestions = [
  { id: 'rent_on_time', label: 'Paid rent on time consistently', icon: 'ri-calendar-check-line' },
  { id: 'noisy', label: 'Was noisy or disturbed neighbours', icon: 'ri-volume-up-line', negative: true },
  { id: 'property_damage', label: 'Caused damage to the property', icon: 'ri-tools-line', negative: true },
  { id: 'cleanliness', label: 'Maintained cleanliness of the unit', icon: 'ri-sparkling-line' },
  { id: 'rules_followed', label: 'Followed house rules and society norms', icon: 'ri-shield-check-line' },
  { id: 'communication', label: 'Communicated issues promptly and respectfully', icon: 'ri-chat-check-line' },
  { id: 'guests', label: 'Had frequent unauthorised guests', icon: 'ri-group-line', negative: true },
  { id: 'vacated_properly', label: 'Vacated the property in good condition', icon: 'ri-home-smile-line' },
];

export const renterOnOwnerQuestions = [
  { id: 'no_extra_rent', label: 'Did not charge extra or hidden rent', icon: 'ri-money-rupee-circle-line' },
  { id: 'amenities_provided', label: 'Provided all promised amenities', icon: 'ri-home-gear-line' },
  { id: 'maintenance_responsive', label: 'Responded to maintenance requests quickly', icon: 'ri-tools-line' },
  { id: 'privacy_respected', label: 'Respected tenant\'s privacy', icon: 'ri-lock-line' },
  { id: 'deposit_returned', label: 'Returned security deposit on time', icon: 'ri-refund-2-line' },
  { id: 'fair_agreement', label: 'Provided a fair and transparent rent agreement', icon: 'ri-file-text-line' },
  { id: 'harassment', label: 'Harassed or pressured the tenant', icon: 'ri-alarm-warning-line', negative: true },
  { id: 'utilities_fair', label: 'Charged utilities fairly and transparently', icon: 'ri-flashlight-line' },
];

export const feedbackEntries: FeedbackEntry[] = [
  {
    id: 'f1',
    role: 'owner_on_renter',
    reviewer_name: 'Priya Sharma',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20woman%20headshot%20portrait%20warm%20smile%20neutral%20background%20business%20casual&width=100&height=100&seq=101&orientation=squarish',
    subject_name: 'Arjun Mehta',
    subject_avatar: 'https://readdy.ai/api/search-image?query=young%20indian%20man%20professional%20headshot%20portrait%20friendly%20smile%20neutral%20background%20casual&width=100&height=100&seq=201&orientation=squarish',
    property: 'Sunny 2BHK in Bandra West',
    location: 'Bandra West, Mumbai',
    tenancy_period: 'Jan 2025 – Mar 2026',
    overall_rating: 5,
    answers: [
      { question: 'Paid rent on time consistently', value: true },
      { question: 'Was noisy or disturbed neighbours', value: false },
      { question: 'Caused damage to the property', value: false },
      { question: 'Maintained cleanliness of the unit', value: true },
      { question: 'Followed house rules and society norms', value: true },
      { question: 'Communicated issues promptly and respectfully', value: true },
      { question: 'Had frequent unauthorised guests', value: false },
      { question: 'Vacated the property in good condition', value: true },
    ],
    comment: 'Arjun was an absolutely ideal tenant. Always paid on the 1st, kept the flat spotless, and even fixed a minor plumbing issue himself. Would happily rent to him again.',
    created_at: '2026-04-10',
  },
  {
    id: 'f2',
    role: 'renter_on_owner',
    reviewer_name: 'Arjun Mehta',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=young%20indian%20man%20professional%20headshot%20portrait%20friendly%20smile%20neutral%20background%20casual&width=100&height=100&seq=201&orientation=squarish',
    subject_name: 'Priya Sharma',
    subject_avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20woman%20headshot%20portrait%20warm%20smile%20neutral%20background%20business%20casual&width=100&height=100&seq=101&orientation=squarish',
    property: 'Sunny 2BHK in Bandra West',
    location: 'Bandra West, Mumbai',
    tenancy_period: 'Jan 2025 – Mar 2026',
    overall_rating: 5,
    answers: [
      { question: 'Did not charge extra or hidden rent', value: true },
      { question: 'Provided all promised amenities', value: true },
      { question: 'Responded to maintenance requests quickly', value: true },
      { question: 'Respected tenant\'s privacy', value: true },
      { question: 'Returned security deposit on time', value: true },
      { question: 'Provided a fair and transparent rent agreement', value: true },
      { question: 'Harassed or pressured the tenant', value: false },
      { question: 'Charged utilities fairly and transparently', value: true },
    ],
    comment: 'Priya is a wonderful landlord. She fixed the AC within 24 hours of my request and returned my full deposit within a week of vacating. Transparent, fair, and respectful.',
    created_at: '2026-04-11',
  },
  {
    id: 'f3',
    role: 'owner_on_renter',
    reviewer_name: 'Rahul Verma',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20man%20headshot%20portrait%20friendly%20smile%20neutral%20background%20business%20casual&width=100&height=100&seq=102&orientation=squarish',
    subject_name: 'Sneha Kapoor',
    subject_avatar: 'https://readdy.ai/api/search-image?query=young%20indian%20woman%20professional%20headshot%20portrait%20friendly%20smile%20neutral%20background%20casual&width=100&height=100&seq=202&orientation=squarish',
    property: 'Cozy Studio Near IIT Bombay',
    location: 'Powai, Mumbai',
    tenancy_period: 'Jun 2025 – Dec 2025',
    overall_rating: 4,
    answers: [
      { question: 'Paid rent on time consistently', value: true },
      { question: 'Was noisy or disturbed neighbours', value: false },
      { question: 'Caused damage to the property', value: false },
      { question: 'Maintained cleanliness of the unit', value: true },
      { question: 'Followed house rules and society norms', value: true },
      { question: 'Communicated issues promptly and respectfully', value: true },
      { question: 'Had frequent unauthorised guests', value: true },
      { question: 'Vacated the property in good condition', value: true },
    ],
    comment: 'Sneha was a good tenant overall. Rent was always on time and the flat was well-maintained. Had a few extra guests occasionally but nothing that caused issues.',
    created_at: '2026-03-28',
  },
  {
    id: 'f4',
    role: 'renter_on_owner',
    reviewer_name: 'Karan Singh',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=young%20indian%20man%20professional%20headshot%20portrait%20confident%20smile%20neutral%20background%20casual&width=100&height=100&seq=203&orientation=squarish',
    subject_name: 'Vikram Malhotra',
    subject_avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20man%20headshot%20portrait%20friendly%20smile%20neutral%20background%20business%20casual%20middle%20aged&width=100&height=100&seq=104&orientation=squarish',
    property: 'Modern Loft in Hauz Khas',
    location: 'Hauz Khas, New Delhi',
    tenancy_period: 'Sep 2024 – Feb 2026',
    overall_rating: 2,
    answers: [
      { question: 'Did not charge extra or hidden rent', value: false },
      { question: 'Provided all promised amenities', value: false },
      { question: 'Responded to maintenance requests quickly', value: false },
      { question: 'Respected tenant\'s privacy', value: false },
      { question: 'Returned security deposit on time', value: false },
      { question: 'Provided a fair and transparent rent agreement', value: true },
      { question: 'Harassed or pressured the tenant', value: true },
      { question: 'Charged utilities fairly and transparently', value: false },
    ],
    comment: 'Very disappointing experience. The owner charged extra for electricity at inflated rates, the promised gym was never functional, and my deposit was held for 3 months without reason.',
    created_at: '2026-03-15',
  },
  {
    id: 'f5',
    role: 'owner_on_renter',
    reviewer_name: 'Anita Reddy',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=professional%20south%20indian%20woman%20headshot%20portrait%20warm%20smile%20neutral%20background%20business%20casual&width=100&height=100&seq=103&orientation=squarish',
    subject_name: 'Rohan Nair',
    subject_avatar: 'https://readdy.ai/api/search-image?query=young%20south%20indian%20man%20professional%20headshot%20portrait%20friendly%20smile%20neutral%20background%20casual&width=100&height=100&seq=204&orientation=squarish',
    property: 'Spacious 3BHK Family Home',
    location: 'Whitefield, Bangalore',
    tenancy_period: 'Mar 2025 – Mar 2026',
    overall_rating: 3,
    answers: [
      { question: 'Paid rent on time consistently', value: false },
      { question: 'Was noisy or disturbed neighbours', value: true },
      { question: 'Caused damage to the property', value: false },
      { question: 'Maintained cleanliness of the unit', value: false },
      { question: 'Followed house rules and society norms', value: true },
      { question: 'Communicated issues promptly and respectfully', value: true },
      { question: 'Had frequent unauthorised guests', value: false },
      { question: 'Vacated the property in good condition', value: true },
    ],
    comment: 'Rohan was decent but rent was often 5-7 days late. The flat needed a deep clean after vacating. Communication was good though and no major damage.',
    created_at: '2026-04-02',
  },
  {
    id: 'f6',
    role: 'renter_on_owner',
    reviewer_name: 'Meera Pillai',
    reviewer_avatar: 'https://readdy.ai/api/search-image?query=young%20south%20indian%20woman%20professional%20headshot%20portrait%20warm%20smile%20neutral%20background%20casual&width=100&height=100&seq=205&orientation=squarish',
    subject_name: 'Rajesh Iyer',
    subject_avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20man%20headshot%20portrait%20confident%20smile%20neutral%20background%20business%20suit%20middle%20aged&width=100&height=100&seq=106&orientation=squarish',
    property: 'Luxury 2BHK with Pool Access',
    location: 'Juhu, Mumbai',
    tenancy_period: 'Nov 2024 – Apr 2026',
    overall_rating: 4,
    answers: [
      { question: 'Did not charge extra or hidden rent', value: true },
      { question: 'Provided all promised amenities', value: true },
      { question: 'Responded to maintenance requests quickly', value: false },
      { question: 'Respected tenant\'s privacy', value: true },
      { question: 'Returned security deposit on time', value: true },
      { question: 'Provided a fair and transparent rent agreement', value: true },
      { question: 'Harassed or pressured the tenant', value: false },
      { question: 'Charged utilities fairly and transparently', value: true },
    ],
    comment: 'Great property and fair owner. The pool and gym were always well-maintained. Only downside was maintenance requests sometimes took 3-4 days. Overall a positive experience.',
    created_at: '2026-04-20',
  },
];
