"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

const tabs = [
  { name: "Overview", href: "/tasks/overview" },
  { name: "Tasks Management", href: "/tasks/tasks-management" },
  { name: "Routes", href: "/tasks/routes" },
  { name: "PJP Requests", href: "/tasks/pjp-requests" },
];

export default function TasksLayout({ children }) {
  const pathname = usePathname();

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Tabs Bar */}
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="px-6">
            <div className="flex gap-8">
              {tabs.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`py-4 text-sm font-semibold border-b-2 transition ${
                      active
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
