// src/components/Navbar.tsx
import { BellIcon, User2Icon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { useNotifications } from "../../pages/Notificationpage/hooks/useNotification";
interface NavbarProps {
  logout: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ logout }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  // 1. RE-INTRODUCE: Effect to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside NOTIF AND outside USER dropdowns
      const isOutsideNotif = notifRef.current && !notifRef.current.contains(target);
      const isOutsideUser = userRef.current && !userRef.current.contains(target);
      if (isOutsideNotif) {
        setIsNotifOpen(false);
      }
      if (isOutsideUser) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array means this runs once on mount
  // 3. NEW LOGIC: Handlers to ensure only one is open at a time
  const handleNotifToggle = () => {
    // Close user dropdown when opening notification dropdown
    if (!isNotifOpen) {
      setIsUserOpen(false);
    }
    setIsNotifOpen(!isNotifOpen);
  };
  const handleUserToggle = () => {
    // Close notification dropdown when opening user dropdown
    if (!isUserOpen) {
      setIsNotifOpen(false);
    }
    setIsUserOpen(!isUserOpen);
  };
  // Helper to ensure dropdown closes if a NavLink is clicked inside it
  const handleNavLinkClick = () => {
      setIsNotifOpen(false);
      setIsUserOpen(false);
  }
  const handleLogout = () => {
    logout();
    setIsUserOpen(false); // Close menu on action
    navigate("/login");
  };
  // ... (formatTime and getIconAndColor remain the same)
  const formatTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  const getIconAndColor = (type: string) => {
    switch (type) {
      case "achievement": return { icon: "🏆", color: "bg-yellow-500" };
      case "score": return { icon: "⭐", color: "bg-green-500" };
      case "streak": return { icon: "🔥", color: "bg-orange-500" };
      case "time": return { icon: "⚡", color: "bg-purple-500" };
      case "points": return { icon: "💰", color: "bg-indigo-500" };
      default: return { icon: "📢", color: "bg-blue-500" };
    }
  };
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 h-[80px] bg-white shadow-sm z-50">
      {/* Logo */}
      <div className="flex gap-2 items-center flex-shrink-0">
        <img src="/logo_3.png" alt="Quiz Bay Logo" className="h-10 sm:h-12 w-auto" />
        <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight font-extrabold text-gray-800 whitespace-nowrap">
          QUIZ-BAY
        </h1>
      </div>
      <div className="flex items-center gap-6">
       
        {/* Notifications Dropdown - CLICKABLE */}
        <div
            ref={notifRef}
            className="relative"
            // REMOVED onMouseEnter/onMouseLeave
        >
          <div
            className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
            onClick={handleNotifToggle} // ⬅️ Use the new mutual handler
          >
            <BellIcon className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {isNotifOpen && (
            <article
              // 4. REVERTED: Margin back to mt-3
              className="absolute right-0 top-full mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-200 font-bold text-gray-800 flex items-center justify-between bg-gray-50">
                <NavLink to="/dashboard/notifications" onClick={handleNavLinkClick}>
                  <span className="text-lg">Notifications</span>
                </NavLink>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <BellIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">All clear!</p>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const { icon, color } = getIconAndColor(notif.type);
                    return (
                      <div
                        key={notif.id}
                        // Close dropdown after marking as read to prevent flicker
                        onClick={() => { markAsRead(notif.id); setIsNotifOpen(false); }}
                        className={`px-5 py-4 border-b border-gray-100 last:border-b-0 transition-all cursor-pointer ${
                          !notif.read ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full text-white text-lg shadow-md ${color}`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-500">{formatTime(notif.time)}</span>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          )}
        </div>
        {/* User Dropdown - CLICKABLE */}
        <div
            ref={userRef}
            className="relative"
            // REMOVED onMouseEnter/onMouseLeave
        >
          <div
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            onClick={handleUserToggle} // ⬅️ Use the new mutual handler
          >
            <User2Icon className="h-6 w-6 text-gray-600" />
          </div>
          {isUserOpen && (
            <article
              // 4. REVERTED: Margin back to mt-3
              className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50"
            >
              <NavLink
                to="/dashboard/profile"
                className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100"
                onClick={handleNavLinkClick}
              >
                Profile
              </NavLink>
              <NavLink
                to="/dashboard/performance"
                className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100"
                onClick={handleNavLinkClick}
              >
                Performance
              </NavLink>
              <NavLink
                to="/dashboard/settings"
                className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100"
                onClick={handleNavLinkClick}
              >
                Settings
              </NavLink>
              <div
                onClick={handleLogout}
                className="px-5 py-4 text-red-600 hover:bg-red-100 hover:rounded-b-2xl cursor-pointer font-medium text-center transition ease-in-out"
              >
                Logout
              </div>
            </article>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
