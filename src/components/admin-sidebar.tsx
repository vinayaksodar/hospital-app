"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      isActive: pathname === "/admin",
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/admin/calendar",
      isActive: pathname === "/admin/calendar",
    },
    {
      title: "Doctors",
      icon: Users,
      href: "/admin/doctors",
      isActive: pathname === "/admin/doctors",
    },
    {
      title: "Patients",
      icon: Users,
      href: "/admin/patients",
      isActive: pathname === "/admin/patients",
    },
    {
      title: "Reports",
      icon: LayoutDashboard,
      href: "/admin/reports",
      isActive: pathname === "/admin/reports",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <h2 className="text-lg font-semibold">Hospital Admin</h2>
          <div className="ml-auto md:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Hospital Management System
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
