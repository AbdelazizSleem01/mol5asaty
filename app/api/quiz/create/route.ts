import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz, generateUniqueSlug } from '@/lib/database/models/Quiz';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, displayName, thumbnail, timeLimit, password, questions } = body;

        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Please login first' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const linkToken = Math.random().toString(36).substring(2) +
            Date.now().toString(36);

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 12);
        }

        const slug = await generateUniqueSlug(title);

        const quiz = await Quiz.create({
            title,
            displayName,
            slug,
            thumbnail,
            timeLimit,
            hashedPassword,
            questions,
            createdBy: userId,
            linkToken,
        });

        return NextResponse.json({
            success: true,
            quiz: {
                id: quiz._id,
                slug: quiz.slug,
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
