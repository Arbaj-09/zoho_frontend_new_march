'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Ban } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const teams = [
  { name: 'Default', locked: true },
  { name: 'Pune', locked: false },
  { name: 'Ahilyanagar', locked: false },
  { name: 'Team A', locked: false },
];

export default function TeamsPage() {
const [activeTab, setActiveTab] = useState('list');

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
                        { key: "designation", label: "Designation" , href: "/designation"},
                        { key: "teams", label: "Teams", href: "/teams" },
                    ],
                    activeTabKey: "employees"
                }}
            >
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* TOP TABS */}
      <div className="flex gap-8 border-b mb-6 text-sm font-medium">
        {['Employees', 'Admins', 'Roles', 'Designation', 'Teams'].map(
          (tab) => (
            <button
              key={tab}
              className={`pb-3 ${
                tab === 'Teams'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4">
          <h2 className="font-semibold text-gray-800">
            Total Teams (4)
          </h2>

          <div className="flex items-center gap-3">
            {/* TOGGLE BUTTONS */}
            <div className="flex border rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 border-r ${
                  activeTab === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Team List
              </button>

              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-4 py-2 ${
                  activeTab === 'hierarchy'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Team Hierarchy
              </button>
            </div>

            {/* ADD BUTTON (only in list view) */}
            {activeTab === 'list' && (
              <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        {activeTab === 'list' ? (
          /* ========= TEAM LIST TABLE ========= */
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr className="text-gray-600">
                  <th className="p-3 text-left">Team Name</th>
                  <th className="p-3 text-right pr-8">Action</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-800">
                      {team.name}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-3 pr-4">
                        {team.locked ? (
                          <Ban className="text-gray-400 w-4 h-4" />
                        ) : (
                          <>
                            <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                              <Pencil size={16} />
                            </button>
                            <button className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end p-4 text-sm text-gray-600 border-t">
              Total Rows: {teams.length}
            </div>
          </>
        ) : (
          /* ========= TEAM HIERARCHY VIEW ========= */
          <div className="m-4 bg-gray-100 rounded-lg h-[420px] flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">
              Create your Team Hierarchy
            </h3>

            <button className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700">
              Start
            </button>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
