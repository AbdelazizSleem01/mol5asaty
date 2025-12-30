import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import { Quiz } from '@/lib/database/models/Quiz';
import { Submission } from '@/lib/database/models/Submission';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');
    const decodedUserName = userName ? Buffer.from(userName, 'base64').toString('utf-8') : 'Unknown';

    await connectToDatabase();
    
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
          creatorName: decodedUserName,
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
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
