import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications, AppNotification } from '@/mocks/notifications';

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeIcons: Record<AppNotification['type'], string> = {
  new_inquiry: 'ri-user-received-line',
  inquiry_approved: 'ri-checkbox-circle-line',
  inquiry_declined: 'ri-close-circle-line',
  new_message: 'ri-message-3-line',
  maintenance: 'ri-tools-line',
  rent_reminder: 'ri-money-rupee-circle-line',
};

const typeColors: Record<AppNotification['type'], string> = {
  new_inquiry: 'bg-amber-50 text-amber-600',
  inquiry_approved: 'bg-green-50 text-green-600',
  inquiry_declined: 'bg-red-50 text-red-500',
  new_message: 'bg-blue-50 text-blue-600',
  maintenance: 'bg-orange-50 text-orange-600',
  rent_reminder: 'bg-teal-50 text-teal-600',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([...notifications]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) notifications[idx].read = true;
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => { n.read = true; });
  };

  const handleClick = (notif: AppNotification) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <i className="ri-notification-3-line text-lg text-charcoal" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-amber-600 font-medium hover:text-amber-700 cursor-pointer whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#f9f9f7] rounded-full">
                  <i className="ri-notification-off-line text-xl text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifs.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                    notif.read ? 'bg-white' : 'bg-amber-50/50'
                  }`}
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${typeColors[notif.type]}`}>
                    <i className={`${typeIcons[notif.type]} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm ${notif.read ? 'font-medium text-charcoal' : 'font-bold text-charcoal'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notif.body}
                    </p>
                    {!notif.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mt-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100 text-center">
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="text-xs text-amber-600 font-medium hover:text-amber-700 cursor-pointer whitespace-nowrap"
            >
              View all activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
