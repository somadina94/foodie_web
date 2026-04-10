"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { store, persistor } from "@/lib/store";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { authService } from "@/services/authService";
import { getTokenFromCookie } from "@/lib/cookies";
import { PushNotificationProvider } from "@/components/providers/push-notification-provider";

/** Refresh user from API when a JWT cookie exists (e.g. returning visit). */
function AuthSync() {
  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) return;
    void authService
      .getMe(token)
      .then((res) => {
        store.dispatch(setCredentials({ user: res.data.user, token }));
      })
      .catch(() => {
        /* stale token */
      });
  }, []);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AuthSync />
              <PushNotificationProvider>{children}</PushNotificationProvider>
              <Toaster position="top-center" closeButton richColors />
            </TooltipProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
