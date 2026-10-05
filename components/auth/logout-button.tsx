"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isSigningOut}>
      {isSigningOut ? "Saindo..." : "Sair"}
    </Button>
  );
}
