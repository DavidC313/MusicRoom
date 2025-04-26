import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/';
  const isRegisterPage = pathname === '/register';
  const isMusicRoomPage = pathname === '/music-room';
  const isProfilePage = pathname === '/profile';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  // If user is not authenticated and trying to access protected routes
  if (!token && (isMusicRoomPage || isProfilePage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated and trying to access auth pages
  if (token && (isAuthPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/music-room', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/register', '/music-room', '/profile']
}; 