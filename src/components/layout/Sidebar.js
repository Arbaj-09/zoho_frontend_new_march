"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import {
  BarChart3,
  Building2,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MapPin,
  LogOut,
  Landmark,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Calendar,
  Plus,
} from "lucide-react";

import { cn } from "@/utils/helpers";

function NavIcon({ name, className }) {
  const Icon =
    name === "dashboard"
      ? LayoutDashboard
      : name === "attendance"
      ? CalendarCheck2
      : name === "leaves"
      ? ClipboardList
      : name === "org"
      ? Building2
      : name === "pjp-requests"
      ? Calendar
      : name === "logout"
      ? LogOut
      : name === "bank"
      ? Landmark
      : name === "products"
      ? Package
      : name === "sites"
      ? MapPin
      : name === "tasks"
      ? ClipboardList
      : name === "form"
      ? Calendar
      : name === "order"
      ? ShoppingBag
      : name === "expenses"
      ? CreditCard
      : name === "client"
      ? Users
      : name === "reports"
      ? BarChart3
      : name === "settings"
      ? Settings
      : name === "plus"
      ? Plus
      : Package;

  return <Icon className={cn("h-5 w-5", className)} aria-hidden="true" />;
}

function ChevronIcon({ open }) {
  return (
    <ChevronRight
      className={cn(
        "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200",
        open ? "rotate-90" : "rotate-0"
      )}
      aria-hidden="true"
    />
  );
}

export default function Sidebar({
  brand = "Yash",
  sections = [],
  activeKey = "",
  onLogout,
  onNavigate, // ✅ (MOBILE close callback)
}) {
  const pathname = usePathname();

  const accentStyles = useMemo(
    () => ({
      indigo: {
        icon: "text-indigo-600",
        hoverIcon: "group-hover:text-indigo-600",
        hover: "hover:bg-indigo-50/70",
        active:
          "bg-gradient-to-r from-indigo-600/12 via-indigo-600/8 to-transparent text-indigo-700",
        rail: "bg-indigo-500",
      },
      emerald: {
        icon: "text-emerald-600",
        hoverIcon: "group-hover:text-emerald-600",
        hover: "hover:bg-emerald-50/70",
        active:
          "bg-gradient-to-r from-emerald-600/12 via-emerald-600/8 to-transparent text-emerald-700",
        rail: "bg-emerald-500",
      },
      amber: {
        icon: "text-amber-600",
        hoverIcon: "group-hover:text-amber-600",
        hover: "hover:bg-amber-50/70",
        active:
          "bg-gradient-to-r from-amber-600/12 via-amber-600/8 to-transparent text-amber-700",
        rail: "bg-amber-500",
      },
      slate: {
        icon: "text-slate-700",
        hoverIcon: "group-hover:text-slate-900",
        hover: "hover:bg-slate-100/70",
        active:
          "bg-gradient-to-r from-slate-700/12 via-slate-700/8 to-transparent text-slate-900",
        rail: "bg-slate-500",
      },
      rose: {
        icon: "text-rose-600",
        hoverIcon: "group-hover:text-rose-600",
        hover: "hover:bg-rose-50/70",
        active:
          "bg-gradient-to-r from-rose-600/12 via-rose-600/8 to-transparent text-rose-700",
        rail: "bg-rose-500",
      },
      cyan: {
        icon: "text-cyan-600",
        hoverIcon: "group-hover:text-cyan-600",
        hover: "hover:bg-cyan-50/70",
        active:
          "bg-gradient-to-r from-cyan-600/12 via-cyan-600/8 to-transparent text-cyan-700",
        rail: "bg-cyan-500",
      },
      violet: {
        icon: "text-violet-600",
        hoverIcon: "group-hover:text-violet-600",
        hover: "hover:bg-violet-50/70",
        active:
          "bg-gradient-to-r from-violet-600/12 via-violet-600/8 to-transparent text-violet-700",
        rail: "bg-violet-500",
      },
      orange: {
        icon: "text-orange-600",
        hoverIcon: "group-hover:text-orange-600",
        hover: "hover:bg-orange-50/70",
        active:
          "bg-gradient-to-r from-orange-600/12 via-orange-600/8 to-transparent text-orange-700",
        rail: "bg-orange-500",
      },
      lime: {
        icon: "text-lime-600",
        hoverIcon: "group-hover:text-lime-600",
        hover: "hover:bg-lime-50/70",
        active:
          "bg-gradient-to-r from-lime-600/12 via-lime-600/8 to-transparent text-lime-700",
        rail: "bg-lime-500",
      },
      teal: {
        icon: "text-teal-600",
        hoverIcon: "group-hover:text-teal-600",
        hover: "hover:bg-teal-50/70",
        active:
          "bg-gradient-to-r from-teal-600/12 via-teal-600/8 to-transparent text-teal-700",
        rail: "bg-teal-500",
      },
    }),
    []
  );

  const getAccent = (item) => accentStyles[item?.accent] || accentStyles.indigo;

  const isItemActive = (item) => {
    if (!item?.href) return false;
    if (item.href === "/") return pathname === "/";
    return pathname?.startsWith(item.href);
  };

  const [openSection, setOpenSection] = useState(sections?.[0]?.key || null);

  return (
    <aside
      className={cn(
        "h-[100dvh] w-[300px] md:w-20 lg:w-72",
        "flex flex-col",
        "px-3 py-4",
        "md:fixed md:left-0 md:top-0 md:z-10",
        "md:border md:border-white/30 md:bg-white/10 md:ring-1 md:ring-white/20 md:backdrop-blur-2xl"
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/10 shadow-[12px_0_40px_-25px_rgba(2,6,23,0.45)] ring-1 ring-white/20 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-white/20 to-slate-100/25" />

        {/* Brand */}
        <div className="relative z-10 mx-2 mt-2 flex items-center gap-3 rounded-2xl border border-white/35 bg-white/65 px-3 py-4 shadow-[0_10px_30px_-25px_rgba(2,6,23,0.32)] ring-1 ring-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/55">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-sm font-bold text-white shadow-[0_10px_30px_-15px_rgba(99,102,241,0.8)]">
            {brand?.[0] || "Y"}
          </div>
          <div className="min-w-0 block">
            <div className="truncate text-sm font-semibold text-slate-900">{brand}</div>
            <div className="truncate text-xs text-slate-500">Workforce Suite</div>
          </div>
        </div>

        {/* Menu - scrollable */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-2 pb-3 pt-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {sections?.map((section) => {
            const isOpen = openSection === section.key;

            return (
              <div
                key={section.key}
                className="rounded-2xl border border-white/30 bg-white/70 p-1 shadow-[0_10px_30px_-28px_rgba(2,6,23,0.30)] ring-1 ring-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/60"
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenSection((prev) =>
                      prev === section.key ? null : section.key
                    )
                  }
                  className={cn(
                    "group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                    "text-slate-700 hover:text-slate-900 hover:bg-white/80",
                    isOpen && "bg-white/85 shadow-sm ring-1 ring-white/50"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/60 ring-1 ring-slate-200/60">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    </span>
                    <span className="truncate">{section.label}</span>
                  </span>

                  <ChevronIcon open={isOpen} />
                </button>

                {/* Submenu */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="space-y-1 pl-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                        {section.items?.map((item) => {
                          const active = isItemActive(item);
                          const accent = getAccent(item);

                          return (
                            <Link
                              key={item.key}
                              href={item.href || "#"}
                              onClick={() => onNavigate?.()} // ✅ close on mobile
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                                "text-slate-600 hover:text-slate-900 transition-all",
                                accent.hover,
                                active && accent.active
                              )}
                            >
                              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/50 ring-1 ring-slate-200/70 group-hover:scale-[1.05] transition-transform">
                                <NavIcon
                                  name={item.icon}
                                  className={cn(
                                    active ? accent.icon : "text-slate-400"
                                  )}
                                />
                              </span>
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Logout */}
          {onLogout && (
            <>
              <div className="mt-2 border-t border-slate-200/50" />
              <button
                type="button"
                onClick={() => {
                  onNavigate?.();
                  onLogout();
                }}
                className="group mt-3 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/70 px-3 py-2.5 text-sm font-medium text-rose-600 shadow-sm ring-1 ring-white/40 transition-all hover:bg-white/85"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/60 ring-1 ring-slate-200/70">
                  <NavIcon name="logout" className="text-rose-600" />
                </span>
                <span className="truncate">Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
