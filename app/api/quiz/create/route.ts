import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, displayName, thumbnail, timeLimit, questions } = body;

        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');

        await connectToDatabase();

        const linkToken = Math.random().toString(36).substring(2) +
            Date.now().toString(36);

        const quiz = await Quiz.create({
            title,
            displayName,
            thumbnail,
            timeLimit,
            questions,
            createdBy: userId,
            linkToken,
        });

        return NextResponse.json({
            success: true,
            quiz: {
                id: quiz._id,
                title: quiz.title,
                displayName: quiz.displayName,
                thumbnail: quiz.thumbnail,
                timeLimit: quiz.timeLimit,
                questions: quiz.questions,
                linkToken: quiz.linkToken,
                createdAt: quiz.createdAt,
            },
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
