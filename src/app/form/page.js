'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState("forms");

  return (
     <DashboardLayout>
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Forms</h1>

          {/* Tabs */}
          <div className="flex gap-6 mt-2 border-b">
            <button
              onClick={() => setActiveTab("forms")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "forms"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500"
              }`}
            >
              Forms
            </button>

            <button
              onClick={() => setActiveTab("responses")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "responses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500"
              }`}
            >
              Forms Responses
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search Here..."
            className="h-9 w-56 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button className="h-9 w-9 rounded-md border border-slate-300 flex items-center justify-center">
            🔍
          </button>

          <button className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
            + Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3 text-left">Form Title</th>
              <th className="px-4 py-3 text-left">Form Description</th>
              <th className="px-4 py-3 text-left">Last Modified At</th>
              <th className="px-4 py-3 text-left">Create At</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">
                <input type="checkbox" />
              </td>
              <td className="px-4 py-3">Meeting feedback</td>
              <td className="px-4 py-3">Meeting feedback</td>
              <td className="px-4 py-3">04-04-2024</td>
              <td className="px-4 py-3">07-10-2021</td>
              <td className="px-4 py-3 text-center text-slate-500">
                —
              </td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3">
                <input type="checkbox" />
              </td>
              <td className="px-4 py-3">Guarantor Form</td>
              <td className="px-4 py-3">Guarantor Form</td>
              <td className="px-4 py-3">24-12-2022</td>
              <td className="px-4 py-3">05-07-2022</td>
              <td className="px-4 py-3 text-center flex justify-center gap-3">
                ✏️
                🗑️
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600 border-t">
          <div>
            Rows per page:
            <select className="ml-2 border rounded px-1">
              <option>20</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>1–2 of 2</span>
            <button className="opacity-50">◀</button>
            <button className="opacity-50">▶</button>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
