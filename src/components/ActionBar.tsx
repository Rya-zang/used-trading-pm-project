import type { ReactNode } from "react";

export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20">
      <div className="mx-auto flex w-full max-w-[420px] gap-2 border-t border-[#eeeeea] bg-white px-5 py-3">
        {children}
      </div>
    </div>
  );
}
