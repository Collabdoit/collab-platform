import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication
const protectedPaths = ['/dashboard', '/dashboard/'];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix
  const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/';
  return cleanPath.startsWith('/dashboard');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, _next, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  if (isProtectedPath(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Not authenticated — redirect to login
      const locale = pathname.startsWith('/en') ? 'en' : 'ar';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run i18n middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)',],
};
