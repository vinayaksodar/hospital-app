export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
    // Simulate OTP check (replace with actual Twilio/other API call)
    return otp === "123456"; // ❗ Temporary for testing, replace with real validation
  }