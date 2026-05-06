export interface TenantTaxDocument {
  id: string;
  title: string;
  description: string;
  formCode: string;
  status: 'available' | 'pending' | 'generated';
  year: string;
  icon: string;
  color: string;
}

export const tenantTaxDocuments: TenantTaxDocument[] = [
  {
    id: 'tax-1',
    title: 'HRA Exemption Calculator',
    description: 'Calculate your House Rent Allowance exemption for FY 2025-26 based on rent paid, salary, and city classification.',
    formCode: 'HRA-2025-26',
    status: 'available',
    year: '2025-26',
    icon: 'ri-home-4-line',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'tax-2',
    title: 'Rent Summary for ITR',
    description: 'Yearly rent payment summary with landlord PAN for claiming HRA or 80GG deduction in your ITR.',
    formCode: 'ITR-SUMMARY-2025-26',
    status: 'generated',
    year: '2025-26',
    icon: 'ri-file-list-3-line',
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'tax-3',
    title: 'Form 16B (TDS on Rent)',
    description: 'Download TDS certificate if your landlord deducts tax on rent paid above ₹50,000/month.',
    formCode: '16B-2025-26',
    status: 'pending',
    year: '2025-26',
    icon: 'ri-government-line',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'tax-4',
    title: '80GG Declaration',
    description: 'For those not receiving HRA — claim deduction for rent paid under Section 80GG.',
    formCode: '80GG-2025-26',
    status: 'available',
    year: '2025-26',
    icon: 'ri-file-text-line',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'tax-5',
    title: 'Landlord PAN Verification',
    description: 'Verify your landlord\'s PAN for accurate tax filing and TDS compliance.',
    formCode: 'PAN-VERIFY',
    status: 'generated',
    year: '2025-26',
    icon: 'ri-shield-check-line',
    color: 'bg-blue-50 text-blue-600',
  },
];