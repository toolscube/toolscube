export const dynamic = "force-dynamic";

import { SidebarProvider } from "@/components/ui/sidebar";
import ToolsHeader from "@/components/ui/tools-header";
import { ToolsSidebar } from "@/components/ui/tools-sidebar";
import type { ChildrenProps } from "@/types";

function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {/* soft radial glow */}
      <div className="absolute left-1/2 top-[-10%] h-220 w-220 -translate-x-1/2 rounded-full bg-linear-to-b from-primary/30 via-primary/10 to-transparent blur-3xl" />
      {/* grid dots */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,var(--color-muted)/10_1px,transparent_1px)] bg-size-[24px_24px]" />
      {/* diagonal sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,var(--color-background)_30%,transparent_60%)]/[30]" />
    </div>
  );
}

export default function Layout({ children }: ChildrenProps) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden">
        <BackgroundFX />

        {/* Sidebar */}
        <ToolsSidebar />

        {/* Main area */}
        <div className="flex flex-1 flex-col">
          <ToolsHeader />

          <main className="flex-1 py-4">
            <div className="@container/main min-h-screen w-full px-4">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
