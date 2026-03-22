import * as React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  ReceiptIndianRupee,
  Store,
  ShoppingCart,
  Package,
  Settings
} from "lucide-react";

// Components
import { NavMain } from "../nav-main";
import { NavUser } from "../nav-user";

// UI Components
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

  const navigationItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "New Sale", url: "/sales/new", icon: ShoppingCart },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Credit/Debt", url: "/credits", icon: ReceiptIndianRupee },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const userData = {
    name: user?.fullName ?? "User",
    email: user?.userName ?? "username",
    avatar: "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="py-4"> {/* Added padding for a more premium look */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none h-12">
              {/* Increased size from size-8 to size-10 */}
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="size-6" /> {/* Increased icon size from size-4 to size-6 */}
              </div>
              <div className="grid flex-1 text-left leading-tight ml-2">
                {/* Changed font-bold to text-xl for a much bigger header */}
                <span className="truncate font-bold text-xl tracking-tight">
                  BizFlow
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}