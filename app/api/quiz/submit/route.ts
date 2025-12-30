import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { Submission } from '@/lib/database/models/Submission';
import { Question } from '@/types';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, studentName, answers, startTime, endTime } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        userId = decoded.userId;
      }
    }

    await connectToDatabase();

    let quiz = await Quiz.findOne({ slug: quizId });
    if (!quiz) {
      quiz = await Quiz.findById(quizId);
    }
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    let score = 0;
    quiz.questions.forEach((question: Question, index: number) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    const timeSpent = startTime && endTime
      ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : null;

    const submission = await Submission.create({
      quizId: quiz._id,
      userId,
      studentName,
      answers,
      score: percentage,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      timeSpent,
    });
    
    return NextResponse.json({
      success: true,
      submission: {
        id: submission._id,
        quizId: submission.quizId,
        studentName: submission.studentName,
        answers: submission.answers,
        score: submission.score,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt,
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
