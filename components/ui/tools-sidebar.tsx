"use client";

import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ToolsData } from "@/data/tools";
import { NavMain } from "./nav-tools";

export function ToolsSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader className="border-b px-3 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold"
          aria-label="Tools Hub home"
        >
          <Image src="/assets/logo-transplant.png" height={40} width={40} alt="Tools Hub Logo" />
          {state !== "collapsed" && <span className="truncate">Tools Hub</span>}
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavMain items={ToolsData} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
