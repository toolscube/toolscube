import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has access to the requested page
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

        // For other protected routes, just check if user is authenticated
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};
