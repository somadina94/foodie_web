"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { setAuthCookies } from "@/lib/cookies";
import { useAppDispatch } from "@/lib/hooks";
import { dashboardPathForRole, ROUTES } from "@/lib/constants";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLegalLinks } from "@/components/molecules/auth-legal-links";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/services/apiClient";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const user = res.data.user;
      setAuthCookies(res.token, user.role);
      dispatch(setCredentials({ user, token: res.token }));
      const next = safeCallbackUrl(
        searchParams.get("callbackUrl"),
        dashboardPathForRole(user.role),
      );
      toast.success("Signed in");
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
      setError(msg);
      toast.error("Sign in failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/80 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to order, track, and manage your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-16">
      <Link
        href={ROUTES.home}
        className="mb-8 text-xl font-bold tracking-tight text-primary"
      >
        Foodie
      </Link>
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <AuthLegalLinks />
      </div>
    </div>
  );
}
