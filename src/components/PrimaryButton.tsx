import type { ReactNode } from "react";

export function PrimaryButton({
  children,
  disabled = false,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-12 w-full items-center justify-center rounded-button bg-sage px-4 text-base font-medium text-ink active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
