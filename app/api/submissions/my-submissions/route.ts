import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/database/connect';
import { Submission } from '@/lib/database/models/Submission';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const submissions = await Submission.find({
      $or: [
        { userId: decoded.userId },
        {
          userId: { $exists: false },
          studentName: decoded.name
        }
      ]
    })
      .populate({
        path: 'quizId',
        select: 'title questions createdAt timeLimit'
      })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      submissions: submissions
        .filter(sub => sub.quizId) 
        .map(sub => ({
          id: sub._id.toString(),
          quizId: sub.quizId._id.toString(),
          studentName: sub.studentName,
          answers: sub.answers,
          score: sub.score,
          timeSpent: sub.timeSpent,
          submittedAt: sub.submittedAt,
          quiz: {
            title: sub.quizId.title,
            questionsCount: sub.quizId.questions?.length || 0,
            questions: sub.quizId.questions,
            createdAt: sub.quizId.createdAt,
            timeLimit: sub.quizId.timeLimit
          }
        }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
