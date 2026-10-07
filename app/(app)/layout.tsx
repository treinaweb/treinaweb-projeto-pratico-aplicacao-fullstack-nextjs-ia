import { cookies } from "next/headers";

import { requireSession } from "@/lib/auth/session";
import { hasInterviewInProgress } from "@/lib/db/repositories/interviews";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Brand } from "@/components/layout/brand";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// Shell for every signed-in page. Pages still call requireSession() themselves:
// layouts don't re-run on client navigation, so this is not the access guard.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await requireSession();
  const [cookieStore, interviewInProgress] = await Promise.all([
    cookies(),
    hasInterviewInProgress(session.user.id),
  ]);
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        user={{ name: session.user.name, email: session.user.email }}
        interviewInProgress={interviewInProgress}
      />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md backdrop-saturate-150">
          <SidebarTrigger aria-label="Alternar navegação" />
          <span className="md:hidden">
            <Brand />
          </span>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 md:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
