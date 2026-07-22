import { NextRequest, NextResponse } from 'next/server';
import { MANAGER_TOKEN_COOKIE } from './lib/managerAuthCookie';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/manage/login';
  const hasToken = request.cookies.has(MANAGER_TOKEN_COOKIE);

  if (!isLoginPage && !hasToken) {
    const loginUrl = new URL('/manage/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && hasToken) {
    return NextResponse.redirect(new URL('/manage/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manage/:path*'],
};
