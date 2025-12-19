import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const guestRoutes = ["/auth"];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Skip API routes
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({ headers: request.headers });

  // If logged in and accessing guest routes -> redirect to home
  if (session?.user && guestRoutes.includes(url.pathname)) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If not logged in and accessing protected routes -> redirect to sign-in
  if (!session?.user && !guestRoutes.includes(url.pathname)) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
