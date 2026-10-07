"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  UserRound,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const HOME = { href: "/dashboard", label: "Painel", icon: LayoutDashboard };

const SECTIONS = [
  { href: "/profile", label: "Perfil", icon: UserRound },
  { href: "/jobs", label: "Vagas", icon: BriefcaseBusiness },
  { href: "/resumes", label: "Currículos", icon: FileText },
  { href: "/interviews", label: "Entrevistas", icon: MessagesSquare },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  item,
  pathname,
  live = false,
}: {
  item: typeof HOME;
  pathname: string;
  live?: boolean;
}) {
  const { setOpenMobile } = useSidebar();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={live ? `${item.label} · em andamento` : item.label}
        className="data-active:text-foreground data-active:[&_svg]:text-primary"
        render={
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpenMobile(false)}
          />
        }
      >
        <span className="relative flex">
          <Icon className="size-4" />
          {live && (
            <span className="absolute -top-1 -right-1 hidden size-2 rounded-full bg-cta ring-2 ring-sidebar group-data-[collapsible=icon]:block" />
          )}
        </span>
        <span>{item.label}</span>
        {live && (
          <span className="ml-auto flex items-center group-data-[collapsible=icon]:hidden">
            <span className="size-2 rounded-full bg-cta shadow-[0_0_8px_var(--cta)]" />
            <span className="sr-only">(entrevista em andamento)</span>
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebarNav({
  interviewInProgress,
}: {
  interviewInProgress: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <NavItem item={HOME} pathname={pathname} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Preparação</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {SECTIONS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                pathname={pathname}
                live={item.href === "/interviews" && interviewInProgress}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
