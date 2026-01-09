"use client"

import {
  Bot,
  Settings2,
  SquareTerminal
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      hasChilds: false
    },
    {
      title: "Reports",
      url: "#",
      icon: Bot,
      hasChilds: true,
      items: [
        {
          title: "Form-1",
          url: "#",
        },
        {
          title: "Form-2",
          url: "#",
        },
        {
          title: "Form-3",
          url: "#",
        },
      ],
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
