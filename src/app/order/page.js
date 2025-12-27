'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function OrdersOverviewPage() {
  return (
    <DashboardLayout>
    <div className="p-4 bg-slate-50 min-h-screen">
      {/* Top Tabs */}
      <div className="flex gap-6 border-b mb-4 text-sm font-medium">
        <button className="text-blue-600 border-b-2 border-blue-600 pb-2">
          Overview
        </button>
        <button className="text-slate-500 pb-2">Orders</button>
        <button className="text-slate-500 pb-2">Products</button>
        <button className="text-slate-500 pb-2">Receipt Templates</button>
      </div>

      {/* Chart Section */}
      <div className="bg-white border rounded-md p-4 mb-4 h-40 flex items-center justify-center text-slate-400">
        Order Quantity Chart (This Week)
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border rounded-md p-4">
          <div className="text-sm font-semibold mb-2">Total orders by team</div>
          <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
            Nothing to show
          </div>
        </div>

        <div className="bg-white border rounded-md p-4">
          <div className="text-sm font-semibold mb-2">Total orders by status</div>
          <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
            Nothing to show
          </div>
        </div>

        <div className="bg-white border rounded-md p-4">
          <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
            Nothing to Show
          </div>
        </div>
      </div>

      {/* Orders Summary Header */}
      <div className="bg-white border rounded-md">
        <div className="flex flex-wrap items-center justify-between p-3 border-b gap-3">
          <div className="text-sm font-semibold">Orders Summary (0)</div>

          <div className="flex items-center gap-2 flex-wrap">
            <select className="border rounded px-2 py-1 text-sm">
              <option>Product</option>
            </select>

            <input
              type="text"
              placeholder="Search Here..."
              className="border rounded px-2 py-1 text-sm"
            />

            <input
              type="text"
              value="22-12-2025 to 28-12-2025"
              readOnly
              className="border rounded px-2 py-1 text-sm text-blue-600"
            />

            <button className="border rounded p-1 text-blue-600">🔍</button>
            <button className="border rounded p-1 text-blue-600">📊</button>
          </div>
        </div>

        {/* Empty Table Area */}
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          Nothing To Show
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
