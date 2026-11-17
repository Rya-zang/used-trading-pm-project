import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "warm" | "quiet";
}) {
  const toneClass =
    tone === "quiet" ? "border border-oat bg-white" : "bg-[#f6ebe3]";
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs text-ink ${toneClass}`}>
      {children}
    </span>
  );
}
