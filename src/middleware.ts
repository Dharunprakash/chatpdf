import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback','/api/auth/*', '/api/auth/:path*'],
}

export default authMiddleware
