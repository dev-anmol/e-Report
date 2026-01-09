'use client'

import Header from "@/components/layout/header/app-header";
import Footer from "@/components/layout/footer/app-footer";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden google-sans-regular ">
        {/* Sidebar controls its own width */}
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 bg-neutral-50 dark:bg-[#0A0A0A] overflow-auto p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
