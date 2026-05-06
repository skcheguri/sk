import { useState, useRef, useEffect } from 'react';

interface Props { onClose: () => void; }

interface Message { id: string; from: 'tenant' | 'landlord'; text: string; time: string; read: boolean; }

const initialMessages: Message[] = [
  { id: '1', from: 'landlord', text: 'Hi Arjun, just confirming your rent for April has been received. Receipt will be shared by tomorrow.', time: '1 Apr, 10:12 AM', read: true },
  { id: '2', from: 'tenant', text: 'Thank you Mr. Patel! Please do share the receipt, I need it for my HRA claim.', time: '1 Apr, 10:45 AM', read: true },
  { id: '3', from: 'landlord', text: 'Sure, will send it by evening. Also, the plumber will visit on 3rd April for the kitchen sink issue.', time: '1 Apr, 11:02 AM', read: true },
  { id: '4', from: 'tenant', text: 'Perfect, I\'ll be home between 10am–1pm. Please ask him to come in that window.', time: '1 Apr, 11:15 AM', read: true },
  { id: '5', from: 'landlord', text: 'Noted. I\'ll inform him. Let me know if there are any other issues.', time: '1 Apr, 11:20 AM', read: true },
  { id: '6', from: 'tenant', text: 'One more thing — the society parking sticker for my car hasn\'t been issued yet. Can you follow up?', time: '3 Apr, 9:30 AM', read: true },
  { id: '7', from: 'landlord', text: 'I\'ll speak to the society office today. Should be sorted by this week.', time: '3 Apr, 10:05 AM', read: false },
];

const quickReplies = [
  'Thank you!',
  'Noted, will check.',
  'Please share the receipt.',
  'When can the technician visit?',
];

export default function DirectMessagingPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      from: 'tenant',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-chat-3-line text-brand text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Direct Messaging</h3>
            <p className="text-xs text-gray-500 mt-0.5">Secure, documented conversations with your landlord</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0">
          <i className="ri-close-line text-gray-400 text-lg" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat window */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Landlord info bar */}
          <div className="flex items-center gap-3 bg-[#f9f9f7] rounded-2xl px-4 py-3 mb-3 border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-amber-600">SP</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-charcoal">Mr. Suresh Patel</p>
              <p className="text-xs text-gray-400">Property Owner · B-204, Prestige Towers</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Online
            </span>
          </div>

          {/* Messages */}
          <div className="bg-[#f9f9f7] rounded-2xl border border-gray-100 p-4 h-64 overflow-y-auto space-y-3 mb-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${msg.from === 'tenant' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'tenant'
                      ? 'bg-brand text-white rounded-br-sm'
                      : 'bg-white text-charcoal border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 ${msg.from === 'tenant' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.from === 'tenant' && (
                      <i className={`ri-check-double-line text-[10px] ${msg.read ? 'text-brand' : 'text-gray-300'}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="flex gap-2 flex-wrap mb-3">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={(e) => { e.stopPropagation(); send(q); }}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-brand/40 hover:text-brand transition-colors cursor-pointer whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#f9f9f7] rounded-xl px-3 py-2.5 border border-gray-100 focus-within:border-brand/30 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-charcoal placeholder-gray-400"
              />
              <button className="w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-attachment-2 text-gray-400 text-base hover:text-brand transition-colors" />
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); send(input); }}
              disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40 flex-shrink-0"
            >
              <i className="ri-send-plane-fill text-sm" />
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Conversation info */}
          <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Conversation Info</p>
            {[
              { label: 'Total Messages', value: String(messages.length) },
              { label: 'Unread', value: String(messages.filter(m => !m.read && m.from === 'landlord').length) },
              { label: 'Started', value: '12 Jan 2025' },
              { label: 'Last Active', value: '3 Apr 2026' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className="text-sm font-bold text-charcoal">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Shared files */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Shared Files</p>
            <div className="space-y-2">
              {[
                { name: 'Rent Receipt Apr 2026.pdf', icon: 'ri-file-pdf-line', color: 'text-red-500 bg-red-50' },
                { name: 'Plumber Visit Confirmation.jpg', icon: 'ri-image-line', color: 'text-brand bg-brand/10' },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-2">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${f.color}`}>
                    <i className={`${f.icon} text-xs`} />
                  </div>
                  <p className="text-xs text-charcoal truncate flex-1">{f.name}</p>
                  <i className="ri-download-line text-xs text-gray-400 cursor-pointer hover:text-brand" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-lock-2-line text-green-600 text-sm" />
              <p className="text-xs font-bold text-green-800">End-to-end documented</p>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              All messages are securely stored and can be used as evidence in case of disputes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
