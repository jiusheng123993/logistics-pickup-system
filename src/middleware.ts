import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  const publicPaths = ['/', '/login'];
  const userPaths = ['/user', '/user/pickup', '/user/history'];
  const courierPaths = ['/courier', '/courier/inbound'];
  const adminPaths = ['/admin', '/admin/packages', '/admin/users'];

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const userRole = payload.role;

    if (userPaths.some(p => path.startsWith(p)) && !['USER', 'COURIER', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (courierPaths.some(p => path.startsWith(p)) && !['COURIER', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (adminPaths.some(p => path.startsWith(p)) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/user/:path*', '/courier/:path*', '/admin/:path*'],
};
