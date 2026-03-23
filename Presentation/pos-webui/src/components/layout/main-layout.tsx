import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip"; 

export function MainLayout() {
  return (
    <TooltipProvider delayDuration={0}>
      {/* Ensure the provider doesn't allow horizontal overflow */}
      <SidebarProvider className="max-w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 max-w-full overflow-x-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100/50 px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-slate-900">BizFlow</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* This wrapper ensures the main content area doesn't wobble */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}