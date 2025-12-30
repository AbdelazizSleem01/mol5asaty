export interface Question {
  id: string;
  questionText: string;
  choices: string[];
  correctAnswer: number;
}

export interface Quiz {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  displayName?: string;
  slug?: string;
  thumbnail?: string;
  creatorName?: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  timeLimit?: number;
  linkToken: string;
  submissionsCount?: number;
  averageScore?: number;
  hasPassword?: boolean;
}

export interface Submission {
  _id?: string;
  id: string;
  quizId: string;
  studentName: string;
  answers?: number[];
  score: number;
  timeSpent?: number;
  submittedAt: Date;
}

export interface SubmissionWithQuiz extends Submission {
  quiz: {
    title: string;
    questionsCount: number;
    questions?: Question[];
    createdAt: Date;
    timeLimit?: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
