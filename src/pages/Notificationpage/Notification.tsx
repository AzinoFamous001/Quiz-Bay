// src/pages/NotificationsPage.tsx
import React from "react";
import { BellIcon, Flame, Trophy, Star, X, CheckCircle, Zap, Coins } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { useNotifications } from "../../pages/Notificationpage/hooks/useNotification";

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Group notifications by time
  const grouped = notifications.reduce((acc, notif) => {
    const date = new Date(notif.time);
    let group: string;
    if (isToday(date)) group = "Today";
    else if (isYesterday(date)) group = "Yesterday";
    else if (differenceInDays(new Date(), date) <= 7) group = "This Week";
    else group = format(date, "MMMM d, yyyy");

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const orderedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return 0;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "achievement": return <Trophy className="w-5 h-5" />;
      case "score": return <Star className="w-5 h-5" />;
      case "streak": return <Flame className="w-5 h-5" />;
      case "time": return <Zap className="w-5 h-5" />;
      case "points": return <Coins className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "achievement": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "score": return "bg-green-100 text-green-700 border-green-300";
      case "streak": return "bg-orange-100 text-orange-700 border-orange-300";
      case "time": return "bg-purple-100 text-purple-700 border-purple-300";
      case "points": return "bg-indigo-100 text-indigo-700 border-indigo-300";
      default: return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat">
      {/* Safe top padding for mobile navbar */}
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl">
                <BellIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Notifications
                </h1>
                <p className="text-gray-200 text-sm sm:text-base mt-1">
                  {unreadCount > 0 
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                    : "You're all caught up!"}
                </p>
              </div>
            </div>

            {/* Action Buttons - Stack on mobile */}
            {notifications.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-lg transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-5 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                >
                  <X className="w-5 h-5" />
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-10 bg-white/10 backdrop-blur-xl rounded-3xl inline-block mb-8 shadow-2xl">
                <BellIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white/40" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                No notifications yet
              </h2>
              <p className="text-gray-300 text-base sm:text-lg max-w-md mx-auto">
                Complete quizzes and unlock achievements to see them here!
              </p>
            </div>
          ) : (
            /* Notifications List */
            <div className="space-y-10">
              {orderedGroups.map(group => (
                <div key={group}>
                  <h3 className="text-lg sm:text-xl font-bold text-white/90 mb-5 pl-2 tracking-wide">
                    {group}
                  </h3>
                  <div className="space-y-4">
                    {grouped[group].map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`group relative p-5 sm:p-6 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer
                          ${notif.read
                            ? "bg-white/10 border-white/20 hover:bg-white/15"
                            : "bg-white/25 border-white/50 shadow-lg shadow-white/20 hover:bg-white/30"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl flex-shrink-0 ${getColor(notif.type)}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm sm:text-base leading-relaxed ${notif.read ? "text-gray-200" : "text-white"}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2">
                              {format(new Date(notif.time), "h:mm a · MMM d, yyyy")}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;