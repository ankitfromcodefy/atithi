"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Skip Clerk if no valid key (allows builds without credentials)
  if (!publishableKey || publishableKey.startsWith("pk_test_XXXXX")) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkWrapper>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </ClerkWrapper>
  );
}
