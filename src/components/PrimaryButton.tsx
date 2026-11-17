import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function PrimaryButton({
  children,
  disabled = false,
  type = "button",
  variant = "primary",
  to,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "quiet";
  to?: string;
  onClick?: () => void;
}) {
  const className = [
    "inline-flex h-12 w-full items-center justify-center rounded-button px-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "quiet" ? "border border-oat bg-white text-ink" : "bg-sage text-white",
  ].join(" ");

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
