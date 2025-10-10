"use client";

import NavRight from "../shared/nav-right";
import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

export default function ToolsHeader() {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center border-b py-3 overflow-hidden border-b-muted/40 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-semibold tracking-tight">Tools Cube</h1>

        {/* Fake search control */}
        <NavRight />
      </div>
    </header>
  );
}
