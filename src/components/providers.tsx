"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { useState } from "react";
import CartSyncProvider from "./CartSyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={queryClient}>
        <CartSyncProvider />
        <Toaster position="top-center" richColors />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
