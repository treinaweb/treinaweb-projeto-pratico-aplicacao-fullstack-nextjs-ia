"use client";

import { useSearchParams } from "next/navigation";

// Shown on /login after a password reset (?reset=success). Render it inside
// <Suspense> so the login page stays statically prerendered.
export function ResetSuccessNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("reset") !== "success") {
    return null;
  }

  return (
    <p
      role="status"
      className="rounded-lg border border-cta/45 bg-cta/10 px-3 py-2 text-sm text-cta"
    >
      Senha redefinida. Entre com a nova senha.
    </p>
  );
}
