"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function FieldSettingsIndex() {
  return (
    <DashboardLayout
      header={{
        project: "Field Settings",
        user: { name: "Admin User", role: "Administrator" },
        notifications: [],
      }}
    >
      <div className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-slate-900">Field Settings</div>
          <p className="text-sm text-slate-500">Configure dynamic fields for CRM modules.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/settings/fields/products" className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 hover:bg-slate-50 transition-colors">
            <div className="text-sm font-semibold text-slate-900">Product Fields</div>
            <div className="mt-1 text-xs text-slate-500">Manage Product FieldDefinitions</div>
          </Link>
          <Link href="/settings/fields/banks" className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 hover:bg-slate-50 transition-colors">
            <div className="text-sm font-semibold text-slate-900">Bank Fields</div>
            <div className="mt-1 text-xs text-slate-500">Manage Bank FieldDefinitions</div>
          </Link>
          <Link href="/settings/fields/deals" className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 hover:bg-slate-50 transition-colors">
            <div className="text-sm font-semibold text-slate-900">Deal Fields</div>
            <div className="mt-1 text-xs text-slate-500">Manage Deal FieldDefinitions</div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
