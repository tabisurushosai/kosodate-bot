import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { getOrCreateUser } from "@/lib/users";

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    secret: requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  }),
  providers: [
    GoogleProvider({
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET")
    }),
    EmailProvider({
      server: {
        host: requiredEnv("EMAIL_SERVER_HOST"),
        port: Number(requiredEnv("EMAIL_SERVER_PORT")),
        auth: {
          user: requiredEnv("EMAIL_SERVER_USER"),
          pass: requiredEnv("EMAIL_SERVER_PASSWORD")
        }
      },
      from: requiredEnv("EMAIL_FROM")
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) {
        return false;
      }

      await getOrCreateUser({
        id: user.id,
        email: user.email
      });

      return true;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
      }

      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: requiredEnv("NEXTAUTH_SECRET")
};
