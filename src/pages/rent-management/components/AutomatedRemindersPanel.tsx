import { useState } from 'react';

interface Props { onClose: () => void; }

interface Reminder { id: string; title: string; desc: string; icon: string; color: string; active: boolean; frequency: string; nextTrigger: string; }

const initialReminders: Reminder[] = [
  { id: '1', title: 'Rent Due Alert', desc: 'Notify 3 days before the 1st of every month', icon: 'ri-money-rupee-circle-line', color: 'text-brand bg-brand/10', active: true, frequency: 'Monthly', nextTrigger: '28 Apr 2026' },
  { id: '2', title: 'Lease Renewal', desc: 'Alert 60 days before lease expiry — Dec 2026', icon: 'ri-file-text-line', color: 'text-amber-600 bg-amber-50', active: true, frequency: 'One-time', nextTrigger: '1 Oct 2026' },
  { id: '3', title: 'Inspection Reminder', desc: 'Remind 7 days before scheduled property inspection', icon: 'ri-search-eye-line', color: 'text-teal-600 bg-teal-50', active: false, frequency: 'As scheduled', nextTrigger: '—' },
  { id: '4', title: 'Rent Receipt Request', desc: 'Auto-request receipt from landlord after each payment', icon: 'ri-receipt-line', color: 'text-green-600 bg-green-50', active: true, frequency: 'Monthly', nextTrigger: '2 May 2026' },
  { id: '5', title: 'Security Deposit', desc: 'Remind 30 days before move-out to claim deposit', icon: 'ri-safe-line', color: 'text-slate-600 bg-slate-100', active: false, frequency: 'One-time', nextTrigger: '—' },
  { id: '6', title: 'Utility Bill Reminder', desc: 'Monthly reminder to pay electricity & water bills', icon: 'ri-flashlight-line', color: 'text-yellow-600 bg-yellow-50', active: true, frequency: 'Monthly', nextTrigger: '5 May 2026' },
];

const upcomingAlerts = [
  { label: 'Rent Due Alert', date: '28 Apr 2026', days: 1, color: 'text-red-600 bg-red-50' },
  { label: 'Rent Receipt Request', date: '2 May 2026', days: 5, color: 'text-brand bg-brand/10' },
  { label: 'Utility Bill Reminder', date: '5 May 2026', days: 8, color: 'text-amber-600 bg-amber-50' },
];

export default function AutomatedRemindersPanel({ onClose }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  const toggle = (id: string) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  const activeCount = reminders.filter((r) => r.active).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-notification-3-line text-brand text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Automated Reminders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Stay ahead of every deadline — never miss a payment or renewal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand/10 text-brand">
            {activeCount} active
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-gray-400 text-lg" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder list */}
        <div className="lg:col-span-2 space-y-3">
          {reminders.map((r) => (
            <div key={r.id} className={`rounded-2xl p-4 border transition-all ${r.active ? 'bg-white border-gray-100' : 'bg-[#f9f9f7] border-gray-100 opacity-70'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${r.color}`}>
                  <i className={`${r.icon} text-base`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-charcoal">{r.title}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{r.frequency}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  {r.active && r.nextTrigger !== '—' && (
                    <p className="text-[11px] text-brand font-semibold mt-1 flex items-center gap-1">
                      <i className="ri-calendar-event-line text-xs" /> Next: {r.nextTrigger}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(r.id); }}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${r.active ? 'bg-brand' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${r.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Upcoming alerts */}
          <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Upcoming Alerts</p>
            <div className="space-y-2.5">
              {upcomingAlerts.map((a) => (
                <div key={a.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.color}`}>
                      {a.days}d
                    </span>
                    <span className="text-xs text-charcoal font-medium">{a.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{a.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notification channels */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Notify via</p>
            <div className="space-y-2">
              {[
                { label: 'In-app notification', icon: 'ri-notification-3-line', on: true },
                { label: 'Email', icon: 'ri-mail-line', on: true },
                { label: 'SMS / WhatsApp', icon: 'ri-whatsapp-line', on: false },
              ].map((ch) => (
                <div key={ch.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className={`${ch.icon} text-sm text-gray-400`} />
                    </div>
                    <span className="text-xs text-charcoal">{ch.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ch.on ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {ch.on ? 'On' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-time-line text-amber-600 text-sm" />
              <p className="text-xs font-bold text-amber-800">Lease expires Dec 2026</p>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your lease renewal reminder is set for <strong>1 Oct 2026</strong> — 60 days before expiry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
