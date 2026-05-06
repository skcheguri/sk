import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ReceiptData {
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

interface SavedReceipt {
  id: string;
  receiptNumber: string;
  createdAt: string;
  sentToTenant: boolean;
  sentAt?: string;
  data: ReceiptData;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

const paymentModes = [
  { value: 'cash', label: 'Cash', icon: 'ri-money-rupee-circle-line' },
  { value: 'cheque', label: 'Cheque', icon: 'ri-bank-card-line' },
  { value: 'upi', label: 'UPI', icon: 'ri-smartphone-line' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: 'ri-exchange-line' },
  { value: 'card', label: 'Credit/Debit Card', icon: 'ri-visa-line' },
];

// Mock saved receipts
const initialSavedReceipts: SavedReceipt[] = [
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
    createdAt: '2026-04-05T10:35:00Z',
    sentToTenant: false,
    data: {
      id: 'rcpt-2',
      landlordName: 'Suresh Patel',
      landlordPan: 'ABCPD1234E',
      landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
      tenantName: 'Vikram Singh',
      tenantPan: 'FGHIJ5678K',
      propertyAddress: 'Flat A-203, Green Valley Flats, HSR Layout, Bangalore - 560102',
      periodFrom: '2026-04-01',
      periodTo: '2026-04-30',
      month: 'April',
      year: '2026',
      rentAmount: '18000',
      paymentMode: 'bank_transfer',
      transactionRef: 'NEFT/ICIC/9876543210',
      paymentDate: '2026-04-03',
      includesMaintenance: false,
      maintenanceAmount: '0',
      notes: 'Monthly rent for April 2026.',
    },
  },
];

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

  // Indian numbering system: split into chunks of 2 from right, except last 3
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
      const chunk = convertChunk(parts[i]);
      result += chunk + ' ' + scales[i] + ' ';
    }
  }

  return result.trim() + ' Rupees Only';
}

function formatCurrency(value: string): string {
  const num = parseFloat(value || '0');
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

function generateReceiptNumber(): string {
  const now = new Date();
  const seq = String(now.getTime()).slice(-4);
  return `RCPT-${now.getFullYear()}-${seq}`;
}

export default function RentReceipts() {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';
  const profileLink = isTenant ? '/tenant-profile' : '/owner-profile';
  const profileLabel = isTenant ? 'Tenant Profile' : 'Owner Profile';
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>(initialSavedReceipts);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSendSuccess, setShowSendSuccess] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<SavedReceipt | null>(null);

  const [receipt, setReceipt] = useState<ReceiptData>({
    id: '',
    landlordName: user?.name || 'Suresh Patel',
    landlordPan: 'ABCPD1234E',
    landlordAddress: 'Prestige Towers, Koramangala, Bangalore - 560034',
    tenantName: 'Arjun Mehta',
    tenantPan: 'ABCDE1234F',
    propertyAddress: 'Flat B-204, Prestige Towers, Koramangala, Bangalore - 560034',
    periodFrom: `${String(currentYear)}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    periodTo: `${String(currentYear)}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
    month: months[new Date().getMonth()],
    year: String(currentYear),
    rentAmount: '22000',
    paymentMode: 'upi',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    includesMaintenance: true,
    maintenanceAmount: '2000',
    notes: '',
  });

  const handleChange = (field: keyof ReceiptData, value: string | boolean) => {
    setReceipt((prev) => ({ ...prev, [field]: value }));
  };

  const totalAmount = parseFloat(receipt.rentAmount || '0') + parseFloat(receipt.maintenanceAmount || '0');

  const handleGenerate = () => {
    const newReceipt: SavedReceipt = {
      id: `rcpt-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      createdAt: new Date().toISOString(),
      sentToTenant: false,
      data: { ...receipt, id: `rcpt-${Date.now()}` },
    };
    setSavedReceipts((prev) => [newReceipt, ...prev]);
    setPreviewReceipt(newReceipt);
    setShowPrintPreview(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSendToTenant = (receiptId: string) => {
    const now = new Date().toISOString();
    setSavedReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? { ...r, sentToTenant: true, sentAt: now }
          : r
      )
    );
    setPreviewReceipt((prev) =>
      prev && prev.id === receiptId
        ? { ...prev, sentToTenant: true, sentAt: now }
        : prev
    );
    setShowSendSuccess(true);
    setTimeout(() => setShowSendSuccess(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Rent Receipt - ${previewReceipt?.receiptNumber || ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 40px; background: #fff; color: #1a1a1a; }
            .receipt-container { max-width: 750px; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 24px; }
            .receipt-title { font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: 3px; text-transform: uppercase; }
            .receipt-subtitle { font-size: 11px; color: #666; margin-top: 4px; }
            .receipt-meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; }
            .receipt-table { width: 100%; border-collapse: collapse; font-size: 13px; border: 1.5px solid #1a1a1a; border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
            .receipt-table td { border: 1px solid #ccc; padding: 10px 14px; vertical-align: top; }
            .receipt-table td:first-child { width: 30%; background: #f5f5f0; font-weight: 600; color: #444; }
            .receipt-table td:last-child { font-weight: 500; }
            .receipt-table .amount-cell { font-size: 18px; font-weight: 700; color: #1a1a1a; }
            .summary-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .summary-item { border: 1px solid #ccc; border-radius: 6px; padding: 12px 14px; }
            .summary-item .label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
            .summary-item .value { font-size: 15px; font-weight: 700; color: #1a1a1a; }
            .summary-item .value-total { color: #c78a1a; }
            .signature-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 24px; border-top: 2px solid #ddd; }
            .stamp-area { text-align: center; }
            .stamp-circle { width: 85px; height: 85px; border: 2px dashed #bbb; border-radius: 50%; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #888; text-align: center; line-height: 1.3; }
            .stamp-note { font-size: 9px; color: #999; }
            .landlord-sign { text-align: center; }
            .sign-line { border-top: 1.5px solid #1a1a1a; padding-top: 6px; width: 180px; }
            .sign-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
            .sign-label { font-size: 10px; color: #666; }
            .footer-note { text-align: center; font-size: 9px; color: #999; margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; }
            @media print { body { padding: 0; } }
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
    { id: 'create' as const, label: 'Create Receipt', icon: 'ri-add-circle-line' },
    { id: 'history' as const, label: 'Receipt History', icon: 'ri-history-line' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {showSuccess && (
          <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <i className="ri-check-line" /> Receipt generated successfully
          </div>
        )}

        {showSendSuccess && (
          <div className="fixed top-24 right-6 z-50 bg-amber-500 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <i className="ri-check-line" /> Receipt sent to tenant successfully
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link to={profileLink} className="text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer">{profileLabel}</Link>
            <i className="ri-arrow-right-s-line text-gray-300" />
            <span className="text-sm text-charcoal font-medium">Rent Receipts</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Rent Receipt Generator</h1>
              <p className="text-sm text-gray-500 mt-1">Generate professional rent receipts for TDS and ITR records</p>
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

        {/* Create Receipt Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-edit-line text-amber-600" />
                </div>
                Receipt Details
              </h2>

              {/* Landlord Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Landlord Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Landlord Name</label>
                    <input
                      value={receipt.landlordName}
                      onChange={(e) => handleChange('landlordName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">PAN</label>
                      <input
                        value={receipt.landlordPan}
                        onChange={(e) => handleChange('landlordPan', e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Payment Date</label>
                      <input
                        type="date"
                        value={receipt.paymentDate}
                        onChange={(e) => handleChange('paymentDate', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Landlord Address</label>
                    <input
                      value={receipt.landlordAddress}
                      onChange={(e) => handleChange('landlordAddress', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="Full address"
                    />
                  </div>
                </div>
              </div>

              {/* Tenant Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tenant Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Tenant Name</label>
                      <input
                        value={receipt.tenantName}
                        onChange={(e) => handleChange('tenantName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Tenant PAN</label>
                      <input
                        value={receipt.tenantPan}
                        onChange={(e) => handleChange('tenantPan', e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Property Address</label>
                    <input
                      value={receipt.propertyAddress}
                      onChange={(e) => handleChange('propertyAddress', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="Rented property address"
                    />
                  </div>
                </div>
              </div>

              {/* Rent Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Rent Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Period From</label>
                      <input
                        type="date"
                        value={receipt.periodFrom}
                        onChange={(e) => handleChange('periodFrom', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Period To</label>
                      <input
                        type="date"
                        value={receipt.periodTo}
                        onChange={(e) => handleChange('periodTo', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Month</label>
                      <select
                        value={receipt.month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                      >
                        {months.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Year</label>
                      <select
                        value={receipt.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Rent Amount (₹)</label>
                      <input
                        type="number"
                        value={receipt.rentAmount}
                        onChange={(e) => handleChange('rentAmount', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Payment Mode</label>
                      <select
                        value={receipt.paymentMode}
                        onChange={(e) => handleChange('paymentMode', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                      >
                        {paymentModes.map((mode) => (
                          <option key={mode.value} value={mode.value}>{mode.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Transaction Reference</label>
                    <input
                      value={receipt.transactionRef}
                      onChange={(e) => handleChange('transactionRef', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="UPI ref, Cheque no, NEFT ID, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receipt.includesMaintenance}
                      onChange={(e) => handleChange('includesMaintenance', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="text-sm text-charcoal font-medium">Include Maintenance Charges</span>
                  </label>
                </div>
                {receipt.includesMaintenance && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Maintenance Amount (₹)</label>
                    <input
                      type="number"
                      value={receipt.maintenanceAmount}
                      onChange={(e) => handleChange('maintenanceAmount', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Additional Notes (optional)</label>
                <textarea
                  value={receipt.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f9f9f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                  rows={2}
                  placeholder="Any additional details..."
                  maxLength={200}
                />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{receipt.notes.length}/200</p>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-file-text-line text-sm" /> Generate & Preview Receipt
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
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-charcoal tracking-[0.2em] uppercase">Rent Receipt</h3>
                    <p className="text-xs text-gray-500 mt-1">(Under Section 10(13A) & Section 80GG of Income Tax Act, 1961)</p>
                  </div>

                  {/* Receipt No & Date row */}
                  <div className="flex justify-between items-center mb-6 text-sm">
                    <span><strong>Receipt No:</strong> {generateReceiptNumber()}</span>
                    <span><strong>Date:</strong> {new Date(receipt.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Main table-style receipt body */}
                  <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 w-1/3 bg-gray-50 font-semibold text-gray-700">Received From</td>
                          <td className="px-4 py-3">{receipt.tenantName || '____________________'}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Sum of Rupees</td>
                          <td className="px-4 py-3 font-semibold">{numberToWords(totalAmount)}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Amount (₹)</td>
                          <td className="px-4 py-3 font-bold text-lg">{formatCurrency(String(totalAmount))}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">For the Month(s) of</td>
                          <td className="px-4 py-3">{receipt.month} {receipt.year} ({new Date(receipt.periodFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {new Date(receipt.periodTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Towards Rent of</td>
                          <td className="px-4 py-3">{receipt.propertyAddress || '____________________'}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Payment Mode</td>
                          <td className="px-4 py-3">{paymentModes.find((m) => m.value === receipt.paymentMode)?.label || '____________________'}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Transaction Reference</td>
                          <td className="px-4 py-3">{receipt.transactionRef || '____________________'}</td>
                        </tr>
                        {receipt.includesMaintenance && parseFloat(receipt.maintenanceAmount || '0') > 0 && (
                          <tr className="border-b border-gray-300">
                            <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Maintenance</td>
                            <td className="px-4 py-3">{formatCurrency(receipt.maintenanceAmount)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-700">Landlord PAN</td>
                          <td className="px-4 py-3">{receipt.landlordPan || '____________________'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="border border-gray-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Rent Amount</p>
                      <p className="font-bold text-charcoal">{formatCurrency(receipt.rentAmount)}</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total Received</p>
                      <p className="font-bold text-amber-600">{formatCurrency(String(totalAmount))}</p>
                    </div>
                  </div>

                  {/* Signature & Stamp area */}
                  <div className="flex justify-between items-end mt-8 pt-6 border-t-2 border-gray-200">
                    <div className="text-center">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-[9px] text-gray-400 text-center leading-tight">Landlord<br />Revenue<br />Stamp</span>
                      </div>
                      <p className="text-[10px] text-gray-400">(₹1 Revenue Stamp affixed if &gt; ₹5,000)</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-800 w-48 pt-2">
                        <p className="text-sm font-semibold text-charcoal">{receipt.landlordName}</p>
                        <p className="text-xs text-gray-500">Signature of Landlord</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-[10px] text-gray-400 text-center mt-6 pt-3 border-t border-gray-100">
                    This receipt is generated via Bhavan and serves as official proof of rent payment for HRA exemption & 80GG deduction claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {savedReceipts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                  <i className="ri-file-text-line text-2xl text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">No receipts yet</h3>
                <p className="text-sm text-gray-500 mb-5">Generate your first rent receipt.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Create Receipt
                </button>
              </div>
            ) : (
              savedReceipts.map((saved) => (
                <div key={saved.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-50 flex-shrink-0">
                        <i className="ri-file-text-line text-xl text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-charcoal">{saved.receiptNumber}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Generated</span>
                          {saved.sentToTenant && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                              <i className="ri-check-double-line" /> Sent to Tenant
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {saved.data.tenantName} — {saved.data.month} {saved.data.year} ({new Date(saved.data.periodFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {new Date(saved.data.periodTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatCurrency(saved.data.rentAmount)} · {paymentModes.find((m) => m.value === saved.data.paymentMode)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!saved.sentToTenant && (
                        <button
                          onClick={() => handleSendToTenant(saved.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-send-plane-line text-xs" /> Send to Tenant
                        </button>
                      )}
                      <button
                        onClick={() => { setPreviewReceipt(saved); setShowPrintPreview(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-charcoal hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-eye-line text-xs" /> View
                      </button>
                      <button
                        onClick={() => { setPreviewReceipt(saved); setShowPrintPreview(true); }}
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

        {/* Print Preview Modal */}
        {showPrintPreview && previewReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-charcoal">Receipt Preview</h3>
                  <p className="text-xs text-gray-400">{previewReceipt.receiptNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  {previewReceipt && !previewReceipt.sentToTenant && (
                    <button
                      onClick={() => {
                        if (previewReceipt) handleSendToTenant(previewReceipt.id);
                      }}
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
                    onClick={() => setShowPrintPreview(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div ref={printRef}>
                  <div className="receipt-container">
                    <div className="receipt-header">
                      <h1 className="receipt-title">Rent Receipt</h1>
                      <p className="receipt-subtitle">(Under Section 10(13A) & Section 80GG of Income Tax Act, 1961)</p>
                    </div>

                    <div className="receipt-meta">
                      <span><strong>Receipt No:</strong> {previewReceipt.receiptNumber}</span>
                      <span><strong>Date:</strong> {new Date(previewReceipt.data.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <table className="receipt-table">
                      <tbody>
                        <tr>
                          <td>Received From</td>
                          <td>{previewReceipt.data.tenantName}</td>
                        </tr>
                        <tr>
                          <td>Sum of Rupees</td>
                          <td className="font-semibold">{numberToWords(parseFloat(previewReceipt.data.rentAmount || '0') + parseFloat(previewReceipt.data.maintenanceAmount || '0'))}</td>
                        </tr>
                        <tr>
                          <td>Amount (₹)</td>
                          <td className="amount-cell">{formatCurrency(String(parseFloat(previewReceipt.data.rentAmount || '0') + parseFloat(previewReceipt.data.maintenanceAmount || '0')))}</td>
                        </tr>
                        <tr>
                          <td>For the Month(s) of</td>
                          <td>{previewReceipt.data.month} {previewReceipt.data.year} ({new Date(previewReceipt.data.periodFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {new Date(previewReceipt.data.periodTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})</td>
                        </tr>
                        <tr>
                          <td>Towards Rent of</td>
                          <td>{previewReceipt.data.propertyAddress}</td>
                        </tr>
                        <tr>
                          <td>Payment Mode</td>
                          <td>{paymentModes.find((m) => m.value === previewReceipt.data.paymentMode)?.label}</td>
                        </tr>
                        <tr>
                          <td>Transaction Reference</td>
                          <td>{previewReceipt.data.transactionRef || 'N/A'}</td>
                        </tr>
                        {previewReceipt.data.includesMaintenance && parseFloat(previewReceipt.data.maintenanceAmount || '0') > 0 && (
                          <tr>
                            <td>Maintenance</td>
                            <td>{formatCurrency(previewReceipt.data.maintenanceAmount)}</td>
                          </tr>
                        )}
                        <tr>
                          <td>Landlord PAN</td>
                          <td>{previewReceipt.data.landlordPan || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="summary-box">
                      <div className="summary-item">
                        <div className="label">Rent Amount</div>
                        <div className="value">{formatCurrency(previewReceipt.data.rentAmount)}</div>
                      </div>
                      <div className="summary-item">
                        <div className="label">Total Received</div>
                        <div className="value value-total">{formatCurrency(String(parseFloat(previewReceipt.data.rentAmount || '0') + parseFloat(previewReceipt.data.maintenanceAmount || '0')))}</div>
                      </div>
                    </div>

                    <div className="signature-area">
                      <div className="stamp-area">
                        <div className="stamp-circle">Landlord<br />Revenue<br />Stamp</div>
                        <div className="stamp-note">(₹1 Revenue Stamp affixed if &gt; ₹5,000)</div>
                      </div>
                      <div className="landlord-sign">
                        <div className="sign-line">
                          <div className="sign-name">{previewReceipt.data.landlordName}</div>
                          <div className="sign-label">Signature of Landlord</div>
                        </div>
                      </div>
                    </div>

                    <p className="footer-note">
                      This receipt is generated via Bhavan and serves as official proof of rent payment for HRA exemption & 80GG deduction claims.
                    </p>
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