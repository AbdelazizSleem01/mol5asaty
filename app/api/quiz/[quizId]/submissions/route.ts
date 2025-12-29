import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import { Submission } from '@/lib/database/models/Submission';
import { Quiz } from '@/lib/database/models/Quiz';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();

    const { quizId } = await params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (quiz.createdBy.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const totalSubmissions = await Submission.countDocuments({ quizId: quizId });
    const submissions = await Submission.find({ quizId: quizId })
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalSubmissions / limit);

    return NextResponse.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub._id,
        studentName: sub.studentName,
        score: sub.score,
        submittedAt: sub.submittedAt,
        answers: sub.answers,
        timeSpent: sub.timeSpent,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalSubmissions,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
