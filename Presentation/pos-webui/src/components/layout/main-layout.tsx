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
      <SidebarProvider className="max-w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 max-w-full overflow-x-hidden bg-white">
          
          {/* THIN HEADER: h-12 (48px) for a professional, space-efficient look */}
          <header className="flex h-12 shrink-0 items-center px-4 bg-white/80 backdrop-blur-md sticky top-0 z-[40] border-b border-slate-100/50">
            <div className="flex items-center gap-2">
              {/* SidebarTrigger with a slight left margin gap */}
              <SidebarTrigger className="h-8 w-8 hover:bg-slate-100 transition-colors" />
              
              <Separator
                orientation="vertical"
                className="mx-2 h-4 bg-slate-200"
              />
              
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

          {/* MAIN CONTENT AREA */}
          {/* Removed top padding (pt-0) because the header provides the gap */}
          <main className="flex flex-1 flex-col overflow-x-hidden">
            <Outlet />
          </main>
          
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}