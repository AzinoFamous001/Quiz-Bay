// src/components/QuizPage/QuizModal.tsx
import { useState, useEffect, useCallback } from "react";
import quizData from "../../../Server/db.json";
import type { QuizModalProps, QuizResult } from "./libs/Types";
import { generateAnswerWithGemini } from "../../libs/gemini";



const QUIZ_DURATION_SECONDS = 300;

function QuizModal({ quizType, isOpen, onClose }: QuizModalProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  if (!isOpen) return null;

  const quiz = (quizData as any).quizzes[quizType] as {
    title: string;
    description: string;
    questions: Array<{
      question: string;
      answers: Array<{ text: string; correct: boolean }>;
    }>;
  };

  if (!quiz || !quiz.questions) {
    return null;
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[current];

  useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(id);
    }
    if (timeLeft === 0 && !showResults) {
      finishQuiz();
      alert("Time's up!");
    }
  }, [timeLeft, showResults]);

  const solveWithGemini = async () => {
    if (isLoadingGemini || selectedAnswer) return;
    setIsLoadingGemini(true);
    const options = currentQuestion.answers.map(a => a.text);
    const geminiAnswer = await generateAnswerWithGemini(currentQuestion.question, options);
    if (geminiAnswer) handleAnswerSelect(geminiAnswer);
    else alert("Gemini couldn't solve this one");
    setIsLoadingGemini(false);
  };

  const handleAnswerSelect = (answerText: string) => {
    setSelectedAnswer(answerText);
    setAnswers(prev => ({ ...prev, [current]: answerText }));
  };

  const handleNext = () => {
    if (current < totalQuestions - 1) {
      setCurrent(current + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const handleSkip = () => {
    setAnswers(prev => ({ ...prev, [current]: "" }));
    handleNext();
  };

  const finishQuiz = useCallback(() => {
    if (showResults) return;

    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      const correctAnswer = q.answers.find(a => a.correct)?.text;
      if (userAnswer && userAnswer === correctAnswer) correct++;
    });

    const percent = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(timeTakenSeconds / 60);
    const secs = timeTakenSeconds % 60;
    const timeTaken = `${mins}:${secs.toString().padStart(2, "0")}`;

    const result: QuizResult = {
      id: Date.now().toString(),
      quizType,
      quizTitle: quiz.title,
      score: correct,
      totalQuestions,
      percentage: percent,
      date: new Date().toISOString(),
      timeTaken,
    };

    const saved = JSON.parse(localStorage.getItem("quizResults") || "[]");
    saved.push(result);
    localStorage.setItem("quizResults", JSON.stringify(saved));

    setScore(correct);
    setPercentage(percent);
    setShowResults(true);
  }, [answers, questions, quiz.title, quizType, totalQuestions, startTime, showResults]);

  useEffect(() => {
    setSelectedAnswer(answers[current] || null);
  }, [current, answers]);

  const handleRestart = () => {
    setCurrent(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResults(false);
    setScore(0);
    setPercentage(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // RESULTS SCREEN — Your original style
  if (showResults) {
    return (
      <div className="min-h-screen pt-14 px-4 pb-32 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your score: {score} / {totalQuestions}
            </p>
            <div className={`inline-block px-4 py-2 rounded-full font-bold text-white mb-6 ${
              percentage >= 70 ? "bg-green-500" :
              percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
            }`}>
              {percentage}%
            </div>
            <p className={`text-lg font-semibold ${
              percentage >= 70 ? "text-green-600" :
              percentage >= 40 ? "text-yellow-600" : "text-red-600"
            }`}>
              {percentage >= 70 ? "Excellent!" :
               percentage >= 40 ? "Good job!" : "Keep practicing!"}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={handleRestart} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Restart Quiz
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN QUIZ SCREEN — Your exact original UI, now perfectly positioned
  return (
    <div className="min-h-screen pt-14 px-4 pb-32  backdrop-blur-sm flex items-start justify-center">
      <div className="bg-white p-6 rounded-xl shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto relative mt-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">
          ×
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <h2 className="text-4xl font-[BBH_Sans_Hegarty] font-bold mb-2">
            {quiz.title} Quiz
          </h2>
          <p className="text-gray-600">{quiz.description}</p>
        </div>

        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-bold">
            Q{current + 1}/{totalQuestions}
          </h3>

          <div className="flex items-center gap-4">
            <div className={`text-xl font-bold px-4 py-2 rounded-md ${timeLeft <= 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={solveWithGemini}
              disabled={isLoadingGemini || !!selectedAnswer}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isLoadingGemini || selectedAnswer
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {isLoadingGemini ? "Thinking..." : "Solve with AI"}
            </button>
          </div>

          <button onClick={handleSkip} className="text-blue-600 underline hover:text-blue-800">
            Skip
          </button>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">{currentQuestion.question}</h4>

          {currentQuestion.answers.map((a, i) => {
            const isSelected = selectedAnswer === a.text;
            let buttonClass = "block min-w-full px-3 py-3 mb-2 text-left rounded-lg border transition-all";
            if (isSelected) {
              buttonClass += " bg-blue-500 text-white border-blue-500 shadow-md";
            } else {
              buttonClass += " border-gray-300 hover:bg-blue-50 cursor-pointer";
            }
            if (selectedAnswer) buttonClass += " cursor-not-allowed";

            return (
              <button
                key={i}
                onClick={() => handleAnswerSelect(a.text)}
                disabled={!!selectedAnswer}
                className={buttonClass}
              >
                {a.text}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {current === totalQuestions - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizModal;