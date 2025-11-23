interface ResultsModalType {
  quizType: keyof any; // Match QuizData if typed
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  onClose: () => void;
  onRestart?: () => void;
}

export type { ResultsModalType };
