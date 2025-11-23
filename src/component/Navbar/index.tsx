// src/components/Navbar.tsx
import { BellIcon, User2Icon, Menu, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { useNotifications } from "../../pages/Notificationpage/hooks/useNotification";

interface NavbarProps {
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ logout }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  // Desktop dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Desktop-only dropdown toggles — mobile taps are ignored
  const handleNotifToggle = () => {
    if (window.innerWidth < 768) return; // ← Prevent dropdown on mobile
    if (!isNotifOpen) setIsUserOpen(false);
    setIsNotifOpen(!isNotifOpen);
  };

  const handleUserToggle = () => {
    if (window.innerWidth < 768) return; // ← Prevent dropdown on mobile
    if (!isUserOpen) setIsNotifOpen(false);
    setIsUserOpen(!isUserOpen);
  };

  const closeAll = () => {
    setIsNotifOpen(false);
    setIsUserOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    navigate("/login");
  };

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
      case "achievement": return { icon: "Trophy", color: "bg-yellow-500" };
      case "score": return { icon: "Star", color: "bg-green-500" };
      case "streak": return { icon: "Fire", color: "bg-orange-500" };
      case "time": return { icon: "Lightning", color: "bg-purple-500" };
      case "points": return { icon: "Coins", color: "bg-indigo-500" };
      default: return { icon: "Megaphone", color: "bg-blue-500" };
    }
  };

  return (
    <>
      <header className="w-full flex items-center justify-between px-4 py-2 h-[80px] bg-white shadow-sm z-50 relative">
        {/* Logo */}
        <div className="flex gap-2 items-center flex-shrink-0">
          <img src="/logo_3.png" alt="Quiz Bay Logo" className="h-10 sm:h-12 w-auto" />
          <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight font-extrabold text-gray-800 whitespace-nowrap">
            QUIZ-BAY
          </h1>
        </div>

        {/* Desktop Icons + Mobile Controls */}
        <div className="flex items-center gap-4">
          {/* Desktop: Notification & User Dropdowns */}
          <div className="hidden md:flex items-center gap-6">
            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <div
                className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
                onClick={handleNotifToggle}
              >
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              {isNotifOpen && (
                <article className="absolute right-0 top-full mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200 font-bold text-gray-800 flex items-center justify-between bg-gray-50">
                    <NavLink to="/dashboard/notifications" onClick={closeAll}>
                      <span className="text-lg">Notifications</span>
                    </NavLink>
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-sm text-red-600 hover:text-red-700 font-medium">
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
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsNotifOpen(false);
                            }}
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
                              {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              )}
            </div>

            {/* User Dropdown */}
            <div ref={userRef} className="relative">
              <div
                className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                onClick={handleUserToggle}
              >
                <User2Icon className="h-6 w-6 text-gray-600" />
              </div>

              {isUserOpen && (
                <article className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50">
                  <NavLink to="/dashboard/profile" className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100" onClick={closeAll}>
                    Profile
                  </NavLink>
                  <NavLink to="/dashboard/performance" className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100" onClick={closeAll}>
                    Performance
                  </NavLink>
                  <NavLink to="/dashboard/settings" className="block px-5 py-4 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100" onClick={closeAll}>
                    Settings
                  </NavLink>
                  <div onClick={handleLogout} className="px-5 py-4 text-red-600 hover:bg-red-100 hover:rounded-b-2xl cursor-pointer font-medium text-center transition">
                    Logout
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* Mobile: Bell (badge only) + Hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="relative">
              <BellIcon className="h-6 w-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition z-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — Only one menu ever appears */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-sm text-red-600 font-medium">
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <BellIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 8).map((notif) => {
                      const { icon, color } = getIconAndColor(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsMobileMenuOpen(false);
                            navigate("/dashboard/notifications");
                          }}
                          className={`p-4 rounded-xl border ${!notif.read ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-full text-white text-lg ${color}`}>{icon}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(notif.time)}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                          </div>
                        </div>
                      );
                    })}
                    {notifications.length > 8 && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/dashboard/notifications");
                        }}
                        className="w-full text-center text-blue-600 font-medium text-sm py-2"
                      >
                        View all notifications
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 space-y-1">
                <NavLink to="/dashboard/profile" onClick={closeAll} className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-800">
                  Profile
                </NavLink>
                <NavLink to="/dashboard/performance" onClick={closeAll} className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-800">
                  Performance
                </NavLink>
                <NavLink to="/dashboard/settings" onClick={closeAll} className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-800">
                  Settings
                </NavLink>
                <button onClick={handleLogout} className="w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 text-red-600 font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;