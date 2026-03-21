import * as React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  ReceiptIndianRupee,
  Store
} from "lucide-react";
import { NavMain } from "../nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "../nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context/auth-context-types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navData = {
    user: {
      name: user?.fullName ?? "User",
      email: user?.userName ?? "username",
      avatar: "/avatars/default.jpg",
    },
    navMain: [
      {
        title: "Platform",
        url: "#",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          { title: "Dashboard", url: "/dashboard" },
          { title: "New Sale", url: "/sales/new" },
          { title: "Inventory", url: "/inventory" },
        ],
      },
    ],
    projects: [
      { name: "Reports", url: "/reports", icon: BarChart3 },
      { name: "Credit/Debt", url: "/credits", icon: ReceiptIndianRupee },
    ],
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BizFlow</span>
                  <span className="truncate text-xs">{user?.role ?? "Management"}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavProjects projects={navData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}