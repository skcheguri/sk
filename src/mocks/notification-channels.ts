export type ChannelType = 'push' | 'sms' | 'email' | 'in_app';

export interface NotificationPreference {
  category: string;
  label: string;
  push: boolean;
  sms: boolean;
  email: boolean;
  inApp: boolean;
  criticalOnly?: boolean; // SMS fallback only for critical events
}

export interface DeliveryLog {
  id: string;
  notificationId: string;
  channel: ChannelType;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
}

export const notificationPreferences: NotificationPreference[] = [
  {
    category: 'new_inquiry',
    label: 'New Tenant Inquiries',
    push: true,
    sms: false,
    email: true,
    inApp: true,
  },
  {
    category: 'inquiry_approved',
    label: 'Inquiry Approved / Declined',
    push: true,
    sms: false,
    email: true,
    inApp: true,
  },
  {
    category: 'new_message',
    label: 'New Messages',
    push: true,
    sms: false,
    email: false,
    inApp: true,
  },
  {
    category: 'maintenance',
    label: 'Maintenance Updates',
    push: true,
    sms: true,
    email: true,
    inApp: true,
    criticalOnly: true,
  },
  {
    category: 'rent_reminder',
    label: 'Rent & Payment Alerts',
    push: true,
    sms: true,
    email: true,
    inApp: true,
    criticalOnly: true,
  },
];

export const deliveryLogs: DeliveryLog[] = [
  { id: 'dl-1', notificationId: 'notif-1', channel: 'push', status: 'delivered', sentAt: '2026-04-30T08:15:02Z' },
  { id: 'dl-2', notificationId: 'notif-1', channel: 'email', status: 'delivered', sentAt: '2026-04-30T08:15:05Z' },
  { id: 'dl-3', notificationId: 'notif-1', channel: 'in_app', status: 'delivered', sentAt: '2026-04-30T08:15:00Z' },
  { id: 'dl-4', notificationId: 'notif-2', channel: 'push', status: 'delivered', sentAt: '2026-04-29T16:45:02Z' },
  { id: 'dl-5', notificationId: 'notif-2', channel: 'email', status: 'delivered', sentAt: '2026-04-29T16:45:05Z' },
  { id: 'dl-6', notificationId: 'notif-2', channel: 'in_app', status: 'delivered', sentAt: '2026-04-29T16:45:00Z' },
  { id: 'dl-7', notificationId: 'notif-3', channel: 'push', status: 'failed', sentAt: '2026-04-29T14:10:01Z', error: 'Device offline' },
  { id: 'dl-8', notificationId: 'notif-3', channel: 'sms', status: 'sent', sentAt: '2026-04-29T14:10:03Z' },
  { id: 'dl-9', notificationId: 'notif-3', channel: 'in_app', status: 'delivered', sentAt: '2026-04-29T14:10:00Z' },
  { id: 'dl-10', notificationId: 'notif-5', channel: 'push', status: 'delivered', sentAt: '2026-04-28T09:00:02Z' },
  { id: 'dl-11', notificationId: 'notif-5', channel: 'email', status: 'delivered', sentAt: '2026-04-28T09:00:05Z' },
  { id: 'dl-12', notificationId: 'notif-5', channel: 'in_app', status: 'delivered', sentAt: '2026-04-28T09:00:00Z' },
  { id: 'dl-13', notificationId: 'notif-7', channel: 'push', status: 'failed', sentAt: '2026-04-26T09:00:01Z', error: 'Token expired' },
  { id: 'dl-14', notificationId: 'notif-7', channel: 'sms', status: 'delivered', sentAt: '2026-04-26T09:00:04Z' },
  { id: 'dl-15', notificationId: 'notif-7', channel: 'email', status: 'delivered', sentAt: '2026-04-26T09:00:06Z' },
  { id: 'dl-16', notificationId: 'notif-7', channel: 'in_app', status: 'delivered', sentAt: '2026-04-26T09:00:00Z' },
];

export function getDeliveryLogsForNotification(notificationId: string): DeliveryLog[] {
  return deliveryLogs.filter((d) => d.notificationId === notificationId);
}

export function getChannelStatus(notificationId: string, channel: ChannelType): DeliveryLog | undefined {
  return deliveryLogs.find((d) => d.notificationId === notificationId && d.channel === channel);
}