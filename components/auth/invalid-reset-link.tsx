import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function InvalidResetLink() {
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="text-sm text-body">
        Este link é inválido ou expirou. Os links de redefinição valem por 1
        hora e só podem ser usados uma vez.
      </p>
      <Link
        href="/forgot-password"
        className={buttonVariants({ variant: "cta", size: "lg" })}
      >
        Pedir um novo link
      </Link>
    </div>
  );
}
