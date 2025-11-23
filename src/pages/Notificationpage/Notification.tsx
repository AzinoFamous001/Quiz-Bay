// src/pages/NotificationsPage.tsx
import React from "react";
import { BellIcon, Flame, Trophy, Star, X, CheckCircle, Zap, Coins } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { useNotifications } from "../../pages/Notificationpage/hooks/useNotification";


const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  // Your original grouping logic
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
  // Your original ordering logic
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
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur rounded-2xl">
              <BellIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Notifications</h1>
              <p className="text-gray-300">
                {/* Displaying the correct count */}
                {unreadCount > 0 ? `${unreadCount} unread` : "Check out new notifications!"}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur transition flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark all as read
                </button>
              )}
              <button
                // Clear all will correctly sync via the hook logic
                onClick={clearAll}
                className="px-5 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Clear all
              </button>
            </div>
          )}
        </div>
        {/* List */}
        <div className="space-y-8">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-8 bg-white/10 backdrop-blur rounded-3xl inline-block mb-6">
                <BellIcon className="w-20 h-20 text-white/50" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No notifications yet</h2>
              <p className="text-gray-300 text-lg">
                Complete quizzes and unlock achievements to see them here!
              </p>
            </div>
          ) : (
            orderedGroups.map(group => (
              <div key={group}>
                <h3 className="text-lg font-semibold text-white/80 mb-4 pl-2">{group}</h3>
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`group relative p-5 rounded-2xl border backdrop-blur transition-all cursor-pointer
                        ${notif.read
                          ? "bg-white/10 border-white/20 hover:bg-white/15"
                          : "bg-white/20 border-white/40 shadow-lg shadow-white/10 hover:bg-white/25"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${getColor(notif.type)}`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${notif.read ? "text-gray-200" : "text-white"}`}>
                            {notif.message}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {format(new Date(notif.time), "h:mm a · MMM d, yyyy")}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;
