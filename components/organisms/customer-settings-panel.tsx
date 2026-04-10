"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { performLogout } from "@/lib/logout";
import { setAuthCookies } from "@/lib/cookies";
import { userService } from "@/services/userService";
import { ApiError } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function CustomerSettingsPanel() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });
  const [deletePhrase, setDeletePhrase] = useState("");

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      zip: user.zip ?? "",
    });
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => userService.updateMe(profile),
    onSuccess: (res) => {
      if (!user) return;
      dispatch(setCredentials({ user: res.data.user }));
      toast.success("Profile saved");
    },
    onError: (err) =>
      toast.error("Could not update profile", {
        description: errorMessage(err, "Try again."),
      }),
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.updatePassword(passwordForm),
    onSuccess: (res) => {
      setAuthCookies(res.token, res.data.user.role);
      dispatch(setCredentials({ user: res.data.user, token: res.token }));
      setPasswordForm({ passwordCurrent: "", password: "", passwordConfirm: "" });
      toast.success("Password updated");
    },
    onError: (err) =>
      toast.error("Could not update password", {
        description: errorMessage(err, "Check your current password."),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteMe(),
    onSuccess: async () => {
      toast.success("Account deleted");
      await performLogout();
      router.push("/");
      router.refresh();
    },
    onError: (err) =>
      toast.error("Could not delete account", {
        description: errorMessage(err, "Try again."),
      }),
  });

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage profile details, password, and account access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal and delivery information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              profileMutation.mutate();
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settings-name">Full name</Label>
              <Input
                id="settings-name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settings-address">Address</Label>
              <Input
                id="settings-address"
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-city">City</Label>
              <Input
                id="settings-city"
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-state">State</Label>
              <Input
                id="settings-state"
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settings-zip">ZIP</Label>
              <Input
                id="settings-zip"
                value={profile.zip}
                onChange={(e) => setProfile((p) => ({ ...p, zip: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-full" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Use a separate form to change your password securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              passwordMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="settings-current-password">Current password</Label>
              <Input
                id="settings-current-password"
                type="password"
                autoComplete="current-password"
                value={passwordForm.passwordCurrent}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, passwordCurrent: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-new-password">New password</Label>
              <Input
                id="settings-new-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-confirm-password">Confirm new password</Label>
              <Input
                id="settings-confirm-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.passwordConfirm}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, passwordConfirm: e.target.value }))
                }
                required
              />
            </div>
            <Button type="submit" className="rounded-full" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            This permanently removes your account data and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-phrase">Type DELETE to confirm</Label>
            <Input
              id="delete-phrase"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            disabled={deletePhrase !== "DELETE" || deleteMutation.isPending}
            onClick={() => {
              deleteMutation.mutate();
            }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete my account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
