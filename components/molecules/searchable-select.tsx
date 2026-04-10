"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableOption = string | { value: string; label: string };

type SearchableSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

function normalizeOptions(options: SearchableOption[]): { value: string; label: string }[] {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  emptyLabel = "No results.",
  disabled,
  loading,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const normalized = React.useMemo(() => normalizeOptions(options), [options]);
  const selected = normalized.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled || loading}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-left text-sm font-normal shadow-xs outline-none transition-[color,box-shadow] hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          className
        )}
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate">
          {loading ? (
            "Loading…"
          ) : selected ? (
            selected.label
          ) : value ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--anchor-width)] min-w-[min(100vw-2rem,28rem)] max-w-[min(100vw-2rem,28rem)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}…`} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : emptyLabel}</CommandEmpty>
            {normalized.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
