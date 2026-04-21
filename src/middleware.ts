import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'carh-api-secret-2026');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtenemos el texto de la cookie
  const token = request.cookies.get('access_token')?.value;
  let isTokenValid = false;

  if (token) {
    try {
      // Verificamos matemáticamente la firma del JWT (Edge Compatible)
      await jwtVerify(token, JWT_SECRET);
      isTokenValid = true;
    } catch (err) {
      isTokenValid = false; // Firma inválida o expiró
    }
  }

  if (token && !isTokenValid) {
    // Si la cookie existe pero fue corrompida, la purgamos radicalmente
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // 1. Si intenta ir al dashboard sin token, lo expulsamos al login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Si intenta ir a login o registro y su token YA es perfectamente válido, lo pasamos al dashboard.
  if (isTokenValid && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Rutas vigiladas:
 */
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};
