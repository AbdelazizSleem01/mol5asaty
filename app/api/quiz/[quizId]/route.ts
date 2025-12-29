import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { User } from '@/lib/database/models/User';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    await connectToDatabase();

    const { quizId } = await params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const creator = await User.findById(quiz.createdBy).select('name');

    const quizData = {
      id: quiz._id,
      title: quiz.title,
      displayName: quiz.displayName,
      thumbnail: quiz.thumbnail,
      creatorName: creator?.name || 'Unknown',
      questions: quiz.questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      timeLimit: quiz.timeLimit,
    };

    return NextResponse.json({
      success: true,
      quiz: quizData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

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

    await Quiz.findByIdAndDelete(quizId);

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const body = await request.json();
    const { title, displayName, thumbnail, timeLimit, questions } = body;

    const userId = request.headers.get('x-user-id');

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

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        title,
        displayName,
        thumbnail,
        timeLimit,
        questions,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      quiz: {
        id: updatedQuiz._id,
        title: updatedQuiz.title,
        displayName: updatedQuiz.displayName,
        thumbnail: updatedQuiz.thumbnail,
        timeLimit: updatedQuiz.timeLimit,
        questions: updatedQuiz.questions,
        createdAt: updatedQuiz.createdAt,
        updatedAt: updatedQuiz.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
