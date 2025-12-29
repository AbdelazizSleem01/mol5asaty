import { create } from 'zustand';
import { Question, Quiz, Submission } from '@/types';

interface QuizState {
  currentQuiz: Quiz | null;
  studentAnswers: number[];
  studentName: string;
  submittedQuiz: Submission | null;
  quizStartTime: Date | null;
  quizEndTime: Date | null;
  isLoading: boolean;

  setCurrentQuiz: (quiz: Quiz) => void;
  setStudentName: (name: string) => void;
  setAnswer: (questionIndex: number, answer: number) => void;
  setSubmittedQuiz: (submission: Submission) => void;
  setQuizStartTime: (time: Date) => void;
  setQuizEndTime: (time: Date) => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuiz: null,
  studentAnswers: [],
  studentName: '',
  submittedQuiz: null,
  quizStartTime: null,
  quizEndTime: null,
  isLoading: false,
  
  setCurrentQuiz: (quiz) => {
    set({ 
      currentQuiz: quiz,
      studentAnswers: new Array(quiz.questions.length).fill(-1)
    });
  },
  
  setStudentName: (name) => set({ studentName: name }),
  
  setAnswer: (questionIndex, answer) => {
    set((state) => {
      const newAnswers = [...state.studentAnswers];
      newAnswers[questionIndex] = answer;
      return { studentAnswers: newAnswers };
    });
  },

  setSubmittedQuiz: (submission) => set({ submittedQuiz: submission }),

  setQuizStartTime: (time) => set({ quizStartTime: time }),

  setQuizEndTime: (time) => set({ quizEndTime: time }),

  submitQuiz: async () => {
    const { currentQuiz, studentAnswers, studentName } = get();
    if (!currentQuiz) return;
    
    set({ isLoading: true });
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          studentName,
          answers: studentAnswers,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      set({ submittedQuiz: data.submission });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetQuiz: () => {
    set({
      currentQuiz: null,
      studentAnswers: [],
      studentName: '',
      submittedQuiz: null,
      quizStartTime: null,
      quizEndTime: null,
    });
  },
}));
