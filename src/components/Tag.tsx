import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-sage px-2 text-xs text-ink">
      {children}
    </span>
  );
}
