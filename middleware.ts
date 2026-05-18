import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token)
  },
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
