import { withAuth } from 'next-auth/middleware';

const publicRoutes = ['/', '/login', '/signup'];

export default withAuth(
  (req: { nextUrl: { pathname: string } }) => {
    const { pathname } = req.nextUrl;
    if (publicRoutes.includes(pathname)) {
      return;
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }: { req: { nextUrl: { pathname: string } }; token: unknown }) => {
        if (publicRoutes.includes(req.nextUrl.pathname)) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ['/dashboard/:path*', '/messages/:path*', '/groups/:path*', '/profile/:path*'],
};
