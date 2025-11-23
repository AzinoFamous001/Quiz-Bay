// src/Routes/Route.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import Signup from "../pages/Auth/Signup";
import Login from "../pages/Auth/Login";
import Profile from "../pages/Profile";
import Settings from "../pages/Settingspage";
import Navbar from "../component/Navbar";
import QuizPerformanceDashboard from "../pages/performance";
import NotificationsPage from "../pages/Notificationpage/Notification";
import QuizDashboard from "../pages/Home/Dashboard";

// ───────────────────────────── Auth Context ─────────────────────────────
type AuthContextType = {
  user: any | null;
  login: (userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(undefined); // undefined = loading

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      setUser(null);
      return;
    }

    fetch(`http://localhost:3000/users?id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.[0]) setUser(data[0]);
        else {
          localStorage.removeItem("currentUserId");
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("currentUserId");
        setUser(null);
      });
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem("currentUserId", String(userData.id));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUserId");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ───────────────────────────── Protected Route ─────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/Backdrop.jpg')] bg-cover">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// ───────────────────────────── Dashboard Layout ─────────────────────────────
const DashboardLayout = () => {
  const { logout } = useAuth();

  return (
    <>
      <Navbar logout={logout} />
      <Routes>
        <Route index element={<QuizDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="performance" element={<QuizPerformanceDashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Routes>
    </>
  );
};

// ───────────────────────────── Main Router ─────────────────────────────
export const AppRouter = () => {
  return (
    <Router>
      <AuthProvider> {/* ← Wraps the ENTIRE app, only once */}
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};