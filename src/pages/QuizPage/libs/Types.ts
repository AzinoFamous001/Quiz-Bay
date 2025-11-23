// src/QuizPage/libs/Types.ts
export interface AnswerType {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: AnswerType[];
}

export interface QuizCategory {
  id: string;
  title: string;
  icon?: string;
  description: string;
  color: string;
  questions: QuizQuestion[];
}

export interface QuizData {
  quizzes: Record<string, QuizCategory>;
}

export type QuizType = keyof QuizData["quizzes"];

export interface QuizResult {
  id: string;
  quizType: QuizType;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  timeTaken: string;
}

export interface QuizModalProps {
  quizType: QuizType;
  isOpen: boolean;
  onClose: () => void;
}
