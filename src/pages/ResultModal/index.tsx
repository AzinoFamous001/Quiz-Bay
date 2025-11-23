// import Navbar from "../../component/Navbar";
import quizData from '../../../Server/db.json';
import type { ResultsModalType } from "./libs/Type";
function ResultsModal({ quizType, isOpen, score, totalQuestions, onClose, onRestart }: ResultsModalType) {
  if (!isOpen) return null;
 
  const quizzes = (quizData as any)["quizzes"]; // Assuming quizData import if needed
  const percentage = Math.round((score / totalQuestions) * 100);
 
  return (
    <>
      {/* <Navbar logout={onClose} /> */}
      <div className="fixed top-12 inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
 
          {/* Results Header - Matching Quiz Header Style */}
          <div className="mb-6 flex flex-col items-center text-center">
            <h2 className="text-4xl font-[BBH_Sans_Hegarty] font-bold mb-2">
              {quizzes[quizType].title} Quiz Complete!
            </h2>
            <p className="text-gray-600">{quizzes[quizType].description}</p>
          </div>
 
          {/* Score Display */}
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-xl font-bold mb-4">Your Score</h3>
            <p className="text-gray-600 mb-4">You got {score} out of {totalQuestions} correct.</p>
           
            {/* Percentage Badge */}
            <div className={`inline-block px-4 py-2 rounded-full font-bold text-white mb-4 ${
              percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {percentage}%
            </div>
 
            {/* Feedback Message */}
            <p className={`text-lg font-semibold ${
              percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentage >= 70 ? 'Excellent job!' : percentage >= 40 ? 'Good effort!' : 'Keep practicing!'}
            </p>
          </div>
 
          {/* Actions - Matching Navigation Buttons Style */}
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
        </div>
      </div>
    </>
  );
}
 
export default ResultsModal;