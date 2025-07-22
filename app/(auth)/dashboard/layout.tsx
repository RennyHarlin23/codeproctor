import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout(props: {
  children: React.ReactNode;
  admin: React.ReactNode;
  staff: React.ReactNode;
  student: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {props.admin    }
      </SidebarInset>
    </SidebarProvider>
  );
}
