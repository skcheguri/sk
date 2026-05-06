import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { RentalAgreement } from '@/mocks/rental-agreements';
import { savedRentalAgreements } from '@/mocks/saved-rental-agreements';

interface AgreementFormData {
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
  carpetArea: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
  securityDeposit: string;
  rentDueDay: string;
  paymentMode: string;
  maintenanceAmount: string;
  noticePeriodDays: string;
  lockInMonths: string;
  renewalClause: string;
  witness1Name: string;
  witness1Address: string;
  witness2Name: string;
  witness2Address: string;
}

interface SavedAgreement {
  id: string;
  agreementNumber: string;
  createdAt: string;
  sentToTenant: boolean;
  sentAt?: string;
  data: RentalAgreement;
}

const paymentModes = [
  { value: 'Bank Transfer (NEFT/IMPS)', label: 'Bank Transfer (NEFT/IMPS)' },
  { value: 'UPI / Bank Transfer', label: 'UPI / Bank Transfer' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Demand Draft', label: 'Demand Draft' },
];

const defaultRenewal = 'Renewable by mutual consent with 10% rent escalation after 1 year.';

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertChunk(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertChunk(n % 100) : '');
  }

  const parts: number[] = [];
  let remaining = num;
  parts.push(remaining % 1000);
  remaining = Math.floor(remaining / 1000);
  while (remaining > 0) {
    parts.push(remaining % 100);
    remaining = Math.floor(remaining / 100);
  }

  let result = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] > 0) {
      result += convertChunk(parts[i]) + ' ' + scales[i] + ' ';
    }
  }

  return result.trim() + ' Rupees Only';
}

function formatINR(num: number): string {
  return `\u20b9${num.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function generateAgreementNumber(): string {
  const now = new Date();
  const seq = String(now.getTime()).slice(-4);
  return `RA-${now.getFullYear()}-${seq}`;
}

export default function RentalAgreements() {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';
  const profileLink = isTenant ? '/tenant-profile' : '/owner-profile';
  const profileLabel = isTenant ? 'Tenant Profile' : 'Owner Profile';
  const printRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [savedAgreements, setSavedAgreements] = useState<SavedAgreement[]>(savedRentalAgreements);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSendSuccess, setShowSendSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAgreement, setPreviewAgreement] = useState<SavedAgreement | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<AgreementFormData>({
    tenantName: 'Rahul Nair',
    tenantAddress: 'Flat C-302, Prestige Towers, Koramangala, Bangalore - 560034',
    tenantPhone: '+91-94444-33333',
    tenantEmail: 'rahul.nair@email.com',
    tenantPan: 'VWXYZ7890A',
    tenantAadhaar: 'XXXX XXXX 7890',
    landlordName: user?.name || 'Suresh Patel',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    landlordPhone: '+91-98450-12345',
    landlordEmail: 'suresh.patel@email.com',
    landlordPan: 'ABCPD1234E',
    propertyAddress: 'Flat C-302, Prestige Towers, Koramangala, Bangalore - 560034',
    propertyDescription: 'Residential apartment with 2 bedrooms, 2 bathrooms, modular kitchen, balcony, and 1 covered parking slot.',
    flatNumber: 'C-302',
    carpetArea: '1150',
    leaseStartDate: today,
    leaseEndDate: `${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    monthlyRent: '22000',
    securityDeposit: '66000',
    rentDueDay: '5',
    paymentMode: 'Bank Transfer (NEFT/IMPS)',
    maintenanceAmount: '2000',
    noticePeriodDays: '60',
    lockInMonths: '12',
    renewalClause: defaultRenewal,
    witness1Name: 'Arjun Mehta',
    witness1Address: 'Flat B-204, Prestige Towers, Bangalore - 560034',
    witness2Name: 'Priya Sharma',
    witness2Address: 'Flat A-101, Prestige Towers, Bangalore - 560034',
  });

  const handleChange = (field: keyof AgreementFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildAgreementData = (): RentalAgreement => ({
    id: `agree-${Date.now()}`,
    tenantId: `t-${Date.now()}`,
    tenantName: form.tenantName,
    tenantAddress: form.tenantAddress,
    tenantPhone: form.tenantPhone,
    tenantEmail: form.tenantEmail,
    tenantPan: form.tenantPan.toUpperCase(),
    tenantAadhaar: form.tenantAadhaar,
    landlordName: form.landlordName,
    landlordAddress: form.landlordAddress,
    landlordPhone: form.landlordPhone,
    landlordEmail: form.landlordEmail,
    landlordPan: form.landlordPan.toUpperCase(),
    propertyAddress: form.propertyAddress,
    propertyDescription: form.propertyDescription,
    flatNumber: form.flatNumber,
    carpetArea: parseInt(form.carpetArea || '0', 10),
    leaseStartDate: form.leaseStartDate,
    leaseEndDate: form.leaseEndDate,
    monthlyRent: parseInt(form.monthlyRent || '0', 10),
    securityDeposit: parseInt(form.securityDeposit || '0', 10),
    rentDueDay: parseInt(form.rentDueDay || '5', 10),
    paymentMode: form.paymentMode,
    maintenanceAmount: parseInt(form.maintenanceAmount || '0', 10),
    noticePeriodDays: parseInt(form.noticePeriodDays || '60', 10),
    lockInMonths: parseInt(form.lockInMonths || '12', 10),
    renewalClause: form.renewalClause,
    createdAt: new Date().toISOString(),
    signedByLandlord: false,
    signedByTenant: false,
    witness1Name: form.witness1Name,
    witness1Address: form.witness1Address,
    witness2Name: form.witness2Name,
    witness2Address: form.witness2Address,
  });

  const handleGenerate = () => {
    const data = buildAgreementData();
    const newAgreement: SavedAgreement = {
      id: `saved-agree-${Date.now()}`,
      agreementNumber: generateAgreementNumber(),
      createdAt: new Date().toISOString(),
      sentToTenant: false,
      data,
    };
    setSavedAgreements((prev) => [newAgreement, ...prev]);
    setPreviewAgreement(newAgreement);
    setShowPreview(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSendToTenant = (id: string) => {
    const now = new Date().toISOString();
    setSavedAgreements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, sentToTenant: true, sentAt: now } : a))
    );
    setPreviewAgreement((prev) =>
      prev && prev.id === id ? { ...prev, sentToTenant: true, sentAt: now } : prev
    );
    setShowSendSuccess(true);
    setTimeout(() => setShowSendSuccess(false), 3000);
  };

  const handlePrint = () => {
    if (!printRef.current || !previewAgreement) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Rental Agreement - ${previewAgreement.data.tenantName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 40px; background: #fff; color: #1a1a1a; line-height: 1.6; }
            .doc-container { max-width: 800px; margin: 0 auto; }
            .doc-title { text-align: center; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
            .doc-subtitle { text-align: center; font-size: 11px; color: #666; margin-bottom: 24px; }
            .doc-section { margin-bottom: 20px; }
            .doc-heading { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; color: #333; }
            .doc-text { font-size: 12px; text-align: justify; margin-bottom: 12px; line-height: 1.8; }
            .doc-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
            .doc-table td { border: 1px solid #ccc; padding: 8px 12px; vertical-align: top; }
            .doc-table td:first-child { width: 35%; background: #f5f5f0; font-weight: 600; color: #444; }
            .doc-party { border: 1px solid #ccc; padding: 14px; margin-bottom: 12px; border-radius: 4px; }
            .doc-party h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; color: #333; }
            .doc-party p { font-size: 11px; margin-bottom: 3px; color: #444; }
            .doc-party .label { color: #888; font-weight: 500; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; }
            .sign-box { text-align: center; }
            .sign-line { border-top: 1.5px solid #1a1a1a; padding-top: 6px; margin-top: 40px; }
            .sign-name { font-size: 12px; font-weight: 600; color: #1a1a1a; }
            .sign-label { font-size: 10px; color: #666; }
            .stamp-area { width: 70px; height: 70px; border: 2px dashed #bbb; border-radius: 50%; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #888; text-align: center; line-height: 1.2; }
            .clause-list { list-style: decimal; padding-left: 20px; }
            .clause-list li { font-size: 11px; margin-bottom: 6px; line-height: 1.6; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const tabs = [
    { id: 'create' as const, label: 'Create Agreement', icon: 'ri-add-circle-line' },
    { id: 'history' as const, label: 'Agreement History', icon: 'ri-history-line' },
  ];

  const formSections = [
    {
      title: 'Landlord Information',
      fields: [
        { label: 'Landlord Name', key: 'landlordName' as const, type: 'text', grid: 1 },
        { label: 'PAN', key: 'landlordPan' as const, type: 'text', grid: 2, placeholder: 'ABCDE1234F', uppercase: true },
        { label: 'Phone', key: 'landlordPhone' as const, type: 'text', grid: 2 },
        { label: 'Email', key: 'landlordEmail' as const, type: 'email', grid: 1 },
        { label: 'Landlord Address', key: 'landlordAddress' as const, type: 'text', grid: 1 },
      ],
    },
    {
      title: 'Tenant Information',
      fields: [
        { label: 'Tenant Name', key: 'tenantName' as const, type: 'text', grid: 1 },
        { label: 'PAN', key: 'tenantPan' as const, type: 'text', grid: 2, placeholder: 'ABCDE1234F', uppercase: true },
        { label: 'Aadhaar (Last 4)', key: 'tenantAadhaar' as const, type: 'text', grid: 2, placeholder: 'XXXX XXXX 1234' },
        { label: 'Phone', key: 'tenantPhone' as const, type: 'text', grid: 2 },
        { label: 'Email', key: 'tenantEmail' as const, type: 'email', grid: 2 },
        { label: 'Tenant Address', key: 'tenantAddress' as const, type: 'text', grid: 1 },
      ],
    },
    {
      title: 'Property Details',
      fields: [
        { label: 'Property Address', key: 'propertyAddress' as const, type: 'text', grid: 1 },
        { label: 'Flat / Unit Number', key: 'flatNumber' as const, type: 'text', grid: 2 },
        { label: 'Carpet Area (sq. ft.)', key: 'carpetArea' as const, type: 'number', grid: 2 },
        { label: 'Property Description', key: 'propertyDescription' as const, type: 'text', grid: 1 },
      ],
    },
    {
      title: 'Lease Terms',
      fields: [
        { label: 'Lease Start Date', key: 'leaseStartDate' as const, type: 'date', grid: 2 },
        { label: 'Lease End Date', key: 'leaseEndDate' as const, type: 'date', grid: 2 },
        { label: 'Monthly Rent (\u20b9)', key: 'monthlyRent' as const, type: 'number', grid: 2 },
        { label: 'Security Deposit (\u20b9)', key: 'securityDeposit' as const, type: 'number', grid: 2 },
        { label: 'Rent Due Day (of month)', key: 'rentDueDay' as const, type: 'number', grid: 2 },
        { label: 'Payment Mode', key: 'paymentMode' as const, type: 'select', grid: 2, options: paymentModes },
        { label: 'Maintenance (\u20b9/mo)', key: 'maintenanceAmount' as const, type: 'number', grid: 2 },
        { label: 'Notice Period (days)', key: 'noticePeriodDays' as const, type: 'number', grid: 2 },
        { label: 'Lock-in Period (months)', key: 'lockInMonths' as const, type: 'number', grid: 2 },
        { label: 'Renewal Clause', key: 'renewalClause' as const, type: 'textarea', grid: 1 },
      ],
    },
    {
      title: 'Witnesses',
      fields: [
        { label: 'Witness 1 Name', key: 'witness1Name' as const, type: 'text', grid: 1 },
        { label: 'Witness 1 Address', key: 'witness1Address' as const, type: 'text', grid: 1 },
        { label: 'Witness 2 Name', key: 'witness2Name' as const, type: 'text', grid: 1 },
        { label: 'Witness 2 Address', key: 'witness2Address' as const, type: 'text', grid: 1 },
      ],
    },
  ];

  const agreement = previewAgreement?.data || buildAgreementData();

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {showSuccess && (
          <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <i className="ri-check-line" /> Agreement generated successfully
          </div>
        )}

        {showSendSuccess && (
          <div className="fixed top-24 right-6 z-50 bg-amber-500 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <i className="ri-check-line" /> Agreement shared with tenant
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link to={profileLink} className="text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer">{profileLabel}</Link>
            <i className="ri-arrow-right-s-line text-gray-300" />
            <span className="text-sm text-charcoal font-medium">Rental Agreements</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Rental Agreement Generator</h1>
              <p className="text-sm text-gray-500 mt-1">Generate legally compliant rental agreements for Indian properties</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-edit-line text-amber-600" />
                </div>
                Agreement Details
              </h2>

              {formSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{section.title}</h3>
                  <div className="space-y-3">
                    <div className={`grid gap-3 ${section.fields.some((f) => f.grid === 1) && section.fields.some((f) => f.grid === 2) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {section.fields.map((field) => (
                        <div key={field.key} className={field.grid === 2 ? 'sm:col-span-1' : 'sm:col-span-2'}>
                          <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={form[field.key]}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                              rows={2}
                              maxLength={300}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              value={form[field.key]}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                            >
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={form[field.key]}
                              onChange={(e) => handleChange(field.key, field.uppercase ? e.target.value.toUpperCase() : e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                              placeholder={field.placeholder}
                              maxLength={field.key.includes('Pan') ? 10 : undefined}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-file-text-line text-sm" /> Generate & Preview Agreement
              </button>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-charcoal flex items-center gap-2 mb-4">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-eye-line text-amber-600" />
                </div>
                Live Preview
              </h2>
              <div className="border-2 border-gray-800 rounded-xl overflow-hidden bg-white">
                <div className="p-5 md:p-6 text-sm overflow-y-auto max-h-[75vh]">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-charcoal tracking-[0.15em] uppercase">Rental Agreement</h3>
                    <p className="text-[10px] text-gray-500 mt-1">(Registered under the Indian Registration Act, 1908)</p>
                  </div>

                  <p className="text-[11px] text-justify mb-3 leading-relaxed text-gray-700">
                    This Rental Agreement is made and executed on <strong>{formatDate(agreement.createdAt || today)}</strong> at <strong>{agreement.propertyAddress.split(',').pop()?.trim() || 'Bangalore'}</strong>.
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-gray-800">1. Parties</p>
                  <div className="border border-gray-300 rounded-lg p-3 mb-3 text-[11px] space-y-1">
                    <p><span className="text-gray-500">Landlord:</span> <strong>{agreement.landlordName}</strong></p>
                    <p><span className="text-gray-500">Address:</span> {agreement.landlordAddress}</p>
                    <p><span className="text-gray-500">PAN:</span> {agreement.landlordPan}</p>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-3 mb-3 text-[11px] space-y-1">
                    <p><span className="text-gray-500">Tenant:</span> <strong>{agreement.tenantName}</strong></p>
                    <p><span className="text-gray-500">Address:</span> {agreement.tenantAddress}</p>
                    <p><span className="text-gray-500">PAN:</span> {agreement.tenantPan} &nbsp;|&nbsp; <span className="text-gray-500">Aadhaar:</span> {agreement.tenantAadhaar}</p>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-gray-800">2. Property</p>
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-[11px]">
                      <tbody>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 w-1/3 text-gray-600">Address</td><td className="px-3 py-1.5">{agreement.propertyAddress}</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Flat</td><td className="px-3 py-1.5">{agreement.flatNumber}</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Area</td><td className="px-3 py-1.5">{agreement.carpetArea} sq. ft.</td></tr>
                        <tr><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Description</td><td className="px-3 py-1.5">{agreement.propertyDescription}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-gray-800">3. Lease Term</p>
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-[11px]">
                      <tbody>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 w-1/3 text-gray-600">Start</td><td className="px-3 py-1.5">{formatDate(agreement.leaseStartDate)}</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">End</td><td className="px-3 py-1.5">{formatDate(agreement.leaseEndDate)}</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Lock-in</td><td className="px-3 py-1.5">{agreement.lockInMonths} months</td></tr>
                        <tr><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Notice</td><td className="px-3 py-1.5">{agreement.noticePeriodDays} days</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-gray-800">4. Rent & Deposit</p>
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-[11px]">
                      <tbody>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 w-1/3 text-gray-600">Monthly Rent</td><td className="px-3 py-1.5 font-bold">{formatINR(agreement.monthlyRent)} ({numberToWords(agreement.monthlyRent)})</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Security Deposit</td><td className="px-3 py-1.5 font-bold">{formatINR(agreement.securityDeposit)} ({numberToWords(agreement.securityDeposit)})</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Due Date</td><td className="px-3 py-1.5">{agreement.rentDueDay}<sup>th</sup> of every month</td></tr>
                        <tr className="border-b border-gray-200"><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Payment Mode</td><td className="px-3 py-1.5">{agreement.paymentMode}</td></tr>
                        <tr><td className="px-3 py-1.5 bg-gray-50 text-gray-600">Maintenance</td><td className="px-3 py-1.5">{formatINR(agreement.maintenanceAmount)} / month</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-gray-800">5. Terms & Conditions</p>
                  <ol className="list-decimal list-inside text-[10px] text-gray-700 space-y-1 mb-4 pl-1">
                    <li>Use premises solely for residential purposes.</li>
                    <li>No subletting without written consent.</li>
                    <li>Tenant responsible for minor repairs up to {formatINR(500)}.</li>
                    <li>No structural alterations without consent.</li>
                    <li>Compliance with society rules and local regulations.</li>
                    <li>24-hour notice required for landlord inspections.</li>
                    <li>Utility bills in tenant's name during lease period.</li>
                    <li>Security deposit refundable within 15 days of handover.</li>
                    <li>Disputes subject to local jurisdiction courts.</li>
                  </ol>

                  <div className="flex justify-between items-end mt-4 pt-4 border-t-2 border-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-16 border-2 border-dashed border-gray-400 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <span className="text-[8px] text-gray-400 text-center leading-tight">Revenue<br />Stamp<br />\u20b9100/-</span>
                      </div>
                      <p className="text-[9px] text-gray-400">(\u20b9100 Revenue Stamp)</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-800 w-36 pt-1">
                        <p className="text-xs font-semibold text-charcoal">{agreement.landlordName}</p>
                        <p className="text-[10px] text-gray-500">Landlord Signature</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-800 w-36 pt-1">
                        <p className="text-xs font-semibold text-charcoal">{agreement.tenantName}</p>
                        <p className="text-[10px] text-gray-500">Tenant Signature</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 text-center mt-4 pt-2 border-t border-gray-100">
                    Generated via Bhavan. Subject to registration under the Indian Registration Act, 1908.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {savedAgreements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                  <i className="ri-file-text-line text-2xl text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No agreements yet</h3>
                <p className="text-sm text-gray-500 mb-5">Generate your first rental agreement.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Create Agreement
                </button>
              </div>
            ) : (
              savedAgreements.map((saved) => (
                <div key={saved.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-50 flex-shrink-0">
                        <i className="ri-file-list-3-line text-xl text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-charcoal">{saved.agreementNumber}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Generated</span>
                          {saved.sentToTenant && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                              <i className="ri-check-double-line" /> Sent to Tenant
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {saved.data.tenantName} — {saved.data.flatNumber} · {saved.data.propertyAddress.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(saved.data.leaseStartDate)} — {formatDate(saved.data.leaseEndDate)} · {formatINR(saved.data.monthlyRent)}/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {!saved.sentToTenant && (
                        <button
                          onClick={() => handleSendToTenant(saved.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-send-plane-line text-xs" /> Share with Tenant
                        </button>
                      )}
                      <button
                        onClick={() => { setPreviewAgreement(saved); setShowPreview(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-eye-line text-xs" /> View
                      </button>
                      <button
                        onClick={() => { setPreviewAgreement(saved); setShowPreview(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-printer-line text-xs" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewAgreement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-charcoal">Agreement Preview</h3>
                  <p className="text-xs text-gray-400">{previewAgreement.agreementNumber} — {previewAgreement.data.tenantName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!previewAgreement.sentToTenant && (
                    <button
                      onClick={() => handleSendToTenant(previewAgreement.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-send-plane-line text-sm" /> Share with Tenant
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-printer-line text-sm" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div ref={printRef} className="doc-container">
                  <h1 className="doc-title">Rental Agreement</h1>
                  <p className="doc-subtitle">(Registered under the Indian Registration Act, 1908)</p>

                  <div className="doc-section">
                    <p className="doc-text">
                      This Rental Agreement (hereinafter referred to as the "Agreement") is made and executed on <strong>{formatDate(previewAgreement.data.createdAt)}</strong> at <strong>{previewAgreement.data.propertyAddress.split(',').pop()?.trim() || 'Bangalore'}</strong>.
                    </p>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">1. Parties to the Agreement</h4>
                    <div className="doc-party">
                      <h4>Landlord (Lessor)</h4>
                      <p><span className="label">Name:</span> {previewAgreement.data.landlordName}</p>
                      <p><span className="label">Address:</span> {previewAgreement.data.landlordAddress}</p>
                      <p><span className="label">Phone:</span> {previewAgreement.data.landlordPhone}</p>
                      <p><span className="label">Email:</span> {previewAgreement.data.landlordEmail}</p>
                      <p><span className="label">PAN:</span> {previewAgreement.data.landlordPan}</p>
                      <p>Hereinafter referred to as the "<strong>Landlord</strong>" (which expression shall unless repugnant to the context mean and include their legal heirs, successors, representatives, administrators, and assigns).</p>
                    </div>
                    <div className="doc-party">
                      <h4>Tenant (Lessee)</h4>
                      <p><span className="label">Name:</span> {previewAgreement.data.tenantName}</p>
                      <p><span className="label">Address:</span> {previewAgreement.data.tenantAddress}</p>
                      <p><span className="label">Phone:</span> {previewAgreement.data.tenantPhone}</p>
                      <p><span className="label">Email:</span> {previewAgreement.data.tenantEmail}</p>
                      <p><span className="label">PAN:</span> {previewAgreement.data.tenantPan}</p>
                      <p><span className="label">Aadhaar:</span> {previewAgreement.data.tenantAadhaar}</p>
                      <p>Hereinafter referred to as the "<strong>Tenant</strong>" (which expression shall unless repugnant to the context mean and include their legal heirs, successors, representatives, administrators, and assigns).</p>
                    </div>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">2. Property Details</h4>
                    <table className="doc-table">
                      <tbody>
                        <tr><td>Property Address</td><td>{previewAgreement.data.propertyAddress}</td></tr>
                        <tr><td>Flat / Unit Number</td><td>{previewAgreement.data.flatNumber}</td></tr>
                        <tr><td>Carpet Area</td><td>{previewAgreement.data.carpetArea} sq. ft.</td></tr>
                        <tr><td>Description</td><td>{previewAgreement.data.propertyDescription}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">3. Term of the Lease</h4>
                    <table className="doc-table">
                      <tbody>
                        <tr><td>Lease Commencement Date</td><td>{formatDate(previewAgreement.data.leaseStartDate)}</td></tr>
                        <tr><td>Lease Expiry Date</td><td>{formatDate(previewAgreement.data.leaseEndDate)}</td></tr>
                        <tr><td>Total Duration</td><td>{Math.ceil((new Date(previewAgreement.data.leaseEndDate).getTime() - new Date(previewAgreement.data.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</td></tr>
                        <tr><td>Lock-in Period</td><td>{previewAgreement.data.lockInMonths} months from commencement</td></tr>
                        <tr><td>Notice Period</td><td>{previewAgreement.data.noticePeriodDays} days written notice required</td></tr>
                        <tr><td>Renewal Clause</td><td>{previewAgreement.data.renewalClause}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">4. Rent & Security Deposit</h4>
                    <table className="doc-table">
                      <tbody>
                        <tr><td>Monthly Rent</td><td><strong>{formatINR(previewAgreement.data.monthlyRent)}</strong> ({numberToWords(previewAgreement.data.monthlyRent)})</td></tr>
                        <tr><td>Security Deposit</td><td><strong>{formatINR(previewAgreement.data.securityDeposit)}</strong> ({numberToWords(previewAgreement.data.securityDeposit)}) — refundable at lease end subject to deductions for damages/unpaid dues</td></tr>
                        <tr><td>Rent Due Date</td><td>On or before the {previewAgreement.data.rentDueDay}<sup>th</sup> of every month</td></tr>
                        <tr><td>Payment Mode</td><td>{previewAgreement.data.paymentMode}</td></tr>
                        <tr><td>Late Payment Penalty</td><td>18% per annum on overdue amount</td></tr>
                        <tr><td>Maintenance Charges</td><td>{formatINR(previewAgreement.data.maintenanceAmount)} per month (to be paid separately to the society)</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">5. Terms & Conditions</h4>
                    <ol className="clause-list">
                      <li>The Tenant shall use the premises solely for residential purposes and shall not engage in any illegal or commercial activities.</li>
                      <li>The Tenant shall not sublet, assign, or transfer this lease to any third party without prior written consent of the Landlord.</li>
                      <li>The Tenant shall maintain the premises in good and tenantable condition and shall be responsible for minor repairs up to {formatINR(500)}.</li>
                      <li>Structural repairs, plumbing, and electrical work beyond minor fixes shall be the responsibility of the Landlord.</li>
                      <li>The Tenant shall not make any structural alterations or paint the premises without prior written consent.</li>
                      <li>The Tenant shall comply with all society rules, by-laws, and local municipal regulations.</li>
                      <li>The Landlord or their authorized representative shall have the right to inspect the premises with 24 hours prior notice.</li>
                      <li>All utility bills (electricity, water, gas, internet) shall be in the Tenant's name and borne by the Tenant during the lease period.</li>
                      <li>The Tenant shall not keep any hazardous, inflammable, or objectionable goods on the premises.</li>
                      <li>Pets are allowed only with prior written consent from the Landlord and subject to society rules.</li>
                      <li>Upon termination, the Tenant shall hand over vacant possession of the premises in the same condition as received (fair wear and tear excepted).</li>
                      <li>The Security Deposit shall be refunded within 15 days of handover after deducting dues for damages, unpaid rent, or utility bills.</li>
                      <li>Any dispute arising out of this Agreement shall be subject to the jurisdiction of courts in {previewAgreement.data.propertyAddress.split(',').pop()?.trim() || 'Bangalore'}.</li>
                      <li>This Agreement supersedes all prior oral or written agreements between the parties.</li>
                    </ol>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">6. Additional Covenants</h4>
                    <ol className="clause-list">
                      <li>The Landlord confirms having clear and marketable title to the property and the authority to lease it.</li>
                      <li>The Tenant confirms that all personal and financial information provided is true and accurate.</li>
                      <li>Both parties agree that this Agreement may be registered with the local Sub-Registrar office as per the Indian Registration Act, 1908.</li>
                      <li>Stamp duty and registration charges shall be borne equally by both parties unless otherwise agreed.</li>
                    </ol>
                  </div>

                  <div className="doc-section">
                    <h4 className="doc-heading">7. Execution & Signatures</h4>
                    <p className="doc-text">
                      IN WITNESS WHEREOF, the parties have signed and executed this Agreement on the date first written above, in the presence of the undersigned witnesses.
                    </p>
                    <div className="signatures">
                      <div className="sign-box">
                        <div className="stamp-area">Revenue<br />Stamp<br />\u20b9100/-</div>
                        <div className="sign-line">
                          <p className="sign-name">{previewAgreement.data.landlordName}</p>
                          <p className="sign-label">Landlord Signature</p>
                        </div>
                        {previewAgreement.data.signedByLandlord && <p className="text-[10px] text-green-600 mt-1">\u2713 Signed</p>}
                      </div>
                      <div className="sign-box">
                        <div className="sign-line" style={{ marginTop: '46px' }}>
                          <p className="sign-name">{previewAgreement.data.tenantName}</p>
                          <p className="sign-label">Tenant Signature</p>
                        </div>
                        {previewAgreement.data.signedByTenant && <p className="text-[10px] text-green-600 mt-1">\u2713 Signed</p>}
                      </div>
                      <div className="sign-box">
                        <div className="sign-line" style={{ marginTop: '46px' }}>
                          <p className="sign-name">{previewAgreement.data.witness1Name}</p>
                          <p className="sign-label">Witness 1</p>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">{previewAgreement.data.witness1Address}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-6" style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">Witness 2</p>
                        <p className="text-xs font-semibold text-charcoal">{previewAgreement.data.witness2Name}</p>
                        <p className="text-[9px] text-gray-400">{previewAgreement.data.witness2Address}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">Agreement ID</p>
                        <p className="text-xs font-semibold text-charcoal">{previewAgreement.data.id.toUpperCase()}</p>
                        <p className="text-[9px] text-gray-400">Created: {formatDate(previewAgreement.data.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}