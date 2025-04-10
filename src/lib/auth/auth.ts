import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/drizzle";
import { verifyOtp } from "../services/otpService";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { Adapter } from "next-auth/adapters";
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuid } from "uuid";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    async authorize(credentials) {
      const { email, password } = credentials;

      return {
        id: "10",
        name: "vms",
        email: "vms@gmail.com",
        role: "admin",

        hospitalId: 1,
        phone: null,
        emailVerified: null,
      };
    },
  }),
  // ✅ Phone Login (OTP-based)
  Credentials({
    name: "Phone Login",
    credentials: {
      phone: {},
      otp: {},
    },
    authorize: async (credentials) => {
      //TODO: Add zod validation don't directly store them in the database
      const phone = credentials.phone as string;
      const otp = credentials.otp as string;

      if (!phone || !otp) {
        throw new Error("Phone and OTP are required.");
      }

      // ✅ Step 1: Verify OTP
      const isOtpValid = await verifyOtp(phone, otp);
      if (!isOtpValid) throw new Error("Invalid OTP");

      // ✅ Step 2: Check if user exists in DB
      let user = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      });

      // ✅ Step 3: If user doesn't exist, create them
      if (!user) {
        const newUser = await db
          .insert(users)
          .values({
            phone,
            name: "New User", // Default name, update later
            hospitalId: 1,
          })
          .returning();
        user = newUser.length > 0 ? newUser[0] : undefined; // ✅ Extract first user safely
      }

      // Return a User object
      return user || null; //As user can be undefined
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
  debug: true, // To debug in dev remove in production
  // pages: {
  //   signIn: "/login",
  // },
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
        session.user.role = user.role;
        session.user.hospitalId = user.hospitalId;
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
    role: UserRole;
    hospitalId: number; // Nullable for patients who may not belong to a hospital
  }

  interface Session {
    user: {
      role: UserRole;
      hospitalId: number;
    };
  }
}
