// src/pages/Settings.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, Globe, Shield, Trash2, LogOut, User, Volume2, Save, Clock } from "lucide-react"; 
import { useAuth } from "../../Routes/Route";
import type { DataType } from "../Auth/lib/type";
import USERS from "../../../Server/db.json";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<DataType | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [notifications, setNotifications] = useState(true);
  const [timerVisible, setTimerVisible] = useState(true); 
  const [sound, setSound] = useState(true);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const foundUser = USERS.users.find((user: DataType) => user.id === userId);
    if (foundUser) {
      setCurrentUser(foundUser);
      setDisplayName(foundUser.name ?? '');
    } else {
      localStorage.removeItem("currentUserId");
      navigate("/login"); 
      return;
    }

    const savedSettings = localStorage.getItem(`settings_${userId}`);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        setTimerVisible(settings.timerVisible ?? true); 
        setSound(settings.sound ?? true);
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
    
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      const settingsToSave = {
        notifications,
        timerVisible, 
        sound,
      };
      localStorage.setItem(`settings_${currentUser.id}`, JSON.stringify(settingsToSave));
    }
  }, [notifications, timerVisible, sound, currentUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all quiz results? This cannot be undone.")) {
      localStorage.removeItem("quizResults");
      alert("All quiz data cleared!");
    }
  };

  const handleSaveName = () => {
    if (displayName.trim().length > 2) {
        alert(`Username updated to: ${displayName} (Local state only)`);
        setIsEditingName(false);
    } else {
        alert("Username must be at least 3 characters long.");
    }
  };

  if (isLoading || !currentUser) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-white text-xl">Loading user data...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat overflow-x-hidden">
      {/* Only added pt-24 + px-4 for mobile safety */}
      <div className="max-w-4xl mx-auto px-4 pt-24">
        <h1 className="text-5xl font-bold text-white text-center mb-12">Settings</h1>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <User className="w-7 h-7" />
              Account
            </h2>
            <div className="space-y-4">
              {/* Change Username */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-white/10 gap-4">
                <div className="mb-2 sm:mb-0">
                  <p className="text-white font-medium">Username</p>
                  <p className="text-gray-300 text-sm">Update your display name</p>
                </div>
                
                {isEditingName ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="p-2 rounded-lg text-gray-900 bg-white border border-gray-300 w-full sm:w-40"
                        />
                        <button 
                            onClick={handleSaveName}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => { setDisplayName(currentUser.name ?? ''); setIsEditingName(false); }}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-white font-semibold">{displayName}</span>
                        <button 
                            onClick={() => setIsEditingName(true)}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                            Edit
                        </button>
                    </div>
                )}
              </div>
              
              {/* Email Address */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-white/10 gap-4">
                <div>
                  <p className="text-white font-medium">Email Address</p>
                  <p className="text-gray-300 text-sm">Used for login & notifications</p>
                </div>
                <span className="text-gray-300 font-mono break-all text-right sm:text-left">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Globe className="w-7 h-7" />
              Preferences
            </h2>
            <div className="space-y-5">
              
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-300 text-sm">Get reminders and streak alerts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 appearance-none bg-gray-200 checked:bg-blue-600 checked:border-transparent transition duration-200 ease-in-out border border-gray-300 cursor-pointer"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <Volume2 className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Sound Effects</p>
                    <p className="text-gray-300 text-sm">Play sounds during quiz</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="w-6 h-6 text-green-600 rounded focus:ring-green-500 appearance-none bg-gray-200 checked:bg-green-600 checked:border-transparent transition duration-200 ease-in-out border border-gray-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-indigo-400" /> 
                  <div>
                    <p className="text-white font-medium">Quiz Timer Visibility</p>
                    <p className="text-gray-300 text-sm">Hide the countdown timer during timed quizzes</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={timerVisible}
                  onChange={(e) => setTimerVisible(e.target.checked)}
                  className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500 appearance-none bg-gray-200 checked:bg-indigo-600 checked:border-transparent transition duration-200 ease-in-out border border-gray-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7" />
              Privacy & Data
            </h2>
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-4 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition text-left"
            >
              <div className="flex items-center gap-4">
                <Trash2 className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-white font-medium">Clear Quiz History</p>
                  <p className="text-gray-300 text-sm">Remove all saved results permanently</p>
                </div>
              </div>
            </button>
          </div>

          {/* Logout */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-lg"
            >
              <LogOut className="w-6 h-6" />
              Logout
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-lg font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;