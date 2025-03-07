import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/drizzle";
import { verifyOtp } from "../services/otpService";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import { users } from "../db/schema";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
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
          })
          .returning();
        user = newUser.length > 0 ? newUser[0] : undefined; // ✅ Extract first user safely
      }

      // Return a User object
      return user || null; //As user can be undefined
    },
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

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: providers,

  adapter: DrizzleAdapter(db), // ✅ Store sessions in Drizzle
  // session: {
  //   strategy: "jwt", // ✅ Use JWT sessions
  // },
  // callbacks: {
  //   jwt: async ({ token, user }) => {
  //     if (user) {
  //       token.user = user;
  //     }
  //     return token;
  //   },
  // },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
