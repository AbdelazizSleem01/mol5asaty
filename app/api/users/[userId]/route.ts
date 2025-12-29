import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/database/connect';
import { User } from '@/lib/database/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
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

    const { userId } = await params;
    const { action, newRole } = await request.json();

    await connectToDatabase();

    if (action === 'changeRole') {
      if (!['admin', 'teacher', 'student'].includes(newRole)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        );
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User role updated successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }

    if (action === 'resetPassword') {
      const hashedPassword = await bcrypt.hash('123456789', 12);

      const user = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully to 123456789'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
  
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

    const { userId } = await params;

    if (payload.userId === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
