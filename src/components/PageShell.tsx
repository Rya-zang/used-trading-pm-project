import { useEffect, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navItems: readonly {
  to: string;
  label: string;
  end: boolean;
  icon: () => ReactNode;
}[] = [
  { to: "/", label: "首页", end: true, icon: HomeIcon },
  { to: "/roommates", label: "找室友", end: false, icon: PeopleIcon },
  { to: "/housing", label: "找房", end: false, icon: HouseIcon },
  { to: "/space", label: "合租空间", end: false, icon: SpaceIcon },
  { to: "/me", label: "我的", end: false, icon: PersonIcon },
];

export function PageShell({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = title ? `${title} · 顺心` : "顺心 · Roommate Match";
  }, [title]);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <main className="flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
          {children}
        </main>
      </div>
      <nav aria-label="底部导航" className="pointer-events-none fixed inset-x-0 bottom-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-[420px] border-t border-oat bg-cream pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none focus-visible:ring-2 focus-visible:ring-warm",
                      isActive ? "text-ink" : "text-muted",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={
                          isActive
                            ? "flex h-7 w-7 items-center justify-center rounded-full bg-sage text-ink"
                            : "flex h-7 w-7 items-center justify-center text-muted"
                        }
                      >
                        <item.icon />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="8" cy="9" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.8 18.5c.6-2.4 2.2-3.7 4.2-3.7s3.6 1.3 4.2 3.7M11.8 18.5c.6-2.4 2.2-3.7 4.2-3.7s3.6 1.3 4.2 3.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M3.5 11 12 4l8.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 10.5V19h11v-8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M11 19v-4.5h2.2V19" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SpaceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect
        x="3.5"
        y="4"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="4"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3.5"
        y="12.5"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="12.5"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="8" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.2c.9-3.1 3-4.7 6.5-4.7s5.6 1.6 6.5 4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
