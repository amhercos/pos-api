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
      <SidebarProvider className="max-w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen min-w-0 max-w-full bg-white overflow-hidden">
          <header className="flex h-12 shrink-0 items-center px-4 bg-white sticky top-0 z-[40] border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Biz<span className="text-blue-600">Flow</span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="flex-1 min-h-0 w-full overflow-y-auto relative custom-scrollbar">
            <Outlet />
          </main>
          
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}