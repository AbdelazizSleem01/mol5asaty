import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { User } from '@/lib/database/models/User';
import { Submission } from '@/lib/database/models/Submission';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const quizzes = await Quiz.find({ createdBy: userId }).sort({ createdAt: -1 });

    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissions = await Submission.find({ quizId: quiz._id });

        const submissionsCount = submissions.length;
        const averageScore = submissions.length > 0
          ? Math.round(submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length)
          : null;

        return {
          id: quiz._id,
          slug: quiz.slug,
          title: quiz.title,
          displayName: quiz.displayName,
          thumbnail: quiz.thumbnail,
          creatorName: user.name,
          questions: quiz.questions,
          linkToken: quiz.linkToken,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
          timeLimit: quiz.timeLimit,
          submissionsCount,
          averageScore,
        };
      })
    );

    return NextResponse.json({
      success: true,
      quizzes: quizzesWithStats,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get user quizzes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const { quizId } = await request.json();

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedQuiz = await Quiz.findOneAndDelete({
      _id: quizId,
      createdBy: userId,
    });

    if (!deletedQuiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found or access denied' },
        { status: 404 }
      );
    }

    await Submission.deleteMany({ quizId });

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Delete user quiz error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
