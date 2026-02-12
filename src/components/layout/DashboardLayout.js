"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const sidebarSections = [
  {
    key: "zoho",
    label: "Zoho",
    items: [
      { key: "zoho-dashboard", label: "Dashboard", href: "/", icon: "dashboard", accent: "indigo" },
      { key: "zoho-customers", label: "Customers", href: "/customers", icon: "client", accent: "emerald" },
      { key: "zoho-bank", label: "Bank", href: "/bank", icon: "bank", accent: "amber" },
      { key: "zoho-products", label: "Products", href: "/products", icon: "products", accent: "violet" },
    ],
  },
  {
    key: "unolo",
    label: "Unolo",
    items: [
      { key: "unolo-dashboard", label: "Dashboard", href: "/dashboard", icon: "dashboard", accent: "indigo" },
      { key: "unolo-attendance", label: "Attendance", href: "/attendance", icon: "attendance", accent: "cyan" },
      { key: "unolo-leave", label: "Leave", href: "/leaves", icon: "leaves", accent: "rose" },
      { key: "unolo-organization", label: "Organization", href: "/organization", icon: "org", accent: "slate" },
      { key: "unolo-form", label: "Form", href: "/form", icon: "form", accent: "teal" },
      { key: "unolo-order", label: "Order", href: "/order", icon: "order", accent: "orange" },
      { key: "unolo-sites", label: "Sites", href: "/sites", icon: "sites", accent: "lime" },
      { key: "tasks", label: "Tasks", href: "/tasks", icon: "tasks", accent: "indigo" },
    ],
  },
  {
    key: "expenses",
    label: "Expenses",
    items: [
      { key: "expenses-overview", label: "Overview", href: "/expenses", icon: "dashboard", accent: "green" },
      { key: "expenses-invoices", label: "Invoices", href: "/expenses/invoices", icon: "invoice", accent: "purple" },
    ],
  },
];

const navigationItems = sidebarSections.flatMap((s) => s.items);

export default function DashboardLayout({ header, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ disable background scroll when menu open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileMenuOpen]);

  // ✅ auth guard
  useEffect(() => {
    if (pathname === "/login") return;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (!token) router.replace("/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("auth_token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const getActiveKey = () => {
    const item = navigationItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    );
    return item?.key || "dashboard";
  };

  const getActiveTabKey = () => {
    if (!header?.tabs) return null;
    const activeTab = header.tabs.find((tab) =>
      tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
    );
    return activeTab?.key || header?.activeTabKey;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* MOBILE HAMBURGER - show only < md */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-[60] rounded-lg p-2 bg-white/85 backdrop-blur border border-slate-200 shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-[65] md:hidden"
            >
              <div className="relative h-[100dvh]">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-3 right-3 z-[80] rounded-xl p-2 bg-white/85 backdrop-blur border border-slate-200 shadow-lg"
                >
                  <X className="h-5 w-5 text-slate-800" />
                </button>

                <Sidebar
                  sections={sidebarSections}
                  brand="Yash"
                  activeKey={getActiveKey()}
                  onLogout={handleLogout}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Desktop Sidebar: md mini + lg full */}
      <div className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-[100dvh] md:z-20">
        <Sidebar
          sections={sidebarSections}
          brand="Yash"
          activeKey={getActiveKey()}
          onLogout={handleLogout}
        />
      </div>

      {/* ✅ Main content spacing */}
      <div className="flex-1 md:ml-20 lg:ml-72 min-h-screen">
        <Topbar
          tabs={header?.tabs || []}
          activeTabKey={getActiveTabKey()}
          onTabClick={(tab) => tab?.href && router.push(tab.href)}
        />

        <main className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 py-6">
          <div className="min-h-screen pb-20">{children}</div>
        </main>
      </div>
      
      {/* 🎯 Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
