"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, Lock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { outgoingTick, roleLabel } from "@/lib/order-chat";
import type { Order } from "@/services/orderService";
import { orderMessageService, type OrderChatMessage } from "@/services/orderMessageService";
import { ApiError } from "@/services/apiClient";
import { useAppSelector } from "@/lib/hooks";

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}

function formatDayLabel(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
  } catch {
    return "";
  }
}

function TickIcon({ level }: { level: "sent" | "delivered" | "read" }) {
  if (level === "sent") {
    return <Check className="size-3.5 text-muted-foreground/70" aria-hidden />;
  }
  if (level === "delivered") {
    return <CheckCheck className="size-3.5 text-muted-foreground/70" aria-hidden />;
  }
  return <CheckCheck className="size-3.5 text-sky-500 dark:text-sky-400" aria-hidden />;
}

function MessageBubble({
  msg,
  isMine,
  tick,
  showRole,
}: {
  msg: OrderChatMessage;
  isMine: boolean;
  tick: "sent" | "delivered" | "read";
  showRole: boolean;
}) {
  return (
    <div className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,20rem)] rounded-2xl px-3 py-2 shadow-sm",
          isMine
            ? "rounded-br-md bg-[#d9fdd3] text-foreground dark:bg-emerald-900/75 dark:text-emerald-50"
            : "rounded-bl-md border border-border/60 bg-card text-card-foreground",
        )}
      >
        {showRole && !isMine && (
          <p className="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
            {roleLabel(msg.sender.role)} · {msg.sender.name.split(" ")[0]}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.text}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1",
            isMine ? "text-emerald-700/80 dark:text-emerald-200/80" : "text-muted-foreground",
          )}
        >
          <span className="text-[0.65rem] tabular-nums">{formatTime(msg.createdAt)}</span>
          {isMine && <TickIcon level={tick} />}
        </div>
      </div>
    </div>
  );
}

export function OrderChatPanel({ orderId, order }: { orderId: string; order: Order }) {
  const myId = useAppSelector((s) => s.auth.user?._id);
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  const canViewChat =
    Boolean(order.vendorUser) &&
    order.status !== "cancelled" &&
    order.status !== "pending_payment" &&
    order.status !== "pending_kitchen";

  const chatClosed = order.status === "delivered";

  const query = useQuery({
    queryKey: ["order-messages", orderId],
    queryFn: () => orderMessageService.list(orderId),
    enabled: Boolean(orderId) && canViewChat,
    refetchInterval: canViewChat && !chatClosed ? 5000 : false,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => orderMessageService.send(orderId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order-messages", orderId] });
      setDraft("");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not send.";
      toast.error("Message failed", { description: msg });
    },
  });

  const messages = query.data?.data.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const grouped = useMemo(() => {
    type GroupItem =
      | { type: "day"; label: string }
      | { type: "msg"; message: OrderChatMessage };
    const items: GroupItem[] = [];
    let lastDay = "";
    for (const m of messages) {
      const day = new Date(m.createdAt).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        items.push({ type: "day", label: formatDayLabel(m.createdAt) });
      }
      items.push({ type: "msg", message: m });
    }
    return items;
  }, [messages]);

  if (!myId) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center gap-3 border-b border-primary/25 bg-primary px-4 py-3 text-primary-foreground shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15 ring-2 ring-primary-foreground/25">
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-semibold tracking-tight">Order chat</h2>
          <p className="text-[0.7rem] text-primary-foreground/90">
            Customer, kitchen & rider — same thread as your order
          </p>
        </div>
      </div>

      {!canViewChat && (
        <p className="border-b border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Chat opens after a kitchen is assigned to this order.
        </p>
      )}

      {canViewChat && chatClosed && (
        <div className="flex items-start gap-2 border-b border-border/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/15 dark:text-amber-100">
          <Lock className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
          <div>
            <p className="font-medium">Chat closed</p>
            <p className="text-[0.8rem] opacity-90">
              This order is delivered — new messages are disabled. History below is kept for your
              records.
            </p>
          </div>
        </div>
      )}

      {canViewChat && query.isError && (
        <p className="px-4 py-3 text-sm text-destructive">
          {query.error instanceof ApiError
            ? query.error.message
            : "Could not load messages."}
        </p>
      )}

      {canViewChat && (
        <>
          <ScrollArea
            className={cn(
              "h-[min(420px,52vh)] w-full",
              "bg-[#e4dcd4] dark:bg-[#0b141a]",
              "[background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)]",
              "dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]",
              "bg-[length:18px_18px]",
            )}
          >
            <div className="space-y-3 p-3 pr-4">
              {query.isPending && (
                <p className="text-center text-sm text-muted-foreground">Loading messages…</p>
              )}
              {!query.isPending && messages.length === 0 && (
                <p className="rounded-lg bg-black/5 px-3 py-6 text-center text-sm text-muted-foreground dark:bg-white/5">
                  No messages yet. Say hello to coordinate pickup and delivery.
                </p>
              )}
              {grouped.map((item, i) =>
                item.type === "day" ? (
                  <div key={`day-${item.label}-${i}`} className="flex justify-center py-1">
                    <span className="rounded-full bg-black/10 px-3 py-0.5 text-[0.65rem] font-medium text-muted-foreground shadow-sm dark:bg-white/10 dark:text-emerald-100/80">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <MessageBubble
                    key={item.message._id}
                    msg={item.message}
                    isMine={item.message.sender._id === myId}
                    tick={outgoingTick(item.message, myId, order)}
                    showRole
                  />
                ),
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {chatClosed ? (
            <div className="flex items-center gap-2 border-t border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <Lock className="size-4 shrink-0" aria-hidden />
              <span>Conversation closed — read-only history</span>
            </div>
          ) : (
            <div className="flex gap-2 border-t border-border/50 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                rows={1}
                className="min-h-[44px] resize-none rounded-2xl border-border/80 bg-muted/30 py-3 pr-10"
                disabled={mutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const t = draft.trim();
                    if (t) mutation.mutate(t);
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full"
                disabled={mutation.isPending || !draft.trim()}
                onClick={() => {
                  const t = draft.trim();
                  if (t) mutation.mutate(t);
                }}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
