import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications as allNotifications, AppNotification, NotificationType } from '@/mocks/notifications';
import PushSetupBanner from './components/PushSetupBanner';
import DeliveryStatus from './components/DeliveryStatus';

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeIcons: Record<NotificationType, string> = {
  new_inquiry: 'ri-user-received-line',
  inquiry_approved: 'ri-checkbox-circle-line',
  inquiry_declined: 'ri-close-circle-line',
  new_message: 'ri-message-3-line',
  maintenance: 'ri-tools-line',
  rent_reminder: 'ri-money-rupee-circle-line',
};

const typeColors: Record<NotificationType, string> = {
  new_inquiry: 'bg-amber-50 text-amber-600',
  inquiry_approved: 'bg-green-50 text-green-600',
  inquiry_declined: 'bg-red-50 text-red-500',
  new_message: 'bg-blue-50 text-blue-600',
  maintenance: 'bg-orange-50 text-orange-600',
  rent_reminder: 'bg-teal-50 text-teal-600',
};

const typeLabels: Record<NotificationType | 'all' | 'unread', string> = {
  all: 'All',
  unread: 'Unread',
  new_inquiry: 'Requests',
  inquiry_approved: 'Approved',
  inquiry_declined: 'Declined',
  new_message: 'Messages',
  maintenance: 'Maintenance',
  rent_reminder: 'Reminders',
};

type FilterKey = 'all' | 'unread' | NotificationType;

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([...allNotifications]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showDeliveryId, setShowDeliveryId] = useState<string | null>(null);
  const navigate = useNavigate();

  const unreadCount = notifs.filter((n) => !n.read).length;

  const filtered = notifs.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const idx = allNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) allNotifications[idx].read = true;
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    allNotifications.forEach((n) => { n.read = true; });
  };

  const handleClick = (notif: AppNotification) => {
    markRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filterKeys: FilterKey[] = ['all', 'unread', 'new_inquiry', 'new_message', 'maintenance', 'rent_reminder', 'inquiry_approved', 'inquiry_declined'];

  const counts: Record<FilterKey, number> = {
    all: notifs.length,
    unread: unreadCount,
    new_inquiry: notifs.filter((n) => n.type === 'new_inquiry').length,
    new_message: notifs.filter((n) => n.type === 'new_message').length,
    maintenance: notifs.filter((n) => n.type === 'maintenance').length,
    rent_reminder: notifs.filter((n) => n.type === 'rent_reminder').length,
    inquiry_approved: notifs.filter((n) => n.type === 'inquiry_approved').length,
    inquiry_declined: notifs.filter((n) => n.type === 'inquiry_declined').length,
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6 pt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread of {notifs.length} total
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex-shrink-0 text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Push setup banner */}
        <PushSetupBanner />

        {/* Filters */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {filterKeys.map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-500 hover:text-charcoal border border-gray-100'
              }`}
            >
              {typeLabels[key]}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-[#f9f9f7] rounded-full">
                <i className="ri-notification-off-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-charcoal mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications here'}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread'
                  ? 'You have read all your notifications.'
                  : `No ${typeLabels[filter] !== 'All' ? typeLabels[filter].toLowerCase() : ''} notifications yet.`}
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left bg-white rounded-2xl border p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer ${
                  notif.read
                    ? 'border-gray-100 hover:border-gray-200'
                    : 'border-amber-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl flex-shrink-0 ${typeColors[notif.type]}`}>
                  <i className={`${typeIcons[notif.type]} text-base sm:text-lg`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm sm:text-base ${notif.read ? 'font-medium text-charcoal' : 'font-bold text-charcoal'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0 mt-0.5">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notif.body}
                  </p>

                  {/* Delivery status */}
                  {showDeliveryId === notif.id ? (
                    <DeliveryStatus notificationId={notif.id} />
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeliveryId(notif.id); }}
                      className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-signal-tower-line" />
                      Show delivery channels
                    </button>
                  )}

                  <div className="flex items-center gap-3 mt-2.5">
                    {!notif.read && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Unread
                      </span>
                    )}
                    {notif.link && (
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-arrow-right-line" />
                        Tap to view
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover action */}
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(notif.id);
                    }}
                    className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <i className="ri-check-double-line text-sm text-gray-400" />
                  </button>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}