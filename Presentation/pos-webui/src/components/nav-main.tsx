"use client"

import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup className="h-full"> {/* Ensure Group takes full available height */}
      <SidebarMenu className="h-full justify-evenly"> {/* justify-evenly creates equal space between each item */}
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.title}
              isActive={location.pathname === item.url}
              className="py-6" // Increase padding for bigger touch targets/spacing
            >
              <Link to={item.url}>
                {item.icon && <item.icon className="size-5" />}
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}