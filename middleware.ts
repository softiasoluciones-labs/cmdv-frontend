import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect routes
 * Redirects unauthenticated users to login page
 */
export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicPaths = ["/login"];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If user is not authenticated and trying to access protected route
    if (!accessToken && !isPublicPath) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access login page, redirect to dashboard
    if (accessToken && pathname === "/login") {
        const dashboardUrl = new URL("/", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

/**
 * Configure which routes should be checked by middleware
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon-.*\\.png|apple-icon\\.png|icon\\.svg).*)",
    ],
};
