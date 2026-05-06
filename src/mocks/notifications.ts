export type NotificationType = 'new_inquiry' | 'inquiry_approved' | 'inquiry_declined' | 'new_message' | 'maintenance' | 'rent_reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
  requestId?: string;
}

export const notifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'new_inquiry',
    title: 'New connection request',
    body: 'Aditya Kumar sent a request for 3 BHK Premium Flat in Koramangala',
    createdAt: '2026-04-30T08:15:00Z',
    read: false,
    link: '/owner-profile?tab=inquiries',
    requestId: 'req-1',
  },
  {
    id: 'notif-2',
    type: 'new_inquiry',
    title: 'New connection request',
    body: 'Meera Nair sent a request for 3 BHK Premium Flat in Koramangala',
    createdAt: '2026-04-29T16:45:00Z',
    read: false,
    link: '/owner-profile?tab=inquiries',
    requestId: 'req-2',
  },
  {
    id: 'notif-3',
    type: 'new_message',
    title: 'New message from Rajesh Patel',
    body: 'Should I bring any documents with me?',
    createdAt: '2026-04-29T14:10:00Z',
    read: false,
    link: '/owner-profile?tab=chat',
    requestId: 'req-3',
  },
  {
    id: 'notif-4',
    type: 'new_message',
    title: 'New message from Sunita Reddy',
    body: 'That\'s great. What about parking? We have one car.',
    createdAt: '2026-04-28T10:35:00Z',
    read: false,
    link: '/owner-profile?tab=chat',
    requestId: 'req-4',
  },
  {
    id: 'notif-5',
    type: 'inquiry_approved',
    title: 'Inquiry approved',
    body: 'You approved Priya Sharma\'s request for 2 BHK in Indiranagar.',
    createdAt: '2026-04-28T09:00:00Z',
    read: false,
    link: '/owner-profile?tab=inquiries',
    requestId: 'req-5',
  },
  {
    id: 'notif-6',
    type: 'maintenance',
    title: 'Maintenance request resolved',
    body: 'The plumbing issue in Flat B-204 has been resolved by the technician.',
    createdAt: '2026-04-27T11:00:00Z',
    read: true,
    link: '/owner-profile',
  },
  {
    id: 'notif-7',
    type: 'rent_reminder',
    title: 'Rent due soon',
    body: 'Rent for Flat A-101 (₹20,000) is due on 1st May 2026.',
    createdAt: '2026-04-26T09:00:00Z',
    read: true,
    link: '/owner-profile',
  },
  {
    id: 'notif-8',
    type: 'new_inquiry',
    title: 'New connection request',
    body: 'Vikram Rao sent a request for Studio Apartment in JP Nagar.',
    createdAt: '2026-04-25T18:20:00Z',
    read: true,
    link: '/owner-profile?tab=inquiries',
    requestId: 'req-6',
  },
  {
    id: 'notif-9',
    type: 'inquiry_declined',
    title: 'Inquiry declined',
    body: 'You declined Arjun Menon\'s request for 1 BHK in Whitefield.',
    createdAt: '2026-04-24T13:45:00Z',
    read: true,
    link: '/owner-profile?tab=inquiries',
    requestId: 'req-7',
  },
  {
    id: 'notif-10',
    type: 'new_message',
    title: 'New message from Kavita Iyer',
    body: 'Can we schedule the visit for Saturday morning instead?',
    createdAt: '2026-04-23T16:30:00Z',
    read: true,
    link: '/owner-profile?tab=chat',
    requestId: 'req-8',
  },
  {
    id: 'notif-11',
    type: 'rent_reminder',
    title: 'Rent paid — Flat C-305',
    body: 'Rahul Desai paid ₹25,000 for April 2026 rent. Receipt generated.',
    createdAt: '2026-04-22T10:00:00Z',
    read: true,
    link: '/rent-receipts',
  },
  {
    id: 'notif-12',
    type: 'maintenance',
    title: 'New maintenance request',
    body: 'Tenant reported AC not cooling in Flat D-102. Assigned to CoolAir Services.',
    createdAt: '2026-04-21T09:15:00Z',
    read: true,
    link: '/owner-profile',
  },
];
