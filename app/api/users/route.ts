import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/database/connect';
import { User } from '@/lib/database/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    await connectToDatabase();

    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
