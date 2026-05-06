import { useState } from 'react';
import { notificationPreferences, type NotificationPreference, type ChannelType } from '@/mocks/notification-channels';

const channelMeta: Record<ChannelType, { label: string; icon: string; desc: string; color: string }> = {
  push: { label: 'Push', icon: 'ri-smartphone-line', desc: 'Instant device alerts', color: 'text-green-600' },
  sms: { label: 'SMS', icon: 'ri-message-2-line', desc: 'Critical fallback via text', color: 'text-amber-600' },
  email: { label: 'Email', icon: 'ri-mail-line', desc: 'Detailed summaries', color: 'text-blue-600' },
  in_app: { label: 'In-App', icon: 'ri-notification-3-line', desc: 'Inside the platform', color: 'text-charcoal' },
};

export default function ChannelPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>([...notificationPreferences]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (category: string, channel: keyof Omit<NotificationPreference, 'category' | 'label' | 'criticalOnly'>) => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.category === category
          ? { ...p, [channel]: !p[channel as keyof typeof p] }
          : p
      )
    );
  };

  return (
    <div className="space-y-3">
      {prefs.map((pref) => {
        const isOpen = expanded === pref.category;
        const activeCount = [
          pref.push && 'push',
          pref.sms && 'sms',
          pref.email && 'email',
          pref.inApp && 'in_app',
        ].filter(Boolean).length;

        return (
          <div
            key={pref.category}
            className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-amber-200' : 'border-gray-100 hover:border-gray-200'}`}
          >
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : pref.category)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50">
                  <i className="ri-notification-3-line text-sm text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{pref.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeCount} of 4 channels active
                    {pref.criticalOnly && ' · SMS for critical only'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                  {activeCount} active
                </span>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={isOpen ? 'ri-arrow-up-s-line text-gray-400 text-sm' : 'ri-arrow-down-s-line text-gray-400 text-sm'} />
                </div>
              </div>
            </button>

            {/* Expanded toggles */}
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 space-y-3">
                <div className="h-px bg-gray-100" />
                {(Object.keys(channelMeta) as ChannelType[]).map((ch) => {
                  const meta = channelMeta[ch];
                  const valueKey = ch === 'in_app' ? 'inApp' : ch;
                  const enabled = pref[valueKey as keyof NotificationPreference] as boolean;
                  const isCriticalOnly = ch === 'sms' && pref.criticalOnly && enabled;

                  return (
                    <div key={ch} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${enabled ? 'bg-gray-50' : 'bg-gray-100'}`}>
                          <i className={`${meta.icon} text-sm ${enabled ? meta.color : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{meta.label}</p>
                          <p className="text-xs text-gray-400">{meta.desc}</p>
                          {isCriticalOnly && (
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Only critical events</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(pref.category, valueKey)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${enabled ? 'bg-amber-500' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}