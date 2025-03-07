"use client";
// https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/ useful link do not remove
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignInPage() {
  const [step, setStep] = useState<"inputphone" | "inputotp">("inputphone");

  //TODO: Shift zod schema to separate file
  const signInSchema = z.object({
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits"),
    otp: z.string().length(6, "OTP must be exactly 6 digits").optional(),
  });

  type SignInSchema = z.infer<typeof signInSchema>;

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: "", otp: "" },
    mode: undefined,
  });

  function onSubmit(data: SignInSchema) {
    if (step === "inputphone") {
      setStep("inputotp");
    }
    console.log("Submitted Data:", data);
    // TODO: Call API to verify OTP
  }

  async function handleGetOtp() {
    const isValidPhone = await form.trigger("phone");
    console.log(isValidPhone);
    if (!isValidPhone) return;
    // TODO: Call API to get OTP
    setStep("inputotp");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-md">
        <Form {...form}>
          <form noValidate={true} onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  {step === "inputphone"
                    ? "Please enter a phone number for verification with a one-time code."
                    : "Please enter the one-time code sent to your phone number."}
                </CardDescription>
              </CardHeader>

              {step === "inputphone" ? (
                <>
                  <CardContent>
                    <FormField
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // Prevent form submission
                                  handleGetOtp(); // Trigger OTP retrieval
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={handleGetOtp}>
                      Get OTP
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>One-Time Password</FormLabel>
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Submit</Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
