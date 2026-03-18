import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas protegidas del portal de clubs
  if (pathname.startsWith('/portal')) {
    const clubId = request.cookies.get('clubId')
    if (!clubId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Rutas protegidas del admin
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('isAdmin')
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*']
}