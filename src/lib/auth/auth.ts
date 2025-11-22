import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/drizzle";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { Adapter } from "next-auth/adapters";
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    async authorize(credentials) {
      const { email, password } = credentials;

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email as string),
      });

      if (!user) {
        return null;
      }

      if (!user.hashedPassword) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password as string,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  }),


  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
}) as Adapter;

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  debug: true, // To debug in dev remove in production
  pages: {
    signIn: "/signin",
  },
  providers: providers,

  adapter: adapter, // ✅ Store sessions in Drizzle
  session: {
    strategy: "database", // ✅ Use JWT sessions or database here as you have linked drizzle
  },
  callbacks: {
    // jwt: async ({ token, user }) => {            //No need to set anything on jwt as you are using database which will get session
    //   if (user) {
    //     token.user = user;
    //   }
    //   return token;
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
    session: async ({ session, user }) => {
      if (user) {
        // Only update session when user is available
        session.user.id = user.id;
        // The following properties are not on the user object returned from authorize
        // session.user.role = user.role; 
        // session.user.hospitalId = user.hospitalId;
      }
      return session;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

declare module "next-auth" {
  type UserRole = "patient" | "doctor" | "admin";

  interface User {
    // role: UserRole;
    // hospitalId: number; 
  }

  interface Session {
    user: {
      // role: UserRole;
      // hospitalId: number;
    } & {
      id: string;
    };
  }
}
