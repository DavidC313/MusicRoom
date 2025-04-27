import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing request for path:', pathname);

  const isAuthPage = pathname === '/';
  const isRegisterPage = pathname === '/register';
  const isMusicRoomPage = pathname === '/music-room';
  const isProfilePage = pathname === '/profile';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;
  console.log('Token in cookies:', token ? 'Present' : 'Missing');

  // If user is not authenticated and trying to access protected routes
  if (!token && (isMusicRoomPage || isProfilePage)) {
    console.log('Unauthenticated access attempt to protected route:', pathname);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated and trying to access auth pages
  if (token && (isAuthPage || isRegisterPage)) {
    console.log('Authenticated user attempting to access auth page:', pathname);
    return NextResponse.redirect(new URL('/music-room', request.url));
  }

  console.log('Request allowed to proceed to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/register', '/music-room', '/profile']
}; 