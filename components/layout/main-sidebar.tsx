"use client";

import {
  BarChart3,
  History,
  MessageCircle,
  Settings,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/chat",
    label: "AI相談",
    icon: MessageCircle
  },
  {
    href: "/history",
    label: "相談履歴",
    icon: History
  },
  {
    href: "/profile",
    label: "子どもプロファイル",
    icon: UserRound
  },
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: BarChart3
  },
  {
    href: "/settings",
    label: "設定",
    icon: Settings
  }
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white px-4 py-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:px-5 md:py-6">
      <Link href="/chat">
        <BrandLogo />
      </Link>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/30",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-md border border-slate-200 bg-slate-50 p-4 md:block">
        <p className="text-xs font-semibold text-slate-500">今月の相談</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">3回</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          無料プランの上限まで利用できます。
        </p>
      </div>
    </aside>
  );
}
