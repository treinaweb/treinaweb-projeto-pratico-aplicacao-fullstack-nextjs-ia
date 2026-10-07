import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { AppSidebarNav } from "@/components/layout/app-sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  interviewInProgress,
}: {
  user: { name: string; email: string };
  interviewInProgress: boolean;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent group-data-[collapsible=icon]:p-0!"
              render={<Link href="/dashboard" aria-label="TWJobs AI — painel" />}
            >
              <Brand />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarNav interviewInProgress={interviewInProgress} />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu name={user.name} email={user.email} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
