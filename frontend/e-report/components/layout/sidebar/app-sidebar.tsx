"use client"

import {
  Plus,
  Settings2,
  SquareTerminal,
  FolderOpen
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Anmol",
    email: "anmol@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      hasChilds: false
    },
    {
      title: "Cases",
      url: '/cases',
      icon: FolderOpen,
      isActive: true, // Keep it active or conditional? Probably leave as is for now or set false. The previous one was true.
      hasChilds: false
    },
    {
      title: "Analyze",
      url: "#",
      icon: Settings2,
      hasChilds: false
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="dark:border dark:border-accent dark:bg-accent/20">
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* New Case Quick Action */}
        <SidebarGroup className="px-2 py-2">
          <SidebarGroupContent>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
