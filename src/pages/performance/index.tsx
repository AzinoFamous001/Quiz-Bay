// src/pages/QuizResultsDashboard.tsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Trophy, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from 'react-router';
interface QuizResult {
  id: string;
  quizType: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  timeTaken: string;
}

type PerformanceItem = {
  name: string;
  value: number;
  color: string;
};

export default function QuizPerformanceDashboard() {
  const [results, setResults] = useState<QuizResult[]>([]);
    const navigate = useNavigate();
  useEffect(() => {
    const saved = localStorage.getItem("quizResults");
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);
  // Aggregate data by quiz type
  const statsByQuiz = results.reduce((acc, result) => {
    if (!acc[result.quizType]) {
      acc[result.quizType] = {
        title: result.quizTitle,
        attempts: 0,
        totalScore: 0,
        best: 0,
        avg: 0,
      };
    }
    acc[result.quizType].attempts += 1;
    acc[result.quizType].totalScore += result.percentage;
    acc[result.quizType].best = Math.max(acc[result.quizType].best, result.percentage);
    return acc;
  }, {} as Record<string, { title: string; attempts: number; totalScore: number; best: number; avg: number }>);
  Object.keys(statsByQuiz).forEach(key => {
    statsByQuiz[key].avg = Math.round(statsByQuiz[key].totalScore / statsByQuiz[key].attempts);
  });
  // Prepare data for Pie Chart (overall performance distribution)
  const performanceData = [
    { name: "Excellent (80%+)", value: results.filter(r => r.percentage >= 80).length, color: "#10B981" },
    { name: "Good (60-79%)", value: results.filter(r => r.percentage >= 60 && r.percentage < 80).length, color: "#3B82F6" },
    { name: "Average (40-59%)", value: results.filter(r => r.percentage >= 40 && r.percentage < 60).length, color: "#F59E0B" },
    { name: "Needs Practice (<40%)", value: results.filter(r => r.percentage < 40).length, color: "#EF4444" },
  ].filter(item => item.value > 0);
  // Prepare data for Bar Chart (best score per quiz)
  const barData = Object.values(statsByQuiz).map(value => ({
    name: value.title,
    best: value.best,
    avg: value.avg,
  }));
  const totalQuizzesTaken = results.length;
  const averageScore = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0;
  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center p-8">
        <div className="text-center text-white">
          <Trophy size={80} className="mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold mb-4">No Quiz Results Yet</h1>
          <p className="text-xl text-gray-300">Complete your first quiz to see your progress!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <span>
        <h1 className="text-5xl font-bold text-white text-center mb-2">Quiz Performance</h1>
        <p className="text-center text-gray-300 text-lg">Track your progress and improve over time</p>
          </span>
           <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-lg font-medium"
            >
              Back to Dashboard
            </button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white">{totalQuizzesTaken}</p>
            <p className="text-gray-300">Quizzes Taken</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white">{averageScore}%</p>
            <p className="text-gray-300">Average Score</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mx-auto mb-3 flex items-center justify-center text-white font-bold">
              ★
            </div>
            <p className="text-3xl font-bold text-white">{bestScore}%</p>
            <p className="text-gray-300">Best Score</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <Clock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white">
              {results.reduce((a, b) => {
                const [m, s] = b.timeTaken.split(":").map(Number);
                return a + m * 60 + s;
              }, 0)}s
            </p>
            <p className="text-gray-300">Total Time</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart - Performance Distribution */}
         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
  <h2 className="text-2xl font-bold text-white mb-6 text-center">Performance Overview</h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={performanceData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={(props) => `${props.name ?? "Unknown"}: ${props.value ?? 0}`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {performanceData.map((entry: PerformanceItem, index: number) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => `${value} quiz${value > 1 ? "zes" : ""}`} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

          {/* Bar Chart - Best & Average per Quiz */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Best vs Average Score</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
                <XAxis dataKey="name" stroke="#fff" angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#fff" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="best" fill="#10B981" name="Best Score" />
                <Bar dataKey="avg" fill="#3B82F6" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Quiz History Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Quiz History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 text-gray-300">Quiz</th>
                  <th className="py-3 text-gray-300">Date</th>
                  <th className="py-3 text-gray-300">Score</th>
                  <th className="py-3 text-gray-300">Time</th>
                  <th className="py-3 text-gray-300">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.slice().reverse().map((result) => (
                  <tr key={result.id} className="border-b border-white/10">
                    <td className="py-4 text-white font-medium">{result.quizTitle}</td>
                    <td className="py-4 text-gray-300">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-white">
                      {result.score}/{result.totalQuestions} ({result.percentage}%)
                    </td>
                    <td className="py-4 text-gray-300">{result.timeTaken}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.percentage >= 70 ? "bg-green-500/20 text-green-300" :
                        result.percentage >= 50 ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-red-500/20 text-red-300"
                      }`}>
                        {result.percentage >= 70 ? "Excellent" : result.percentage >= 50 ? "Good" : "Needs Practice"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
