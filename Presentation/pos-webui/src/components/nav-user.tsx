"use client"

import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context-types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  const { logout } = useAuth();

  // Get first letter for the fallback
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <SidebarMenu className="gap-4 p-2"> {/* Added gap-4 for spacing and p-2 for padding */}
      {/* 1. User Profile Info */}
      <SidebarMenuItem >
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <Avatar className="h-8 w-8 rounded-lg shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* 2. Direct Log Out Button */}
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={logout}
          tooltip="Log out"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-4" />
          <span className="font-medium">Log out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}