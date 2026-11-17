import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-card bg-oat p-4">{children}</div>;
}
