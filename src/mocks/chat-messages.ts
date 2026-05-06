export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'tenant' | 'landlord';
  text: string;
  sentAt: string;
  read: boolean;
}

export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    requestId: 'req-3',
    sender: 'tenant',
    text: 'Hi Ravi, thank you for approving my request! I\'m really interested in the 2BHK. Can we schedule a visit this Saturday?',
    sentAt: '2026-04-26T14:35:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    requestId: 'req-3',
    sender: 'landlord',
    text: 'Hi Rajesh, sure! Saturday works for me. Would 11 AM be okay? I can show you the flat and the society amenities too.',
    sentAt: '2026-04-26T15:00:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    requestId: 'req-3',
    sender: 'tenant',
    text: '11 AM is perfect. Should I bring any documents with me?',
    sentAt: '2026-04-26T15:10:00Z',
    read: true,
  },
  {
    id: 'msg-4',
    requestId: 'req-3',
    sender: 'landlord',
    text: 'Just your ID proof and a reference letter if you have one. See you Saturday at 11!',
    sentAt: '2026-04-26T15:20:00Z',
    read: false,
  },
  {
    id: 'msg-5',
    requestId: 'req-4',
    sender: 'tenant',
    text: 'Thank you for the approval! We\'re excited to see the flat. Is there a lift in the building?',
    sentAt: '2026-04-25T10:05:00Z',
    read: true,
  },
  {
    id: 'msg-6',
    requestId: 'req-4',
    sender: 'landlord',
    text: 'Yes, there are two lifts — one passenger and one service. The building is 5 years old and well maintained.',
    sentAt: '2026-04-25T10:30:00Z',
    read: true,
  },
  {
    id: 'msg-7',
    requestId: 'req-4',
    sender: 'tenant',
    text: 'That\'s great. What about parking? We have one car.',
    sentAt: '2026-04-25T10:35:00Z',
    read: false,
  },
];
