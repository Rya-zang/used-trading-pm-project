import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "warm" | "quiet";
}) {
  const toneClass =
    tone === "warm" ? "bg-[#ead7b6]" : tone === "quiet" ? "border border-oat bg-cream" : "bg-sage";
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs text-ink ${toneClass}`}>
      {children}
    </span>
  );
}
