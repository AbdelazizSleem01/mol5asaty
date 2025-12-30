import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { User } from '@/lib/database/models/User';
import { Question } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await params;
    let quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      quiz = await Quiz.findById(slug);
    }
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
      hasPassword: !!quiz.hashedPassword,
    };

    return NextResponse.json({
      success: true,
      quiz: quizData,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    await connectToDatabase();

    const { slug } = await params;

    let quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      quiz = await Quiz.findById(slug);
    }
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

    await Quiz.findByIdAndDelete(quiz._id);

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { password } = body;

    await connectToDatabase();

    const { slug } = await params;

    let quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      quiz = await Quiz.findById(slug);
    }
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (!quiz.hashedPassword) {
      return NextResponse.json({
        success: true,
        valid: true,
      });
    }

    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'Password is required',
      }, { status: 400 });
    }

    const isValidPassword = await bcrypt.compare(password, quiz.hashedPassword);
    return NextResponse.json({
      success: true,
      valid: isValidPassword,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { title, displayName, thumbnail, timeLimit, password, questions } = body;

    const userId = request.headers.get('x-user-id');

    await connectToDatabase();

    const { slug } = await params;

    let quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      quiz = await Quiz.findById(slug);
    }
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

    let hashedPassword;
    if (password !== undefined) {
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      } else {
        hashedPassword = undefined;
      }
    }

    const updateData: Partial<{
      title: string;
      displayName: string;
      thumbnail: string;
      timeLimit: number;
      questions: Question[];
      updatedAt: Date;
      hashedPassword: string | undefined;
    }> = {
      title,
      displayName,
      thumbnail,
      timeLimit,
      questions,
      updatedAt: new Date(),
    };

    if (password !== undefined) {
      updateData.hashedPassword = hashedPassword;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quiz._id,
      updateData,
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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
