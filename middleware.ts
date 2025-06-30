// middleware.ts (in root directory - same level as package.json)
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic if needed
    console.log('Middleware running for:', req.nextUrl.pathname)
    console.log('Token exists:', !!req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Return true if user is authenticated, false otherwise
        console.log('Authorization check:', !!token)
        return !!token
      },
    },
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/tasks/:path*',
    '/api/projects/:path*',
    '/api/users/:path*',
  ]
}