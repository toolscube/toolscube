"use client";

import { LayoutGrid, Menu, Search, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import { ActionButton } from "./action-buttons";
import NavRight from "./nav-right";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/75 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center font-semibold">
            <Image
              src="/assets/logo.png"
              height={40}
              width={40}
              alt="Tools Cube Logo"
            />
            <span>Tools Cube</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm md:flex">
            <Link href="/tools" className="hover:opacity-80">
              <ActionButton icon={Wrench} label="Tools" variant="ghost" />
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NavRight />
        </div>

        {/* Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] sm:w-96">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-semibold"
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span>Tools Cube</span>
                </Link>
              </div>
            </SheetHeader>
            <div className="grid gap-2">
              <SheetClose asChild>
                <Link href="/tools" className="rounded-md p-2 hover:bg-muted">
                  Tools
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/privacy" className="rounded-md p-2 hover:bg-muted">
                  Privacy
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/terms" className="rounded-md p-2 hover:bg-muted">
                  Terms
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/about" className="rounded-md p-2 hover:bg-muted">
                  About
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/sponsor" className="rounded-md p-2 hover:bg-muted">
                  Sponsor
                </Link>
              </SheetClose>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href="/tools">
                    <Search className="mr-2 h-4 w-4" /> Find a tool
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
