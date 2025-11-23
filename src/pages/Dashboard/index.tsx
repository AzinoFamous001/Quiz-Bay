import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Globe, Code, Palette, Zap, Layout, Terminal } from "lucide-react";
import quizzes from "../../../Server/db.json";
import QuizModal from "../QuizPage/quizModal";
import { useAuth } from "../../Routes/Route";
const QuizDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<keyof typeof quizzes["quizzes"] | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; id: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const quizCategories = quizzes.quizzes || quizzes;
  const topics = Object.entries(quizCategories).map(([key, value]) => ({
    ...value,
    id: key,
  }));
  const iconMap: Record<string, any> = {
    Globe,
    Code2: Code,
    Palette,
    Zap,
    Layout,
    Terminal,
  };
  const getIconComponent = (iconName?: string | null) => {
    const Icon = iconName ? iconMap[iconName] : null;
    return Icon ? <Icon size={40} strokeWidth={1.5} /> : null;
  };
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:3000/users?id=${userId}`)
      .then((res) => res.json())
      .then((users) => {
        if (users?.[0]) {
          setCurrentUser({ name: users[0].name, id: users[0].id });
        } else {
          localStorage.removeItem("currentUserId");
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("currentUserId");
        navigate("/login");
      });
  }, [navigate]);
  const handleStartQuiz = (quizType: keyof typeof quizCategories) => {
    setSelectedQuizType(quizType);
    setIsOpen(true);
  };
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/Backdrop.jpg')] bg-center bg-cover">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }
  return (
    <main className="min-h-screen pb-8 bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat overflow-x-hidden">
      {/* Welcome Section */}
      <div className="ml-8 mt-8 flex items-center gap-3">
        <div className="w-[80px] h-[80px] rounded-full bg-gray-300 overflow-hidden border-4 border-white shadow-lg">
          <img src="/profilepics.jpeg" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <p className="text-white text-3xl font-bold">Welcome, {currentUser.name}!</p>
      </div>
      {!isOpen && (
        <div className="max-w-6xl mt-8 mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-4">Quiz Dashboard</h1>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Choose a topic to test your knowledge
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleStartQuiz(topic.id as keyof typeof quizCategories)}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 h-full">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(to bottom right, ${topic.color})` }}
                  >
                    <div className="text-white">{getIconComponent(topic.icon)}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{topic.title}</h3>
                  <p className="text-gray-300 text-sm">{topic.description}</p>
                  <div className="mt-4 flex items-center text-white/70 text-sm group-hover:text-white transition-colors">
                    <span>Start Quiz</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedQuizType && (
        <QuizModal
          quizType={selectedQuizType}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedQuizType(null);
          }}
        />
      )}
    </main>
  );
};
export default QuizDashboard;
