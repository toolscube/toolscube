import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import { ChildrenProps } from '@/types';

export default function layout({ children }: ChildrenProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        {/* {role && <DashboardSidebar menu={sidebar[role]} user={user} />} */}
        <AppSidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1">
          {/* Header/Navbar */}
          {/* <DashboardHeader role={role as Role} /> */}

          {/* Main content */}
          <main className="flex-1">
            <div className="@container/main min-h-screen w-full px-4 py-4 lg:px-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
