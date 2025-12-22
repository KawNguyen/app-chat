import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const guestRoutes = ["/auth", "/auth/setup-username"];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Skip API routes
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({ headers: request.headers });

  // If logged in, check if user has username
  if (session?.user) {
    // Skip check for setup-username page
    if (url.pathname === "/auth/setup-username") {
      return NextResponse.next();
    }

    // Check if user has username in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userName: true },
    });

    // If no username, redirect to setup page
    if (!user?.userName) {
      url.pathname = "/auth/setup-username";
      return NextResponse.redirect(url);
    }

    // If has username and accessing guest routes -> redirect to home
    if (guestRoutes.includes(url.pathname)) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // If not logged in and accessing protected routes -> redirect to auth
  if (!session?.user && !guestRoutes.includes(url.pathname)) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
