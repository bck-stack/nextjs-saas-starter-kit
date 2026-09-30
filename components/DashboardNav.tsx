"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutDashboard, Settings } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 px-4 py-4 md:flex-1 md:flex-col md:py-6">
      {LINKS.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
              active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
