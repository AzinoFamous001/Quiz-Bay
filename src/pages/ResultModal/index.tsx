// src/components/QuizPage/ResultsModal.tsx
import quizData from '../../../Server/db.json';
import type { ResultsModalType } from "./libs/Type";

function ResultsModal({ quizType, isOpen, score, totalQuestions, onClose, onRestart }: ResultsModalType) {
  if (!isOpen) return null;

  const quizzes = (quizData as any)["quizzes"];
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <>
      {/* ONLY ONE LINE CHANGED: pt-20 → pt-14 (and added mt-4 for perfect spacing) */}
      <div className="min-h-screen pt-14 px-4 pb-32 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto relative mt-4">
          {/* Close button — your original */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>

          {/* ↓↓↓ EVERYTHING BELOW IS 100% YOUR ORIGINAL CODE — UNTOUCHED ↓↓↓ */}
          <div className="mb-6 flex flex-col items-center text-center">
            <h2 className="text-4xl font-[BBH_Sans_Hegarty] font-bold mb-2">
              {quizzes[quizType].title} Quiz Complete!
            </h2>
            <p className="text-gray-600">{quizzes[quizType].description}</p>
          </div>

          <div className="flex flex-col items-center mb-6">
            <h3 className="text-xl font-bold mb-4">Your Score</h3>
            <p className="text-gray-600 mb-4">You got {score} out of {totalQuestions} correct.</p>
            
            <div className={`inline-block px-4 py-2 rounded-full font-bold text-white mb-4 ${
              percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {percentage}%
            </div>

            <p className={`text-lg font-semibold ${
              percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentage >= 70 ? 'Excellent job!' : percentage >= 40 ? 'Good effort!' : 'Keep practicing!'}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            {onRestart && (
              <button
                onClick={onRestart}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Restart Quiz
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
          {/* ↑↑↑ END OF YOUR ORIGINAL CODE ↑↑↑ */}
        </div>
      </div>
    </>
  );
}

export default ResultsModal;