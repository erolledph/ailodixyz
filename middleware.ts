import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect CMS routes
  if (pathname.startsWith('/cms-admin') || pathname.startsWith('/api/cms')) {
    const sessionCookie = request.cookies.get('cms-session');
    
    if (!sessionCookie) {
      // Redirect to GitHub OAuth login
      return NextResponse.redirect(new URL('/api/auth/github/login', request.url));
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
      
      if (sessionData.username !== adminUsername) {
        return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/api/auth/github/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cms-admin/:path*', '/api/cms/:path*']
};