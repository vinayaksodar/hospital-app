"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);

  const handleContinue = () => {
    setStep("verification");
  };

  const handleBack = () => {
    setStep("phone");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
      // Clear the input in the previous input
      const newCode = [...verificationCode];
      newCode[index - 1] = "";
      setVerificationCode(newCode);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value !== "" && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-between items-center mb-8"></div>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">GH</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Gadad Hospital</h2>
              {/* <p className="text-zinc-400">
                Sign in to v0 using your Vercel account.
              </p> */}
            </div>

            {step === "phone" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-zinc-400">
                    To continue signing up, please enter a phone number for
                    verification with a one time code.
                  </p>
                  <div className="flex">
                    <Input
                      className="rounded-l-none border-zinc-800 bg-zinc-900 focus-visible:ring-zinc-700"
                      placeholder="(201) 555-0123"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-zinc-200"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-zinc-400">
                    A code has been sent to{" "}
                    <span className="text-white">{phoneNumber}</span>.
                    <br />
                    Enter it below to complete your sign up.
                  </p>
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <Input
                        key={index}
                        id={`code-${index}`}
                        className={`w-12 h-12 text-center text-lg border-zinc-800 bg-zinc-900 focus-visible:ring-zinc-700`}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        maxLength={1}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-zinc-200"
                  onClick={handleContinue}
                >
                  Submit
                </Button>
                <div className="flex justify-center">
                  <Button
                    variant="link"
                    className="text-blue-500 hover:text-blue-400 flex items-center gap-1 p-0"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
