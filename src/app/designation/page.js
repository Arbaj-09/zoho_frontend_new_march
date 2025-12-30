'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Pencil, Trash2, Plus, X  } from 'lucide-react';
import { useState } from 'react';

const designations = [
    'None',
    'Collection Executive',
    'Filed Manager',
    'Filed Executive',
    'Banking Manager',
];

export default function DesignationPage() {
    const [open, setOpen] = useState(false);
    const [designation, setDesignation] = useState('');
    return (
        <DashboardLayout
            header={{
                project: "Organization Management",
                user: {
                    name: "Admin User",
                    role: "Administrator"
                },
                notifications: [],
                tabs: [
                    { key: "employees", label: "Employees", href: "/organization" },
                    { key: "admins", label: "Admins", href: "/admins" },
                    { key: "roles", label: "Roles", href: "/roles" },
                    { key: "designation", label: "Designation", href: "/designation" },
                    { key: "teams", label: "Teams" },
                ],
                activeTabKey: "employees"
            }}
        >
            <div className="p-6 bg-[#f8fafc] min-h-screen">
                {/* Top Tabs */}
                <div className="flex gap-8 border-b mb-6 text-sm font-medium">
                    {['Employees', 'Admins', 'Roles', 'Designation', 'Teams'].map(
                        (tab) => (
                            <button
                                key={tab}
                                className={`pb-3 ${tab === 'Designation'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-500'
                                    }`}
                            >
                                {tab}
                            </button>
                        )
                    )}
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-sm border">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4">
                        <h2 className="font-semibold text-gray-800">
                            Designations (5)
                        </h2>

                        <button
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-y">
                                <tr className="text-gray-600">
                                    <th className="p-3 text-left">Categories</th>
                                    <th className="p-3 text-right pr-8">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {designations.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b last:border-none hover:bg-gray-50"
                                    >
                                        <td className="p-4 text-gray-800">
                                            {item}
                                        </td>

                                        <td className="p-4">
                                            {item !== 'None' && (
                                                <div className="flex justify-end gap-3 pr-4">
                                                    <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 text-sm text-gray-600 border-t">
                        Total Rows: {designations.length}
                    </div>
                </div>
            </div>
            {/* ================= ADD DESIGNATION MODAL ================= */}
{open && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      onClick={() => setOpen(false)}
    />

    {/* Modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[480px] p-6 shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Add Designation
          </h3>
          <button onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-2">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
            Enter Designation *
          </label>

          <input
            value={designation}
            onChange={(e) =>
              setDesignation(e.target.value.slice(0, 100))
            }
            className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Helper Text */}
        <div className="flex justify-between text-xs text-gray-500 mb-6">
          <span>
            This must be between 3 and 100 characters
          </span>
          <span>{designation.length} / 100</span>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </>
)}

        </DashboardLayout>
    );
}
