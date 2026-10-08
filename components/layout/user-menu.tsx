"use client";

import Link from "next/link";
import { ChevronsUpDown, KeyRound, LogOut, UserRound } from "lucide-react";

import { useSignOut } from "@/components/auth/use-sign-out";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { signOut, isSigningOut } = useSignOut();

  const identity = (
    <>
      <Avatar>
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left leading-tight">
        <span className="truncate text-sm font-medium text-foreground">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </span>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent"
                aria-label="Abrir menu da conta"
              />
            }
          >
            {identity}
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={8}
            className="w-60"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 px-1.5 py-1.5 font-normal">
                {identity}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href="/profile" onClick={() => setOpenMobile(false)} />}
            >
              <UserRound />
              Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/account" onClick={() => setOpenMobile(false)} />}
            >
              <KeyRound />
              Minha conta
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onClick={signOut}
            >
              <LogOut />
              {isSigningOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
