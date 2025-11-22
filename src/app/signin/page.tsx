"use client";

import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInFormWrapper() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <SignInFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}


