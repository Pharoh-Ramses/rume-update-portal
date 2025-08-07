import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define protected routes
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect to dashboard if logged in and trying to access auth pages (except magic link and setup-password)
  if (isLoggedIn && isAuthRoute && !nextUrl.pathname.includes('/setup-password') && !nextUrl.pathname.includes('/magic')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect to sign in if not logged in and trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl));
  }

  // Check if user needs to set up password
  if (isLoggedIn && req.auth?.user?.needsPasswordSetup && !nextUrl.pathname.includes('/setup-password')) {
    return NextResponse.redirect(new URL('/auth/setup-password', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};