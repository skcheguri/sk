import { useRef } from 'react';
import type { RentalAgreement } from '@/mocks/rental-agreements';

interface Props {
  agreement: RentalAgreement | null;
  tenantName: string;
  onClose: () => void;
}

function formatINR(num: number): string {
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

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

export default function RentalAgreementModal({ agreement, tenantName, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!agreement) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 text-center">
          <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
            <i className="ri-file-text-line text-2xl text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">No Agreement Found</h3>
          <p className="text-sm text-gray-500 mb-5">
            There is no rental agreement on file for <strong>{tenantName}</strong>.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Rental Agreement - ${agreement.tenantName}</title>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-charcoal">Rental Agreement</h3>
            <p className="text-xs text-gray-400">{agreement.tenantName} — Flat {agreement.flatNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-printer-line text-sm" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
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

            {/* Agreement Date */}
            <div className="doc-section">
              <p className="doc-text">
                This Rental Agreement (hereinafter referred to as the "Agreement") is made and executed on <strong>{formatDate(agreement.createdAt)}</strong> at <strong>{agreement.propertyAddress.split(',').pop()?.trim() || 'Bangalore'}</strong>.
              </p>
            </div>

            {/* Parties */}
            <div className="doc-section">
              <h4 className="doc-heading">1. Parties to the Agreement</h4>

              <div className="doc-party">
                <h4>Landlord (Lessor)</h4>
                <p><span className="label">Name:</span> {agreement.landlordName}</p>
                <p><span className="label">Address:</span> {agreement.landlordAddress}</p>
                <p><span className="label">Phone:</span> {agreement.landlordPhone}</p>
                <p><span className="label">Email:</span> {agreement.landlordEmail}</p>
                <p><span className="label">PAN:</span> {agreement.landlordPan}</p>
                <p>Hereinafter referred to as the "<strong>Landlord</strong>" (which expression shall unless repugnant to the context mean and include their legal heirs, successors, representatives, administrators, and assigns).</p>
              </div>

              <div className="doc-party">
                <h4>Tenant (Lessee)</h4>
                <p><span className="label">Name:</span> {agreement.tenantName}</p>
                <p><span className="label">Address:</span> {agreement.tenantAddress}</p>
                <p><span className="label">Phone:</span> {agreement.tenantPhone}</p>
                <p><span className="label">Email:</span> {agreement.tenantEmail}</p>
                <p><span className="label">PAN:</span> {agreement.tenantPan}</p>
                <p><span className="label">Aadhaar:</span> {agreement.tenantAadhaar}</p>
                <p>Hereinafter referred to as the "<strong>Tenant</strong>" (which expression shall unless repugnant to the context mean and include their legal heirs, successors, representatives, administrators, and assigns).</p>
              </div>
            </div>

            {/* Property Details */}
            <div className="doc-section">
              <h4 className="doc-heading">2. Property Details</h4>
              <table className="doc-table">
                <tbody>
                  <tr>
                    <td>Property Address</td>
                    <td>{agreement.propertyAddress}</td>
                  </tr>
                  <tr>
                    <td>Flat / Unit Number</td>
                    <td>{agreement.flatNumber}</td>
                  </tr>
                  <tr>
                    <td>Carpet Area</td>
                    <td>{agreement.carpetArea} sq. ft.</td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>{agreement.propertyDescription}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Term */}
            <div className="doc-section">
              <h4 className="doc-heading">3. Term of the Lease</h4>
              <table className="doc-table">
                <tbody>
                  <tr>
                    <td>Lease Commencement Date</td>
                    <td>{formatDate(agreement.leaseStartDate)}</td>
                  </tr>
                  <tr>
                    <td>Lease Expiry Date</td>
                    <td>{formatDate(agreement.leaseEndDate)}</td>
                  </tr>
                  <tr>
                    <td>Total Duration</td>
                    <td>{Math.ceil((new Date(agreement.leaseEndDate).getTime() - new Date(agreement.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</td>
                  </tr>
                  <tr>
                    <td>Lock-in Period</td>
                    <td>{agreement.lockInMonths} months from commencement</td>
                  </tr>
                  <tr>
                    <td>Notice Period</td>
                    <td>{agreement.noticePeriodDays} days written notice required</td>
                  </tr>
                  <tr>
                    <td>Renewal Clause</td>
                    <td>{agreement.renewalClause}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rent & Deposit */}
            <div className="doc-section">
              <h4 className="doc-heading">4. Rent & Security Deposit</h4>
              <table className="doc-table">
                <tbody>
                  <tr>
                    <td>Monthly Rent</td>
                    <td><strong>{formatINR(agreement.monthlyRent)}</strong> ({numberToWords(agreement.monthlyRent)})</td>
                  </tr>
                  <tr>
                    <td>Security Deposit</td>
                    <td><strong>{formatINR(agreement.securityDeposit)}</strong> ({numberToWords(agreement.securityDeposit)}) — refundable at lease end subject to deductions for damages/unpaid dues</td>
                  </tr>
                  <tr>
                    <td>Rent Due Date</td>
                    <td>On or before the {agreement.rentDueDay}<sup>th</sup> of every month</td>
                  </tr>
                  <tr>
                    <td>Payment Mode</td>
                    <td>{agreement.paymentMode}</td>
                  </tr>
                  <tr>
                    <td>Late Payment Penalty</td>
                    <td>18% per annum on overdue amount</td>
                  </tr>
                  <tr>
                    <td>Maintenance Charges</td>
                    <td>{formatINR(agreement.maintenanceAmount)} per month (to be paid separately to the society)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms & Conditions */}
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
                <li>Any dispute arising out of this Agreement shall be subject to the jurisdiction of courts in {agreement.propertyAddress.split(',').pop()?.trim() || 'Bangalore'}.</li>
                <li>This Agreement supersedes all prior oral or written agreements between the parties.</li>
              </ol>
            </div>

            {/* Additional Covenants */}
            <div className="doc-section">
              <h4 className="doc-heading">6. Additional Covenants</h4>
              <ol className="clause-list">
                <li>The Landlord confirms having clear and marketable title to the property and the authority to lease it.</li>
                <li>The Tenant confirms that all personal and financial information provided is true and accurate.</li>
                <li>Both parties agree that this Agreement may be registered with the local Sub-Registrar office as per the Indian Registration Act, 1908.</li>
                <li>Stamp duty and registration charges shall be borne equally by both parties unless otherwise agreed.</li>
              </ol>
            </div>

            {/* Signatures */}
            <div className="doc-section">
              <h4 className="doc-heading">7. Execution & Signatures</h4>
              <p className="doc-text">
                IN WITNESS WHEREOF, the parties have signed and executed this Agreement on the date first written above, in the presence of the undersigned witnesses.
              </p>

              <div className="signatures">
                <div className="sign-box">
                  <div className="stamp-area">Revenue<br />Stamp<br />₹100/-</div>
                  <div className="sign-line">
                    <p className="sign-name">{agreement.landlordName}</p>
                    <p className="sign-label">Landlord Signature</p>
                  </div>
                  {agreement.signedByLandlord && (
                    <p className="text-[10px] text-green-600 mt-1">✓ Signed</p>
                  )}
                </div>

                <div className="sign-box">
                  <div className="sign-line" style={{ marginTop: '46px' }}>
                    <p className="sign-name">{agreement.tenantName}</p>
                    <p className="sign-label">Tenant Signature</p>
                  </div>
                  {agreement.signedByTenant && (
                    <p className="text-[10px] text-green-600 mt-1">✓ Signed</p>
                  )}
                </div>

                <div className="sign-box">
                  <div className="sign-line" style={{ marginTop: '46px' }}>
                    <p className="sign-name">{agreement.witness1Name}</p>
                    <p className="sign-label">Witness 1</p>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">{agreement.witness1Address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6" style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400">Witness 2</p>
                  <p className="text-xs font-semibold text-charcoal">{agreement.witness2Name}</p>
                  <p className="text-[9px] text-gray-400">{agreement.witness2Address}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400">Agreement ID</p>
                  <p className="text-xs font-semibold text-charcoal">{agreement.id.toUpperCase()}</p>
                  <p className="text-[9px] text-gray-400">Created: {formatDate(agreement.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}