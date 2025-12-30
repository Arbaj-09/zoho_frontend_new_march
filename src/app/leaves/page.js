'use client';

import { CalendarDays, FileText, ClipboardList } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function LeaveOverviewPage() {
  return (
    <DashboardLayout>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 px-6 pt-4">
        <Tab active icon={<ClipboardList size={16} />} label="Overview" />
        <Tab icon={<FileText size={16} />} label="Leaves Requests" />
        <Tab icon={<CalendarDays size={16} />} label="Leave Balance" />
        <Tab icon={<CalendarDays size={16} />} label="Comp Off Credit Request" />
      </div>

      {/* Content */}
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Card */}
          <Card
            title="Approved Leaves by Type"
            filterLabel="Select Month and Year"
            filterValue="December 2025"
          />

          {/* Right Card */}
          <Card
            title="Approved Leaves"
            filterLabel="Select Year"
            filterValue="2025"
          />

        </div>
      </div>
    </DashboardLayout>
  );
}

/* ------------------ Components ------------------ */

function Tab({ label, icon, active = false }) {
  return (
    <button
      className={`flex items-center gap-2 pb-3 text-sm font-medium ${
        active
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Card({ title, filterLabel, filterValue }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[420px] relative">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>

        <div className="flex flex-col text-xs text-gray-500">
          <span className="mb-1">{filterLabel}</span>
          <button className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
            {filterValue}
            <CalendarDays size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-gray-400 font-medium">
          No Data Available
        </p>
      </div>

    </div>
  );
}
