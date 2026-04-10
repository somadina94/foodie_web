"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminListedUser } from "@/services/adminService";
import type { UserRole } from "@/lib/constants";
import { ROLE_SELECT_OPTIONS } from "@/lib/adminRoles";
import { useAppSelector } from "@/lib/hooks";
import { ApiError } from "@/services/apiClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

function formatJoined(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminUsersPanel() {
  const queryClient = useQueryClient();
  const currentUserId = useAppSelector((s) => s.auth.user?._id);
  const [query, setQuery] = useState("");

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.getAllUsers(),
  });

  const users = data?.data.users ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q),
    );
  }, [users, query]);

  const mutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Role updated");
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not update role";
      toast.error(msg);
    },
  });

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-b from-card to-card/80 shadow-lg ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/60 bg-muted/30 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <CardTitle className="text-xl">Directory</CardTitle>
            </div>
            <CardDescription className="max-w-lg text-pretty">
              Assign roles to control dashboards and permissions. You cannot change your own role from here.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="h-8 shrink-0 gap-1.5 px-3 text-sm font-medium tabular-nums">
            <Shield className="size-3.5 opacity-70" />
            {users.length} {users.length === 1 ? "user" : "users"}
          </Badge>
        </div>
        <div className="relative pt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 shadow-sm"
            aria-label="Filter users"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isPending && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}
        {isError && (
          <div className="space-y-3 p-8 text-center">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "Could not load users."}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!isPending && !isError && filtered.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            {query.trim() ? "No users match your search." : "No users found."}
          </p>
        )}
        {!isPending && !isError && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="min-w-[220px] pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    User
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <UserRoleRow
                    key={user._id}
                    user={user}
                    isSelf={user._id === currentUserId}
                    isBusy={
                      mutation.isPending &&
                      mutation.variables?.userId === user._id
                    }
                    onRoleChange={(role) => {
                      if (role === user.role) return;
                      mutation.mutate({ userId: user._id, role });
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserRoleRow({
  user,
  isSelf,
  isBusy,
  onRoleChange,
}: {
  user: AdminListedUser;
  isSelf: boolean;
  isBusy: boolean;
  onRoleChange: (role: UserRole) => void;
}) {
  const location = [user.city, user.state].filter(Boolean).join(", ") || "—";

  return (
    <TableRow
      className={cn(
        "group border-border/50 transition-colors",
        isSelf && "bg-muted/20",
      )}
      data-updating={isBusy ? "true" : undefined}
    >
      <TableCell className="py-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-background shadow-sm">
            <AvatarFallback
              className={cn(
                "text-sm font-semibold",
                "bg-gradient-to-br from-primary/15 to-primary/5 text-primary",
              )}
            >
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{user.name}</span>
              {isSelf ? (
                <Badge variant="outline" className="text-[0.65rem] font-normal">
                  You
                </Badge>
              ) : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="truncate text-xs text-muted-foreground md:hidden">{location}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">{location}</TableCell>
      <TableCell className="py-4">
        <div className="relative flex flex-col gap-2 sm:max-w-[240px]">
          {isBusy ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]"
              aria-hidden
            >
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          ) : null}
          <Select
            value={user.role}
            onValueChange={(v) => {
              if (v) onRoleChange(v as UserRole);
            }}
            disabled={isSelf || isBusy}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "h-9 w-full min-w-[180px] rounded-lg border-border/80 bg-background/90 shadow-sm",
                isSelf && "cursor-not-allowed opacity-70",
              )}
              aria-label={`Role for ${user.name}`}
              aria-busy={isBusy}
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent align="start" className="rounded-xl">
              {ROLE_SELECT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  title={opt.hint}
                  className="rounded-lg py-2 pr-8"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex size-2 shrink-0 rounded-full",
                        opt.value === "user" && "bg-sky-500",
                        opt.value === "vendor" && "bg-amber-500",
                        opt.value === "rider" && "bg-emerald-500",
                        opt.value === "admin" && "bg-violet-500",
                      )}
                    />
                    <span className="font-medium">{opt.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSelf ? (
            <p className="text-xs text-muted-foreground">Ask another admin to change your role.</p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {formatJoined(user.createdAt)}
      </TableCell>
    </TableRow>
  );
}
