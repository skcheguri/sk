import { useState } from 'react';
import { Link } from 'react-router-dom';
import MaintenanceRequestModal from '@/pages/rent-management/components/MaintenanceRequestModal';
import DigitalRentStoragePanel from '@/pages/rent-management/components/DigitalRentStoragePanel';
import AutomatedRemindersPanel from '@/pages/rent-management/components/AutomatedRemindersPanel';
import DocumentVerificationPanel from '@/pages/rent-management/components/DocumentVerificationPanel';
import DirectMessagingPanel from '@/pages/rent-management/components/DirectMessagingPanel';
import MarkAsPaidModal from '@/pages/rent-management/components/MarkAsPaidModal';
import { myRequests } from '@/mocks/maintenance';

type ExpandedCard = 'maintenance' | 'payment' | 'storage' | 'reminders' | 'verification' | 'messaging' | null;
type PaymentTab = 'history' | 'reminders' | 'reports';

const features = [
  { id: 'storage' as const, icon: 'ri-file-text-line', title: 'Digital Rent Storage', description: 'Upload and securely store all your rent documents, addendums, and communications in one centralized location. Access them anytime, anywhere.', cta: 'Browse documents' },
  { id: 'payment' as const, icon: 'ri-calendar-check-line', title: 'Payment Tracking', description: 'Set up automated rent reminders, track payment history, and generate reports for tax season. Never miss a due date again.', cta: 'View details' },
  { id: 'maintenance' as const, icon: 'ri-tools-line', title: 'Maintenance Requests', description: 'Submit maintenance requests with photos, track their status in real-time, and communicate directly with your landlord or property manager.', cta: 'Select a category' },
  { id: 'reminders' as const, icon: 'ri-notification-3-line', title: 'Automated Reminders', description: 'Get notified about rent renewals, inspections, and important deadlines well in advance so you are always prepared.', cta: 'Manage reminders' },
  { id: 'verification' as const, icon: 'ri-shield-check-line', title: 'Document Verification', description: 'Verify the authenticity of rent documents and ensure all terms comply with Indian rental laws and regulations.', cta: 'Verify documents' },
  { id: 'messaging' as const, icon: 'ri-chat-3-line', title: 'Direct Messaging', description: 'Communicate with your landlord through our secure messaging system, keeping all conversations documented and organized.', cta: 'Open chat' },
];

const maintenanceCategories = [
  { id: 'Plumbing', icon: 'ri-drop-line', label: 'Plumbing', desc: 'Leaks, drains, pipes & water pressure', color: 'bg-blue-50 border-blue-100 text-blue-600', iconBg: 'bg-blue-100', badge: 'Most Common', badgeColor: 'bg-blue-100 text-blue-700' },
  { id: 'Electrical', icon: 'ri-flashlight-line', label: 'Electrical', desc: 'Power, switches, wiring & circuits', color: 'bg-yellow-50 border-yellow-100 text-yellow-600', iconBg: 'bg-yellow-100', badge: 'High Priority', badgeColor: 'bg-yellow-100 text-yellow-700' },
  { id: 'Water', icon: 'ri-water-flash-line', label: 'Water Supply', desc: 'Supply issues, tank, seepage & meter', color: 'bg-cyan-50 border-cyan-100 text-cyan-600', iconBg: 'bg-cyan-100', badge: null, badgeColor: '' },
  { id: 'Elevator', icon: 'ri-arrow-up-down-line', label: 'Elevator / Lift', desc: 'Lift breakdown, doors & alarms', color: 'bg-purple-50 border-purple-100 text-purple-600', iconBg: 'bg-purple-100', badge: 'Urgent', badgeColor: 'bg-red-100 text-red-700' },
  { id: 'Carpentry', icon: 'ri-door-open-line', label: 'Carpentry', desc: 'Doors, windows, locks & furniture', color: 'bg-amber-50 border-amber-100 text-amber-600', iconBg: 'bg-amber-100', badge: null, badgeColor: '' },
  { id: 'Painting', icon: 'ri-paint-brush-line', label: 'Painting & Walls', desc: 'Peeling, cracks, damp stains & mould', color: 'bg-pink-50 border-pink-100 text-pink-600', iconBg: 'bg-pink-100', badge: null, badgeColor: '' },
  { id: 'AC/Appliance', icon: 'ri-temp-cold-line', label: 'AC & Appliances', desc: 'AC, geyser, fans & inverter issues', color: 'bg-teal-50 border-teal-100 text-teal-600', iconBg: 'bg-teal-100', badge: null, badgeColor: '' },
  { id: 'Security', icon: 'ri-camera-line', label: 'Security Systems', desc: 'CCTV, intercom, gates & access cards', color: 'bg-slate-50 border-slate-100 text-slate-600', iconBg: 'bg-slate-100', badge: null, badgeColor: '' },
  { id: 'Housekeeping', icon: 'ri-brush-line', label: 'Housekeeping', desc: 'Cleaning, pests, garbage & common areas', color: 'bg-green-50 border-green-100 text-green-600', iconBg: 'bg-green-100', badge: null, badgeColor: '' },
  { id: 'Other', icon: 'ri-more-2-line', label: 'Other Issue', desc: 'Anything not listed above', color: 'bg-gray-50 border-gray-100 text-gray-600', iconBg: 'bg-gray-100', badge: null, badgeColor: '' },
];

const statusColorMap: Record<string, string> = {
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  pending: 'bg-gray-100 text-gray-600',
  acknowledged: 'bg-amber-100 text-amber-700',
};

const statusLabelMap: Record<string, string> = {
  in_progress: 'In Progress',
  resolved: 'Resolved',
  pending: 'Pending',
  acknowledged: 'Acknowledged',
};

interface PaymentRow { month: string; amount: string; date: string; status: string; mode: string; }

const initialPaymentHistory: PaymentRow[] = [
  { month: 'April 2026', amount: '₹22,000', date: '1 Apr 2026', status: 'paid', mode: 'UPI' },
  { month: 'March 2026', amount: '₹22,000', date: '1 Mar 2026', status: 'paid', mode: 'UPI' },
  { month: 'February 2026', amount: '₹22,000', date: '1 Feb 2026', status: 'paid', mode: 'Bank Transfer' },
  { month: 'January 2026', amount: '₹22,000', date: '1 Jan 2026', status: 'paid', mode: 'UPI' },
  { month: 'December 2025', amount: '₹22,000', date: '1 Dec 2025', status: 'paid', mode: 'UPI' },
  { month: 'November 2025', amount: '₹22,000', date: '3 Nov 2025', status: 'late', mode: 'Bank Transfer' },
  { month: 'May 2026', amount: '₹22,000', date: '—', status: 'unpaid', mode: '—' },
];

const remindersList = [
  { label: 'Monthly Rent Due', desc: 'Remind me 3 days before the 1st of every month', active: true, icon: 'ri-calendar-check-line', color: 'text-brand bg-brand/10' },
  { label: 'Lease Renewal', desc: 'Alert 60 days before lease expiry — Dec 2026', active: true, icon: 'ri-file-text-line', color: 'text-amber-600 bg-amber-50' },
  { label: 'Security Deposit Reminder', desc: 'Remind owner 30 days before move-out', active: false, icon: 'ri-safe-line', color: 'text-teal-600 bg-teal-50' },
  { label: 'Rent Receipt Request', desc: 'Auto-request receipt after each payment', active: true, icon: 'ri-receipt-line', color: 'text-green-600 bg-green-50' },
];

export default function RentManagement() {
  const [expandedCard, setExpandedCard] = useState<ExpandedCard>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; icon: string } | null>(null);
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('history');
  const [reminderStates, setReminderStates] = useState<boolean[]>(remindersList.map((r) => r.active));
  const [paymentHistory, setPaymentHistory] = useState<PaymentRow[]>(initialPaymentHistory);
  const [markAsPaidRow, setMarkAsPaidRow] = useState<PaymentRow | null>(null);

  const toggleReminder = (idx: number) => {
    setReminderStates((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleMarkAsPaid = (mode: string, date: string) => {
    if (!markAsPaidRow) return;
    setPaymentHistory((prev) =>
      prev.map((p) =>
        p.month === markAsPaidRow.month
          ? { ...p, status: 'paid', mode, date }
          : p
      )
    );
    setMarkAsPaidRow(null);
  };

  const expand = (id: ExpandedCard) => setExpandedCard(id);
  const collapse = () => setExpandedCard(null);

  return (
    <div className="min-h-screen bg-offwhite pt-20">
      {/* Header */}
      <section className="bg-white py-12 md:py-16 border-b">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-4 py-1.5 border border-brand text-brand text-xs font-semibold rounded-full uppercase tracking-wide">
              Coming Soon
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-charcoal">Rent Management</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Simplify your rental experience with our comprehensive digital rent management tools. Everything you need, all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const isExpanded = expandedCard === feature.id;
                return (
                  <div
                    key={feature.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 ${
                      isExpanded
                        ? 'border-brand/40 md:col-span-2 lg:col-span-3'
                        : 'border-gray-100 hover:border-brand/30 cursor-pointer'
                    }`}
                    onClick={!isExpanded ? () => expand(feature.id) : undefined}
                  >
                    {/* Collapsed */}
                    {!isExpanded && (
                      <div className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className={`${feature.icon} text-brand text-xl`} />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-charcoal">{feature.title}</h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand">
                          {feature.cta} <i className="ri-arrow-right-line" />
                        </div>
                      </div>
                    )}

                    {/* Expanded: Digital Rent Storage */}
                    {isExpanded && feature.id === 'storage' && (
                      <DigitalRentStoragePanel onClose={collapse} />
                    )}

                    {/* Expanded: Automated Reminders */}
                    {isExpanded && feature.id === 'reminders' && (
                      <AutomatedRemindersPanel onClose={collapse} />
                    )}

                    {/* Expanded: Document Verification */}
                    {isExpanded && feature.id === 'verification' && (
                      <DocumentVerificationPanel onClose={collapse} />
                    )}

                    {/* Expanded: Direct Messaging */}
                    {isExpanded && feature.id === 'messaging' && (
                      <DirectMessagingPanel onClose={collapse} />
                    )}

                    {/* Expanded: Payment Tracking */}
                    {isExpanded && feature.id === 'payment' && (
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                              <i className="ri-calendar-check-line text-brand text-xl" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-charcoal">Payment Tracking</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Track rent history, set reminders and download reports</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="hidden md:flex items-center gap-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                                <i className="ri-checkbox-circle-fill text-xs" /> 5 Paid on time
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
                                <i className="ri-time-line text-xs" /> 1 Late
                              </span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); collapse(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0">
                              <i className="ri-close-line text-gray-400 text-lg" />
                            </button>
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-[#f9f9f7] rounded-xl p-1 mb-5 w-fit">
                          {(['history', 'reminders', 'reports'] as PaymentTab[]).map((t) => (
                            <button key={t} onClick={(e) => { e.stopPropagation(); setPaymentTab(t); }}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${paymentTab === t ? 'bg-white text-charcoal' : 'text-gray-500 hover:text-charcoal'}`}>
                              <i className={`text-sm ${t === 'history' ? 'ri-receipt-line' : t === 'reminders' ? 'ri-notification-3-line' : 'ri-bar-chart-2-line'} ${paymentTab === t ? 'text-brand' : ''}`} />
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>

                        {/* History tab */}
                        {paymentTab === 'history' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <div className="bg-[#f9f9f7] rounded-2xl overflow-hidden border border-gray-100">
                                <div className="grid grid-cols-6 px-4 py-2.5 border-b border-gray-100">
                                  {['Month', 'Amount', 'Date Paid', 'Mode', 'Status', 'Action'].map((h) => (
                                    <p key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                                  ))}
                                </div>
                                {paymentHistory.map((p) => (
                                  <div key={p.month} className="grid grid-cols-6 px-4 py-3.5 border-b border-gray-100 last:border-0 bg-white hover:bg-[#f9f9f7] transition-colors items-center">
                                    <p className="text-sm font-semibold text-charcoal">{p.month}</p>
                                    <p className="text-sm font-bold text-charcoal">{p.amount}</p>
                                    <p className="text-sm text-gray-500">{p.date}</p>
                                    <p className="text-sm text-gray-500">{p.mode}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                                      p.status === 'paid' ? 'bg-green-50 text-green-600'
                                      : p.status === 'late' ? 'bg-amber-50 text-amber-600'
                                      : 'bg-red-50 text-red-500'
                                    }`}>
                                      {p.status === 'paid' ? 'Paid' : p.status === 'late' ? 'Late' : 'Unpaid'}
                                    </span>
                                    <div>
                                      {p.status !== 'paid' ? (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setMarkAsPaidRow(p); }}
                                          className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors cursor-pointer whitespace-nowrap"
                                        >
                                          <i className="ri-checkbox-circle-line text-sm" /> Mark Paid
                                        </button>
                                      ) : (
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition-colors cursor-pointer whitespace-nowrap">
                                          <i className="ri-download-line text-sm" /> Receipt
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Summary</p>
                                {[
                                  { label: 'Monthly Rent', value: '₹22,000', icon: 'ri-home-4-line', color: 'text-brand' },
                                  { label: 'Total Paid (6 mo)', value: '₹1,32,000', icon: 'ri-money-rupee-circle-line', color: 'text-green-600' },
                                  { label: 'On-time Rate', value: '83%', icon: 'ri-checkbox-circle-line', color: 'text-teal-600' },
                                  { label: 'Next Due', value: '1 May 2026', icon: 'ri-calendar-line', color: 'text-amber-600' },
                                ].map((s) => (
                                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 flex items-center justify-center">
                                        <i className={`${s.icon} text-sm ${s.color}`} />
                                      </div>
                                      <span className="text-xs text-gray-500">{s.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-charcoal">{s.value}</span>
                                  </div>
                                ))}
                              </div>
                              <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-charcoal hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap">
                                <i className="ri-download-line text-sm" /> Download All Receipts
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reminders tab */}
                        {paymentTab === 'reminders' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-3">
                              {remindersList.map((r, idx) => (
                                <div key={r.label} className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${r.color}`}>
                                    <i className={`${r.icon} text-base`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-charcoal">{r.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); toggleReminder(idx); }}
                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${reminderStates[idx] ? 'bg-brand' : 'bg-gray-200'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${reminderStates[idx] ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="bg-brand/5 rounded-2xl p-5 border border-brand/10 h-fit">
                              <div className="flex items-center gap-2 mb-3">
                                <i className="ri-lightbulb-line text-brand" />
                                <p className="text-sm font-bold text-charcoal">Why set reminders?</p>
                              </div>
                              <ul className="space-y-2">
                                {['Avoid late payment penalties', 'Maintain a clean payment record', 'Get notified before lease expires', 'Never miss a receipt request'].map((tip) => (
                                  <li key={tip} className="flex items-start gap-2 text-xs text-gray-600">
                                    <i className="ri-checkbox-circle-line text-brand text-sm flex-shrink-0 mt-0.5" /> {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Reports tab */}
                        {paymentTab === 'reports' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                              <div className="bg-[#f9f9f7] rounded-2xl p-5 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                  <p className="text-sm font-bold text-charcoal">Monthly Rent Paid (Last 6 Months)</p>
                                  <span className="text-xs text-gray-400">₹22,000 / month</span>
                                </div>
                                <div className="flex items-end gap-3 h-28">
                                  {paymentHistory.filter(p => p.status !== 'unpaid').slice().reverse().map((p) => (
                                    <div key={p.month} className="flex-1 flex flex-col items-center gap-1.5">
                                      <div className={`w-full rounded-t-lg transition-all ${p.status === 'late' ? 'bg-amber-300' : 'bg-brand/70'}`} style={{ height: p.status === 'late' ? '70%' : '100%' }} />
                                      <p className="text-[10px] text-gray-400 text-center leading-tight">{p.month.split(' ')[0]}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-brand/70 inline-block" /> Paid on time</span>
                                  <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-amber-300 inline-block" /> Late payment</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {[
                                  { label: 'FY 2025–26 Rent Statement', size: '42 KB', icon: 'ri-file-pdf-line', color: 'text-red-500 bg-red-50' },
                                  { label: 'Q4 2025 Payment Summary', size: '18 KB', icon: 'ri-file-excel-line', color: 'text-green-600 bg-green-50' },
                                  { label: 'All Receipts (Jan–Apr 2026)', size: '96 KB', icon: 'ri-folder-zip-line', color: 'text-amber-600 bg-amber-50' },
                                ].map((doc) => (
                                  <div key={doc.label} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-gray-100 hover:border-brand/30 transition-colors cursor-pointer">
                                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${doc.color}`}>
                                      <i className={`${doc.icon} text-base`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-charcoal truncate">{doc.label}</p>
                                      <p className="text-xs text-gray-400">{doc.size}</p>
                                    </div>
                                    <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-brand/10 transition-colors flex-shrink-0">
                                      <i className="ri-download-line text-sm text-gray-500" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Annual Overview</p>
                                {[
                                  { label: 'Total Paid (FY 25–26)', value: '₹2,64,000' },
                                  { label: 'Avg. Monthly Rent', value: '₹22,000' },
                                  { label: 'On-time Payments', value: '10 / 12' },
                                  { label: 'Late Payments', value: '2' },
                                ].map((s) => (
                                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                                    <span className="text-xs text-gray-500">{s.label}</span>
                                    <span className="text-sm font-bold text-charcoal">{s.value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="ri-shield-check-line text-green-600" />
                                  <p className="text-sm font-bold text-green-800">Tax Benefit Tip</p>
                                </div>
                                <p className="text-xs text-green-700 leading-relaxed">
                                  Salaried employees can claim HRA exemption. Download your rent statement for Form 12BB submission.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded: Maintenance Requests */}
                    {isExpanded && feature.id === 'maintenance' && (
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                              <i className="ri-tools-line text-brand text-xl" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-charcoal">Request Maintenance</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Something broken? Raise a request in seconds — notified instantly, responded within 24 hrs.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                              <i className="ri-time-line text-brand" />
                              <span>Avg. response: <strong className="text-charcoal">under 24 hrs</strong></span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); collapse(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0">
                              <i className="ri-close-line text-gray-400 text-lg" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <p className="text-sm font-semibold text-charcoal mb-3">Select a category to get started</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                              {maintenanceCategories.map((cat) => (
                                <button key={cat.id} onClick={(e) => { e.stopPropagation(); setSelectedCategory({ id: cat.id, icon: cat.icon }); }}
                                  className={`relative text-left p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${cat.color}`}>
                                  {cat.badge && (
                                    <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.badgeColor}`}>{cat.badge}</span>
                                  )}
                                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl mb-2.5 ${cat.iconBg}`}>
                                    <i className={`${cat.icon} text-base`} />
                                  </div>
                                  <p className="text-xs font-bold text-charcoal leading-tight">{cat.label}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{cat.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-charcoal">Recent Requests</h4>
                                <Link to="/tenant-profile" onClick={(e) => e.stopPropagation()} className="text-xs text-brand font-semibold hover:underline">View all</Link>
                              </div>
                              <div className="space-y-2">
                                {myRequests.slice(0, 3).map((req) => (
                                  <div key={req.id} className="bg-white rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-xs font-bold text-charcoal">{req.category}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{req.issue}</p>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColorMap[req.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {statusLabelMap[req.status] || req.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="ri-alarm-warning-line text-red-500" />
                                <p className="text-sm font-bold text-red-700">Emergency?</p>
                              </div>
                              <p className="text-xs text-red-600 leading-relaxed">For gas leaks, fire, or flooding — call your building emergency line immediately.</p>
                              <p className="mt-1.5 text-xs font-bold text-red-700">Emergency: 1800-XXX-XXXX</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-brand-light py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">How It Works</h2>
            <p className="mt-3 text-gray-600">Getting started with digital rent management is simple</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Create Account', description: 'Sign up for free and verify your identity as a renter or landlord.' },
                { step: '02', title: 'Upload Documents', description: 'Upload your rent agreement and any related documents securely.' },
                { step: '03', title: 'Manage Everything', description: 'Track payments, submit requests, and communicate seamlessly.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold">{item.step}</div>
                  <h3 className="mt-4 text-lg font-semibold text-charcoal">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 md:py-24">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">Ready to Get Started?</h2>
            <p className="mt-3 text-gray-600">Join our waitlist to be the first to access our digital rent management tools when they launch.</p>
            <Link to="/signup" className="inline-block mt-8 bg-brand text-white font-medium px-8 py-3.5 rounded-full hover:bg-brand-dark transition-colors whitespace-nowrap">
              Join Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* Maintenance Modal */}
      {selectedCategory && (
        <MaintenanceRequestModal
          category={selectedCategory.id}
          categoryIcon={selectedCategory.icon}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {/* Mark as Paid Modal */}
      {markAsPaidRow && (
        <MarkAsPaidModal
          month={markAsPaidRow.month}
          amount={markAsPaidRow.amount}
          onConfirm={handleMarkAsPaid}
          onClose={() => setMarkAsPaidRow(null)}
        />
      )}
    </div>
  );
}
