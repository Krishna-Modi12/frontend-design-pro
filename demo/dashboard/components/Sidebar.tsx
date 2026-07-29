"use client";

import { forwardRef } from "react";
import type { ForwardedRef, ReactElement } from "react";
import {
  Building2,
  ChartLine,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  X,
} from "lucide-react";

export type DashboardView = "overview" | "accounts" | "revenue" | "billing" | "settings";

export interface SidebarProps {
  /** The view the main region is currently rendering. */
  current: DashboardView;
  onNavigate: (view: DashboardView) => void;
  /** Drawer state below `lg`. Above it the rail is permanent and this is ignored. */
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  view: DashboardView;
  label: string;
  icon: ReactElement;
}

const ICON = "h-4 w-4 shrink-0";

const NAV: NavItem[] = [
  { view: "overview", label: "Overview", icon: <LayoutDashboard aria-hidden="true" className={ICON} strokeWidth={1.75} /> },
  { view: "accounts", label: "Accounts", icon: <Building2 aria-hidden="true" className={ICON} strokeWidth={1.75} /> },
  { view: "revenue", label: "Revenue", icon: <ChartLine aria-hidden="true" className={ICON} strokeWidth={1.75} /> },
  { view: "billing", label: "Billing", icon: <CreditCard aria-hidden="true" className={ICON} strokeWidth={1.75} /> },
  { view: "settings", label: "Settings", icon: <Settings aria-hidden="true" className={ICON} strokeWidth={1.75} /> },
];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]";

/**
 * Persistent navigation rail. The ref lands on the drawer's close button so the
 * page can move focus into the drawer the moment it opens, and back to the
 * trigger when it closes — the two halves of a focus trap that actually works.
 */
export const Sidebar = forwardRef(function Sidebar(
  { current, onNavigate, isOpen, onClose }: SidebarProps,
  closeRef: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-[oklch(18%_0.02_264_/_0.55)] lg:hidden"
        />
      ) : null}

      <aside
        aria-label="Dashboard sections"
        className={`fixed inset-y-0 start-0 z-30 flex w-64 flex-col border-e border-[var(--color-border)] bg-[var(--color-surface-raised)] transition-transform duration-200 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:h-[100dvh] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] px-4">
          <p className="text-sm font-bold tracking-[-0.01em]">Ledgerline</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={`${FOCUS} grid size-11 place-items-center rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] lg:hidden`}
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {NAV.map((item: NavItem) => {
              const isCurrent = item.view === current;
              return (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`${FOCUS} flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 ease-out motion-reduce:transition-none ${
                      isCurrent
                        ? "bg-[var(--color-surface-sunken)] font-semibold text-[var(--color-ink)]"
                        : "font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <a
            href="/support"
            className={`${FOCUS} flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--color-ink-muted)] transition-colors duration-150 ease-out hover:text-[var(--color-ink)] motion-reduce:transition-none`}
          >
            <LifeBuoy aria-hidden="true" className={ICON} strokeWidth={1.75} />
            Support
          </a>
          <p className="mt-3 px-3 text-xs leading-5 text-[var(--color-ink-muted)]">
            Figures refresh every 90 seconds. Yesterday closes at 00:00 UTC.
          </p>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
