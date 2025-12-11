import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware(_req) {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith("/dashboard")) {
        return !!token;
      }
      if (pathname.startsWith("/profile")) {
        return !!token;
      }
      if (pathname.startsWith("/settings")) {
        return !!token;
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};