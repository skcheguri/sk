import { getDeliveryLogsForNotification, type ChannelType } from '@/mocks/notification-channels';

const channelConfig: Record<ChannelType, { label: string; icon: string; colorMap: Record<string, string> }> = {
  push: {
    label: 'Push',
    icon: 'ri-smartphone-line',
    colorMap: {
      delivered: 'text-green-600',
      sent: 'text-amber-600',
      failed: 'text-red-500',
      pending: 'text-gray-400',
    },
  },
  sms: {
    label: 'SMS',
    icon: 'ri-message-2-line',
    colorMap: {
      delivered: 'text-green-600',
      sent: 'text-amber-600',
      failed: 'text-red-500',
      pending: 'text-gray-400',
    },
  },
  email: {
    label: 'Email',
    icon: 'ri-mail-line',
    colorMap: {
      delivered: 'text-green-600',
      sent: 'text-amber-600',
      failed: 'text-red-500',
      pending: 'text-gray-400',
    },
  },
  in_app: {
    label: 'In-App',
    icon: 'ri-notification-3-line',
    colorMap: {
      delivered: 'text-green-600',
      sent: 'text-amber-600',
      failed: 'text-red-500',
      pending: 'text-gray-400',
    },
  },
};

const statusBg: Record<string, string> = {
  delivered: 'bg-green-50',
  sent: 'bg-amber-50',
  failed: 'bg-red-50',
  pending: 'bg-gray-100',
};

interface Props {
  notificationId: string;
}

export default function DeliveryStatus({ notificationId }: Props) {
  const logs = getDeliveryLogsForNotification(notificationId);

  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-gray-400">In-app only</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {logs.map((log) => {
        const cfg = channelConfig[log.channel];
        return (
          <span
            key={log.id}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBg[log.status]} ${cfg.colorMap[log.status]}`}
            title={log.error ?? `${cfg.label} — ${log.status}`}
          >
            <i className={`${cfg.icon} text-[10px]`} />
            {cfg.label}
            {log.status === 'failed' && log.error && (
              <span className="hidden sm:inline">· {log.error}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}