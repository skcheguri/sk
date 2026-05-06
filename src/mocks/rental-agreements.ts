export interface RentalAgreement {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantPan: string;
  tenantAadhaar: string;
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;
  landlordPan: string;
  propertyAddress: string;
  propertyDescription: string;
  flatNumber: string;
  carpetArea: number;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  securityDeposit: number;
  rentDueDay: number;
  paymentMode: string;
  maintenanceAmount: number;
  noticePeriodDays: number;
  lockInMonths: number;
  renewalClause: string;
  createdAt: string;
  signedByLandlord: boolean;
  signedByTenant: boolean;
  sharedWithTenant: boolean;
  witness1Name: string;
  witness1Address: string;
  witness2Name: string;
  witness2Address: string;
}

export const rentalAgreements: RentalAgreement[] = [
  {
    id: 'agree-t1',
    tenantId: 't1',
    tenantName: 'Arjun Mehta',
    tenantAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
    tenantPhone: '+91-98765-43210',
    tenantEmail: 'arjun.mehta@email.com',
    tenantPan: 'ABCDE1234F',
    tenantAadhaar: 'XXXX XXXX 1234',
    landlordName: 'Suresh Patel',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    landlordPhone: '+91-98450-12345',
    landlordEmail: 'suresh.patel@email.com',
    landlordPan: 'ABCPD1234E',
    propertyAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
    propertyDescription: 'Residential apartment with 2 bedrooms, 2 bathrooms, modular kitchen, balcony, and 1 covered parking slot.',
    flatNumber: 'B-204',
    carpetArea: 1150,
    leaseStartDate: '2024-01-01',
    leaseEndDate: '2026-12-31',
    monthlyRent: 22000,
    securityDeposit: 66000,
    rentDueDay: 5,
    paymentMode: 'Bank Transfer (NEFT/IMPS)',
    maintenanceAmount: 2000,
    noticePeriodDays: 60,
    lockInMonths: 12,
    renewalClause: 'Renewable by mutual consent with 10% rent escalation after 2 years.',
    createdAt: '2023-12-20T10:00:00Z',
    signedByLandlord: true,
    signedByTenant: true,
    sharedWithTenant: true,
    witness1Name: 'Ramesh Gupta',
    witness1Address: 'Flat C-105, Prestige Towers, Bangalore - 560034',
    witness2Name: 'Anita Sharma',
    witness2Address: 'Flat D-301, Prestige Towers, Bangalore - 560034',
  },
  {
    id: 'agree-t2',
    tenantId: 't2',
    tenantName: 'Priya Sharma',
    tenantAddress: 'Flat A-101, Prestige Towers, Koramangala, Bangalore - 560034',
    tenantPhone: '+91-98888-77777',
    tenantEmail: 'priya.sharma@email.com',
    tenantPan: 'FGHIJ5678K',
    tenantAadhaar: 'XXXX XXXX 5678',
    landlordName: 'Suresh Patel',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    landlordPhone: '+91-98450-12345',
    landlordEmail: 'suresh.patel@email.com',
    landlordPan: 'ABCPD1234E',
    propertyAddress: 'Flat A-101, Prestige Towers, Koramangala, Bangalore - 560034',
    propertyDescription: 'Residential apartment with 2 bedrooms, 2 bathrooms, semi-furnished kitchen, balcony.',
    flatNumber: 'A-101',
    carpetArea: 980,
    leaseStartDate: '2024-04-01',
    leaseEndDate: '2027-03-31',
    monthlyRent: 20000,
    securityDeposit: 60000,
    rentDueDay: 5,
    paymentMode: 'UPI / Bank Transfer',
    maintenanceAmount: 1500,
    noticePeriodDays: 60,
    lockInMonths: 12,
    renewalClause: 'Renewable by mutual consent with 10% rent escalation after 2 years.',
    createdAt: '2024-03-15T10:00:00Z',
    signedByLandlord: true,
    signedByTenant: true,
    sharedWithTenant: true,
    witness1Name: 'Vikram Singh',
    witness1Address: 'Flat A-203, Green Valley Flats, Bangalore - 560102',
    witness2Name: 'Sneha Iyer',
    witness2Address: 'Flat D-105, Prestige Towers, Bangalore - 560034',
  },
  {
    id: 'agree-t4',
    tenantId: 't4',
    tenantName: 'Sneha Iyer',
    tenantAddress: 'Flat D-105, Prestige Towers, Koramangala, Bangalore - 560034',
    tenantPhone: '+91-96666-55555',
    tenantEmail: 'sneha.iyer@email.com',
    tenantPan: 'LMNOP9012Q',
    tenantAadhaar: 'XXXX XXXX 9012',
    landlordName: 'Suresh Patel',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    landlordPhone: '+91-98450-12345',
    landlordEmail: 'suresh.patel@email.com',
    landlordPan: 'ABCPD1234E',
    propertyAddress: 'Flat D-105, Prestige Towers, Koramangala, Bangalore - 560034',
    propertyDescription: 'Residential apartment with 2 bedrooms, 2 bathrooms, fully furnished, balcony with garden view.',
    flatNumber: 'D-105',
    carpetArea: 1080,
    leaseStartDate: '2024-10-01',
    leaseEndDate: '2026-09-30',
    monthlyRent: 22000,
    securityDeposit: 66000,
    rentDueDay: 5,
    paymentMode: 'Bank Transfer',
    maintenanceAmount: 1800,
    noticePeriodDays: 60,
    lockInMonths: 12,
    renewalClause: 'Renewable by mutual consent with 10% rent escalation after 2 years.',
    createdAt: '2024-09-20T10:00:00Z',
    signedByLandlord: true,
    signedByTenant: true,
    sharedWithTenant: true,
    witness1Name: 'Arjun Mehta',
    witness1Address: 'Flat B-204, Prestige Towers, Bangalore - 560034',
    witness2Name: 'Priya Sharma',
    witness2Address: 'Flat A-101, Prestige Towers, Bangalore - 560034',
  },
  {
    id: 'agree-t5',
    tenantId: 't5',
    tenantName: 'Vikram Singh',
    tenantAddress: 'Flat A-203, Green Valley Flats, HSR Layout, Bangalore - 560102',
    tenantPhone: '+91-95555-44444',
    tenantEmail: 'vikram.singh@email.com',
    tenantPan: 'QRSTU3456V',
    tenantAadhaar: 'XXXX XXXX 3456',
    landlordName: 'Suresh Patel',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    landlordPhone: '+91-98450-12345',
    landlordEmail: 'suresh.patel@email.com',
    landlordPan: 'ABCPD1234E',
    propertyAddress: 'Flat A-203, Green Valley Flats, HSR Layout, Bangalore - 560102',
    propertyDescription: 'Residential apartment with 1 bedroom, 1 bathroom, semi-furnished, covered parking available.',
    flatNumber: 'A-203',
    carpetArea: 720,
    leaseStartDate: '2024-12-01',
    leaseEndDate: '2026-11-30',
    monthlyRent: 18000,
    securityDeposit: 54000,
    rentDueDay: 5,
    paymentMode: 'NEFT / IMPS',
    maintenanceAmount: 1200,
    noticePeriodDays: 60,
    lockInMonths: 12,
    renewalClause: 'Renewable by mutual consent with 10% rent escalation after 2 years.',
    createdAt: '2024-11-15T10:00:00Z',
    signedByLandlord: true,
    signedByTenant: true,
    sharedWithTenant: true,
    witness1Name: 'Rahul Nair',
    witness1Address: 'Flat C-302, Prestige Towers, Bangalore - 560034',
    witness2Name: 'Meera Nair',
    witness2Address: 'Flat A-101, Prestige Towers, Bangalore - 560034',
  },
];