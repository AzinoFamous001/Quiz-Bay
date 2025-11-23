// src/pages/Profile.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Trophy, Award, Target, Calendar, Star, BookOpen, Clock, Medal,
  Zap, Flame, Brain, Timer, Lock
} from 'lucide-react';
import type { QuizResult } from '../QuizPage/libs/Types';

interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: any;
  earned: boolean;
  coming?: boolean;
}

const STREAK_KEY = 'quiz_streak_data';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; id: string } | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  const [currentStreak, setCurrentStreak] = useState(() => {
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      return saved ? JSON.parse(saved).streak : 0;
    } catch {
      return 0;
    }
  });

  const navigate = useNavigate();

  const calculateAndSaveStreak = useCallback((quizResults: QuizResult[]): number => {
    if (quizResults.length === 0) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: 0, lastCheckDate: new Date().toISOString().split('T')[0] }));
      return 0;
    }

    const quizDates = new Set<string>();
    quizResults.forEach(r => {
      const date = new Date(r.date);
      date.setHours(0, 0, 0, 0);
      quizDates.add(date.toISOString().split('T')[0]);
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);

    const todayStr = currentDate.toISOString().split('T')[0];
    if (quizDates.has(todayStr)) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (quizDates.has(yesterdayStr)) {
        streak = 1;
        currentDate = yesterday;
      } else {
        localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: 0, lastCheckDate: todayStr }));
        return 0;
      }
    }

    while (true) {
      const previousDay = new Date(currentDate);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStr = previousDay.toISOString().split('T')[0];
      if (quizDates.has(previousDayStr)) {
        streak++;
        currentDate = previousDay;
      } else {
        break;
      }
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify({ streak, lastCheckDate: todayStr }));
    return streak;
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:3000/users?id=${userId}`)
      .then(res => res.json())
      .then(users => {
        if (users[0]) setCurrentUser(users[0]);
        else {
          localStorage.removeItem('currentUserId');
          navigate('/login');
        }
      });

    const saved = localStorage.getItem('quizResults');
    if (saved) {
      try {
        const allResults: QuizResult[] = JSON.parse(saved);
        const sortedResults = allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setResults(sortedResults);
      } catch (e) {
        console.error("Failed to parse quizResults");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const newStreak = calculateAndSaveStreak(results);
    setCurrentStreak(newStreak);
  }, [results, calculateAndSaveStreak]);

  const streak = currentStreak;

  const stats = {
    quizzesTaken: results.length,
    totalPoints: results.reduce((sum, r) => sum + r.score * 10, 0),
    correctAnswers: results.reduce((sum, r) => sum + r.score, 0),
    averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0,
    streak,
    rank: results.length >= 50 ? 'Diamond' :
          results.length >= 30 ? 'Platinum' :
          results.length >= 20 ? 'Gold' :
          results.length >= 10 ? 'Silver' : 'Bronze',
  };

  const categoryStats = results.reduce((acc, result) => {
    const title = result.quizTitle || "Unknown Quiz";
    if (!acc[title]) acc[title] = { name: title, quizzes: 0, totalPercentage: 0 };
    acc[title].quizzes += 1;
    acc[title].totalPercentage += result.percentage;
    return acc;
  }, {} as Record<string, { name: string; quizzes: number; totalPercentage: number }>);

  const categories = Object.values(categoryStats)
    .map(cat => ({
      name: cat.name,
      quizzes: cat.quizzes,
      avgScore: Math.round(cat.totalPercentage / cat.quizzes),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const categoryColors: Record<string, string> = {
    "Web Development": "from-blue-500 to-cyan-500",
    "HTML": "from-orange-500 to-red-600",
    "CSS": "from-blue-400 to-indigo-600",
    "JavaScript": "from-yellow-400 to-amber-600",
    "React": "from-cyan-400 to-sky-600",
    "Node.js": "from-green-500 to-emerald-600",
    "Rust": "from-orange-600 to-red-700",
    "Python": "from-blue-400 to-blue-700",
  };

  const achievements: Achievement[] = [
    { id: 1, title: "First Quiz", desc: "Complete your first quiz", icon: Trophy, earned: results.length >= 1, coming: false },
    { id: 2, title: "Perfect Score", desc: "Get 100% on any quiz", icon: Award, earned: results.some(r => r.percentage === 100), coming: false },
    { id: 3, title: "Quick Learner", desc: "Complete 10 quizzes", icon: Brain, earned: results.length >= 10, coming: false },
    { id: 4, title: "Speed Demon", desc: "Finish a quiz in under 3 minutes", icon: Timer, earned: results.some(r => r.timeTaken && parseInt(r.timeTaken.split(':')[0]) < 3), coming: false },
    { id: 5, title: "Consistency King", desc: "7-day streak", icon: Flame, earned: streak >= 7, coming: false },
    { id: 6, title: "Master", desc: "Average score above 90%", icon: Medal, earned: stats.averageScore >= 90, coming: false },
    { id: 7, title: "Quiz Marathon", desc: "Complete 50 quizzes", icon: Zap, earned: results.length >= 50, coming: true },
    { id: 8, title: "Perfectionist", desc: "5 perfect scores", icon: Star, earned: results.filter(r => r.percentage === 100).length >= 5, coming: true },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/Backdrop.jpg')] bg-cover">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat overflow-x-hidden">
      {/* Only added safe top padding for mobile navbar */}
      <div className="max-w-6xl mx-auto px-4 pt-24 sm:pt-28 lg:pt-8">
        
        {/* Profile Header - unchanged layout, only safe flex on mobile */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                  <img src="/profilepics.jpeg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-3 border-4 border-white">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{currentUser.name}</h1>
              <p className="text-gray-200 text-base sm:text-lg">{currentUser.email}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 justify-center md:justify-start">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2 rounded-full text-white font-bold text-sm sm:text-base">
                  {stats.rank} Rank
                </span>
                <span className="bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 rounded-full text-white font-bold flex items-center gap-2 shadow-lg text-sm sm:text-base">
                  <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${streak > 0 ? 'animate-pulse' : ''}`} />
                  {streak} Day{streak !== 1 ? 's' : ''} Streak
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-base sm:text-lg font-medium mt-4 md:mt-0"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Grid - only changed to 2 cols on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: BookOpen, label: "Quizzes Taken", value: stats.quizzesTaken, color: "blue" },
            { icon: Target, label: "Average Score", value: `${stats.averageScore}%`, color: "purple" },
            { icon: Star, label: "Total Points", value: stats.totalPoints, color: "yellow" },
            { icon: Award, label: "Correct Answers", value: stats.correctAnswers, color: "green" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 text-center hover:bg-white/15 transition">
              <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-${stat.color}-400`} />
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-300 text-xs sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs - unchanged */}
        <div className="flex gap-3 sm:gap-4 mb-6 bg-white/10 backdrop-blur-lg rounded-xl p-2">
          {(['overview', 'achievements', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg font-semibold capitalize transition text-sm sm:text-base ${
                activeTab === tab ? 'bg-white text-black' : 'text-white hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Category */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Medal className="w-6 h-6 text-yellow-400" />
                Performance by Category
              </h3>
              {categories.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No quizzes completed yet. Start learning!</p>
              ) : (
                <div className="space-y-6">
                  {categories.map((cat, idx) => {
                    const gradient = categoryColors[cat.name] || "from-purple-500 to-pink-500";
                    return (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-200 font-medium">{cat.name}</span>
                          <span className="text-white font-bold">{cat.avgScore}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out group-hover:scale-x-105 origin-left`}
                            style={{ width: `${cat.avgScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{cat.quizzes} quiz{cat.quizzes > 1 ? 'zes' : ''} completed</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Account Details</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="font-semibold">November 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Rank</p>
                    <p className="font-semibold">{stats.rank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="font-semibold text-orange-400">{streak} day{streak !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Achievements</p>
                    <p className="font-semibold">
                      {achievements.filter(a => a.earned).length} / {achievements.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab - only grid adjustment */}
        {activeTab === 'achievements' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                      ach.earned
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20'
                        : ach.coming
                        ? 'bg-white/5 border-white/10 opacity-60'
                        : 'bg-white/5 border-white/20 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl ${ach.earned ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">{ach.title}</h4>
                        <p className="text-sm text-gray-300">{ach.desc}</p>
                        {ach.coming && (
                          <div className="flex items-center gap-2 mt-3 text-purple-300 text-xs font-medium">
                            <Lock className="w-4 h-4" />
                            <span>Coming Soon</span>
                          </div>
                        )}
                        {ach.earned && (
                          <div className="mt-3 text-green-400 text-sm font-bold flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Unlocked!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Tab - only added overflow-x-auto */}
        {activeTab === 'activity' && (
          <div className="space-y-4 overflow-x-auto">
            {results.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                <p className="text-gray-300 text-xl">No quiz results yet. Start taking quizzes!</p>
              </div>
            ) : (
              results.map(result => (
                <div key={result.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/15 transition min-w-[500px]">
                  <div className="flex items-center gap-4 sm:gap-6 w-full">
                    <div className="bg-blue-500/20 p-4 rounded-xl flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{result.quizTitle}</h3>
                      <div className="flex flex-wrap gap-4 text-gray-300 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                        {result.timeTaken && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {result.timeTaken}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold px-6 py-3 rounded-xl mt-4 sm:mt-0 ${
                    result.percentage >= 70 ? 'bg-green-500/20 text-green-300' :
                    result.percentage >= 40 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {result.percentage}%
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;