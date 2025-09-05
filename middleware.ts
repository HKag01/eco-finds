import { NextRequest, NextResponse } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/cart',
  '/orders', 
  '/profile',
  '/listings/create',
  '/listings/my',
]

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('token')?.value
  return !!token
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuth = isAuthenticated(request)

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuth) {
    // Store the intended destination
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user tries to access login/signup, redirect to home
  if (isAuth && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

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
}