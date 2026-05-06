import { useState } from 'react';
import { contactRequests, ContactRequest } from '@/mocks/contact-requests';
import { chatMessages, ChatMessage } from '@/mocks/chat-messages';
import { useAuth } from '@/hooks/useAuth';
import { useBrokerReport, ReportReason } from '@/hooks/useBrokerReport';
import { useOwnerRateLimit } from '@/hooks/useOwnerRateLimit';
import { useToast } from '@/hooks/useToast';
import ReportBrokerModal from './ReportBrokerModal';

interface ChatTabProps {
  initialRequestId?: string | null;
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatTab({ initialRequestId }: ChatTabProps) {
  const approvedRequests = contactRequests.filter((r) => r.status === 'approved');
  const [activeChat, setActiveChat] = useState<ContactRequest | null>(
    approvedRequests.find((r) => r.id === initialRequestId) ?? approvedRequests[0] ?? null
  );
  const [messages, setMessages] = useState([...chatMessages]);
  const [replyText, setReplyText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const { user } = useAuth();
  const { chat: chatLimit, recordChat } = useOwnerRateLimit(user?.id);
  const { addToast } = useToast();

  const brokerStatus = useBrokerReport(activeChat?.prospectId);
  const alreadyReported = activeChat ? !brokerStatus.canBeReportedBy(user?.id ?? '') : false;

  const chatMessagesForActive = activeChat
    ? messages.filter((m) => m.requestId === activeChat.id).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    : [];

  const handleSend = () => {
    if (!replyText.trim() || !activeChat) return;

    if (!chatLimit.canSend) {
      addToast(chatLimit.limitReason || 'Rate limit reached. Please try again later.', 'error');
      return;
    }

    const ok = recordChat();
    if (!ok) {
      addToast(chatLimit.limitReason || 'Rate limit reached. Please try again later.', 'error');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: activeChat.id,
      sender: 'landlord',
      text: replyText.trim(),
      sentAt: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    chatMessages.push(newMsg);
    setReplyText('');
  };

  const handleReport = async (reason: ReportReason, reasonText: string) => {
    if (!user || !activeChat) return;
    const ok = await brokerStatus.report(user.id, user.name, reason, reasonText, activeChat.listingId);
    if (ok) {
      addToast('Report submitted. We will review within 24 hours.', 'success');
    }
    setReportOpen(false);
  };

  const unreadCount = (reqId: string) =>
    messages.filter((m) => m.requestId === reqId && m.sender === 'tenant' && !m.read).length;

  if (approvedRequests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-[#f9f9f7] rounded-full">
          <i className="ri-message-3-line text-2xl text-gray-400" />
        </div>
        <h3 className="text-base font-bold text-charcoal mb-2">No active chats</h3>
        <p className="text-sm text-gray-500">Approve connection requests to start chatting with prospects.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[500px]">
      {/* Chat list sidebar */}
      <div className="lg:col-span-1 border-r border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-charcoal">Messages</h3>
          <p className="text-xs text-gray-400 mt-0.5">{approvedRequests.length} active conversation{approvedRequests.length > 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          {approvedRequests.map((req) => {
            const lastMsg = messages
              .filter((m) => m.requestId === req.id)
              .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
            const unread = unreadCount(req.id);
            const isActive = activeChat?.id === req.id;
            return (
              <button
                key={req.id}
                onClick={() => setActiveChat(req)}
                className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                  isActive ? 'bg-amber-50' : 'hover:bg-[#f9f9f7]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-600">{req.prospectInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-charcoal' : 'font-medium text-charcoal'}`}>
                      {req.prospectName}
                    </p>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(lastMsg.sentAt)}</span>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
                    {lastMsg ? (lastMsg.sender === 'landlord' ? 'You: ' : '') + lastMsg.text : 'No messages yet'}
                  </p>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold mt-1">
                      {unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="lg:col-span-2 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-amber-600">{activeChat.prospectInitials}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">{activeChat.prospectName}</p>
                <p className="text-xs text-gray-400">{activeChat.occupation} · {activeChat.moveInDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {alreadyReported && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                    <i className="ri-flag-line text-[10px]" /> Reported
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <i className="ri-checkbox-circle-fill text-xs" /> Approved
                </div>
                <button
                  onClick={() => setReportOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Report tenant"
                >
                  <i className="ri-flag-line text-xs" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
              {/* Rate limit banner inside chat */}
              {!chatLimit.canSend && chatLimit.limitReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 mb-3">
                  <i className="ri-error-warning-line text-red-500 text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">Chat Message Limit Reached</p>
                    <p className="text-[11px] text-red-500">{chatLimit.limitReason}</p>
                  </div>
                </div>
              )}
              {chatMessagesForActive.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              )}
              {chatMessagesForActive.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'landlord' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'landlord'
                      ? 'bg-amber-500 text-white rounded-br-md'
                      : 'bg-[#f9f9f7] text-charcoal rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'landlord' ? 'text-amber-100' : 'text-gray-400'}`}>
                      {formatTime(msg.sentAt)}
                      {msg.sender === 'landlord' && (
                        <span className="ml-1">{msg.read ? <i className="ri-check-double-line" /> : <i className="ri-check-line" />}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder={chatLimit.canSend ? 'Type a message...' : 'Message limit reached'}
                  disabled={!chatLimit.canSend}
                  className="flex-1 px-4 py-3 bg-[#f9f9f7] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || !chatLimit.canSend}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <i className="ri-send-plane-fill text-sm" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-gray-400">
                  {chatLimit.dailyRemaining}/{chatLimit.dailyRemaining + chatLimit.dailyCount} messages remaining today
                </p>
                {!chatLimit.canSend && (
                  <p className="text-[11px] text-red-500 font-medium">Limit reached</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      <ReportBrokerModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        prospectName={activeChat?.prospectName ?? ''}
        onReport={handleReport}
        alreadyReported={alreadyReported}
      />
    </div>
  );
}
