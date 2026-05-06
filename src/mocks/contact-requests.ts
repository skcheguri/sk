export type RequestStatus = 'pending' | 'approved' | 'declined';

export interface ContactRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingLocation: string;
  listingPrice: number;
  prospectId: string;
  prospectName: string;
  prospectInitials: string;
  prospectMessage: string;
  requestedAt: string;
  status: RequestStatus;
  respondedAt?: string;
  scannedViaQR: boolean;
  moveInDate?: string;
  occupation?: string;
}

export const contactRequests: ContactRequest[] = [
  {
    id: 'req-arjun-1',
    listingId: '1',
    listingTitle: 'Sunny 2BHK in Bandra West',
    listingLocation: 'Bandra West, Mumbai',
    listingPrice: 35000,
    prospectId: 'mock-tenant-001',
    prospectName: 'Arjun Mehta',
    prospectInitials: 'AM',
    prospectMessage: 'Hi, I am interested in this property. Is it still available? I am looking to move in by May 2026.',
    requestedAt: '2026-04-26T10:00:00Z',
    status: 'approved',
    respondedAt: '2026-04-26T14:00:00Z',
    scannedViaQR: false,
    moveInDate: 'May 2026',
    occupation: 'Software Engineer',
  },
  {
    id: 'req-arjun-2',
    listingId: '2',
    listingTitle: 'Cozy Studio Near IIT Bombay',
    listingLocation: 'Powai, Mumbai',
    listingPrice: 18000,
    prospectId: 'mock-tenant-001',
    prospectName: 'Arjun Mehta',
    prospectInitials: 'AM',
    prospectMessage: 'Looking for a studio near IIT for my research work. Is this available for immediate occupancy?',
    requestedAt: '2026-04-27T09:30:00Z',
    status: 'pending',
    scannedViaQR: false,
    moveInDate: 'Immediate',
    occupation: 'Software Engineer',
  },
  {
    id: 'req-1',
    listingId: '3',
    listingTitle: 'Spacious 3BHK Family Home',
    listingLocation: 'Koramangala, Bangalore',
    listingPrice: 45000,
    prospectId: 'mock-tenant-aditya',
    prospectName: 'Aditya Kumar',
    prospectInitials: 'AK',
    prospectMessage: 'Hi, I scanned the QR code outside the building. I am looking for a 3BHK for my family of 3. Can we schedule a visit this weekend?',
    requestedAt: '2026-04-28T09:15:00Z',
    status: 'pending',
    scannedViaQR: true,
    moveInDate: 'May 2026',
    occupation: 'Software Engineer',
  },
  {
    id: 'req-2',
    listingId: '3',
    listingTitle: 'Spacious 3BHK Family Home',
    listingLocation: 'Koramangala, Bangalore',
    listingPrice: 45000,
    prospectId: 'mock-tenant-meera',
    prospectName: 'Meera Nair',
    prospectInitials: 'MN',
    prospectMessage: 'Saw the QR near the entrance. I\'m a working professional, looking for immediate occupancy. Is the flat still available?',
    requestedAt: '2026-04-27T16:45:00Z',
    status: 'pending',
    scannedViaQR: true,
    moveInDate: 'Immediate',
    occupation: 'Product Manager',
  },
  {
    id: 'req-3',
    listingId: '6',
    listingTitle: 'Luxury 2BHK with Pool Access',
    listingLocation: 'HSR Layout, Bangalore',
    listingPrice: 28000,
    prospectId: 'mock-tenant-rajesh',
    prospectName: 'Rajesh Patel',
    prospectInitials: 'RP',
    prospectMessage: 'I am interested in this flat. Can you share more details about the society amenities and parking availability?',
    requestedAt: '2026-04-26T11:20:00Z',
    status: 'approved',
    respondedAt: '2026-04-26T14:30:00Z',
    scannedViaQR: false,
    moveInDate: 'June 2026',
    occupation: 'Business Analyst',
  },
  {
    id: 'req-4',
    listingId: '3',
    listingTitle: '3 BHK Premium Flat in Koramangala',
    listingLocation: 'Koramangala, Bangalore',
    listingPrice: 45000,
    prospectId: 'mock-tenant-sunita',
    prospectName: 'Sunita Reddy',
    prospectInitials: 'SR',
    prospectMessage: 'Scanned QR outside the gate. We are a couple looking for 3BHK. Stable income, no pets. When can we visit?',
    requestedAt: '2026-04-25T08:00:00Z',
    status: 'approved',
    respondedAt: '2026-04-25T10:00:00Z',
    scannedViaQR: true,
    moveInDate: 'May 2026',
    occupation: 'Doctor',
  },
  {
    id: 'req-5',
    listingId: '6',
    listingTitle: 'Luxury 2BHK with Pool Access',
    listingLocation: 'HSR Layout, Bangalore',
    listingPrice: 28000,
    prospectId: 'mock-tenant-farhan',
    prospectName: 'Farhan Sheikh',
    prospectInitials: 'FS',
    prospectMessage: 'Hi, I found this listing online. Looking for a 2BHK, can you let me know if pets are allowed?',
    requestedAt: '2026-04-24T13:00:00Z',
    status: 'declined',
    respondedAt: '2026-04-24T17:00:00Z',
    scannedViaQR: false,
    moveInDate: 'July 2026',
    occupation: 'Designer',
  },
];
