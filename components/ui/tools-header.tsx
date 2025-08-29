'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Wrench } from 'lucide-react';
import Link from 'next/link';
import { BreadcrumbContainer } from '../globals/breadcrumb-container';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ToolsHeaderProps = {
  title?: string;
  breadcrumbItems?: BreadcrumbItem[];
  rightActions?: React.ReactNode;
  showQuickNav?: boolean;
};

export function ToolsHeader({ title = 'Tools', breadcrumbItems, rightActions, showQuickNav = true }: ToolsHeaderProps) {
  const hasBreadcrumb = !!breadcrumbItems?.length;

  return (
    <header className="flex shrink-0 items-center gap-2 border-b py-3 mb-2">
      <div className="flex w-full items-center gap-1 lg:gap-4 ">
        {/* Sidebar toggle */}
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mx-2 hidden sm:block data-[orientation=vertical]:h-4" />

        {/* Title or Breadcrumb */}
        <div className="min-w-0 flex-1">
          {hasBreadcrumb ? (
            <BreadcrumbContainer items={breadcrumbItems!} className="font-medium" />
          ) : (
            <div className="flex items-center gap-4">
              <h1 className="text-base font-semibold tracking-tight">{title}</h1>
              {showQuickNav && (
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                  <Link href="/tools" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Wrench className="h-4 w-4" />
                    <span>Tools</span>
                  </Link>
                </nav>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">{rightActions}</div>
      </div>
    </header>
  );
}
