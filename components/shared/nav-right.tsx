"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, Facebook, Link2, Search, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolsData } from "@/data/tools";
import { socialIcons } from "./icons";
import { UserNav } from "./user-nav";

// Types
type ToolItem = {
  title: string;
  url: string;
  description?: string;
  popular?: boolean;
};

type FlatItem = ToolItem & {
  category: string;
  categoryUrl: string;
  icon?: unknown;
};

const RECENT_KEY = "tools-hub:recent-items-v1";
const MAX_RECENT = 8;

function asIcon(maybe: unknown): LucideIcon {
  return typeof maybe === "function" ? (maybe as LucideIcon) : Link2;
}

function flattenTools(data: typeof ToolsData): FlatItem[] {
  const out: FlatItem[] = [];
  for (const group of data) {
    if (!group?.isActive) continue;
    for (const item of group.items ?? []) {
      out.push({
        ...item,
        category: group.title,
        categoryUrl: group.url,
        icon: group.icon,
      });
    }
  }
  return out;
}

function addRecent(item: FlatItem) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const prev: FlatItem[] = raw ? JSON.parse(raw) : [];
    const filtered = prev.filter((p) => p.url !== item.url);
    const next = [item, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function getRecent(): FlatItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as FlatItem[]) : [];
  } catch {
    return [];
  }
}

export default function NavRight() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<FlatItem[]>([]);
  const [query, setQuery] = useState("");
  const all = useMemo(() => flattenTools(ToolsData), []);
  const popular = useMemo(() => all.filter((i) => i.popular), [all]);
  const inputProxyRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/") {
        const t = e.target as HTMLElement;
        const tag = t?.tagName?.toLowerCase();
        const editable = t?.getAttribute?.("contenteditable") === "true";
        if (!editable && tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  function go(item: FlatItem) {
    addRecent(item);
    setOpen(false);
    router.push(item.url);
  }

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, FlatItem[]>();
    for (const item of all) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, [all]);

  return (
    <>
      {/* Fake search control */}
      <div className="ml-3 hidden md:flex flex-1" />
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                ref={inputProxyRef}
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center gap-2 rounded-md border bg-background/50 px-3 py-2 text-sm text-muted-foreground hover:bg-background/70 ring-1 ring-border/50 shadow-sm transition backdrop-blur supports-[backdrop-filter]:bg-background/40"
                aria-label="Search tools"
              >
                <Search className="h-4 w-4" />
                <span className="pr-6">Search tools…</span>
                <kbd className="ml-auto text-[10px] tracking-wider rounded border bg-muted px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              Open search (⌘/Ctrl + K)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button variant="outline" asChild size="icon" className="hidden sm:flex">
          <Link
            href="https://www.facebook.com/profile.php?id=61581928709555"
            rel="noopener noreferrer"
            target="_blank"
            className="dark:text-foreground inline-flex items-center gap-1"
          >
            <Facebook className="size-6" />
          </Link>
        </Button>
        <Button variant="outline" asChild size="icon" className="hidden sm:flex">
          <Link
            href="https://discord.gg/e5v3J6eX"
            rel="noopener noreferrer"
            target="_blank"
            className="dark:text-foreground inline-flex items-center gap-1"
          >
            {socialIcons.find((icon) => icon.name === "Discord")?.svg}
          </Link>
        </Button>
        <UserNav />
      </div>

      {/* Search Modal */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search any tool (e.g., QR, Base64, Invoice, Regex)…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>

          {/* Recent */}
          {!query && recent.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {recent.map((item) => {
                  const Icon = asIcon(item.icon);
                  return (
                    <CommandItem
                      key={`recent:${item.url}`}
                      value={`${item.title} ${item.category}`}
                      onSelect={() => go(item)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      <Badge className="ml-auto" variant="secondary">
                        {item.category}
                      </Badge>
                      <ArrowRight className="ml-2 h-4 w-4 opacity-60" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Popular (only when no query) */}
          {!query && popular.length > 0 && (
            <>
              <CommandGroup heading="Popular">
                {popular.map((item) => {
                  return (
                    <CommandItem
                      key={`popular:${item.url}`}
                      value={`${item.title} ${item.category}`}
                      onSelect={() => go(item)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      <Badge className="ml-auto" variant="outline">
                        {item.category}
                      </Badge>
                      <ArrowRight className="ml-2 h-4 w-4 opacity-60" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Categories (filtered by Command’s built-in fuzzy) */}
          {[...groupedByCategory.entries()].map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => {
                const Icon = asIcon(item.icon);
                return (
                  <CommandItem
                    key={item.url}
                    value={`${item.title} ${category}`}
                    onSelect={() => go(item)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                    <Badge className="ml-auto" variant="secondary">
                      {category}
                    </Badge>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-60" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
