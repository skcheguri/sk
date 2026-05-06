export interface BrokerReport {
  id: string;
  tenant_id: string;
  tenant_name: string;
  owner_id: string;
  owner_name: string;
  listing_id: string;
  listing_title: string;
  reason: 'broker_agent' | 'asked_commission' | 'shared_competing_listing' | 'refused_identity' | 'other';
  reason_text: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_note: string;
  created_at: string;
  updated_at: string;
}

export const mockBrokerReports: BrokerReport[] = [
  {
    id: 'br-001',
    tenant_id: 't1',
    tenant_name: 'Rohan Verma',
    owner_id: 'o1',
    owner_name: 'Suresh Patel',
    listing_id: 'l3',
    listing_title: '2BHK in Koramangala',
    reason: 'broker_agent',
    reason_text: 'Tenant demanded \u20b915,000 commission to "close the deal" and shared another broker\'s contact.',
    status: 'pending',
    admin_note: '',
    created_at: '2026-05-01T10:30:00Z',
    updated_at: '2026-05-01T10:30:00Z',
  },
  {
    id: 'br-002',
    tenant_id: 't2',
    tenant_name: 'Neha Gupta',
    owner_id: 'o2',
    owner_name: 'Anil Sharma',
    listing_id: 'l5',
    listing_title: '3BHK Villa in Whitefield',
    reason: 'shared_competing_listing',
    reason_text: 'Sent a competing listing from another platform while claiming to be a direct tenant.',
    status: 'pending',
    admin_note: '',
    created_at: '2026-05-02T14:15:00Z',
    updated_at: '2026-05-02T14:15:00Z',
  },
  {
    id: 'br-003',
    tenant_id: 't3',
    tenant_name: 'Arjun Nair',
    owner_id: 'o1',
    owner_name: 'Suresh Patel',
    listing_id: 'l6',
    listing_title: 'Studio in HSR Layout',
    reason: 'refused_identity',
    reason_text: 'Declined to share Aadhaar when requested. Behaviour consistent with broker patterns.',
    status: 'resolved',
    admin_note: 'Tenant re-verified Aadhaar and provided employment proof. Block lifted.',
    created_at: '2026-04-28T09:00:00Z',
    updated_at: '2026-04-30T16:20:00Z',
  },
  {
    id: 'br-004',
    tenant_id: 't1',
    tenant_name: 'Rohan Verma',
    owner_id: 'o3',
    owner_name: 'Meera Iyer',
    listing_id: 'l7',
    listing_title: '1BHK near MG Road',
    reason: 'asked_commission',
    reason_text: 'Asked for a "facilitation fee" of \u20b910,000 before showing the property.',
    status: 'reviewed',
    admin_note: 'Second report for same tenant. Monitoring for pattern.',
    created_at: '2026-05-02T11:00:00Z',
    updated_at: '2026-05-02T18:00:00Z',
  },
  {
    id: 'br-005',
    tenant_id: 't4',
    tenant_name: 'Karan Singh',
    owner_id: 'o2',
    owner_name: 'Anil Sharma',
    listing_id: 'l8',
    listing_title: '2BHK in Indiranagar',
    reason: 'other',
    reason_text: 'Pretended to be the owner of the property to sublet it to other tenants.',
    status: 'dismissed',
    admin_note: 'Investigation found no evidence. Owner confirmed tenant was genuine.',
    created_at: '2026-04-25T08:45:00Z',
    updated_at: '2026-04-27T12:00:00Z',
  },
];

export const brokerReports = mockBrokerReports;