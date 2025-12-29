import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export default function middleware(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/quiz/') &&
    !request.nextUrl.pathname.includes('/submit');

  if (isDashboardRoute || isProtectedApiRoute) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      if (isDashboardRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
      } else {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const payload = verifyToken(token);
    if (!payload) {
      if (isDashboardRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-name', Buffer.from(payload.name || '').toString('base64'));
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/quiz/:path*'],
  runtime: 'nodejs',
}
