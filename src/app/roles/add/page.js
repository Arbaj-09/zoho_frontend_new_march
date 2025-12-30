'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus } from 'lucide-react';


const leftPermissions = [
  'Dashboard',
  'Attendance',
  'Leaves',
  'Organization',
  'Tasks',
  'Forms',
];

const rightPermissions = [
  'Orders',
  'Expenses',
  'Clients & Sites',
  'Reports',
  'Custom Reports',
  'Settings',
  'Billing',
];

export default function AddRolePage() {
  const router = useRouter();

  return (
    <DashboardLayout
      header={{
        project: 'Organization Management',
        user: {
          name: 'Admin User',
          role: 'Administrator',
        },
        notifications: [],
        tabs: [
          { key: 'employees', label: 'Employees' },
          { key: 'admins', label: 'Admins' },
          { key: 'roles', label: 'Roles' },
          { key: 'designation', label: 'Designation' },
          { key: 'teams', label: 'Teams' },
        ],
        activeTabKey: 'roles',
      }}
    >
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700">
            Save
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border p-6 space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Enter role name"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>This must be between 5 and 45 characters</span>
              <span>0 / 45</span>
            </div>
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Role Description
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Enter role description"
              rows={3}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>This must be between 5 and 100 characters</span>
              <span>0 / 100</span>
            </div>
          </div>

          {/* Permissions */}
          {/* Assign Permissions */}
<div>
  <h3 className="text-sm font-semibold mb-4">
    Assign Permissions
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left Column */}
    <div className="space-y-3">
      {leftPermissions.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 bg-[#eaf0ff] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#dde7ff]"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white">
            <Plus size={14} />
          </div>
          <span className="text-sm font-medium text-blue-700">
            {item}
          </span>
        </div>
      ))}
    </div>

    {/* Right Column */}
    <div className="space-y-3">
      {rightPermissions.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 bg-[#eaf0ff] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#dde7ff]"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white">
            <Plus size={14} />
          </div>
          <span className="text-sm font-medium text-blue-700">
            {item}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

        </div>
      </div>
    </DashboardLayout>
  );
}
