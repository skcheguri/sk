export interface SoftBlockState {
  tenant_id: string;
  tenant_name: string;
  active: boolean;
  triggered_at: string | null;
  aadhaar_re_verified: boolean;
  additional_details_provided: boolean;
  details: {
    employer_name?: string;
    company_address?: string;
    reference_contact?: string;
    purpose_of_renting?: string;
  } | null;
}

export const mockSoftBlockStates: SoftBlockState[] = [
  {
    tenant_id: 't1',
    tenant_name: 'Rohan Verma',
    active: true,
    triggered_at: '2026-05-02T14:15:00Z',
    aadhaar_re_verified: false,
    additional_details_provided: false,
    details: null,
  },
  {
    tenant_id: 't3',
    tenant_name: 'Arjun Nair',
    active: false,
    triggered_at: '2026-04-28T09:00:00Z',
    aadhaar_re_verified: true,
    additional_details_provided: true,
    details: {
      employer_name: 'TechMinds Pvt Ltd',
      company_address: 'Electronic City, Bangalore',
      reference_contact: '+91 98765 43210',
      purpose_of_renting: 'Job relocation — need 1BHK near office',
    },
  },
];

export const softBlockStates = mockSoftBlockStates;
