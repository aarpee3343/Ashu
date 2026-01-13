import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 1. Get Role from Token
    const token = req.nextauth.token;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    // 2. Protect Admin Dashboard
    // If trying to access /admin but NOT an Admin -> Redirect to their actual dashboard
    if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
      if (role === "SPECIALIST") return NextResponse.redirect(new URL("/dashboard/doctor", req.url));
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    // 3. Protect Doctor Dashboard
    // If trying to access /doctor but NOT a Specialist -> Redirect
    if (path.startsWith("/dashboard/doctor") && role !== "SPECIALIST") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    // 4. Protect User Dashboard
    // If trying to access /user but NOT a User -> Redirect
    if (path.startsWith("/dashboard/user") && role !== "USER") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      if (role === "SPECIALIST") return NextResponse.redirect(new URL("/dashboard/doctor", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true if token exists (User is logged in), otherwise redirects to /login
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply to all dashboard sub-routes
export const config = { matcher: ["/dashboard/:path*"] };