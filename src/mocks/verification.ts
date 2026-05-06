export interface VerifiedUser {
  id: string;
  name: string;
  role: 'renter' | 'owner';
  aadhaarLast4: string;
  verifiedAt: string;
  avatar: string;
  badge: 'aadhaar_verified';
}

export const verifiedUsers: VerifiedUser[] = [
  {
    id: 'u1',
    name: 'Rajesh Kumar',
    role: 'owner',
    aadhaarLast4: '4821',
    verifiedAt: '2025-11-10',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20Indian%20man%2040s%20confident%20friendly%20portrait%20clean%20background%20neutral%20tones&width=80&height=80&seq=v1&orientation=squarish',
    badge: 'aadhaar_verified',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    role: 'renter',
    aadhaarLast4: '7634',
    verifiedAt: '2025-12-02',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20Indian%20woman%2030s%20smiling%20portrait%20clean%20background%20neutral%20tones&width=80&height=80&seq=v2&orientation=squarish',
    badge: 'aadhaar_verified',
  },
  {
    id: 'u3',
    name: 'Anil Mehta',
    role: 'owner',
    aadhaarLast4: '2290',
    verifiedAt: '2026-01-15',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20Indian%20man%2050s%20trustworthy%20portrait%20clean%20background%20neutral%20tones&width=80&height=80&seq=v3&orientation=squarish',
    badge: 'aadhaar_verified',
  },
];

export const verificationFaqs = [
  {
    q: 'Why is Aadhaar verification required?',
    a: 'Aadhaar verification ensures every person on Bhavan is a real, identifiable individual — not a broker, fake account, or fraudster. It protects both renters and owners.',
  },
  {
    q: 'Is my Aadhaar data stored on your servers?',
    a: 'No. We only store the last 4 digits of your Aadhaar number and your verified name for display purposes. The full Aadhaar number is never stored.',
  },
  {
    q: 'Can I contact an owner without Aadhaar verification?',
    a: 'No. To prevent brokers and fake inquiries, only Aadhaar-verified renters can contact property owners. Similarly, only verified owners can list properties.',
  },
  {
    q: 'Will the rental agreement be in my Aadhaar name?',
    a: 'Yes. The rental agreement must be executed in the same name as your Aadhaar card. This prevents brokers from acting as middlemen and ensures legal accountability.',
  },
  {
    q: 'How long does verification take?',
    a: 'Aadhaar OTP verification is instant — usually under 60 seconds. Once verified, your profile shows the Aadhaar Verified badge immediately.',
  },
];
