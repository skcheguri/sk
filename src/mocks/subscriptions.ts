export interface SubscriptionData {
  id: string;
  owner_id: string;
  plan: 'free' | 'pro_monthly' | 'pro_annual';
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoice {
  id: string;
  owner_id: string;
  subscription_id: string | null;
  invoice_number: string;
  plan: 'free' | 'pro_monthly' | 'pro_annual';
  amount: number;
  gst_amount: number;
  total_amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'refunded' | 'pending';
  razorpay_payment_id: string | null;
  razorpay_invoice_id: string | null;
  billing_period_start: string;
  billing_period_end: string;
  paid_at: string | null;
  created_at: string;
}

export interface SubscriptionFeature {
  id: string;
  owner_id: string;
  feature_key: string;
  enabled: boolean;
  source: 'plan' | 'addon' | 'trial';
  expires_at: string | null;
  created_at: string;
}

// Pro-tier owner (Suresh Patel — mock-owner-001)
export const mockSubscriptions: SubscriptionData[] = [
  {
    id: 'sub-pro-001',
    owner_id: 'mock-owner-001',
    plan: 'pro_monthly',
    status: 'active',
    razorpay_subscription_id: 'sub_mock_razorpay_001',
    razorpay_customer_id: 'cust_mock_razorpay_001',
    current_period_start: '2026-05-01T00:00:00Z',
    current_period_end: '2026-05-31T23:59:59Z',
    trial_ends_at: null,
    cancel_at_period_end: false,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
];

export const mockBillingHistory: BillingInvoice[] = [
  {
    id: 'inv-001',
    owner_id: 'mock-owner-001',
    subscription_id: 'sub-pro-001',
    invoice_number: 'BGL-2026-0001',
    plan: 'pro_monthly',
    amount: 19900,
    gst_amount: 3582,
    total_amount: 23482,
    currency: 'INR',
    status: 'paid',
    razorpay_payment_id: 'pay_mock_001',
    razorpay_invoice_id: null,
    billing_period_start: '2026-04-01',
    billing_period_end: '2026-04-30',
    paid_at: '2026-04-01T08:30:00Z',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'inv-002',
    owner_id: 'mock-owner-001',
    subscription_id: 'sub-pro-001',
    invoice_number: 'BGL-2026-0002',
    plan: 'pro_monthly',
    amount: 19900,
    gst_amount: 3582,
    total_amount: 23482,
    currency: 'INR',
    status: 'paid',
    razorpay_payment_id: 'pay_mock_002',
    razorpay_invoice_id: null,
    billing_period_start: '2026-05-01',
    billing_period_end: '2026-05-31',
    paid_at: '2026-05-01T08:30:00Z',
    created_at: '2026-05-01T00:00:00Z',
  },
];

export const mockSubscriptionFeatures: SubscriptionFeature[] = [
  { id: 'sf-001', owner_id: 'mock-owner-001', feature_key: 'analytics', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-002', owner_id: 'mock-owner-001', feature_key: 'auto_reminders', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-003', owner_id: 'mock-owner-001', feature_key: 'bulk_receipts', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-004', owner_id: 'mock-owner-001', feature_key: 'priority_listing', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-005', owner_id: 'mock-owner-001', feature_key: 'pro_badge', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-006', owner_id: 'mock-owner-001', feature_key: 'custom_url', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-007', owner_id: 'mock-owner-001', feature_key: 'advanced_tax', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-008', owner_id: 'mock-owner-001', feature_key: 'export_data', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
  { id: 'sf-009', owner_id: 'mock-owner-001', feature_key: 'priority_support', enabled: true, source: 'plan', expires_at: null, created_at: '2026-04-01T00:00:00Z' },
];

// Free tier limits (generous — unlimited on all counts)
export const FREE_TIER_LIMITS = {
  maxProperties: Infinity,
  maxListings: Infinity,
  maxInquiriesPerMonth: Infinity,
} as const;

// Feature matrix for gating
export const PRO_FEATURE_KEYS = [
  'analytics',
  'auto_reminders',
  'bulk_receipts',
  'priority_listing',
  'custom_url',
  'advanced_tax',
  'export_data',
  'priority_support',
] as const;