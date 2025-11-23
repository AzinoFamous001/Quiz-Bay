// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "achievement" | "score" | "streak" | "time" | "points" | "system";
}
// Function to safely get notifications from localStorage
const getInitialNotifications = (): Notification[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const saved = localStorage.getItem("app_notifications");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Notification[];
      return parsed.length > 0 ? parsed : [];
    } catch (e) {
      console.error("Failed to parse notifications from localStorage", e);
      return [];
    }
  }
  return [];
};
// **NEW:** Function to create initial dummy data for testing UI
const createInitialDummyNotifications = (): Notification[] => {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  return [
    {
      id: "1",
      message: "Congratulations! You completed the 'React Basics' quiz.",
      time: now.toISOString(),
      read: false,
      type: "achievement",
    },
    {
      id: "2",
      message:
        "You gained 500 points on the 'CSS Mastery' quiz. Keep up the score!",
      time: threeHoursAgo.toISOString(),
      read: false,
      type: "points",
    },
    {
      id: "3",
      message: "System update complete. New quizzes added to the library.",
      time: twoDaysAgo.toISOString(),
      read: true,
      type: "system",
    },
  ];
};
export const useNotifications = () => {
  // Use lazy initializer for initial state from localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const initial = getInitialNotifications(); // **NEW LOGIC:** If nothing is saved, populate with test data
    return initial.length > 0 ? initial : createInitialDummyNotifications();
  }); // Effect to save state to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem("app_notifications", JSON.stringify(notifications));
  }, [notifications]); // Effect to sync state when localStorage changes in another tab/window
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      // Listen for the specific key and ensure a change happened
      if (e.key === "app_notifications") {
        try {
          // If newValue is null, it means clearAll was called elsewhere
          const newNotifs = e.newValue ? JSON.parse(e.newValue) : []; // Only update if the content has changed
          if (JSON.stringify(newNotifs) !== JSON.stringify(notifications)) {
            setNotifications(newNotifs);
          }
        } catch (e) {
          console.error("Failed to sync notifications from StorageEvent", e);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler); // Include notifications to compare against the latest state
  }, [notifications]);
  const addNotification = (notif: Omit<Notification, "time" | "read">) => {
    const newNotif: Notification = {
      ...notif,
      id:
        notif.id ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAll = () => {
    // 1. Update component state
    setNotifications([]); // 2. Remove from localStorage (This guarantees all other components //    listening to the 'storage' event will see e.newValue as null //    and update their state via the useEffect handler)
    localStorage.removeItem("app_notifications");
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
