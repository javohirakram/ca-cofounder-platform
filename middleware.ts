import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'uz'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

const protectedRoutes = ['/discover', '/matches', '/connections', '/ideas', '/messages', '/profile', '/notifications', '/settings', '/admin'];

export default async function middleware(request: NextRequest) {
  // Create response from intl middleware
  const response = intlMiddleware(request);

  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  // Remove locale prefix for checking
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ru|uz)/, '');

  const isProtected = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (isProtected && !session) {
    const locale = pathname.match(/^\/(en|ru|uz)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // If logged in and going to login/register, redirect to discover
  const isAuthRoute = pathnameWithoutLocale.startsWith('/login') || pathnameWithoutLocale.startsWith('/register');
  if (isAuthRoute && session) {
    const locale = pathname.match(/^\/(en|ru|uz)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/discover`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
