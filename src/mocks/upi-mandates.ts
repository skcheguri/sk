export interface UPIMandate {
  id: string;
  tenant_id: string;
  owner_id: string;
  property_id: string;
  upi_id: string;
  bank_account: string;
  mandate_amount: number; // in paise
  frequency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  razorpay_token: string | null;
  created_at: string;
  updated_at: string;
}

export const mockUPIMandates: UPIMandate[] = [
  {
    id: 'mand-001',
    tenant_id: 'mock-tenant-001',
    owner_id: 'mock-owner-001',
    property_id: 'p1',
    upi_id: 'arjun.mehta@okicici',
    bank_account: 'XXXX XXXX 4521',
    mandate_amount: 2200000,
    frequency: 'monthly',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
    razorpay_token: 'token_razorpay_001',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'mand-002',
    tenant_id: 'mock-tenant-002',
    owner_id: 'mock-owner-001',
    property_id: 'p1',
    upi_id: 'priya.sharma@okhdfc',
    bank_account: 'XXXX XXXX 8833',
    mandate_amount: 2000000,
    frequency: 'monthly',
    start_date: '2026-02-01',
    end_date: '2026-12-31',
    status: 'active',
    razorpay_token: 'token_razorpay_002',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'mand-003',
    tenant_id: 'mock-tenant-003',
    owner_id: 'mock-owner-001',
    property_id: 'p1',
    upi_id: 'rahul.nair@oksbi',
    bank_account: 'XXXX XXXX 1199',
    mandate_amount: 2400000,
    frequency: 'monthly',
    start_date: '2025-06-01',
    end_date: '2026-05-31',
    status: 'paused',
    razorpay_token: 'token_razorpay_003',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },
];