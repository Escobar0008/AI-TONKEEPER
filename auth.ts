import NextAuth, {
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "./lib/prisma";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

        loginVerified: {
          label: "Login Verified",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = credentials.password
          ? String(credentials.password)
          : "";

        const loginVerified =
          credentials.loginVerified
            ? String(credentials.loginVerified)
            : "";

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("EMAIL_NOT_FOUND");
        }

        // ============================================================
        // LOGIN APRÈS VÉRIFICATION DU CODE EMAIL
        // ============================================================

        if (loginVerified === "true") {
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // ============================================================
        // VÉRIFICATION DU MOT DE PASSE
        // ============================================================

        if (!password) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          password,
          user.password
        );

        if (!validPassword) {
          throw new Error("INVALID_PASSWORD");
        }

        // ============================================================
        // EMAIL DOIT ÊTRE VÉRIFIÉ
        // ============================================================

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // ============================================================
        // USER AUTHENTIFIÉ
        // ============================================================

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // ============================================================
  // SESSION JWT
  // ============================================================

  session: {
    strategy: "jwt",
  },

  // ============================================================
  // CALLBACKS
  // ============================================================

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) {
          token.id = String(user.id);
        }

        // Le rôle Prisma est déjà de type Role
        if (user.role) {
          token.role = user.role as Role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = String(token.id);
        }

        if (token.role) {
          session.user.role = token.role as Role;
        }
      }

      return session;
    },
  },

  // ============================================================
  // PAGE LOGIN
  // ============================================================

  pages: {
    signIn: "/login",
  },

  // ============================================================
  // SECRET
  // ============================================================

  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET,

  // ============================================================
  // COOKIES
  // ============================================================

  useSecureCookies:
    process.env.NODE_ENV === "production",
};

// ============================================================
// SERVER AUTH HELPER
// ============================================================

export const auth = () =>
  getServerSession(authOptions);

// ============================================================
// NEXTAUTH HANDLER
// ============================================================

const authHandler = NextAuth(authOptions);

export default authHandler;