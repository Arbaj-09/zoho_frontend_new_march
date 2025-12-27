'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ExpenseOverviewPage() {
  return (
     <DashboardLayout>
    <div className="min-h-screen bg-slate-100 p-3">
      {/* Top Tabs */}
      <div className="flex gap-6 border-b bg-white px-4 py-3 text-sm font-medium">
        <span className="text-blue-600 border-b-2 border-blue-600 pb-2">
          Expense Overview
        </span>
        <span className="text-slate-500">Conveyance Overview</span>
        <span className="text-slate-500">Expense Requests</span>
        <span className="text-slate-500">Conveyance Requests</span>
        <span className="text-slate-500">Advance Requests</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-3">
        {[
          'Total Pending Expenses',
          'Approved Expenses',
          'Overdue Pending Requests',
          'Overdue Approved Requests',
        ].map((title) => (
          <div
            key={title}
            className="bg-white border rounded-md p-3 text-sm"
          >
            <div className="font-medium">{title}</div>
            <div className="mt-2 text-lg font-semibold">
              0 (₹0)
              <span className="text-red-500 ml-1">-x%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              0 (₹0) Yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Expenses Overview */}
        <div className="bg-white border rounded-md">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <div className="font-medium text-sm">Expenses Overview</div>
            <div className="flex gap-2">
              <select className="border rounded px-2 py-1 text-sm">
                <option>Expense Quantity</option>
              </select>
              <select className="border rounded px-2 py-1 text-sm">
                <option>This Week</option>
              </select>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
            Nothing To Show
          </div>
        </div>

        {/* Right Empty Panel */}
        <div className="bg-white border rounded-md flex flex-col">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <input
              placeholder="Search Here..."
              className="border rounded px-2 py-1 text-sm w-48"
            />
            <div className="flex gap-2">
              <select className="border rounded px-2 py-1 text-sm">
                <option>Top Expenses by Teams</option>
              </select>
              <select className="border rounded px-2 py-1 text-sm">
                <option>This Week</option>
              </select>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Nothing To Show
          </div>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-white border rounded-md mt-3">
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <div className="font-medium text-sm">Pie Chart</div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>Expense Quantity</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>This Week</option>
            </select>
          </div>
        </div>
        <div className="h-36 flex items-center justify-center text-slate-400 text-sm">
          Nothing to show.
        </div>
      </div>

      {/* Expenses Table Section */}
      <div className="bg-white border rounded-md mt-3">
        <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b gap-2">
          <div className="font-medium text-sm">Expenses (0)</div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              placeholder="Search Here..."
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              value="22-12-2025 to 28-12-2025"
              readOnly
              className="border rounded px-2 py-1 text-sm text-blue-600"
            />
            <button className="border rounded p-1 text-blue-600">🔍</button>
            <button className="border rounded p-1 text-blue-600">📊</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 px-3 py-2 text-sm">
          {['Employee', 'Category', 'Teams', 'Claim Status'].map((item) => (
            <label key={item} className="flex items-center gap-1">
              <input type="checkbox" defaultChecked={item === 'Employee'} />
              {item}
            </label>
          ))}
        </div>

        {/* Empty Table */}
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Nothing To Show
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
