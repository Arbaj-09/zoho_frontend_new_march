'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { backendApi } from '@/services/api';
import {
  Eye,
  Trash2,
  Check,
  X,
  IndianRupee,
  Plus,
  XCircle
} from 'lucide-react';

export default function ExpenseOverviewPage() {

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setLoading(true);
      const data = await backendApi.get('/expenses');
      setExpenses(data || []);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await backendApi.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  async function handleApprove(id) {
    const updated = await backendApi.post(`/expenses/${id}/approve`);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
  }

  async function handleReject(id) {
    const updated = await backendApi.post(`/expenses/${id}/reject`);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
  }

  async function handlePaid(id) {
    const updated = await backendApi.post(`/expenses/${id}/mark-paid`);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
  }

  const summary = {
    pending: expenses.filter(e => e.status === 'PENDING').length,
    approved: expenses.filter(e => e.status === 'APPROVED').length,
    rejected: expenses.filter(e => e.status === 'REJECTED').length,
    paid: expenses.filter(e => e.status === 'PAID').length,
  };

  const filtered = expenses.filter(e =>
    e.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Expenses</h1>
            <p className="text-sm text-gray-500">
              Manage employee expenses across departments
            </p>
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
            <Plus size={16}/>
            Add Expense
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Pending" value={summary.pending} color="yellow"/>
          <Card title="Approved" value={summary.approved} color="green"/>
          <Card title="Rejected" value={summary.rejected} color="red"/>
          <Card title="Paid" value={summary.paid} color="blue"/>
        </div>

        {/* SEARCH */}
        <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search employee or category..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full md:w-72"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-lg overflow-x-auto">

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading expenses...
            </div>
          ) : (

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Evidence</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>

                {filtered.map(e => (

                  <tr key={e.id} className="border-b hover:bg-gray-50">

                    {/* EMPLOYEE */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">

                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {e.employeeName?.charAt(0) || "U"}
                        </div>

                        <div>
                          <div className="font-medium">
                            {e.employeeName || "Unknown"}
                          </div>

                          <div className="text-xs text-gray-500">
                            {e.departmentName || "Department"}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3">
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                        {e.category}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td className="p-3 font-semibold text-green-600">
                      ₹{e.amount}
                    </td>

                    {/* DATE */}
                    <td className="p-3">
                      {new Date(e.expenseDate).toLocaleDateString()}
                    </td>

                    {/* EVIDENCE */}
                    <td className="p-3">

                      {e.receiptUrl ? (

                        e.receiptUrl.match(/\.(jpg|jpeg|png)$/i) ?

                          <img
                            src={`http://localhost:8080${e.receiptUrl}`}
                            onClick={() => setPreviewImage(e.receiptUrl)}
                            className="w-10 h-10 rounded object-cover border cursor-pointer"
                          />

                          :

                          <a
                            href={`http://localhost:8080${e.receiptUrl}`}
                            target="_blank"
                            className="text-indigo-600 text-xs underline"
                          >
                            View
                          </a>

                      ) : (
                        <span className="text-gray-400 text-xs">
                          None
                        </span>
                      )}

                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      <StatusBadge status={e.status}/>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={()=>setSelectedExpense(e)}
                          className="p-2 bg-gray-100 rounded"
                        >
                          <Eye size={14}/>
                        </button>

                        {e.status === "PENDING" && (
                          <>
                            <button onClick={()=>handleApprove(e.id)} className="p-2 bg-green-100 text-green-700 rounded">
                              <Check size={14}/>
                            </button>

                            <button onClick={()=>handleReject(e.id)} className="p-2 bg-red-100 text-red-700 rounded">
                              <X size={14}/>
                            </button>
                          </>
                        )}

                        {e.status === "APPROVED" && (
                          <button onClick={()=>handlePaid(e.id)} className="p-2 bg-blue-100 text-blue-700 rounded">
                            <IndianRupee size={14}/>
                          </button>
                        )}

                        <button onClick={()=>handleDelete(e.id)} className="p-2 bg-red-100 text-red-700 rounded">
                          <Trash2 size={14}/>
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

      {/* IMAGE MODAL */}
      {previewImage && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={()=>setPreviewImage(null)}
          />

          <div className="relative bg-white p-4 rounded-lg shadow-lg">

            <button
              onClick={()=>setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full shadow"
            >
              <XCircle size={22}/>
            </button>

            <img
              src={`http://localhost:8080${previewImage}`}
              className="max-w-[500px] rounded"
            />

          </div>

        </div>

      )}

      {/* VIEW MODAL */}
      {selectedExpense && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={()=>setSelectedExpense(null)}
          />

          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px]">

            <button
              onClick={()=>setSelectedExpense(null)}
              className="absolute top-3 right-3"
            >
              <XCircle size={20}/>
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Expense Details
            </h2>

            <p><b>Employee:</b> {selectedExpense.employeeName}</p>
            <p><b>Department:</b> {selectedExpense.departmentName}</p>
            <p><b>Category:</b> {selectedExpense.category}</p>
            <p><b>Amount:</b> ₹{selectedExpense.amount}</p>
            <p><b>Description:</b> {selectedExpense.description}</p>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}

/* COMPONENTS */

function Card({title,value,color}){

  const colors={
    yellow:"text-yellow-600",
    green:"text-green-600",
    red:"text-red-600",
    blue:"text-blue-600"
  }

  return(
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-semibold ${colors[color]}`}>
        {value}
      </div>
    </div>
  )
}

function StatusBadge({status}){

  const map={
    APPROVED:"bg-green-100 text-green-700",
    REJECTED:"bg-red-100 text-red-700",
    PAID:"bg-blue-100 text-blue-700",
    PENDING:"bg-yellow-100 text-yellow-700"
  }

  return(
    <span className={`px-2 py-1 text-xs rounded-full ${map[status]||map.PENDING}`}>
      {status}
    </span>
  )
}