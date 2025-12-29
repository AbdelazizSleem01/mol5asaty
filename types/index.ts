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
  displayName?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
