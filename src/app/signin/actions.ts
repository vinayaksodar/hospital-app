"use server";

import { signIn } from "../../lib/auth/auth";

// Mock function to send OTP (Replace with actual implementation)
export async function sendOtp(phone: string) {
  console.log(`Sending OTP to ${phone}`);
  // Store OTP in DB/session for validation (not done here)
}

// Handle OTP login using next-auth Credentials Provider
export async function handleSignIn(
  provider: { id: string; name: string },
  callbackUrl: string
) {
  try {
    await signIn(provider.id, {
      redirectTo: callbackUrl,
    });
  } catch (error) {
    // Signin can fail for a number of reasons, such as the user
    // not existing, or the user not having the correct role.
    // In some cases, you may want to redirect to a custom error
    // if (error instanceof AuthError) {
    //   return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
    // }

    // Otherwise if a redirects happens Next.js can handle it
    // so you can just re-thrown the error and let Next.js handle it.
    // Docs:
    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
    throw error;
  }
}
