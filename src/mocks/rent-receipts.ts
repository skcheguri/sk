export interface ReceiptData {
  id: string;
  landlordName: string;
  landlordPan: string;
  landlordAddress: string;
  tenantName: string;
  tenantPan: string;
  propertyAddress: string;
  periodFrom: string;
  periodTo: string;
  month: string;
  year: string;
  rentAmount: string;
  paymentMode: 'cash' | 'cheque' | 'upi' | 'bank_transfer' | 'card';
  transactionRef: string;
  paymentDate: string;
  includesMaintenance: boolean;
  maintenanceAmount: string;
  notes: string;
}

export interface SavedReceipt {
  id: string;
  receiptNumber: string;
  createdAt: string;
  sentToTenant: boolean;
  sentAt?: string;
  data: ReceiptData;
}

export const savedReceipts: SavedReceipt[] = [
  {
    id: 'rcpt-1',
    receiptNumber: 'RCPT-2026-001',
    createdAt: '2026-04-05T10:30:00Z',
    sentToTenant: true,
    sentAt: '2026-04-05T10:32:00Z',
    data: {
      id: 'rcpt-1',
      landlordName: 'Suresh Patel',
      landlordPan: 'ABCPD1234E',
      landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
      tenantName: 'Arjun Mehta',
      tenantPan: 'ABCDE1234F',
      propertyAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
      periodFrom: '2026-04-01',
      periodTo: '2026-04-30',
      month: 'April',
      year: '2026',
      rentAmount: '22000',
      paymentMode: 'upi',
      transactionRef: 'UPI/123456789012/RENT',
      paymentDate: '2026-04-01',
      includesMaintenance: true,
      maintenanceAmount: '2000',
      notes: 'Monthly rent for April 2026 including maintenance charges.',
    },
  },
  {
    id: 'rcpt-2',
    receiptNumber: 'RCPT-2026-002',
    createdAt: '2026-03-05T10:35:00Z',
    sentToTenant: true,
    sentAt: '2026-03-05T10:36:00Z',
    data: {
      id: 'rcpt-2',
      landlordName: 'Suresh Patel',
      landlordPan: 'ABCPD1234E',
      landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
      tenantName: 'Arjun Mehta',
      tenantPan: 'ABCDE1234F',
      propertyAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
      periodFrom: '2026-03-01',
      periodTo: '2026-03-31',
      month: 'March',
      year: '2026',
      rentAmount: '22000',
      paymentMode: 'upi',
      transactionRef: 'UPI/987654321098/RENT',
      paymentDate: '2026-03-01',
      includesMaintenance: true,
      maintenanceAmount: '2000',
      notes: 'Monthly rent for March 2026 including maintenance charges.',
    },
  },
  {
    id: 'rcpt-3',
    receiptNumber: 'RCPT-2026-003',
    createdAt: '2026-02-05T10:35:00Z',
    sentToTenant: false,
    data: {
      id: 'rcpt-3',
      landlordName: 'Suresh Patel',
      landlordPan: 'ABCPD1234E',
      landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
      tenantName: 'Arjun Mehta',
      tenantPan: 'ABCDE1234F',
      propertyAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
      periodFrom: '2026-02-01',
      periodTo: '2026-02-28',
      month: 'February',
      year: '2026',
      rentAmount: '22000',
      paymentMode: 'bank_transfer',
      transactionRef: 'NEFT/ICIC/1234567890',
      paymentDate: '2026-02-01',
      includesMaintenance: true,
      maintenanceAmount: '2000',
      notes: 'Monthly rent for February 2026.',
    },
  },
];