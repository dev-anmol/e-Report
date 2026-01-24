"use client"

import {
  Bot,
  Plus,
  Settings2,
  SquareTerminal
} from "lucide-react"
import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import { Button } from "@/components/ui/button"
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
          title: "Case Form",
          url: `/reports/section-1`,
        },
        {
          title: "Notice Form",
          url: "/reports/section-2",
        },
        {
          title: "Interim Form",
          url: "/reports/section-3",
        },
        {
          title: "Statement Form",
          url: "/reports/section-4",
        },
        {
          title: "BondTime Form",
          url: "/reports/section-5",
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
    <Sidebar collapsible="icon" {...props} className="dark:border dark:border-accent dark:bg-accent/20">
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        
        {/* New Case Quick Action */}
        <SidebarGroup className="px-2 py-2">
          <SidebarGroupContent>
            <Link href="/cases/new" className="w-full">
              <Button className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </Link>
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
