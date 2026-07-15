import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkHandler = clerkMiddleware();

// Next.js 16 Proxy handler
export async function proxy(request: any, event: any) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
