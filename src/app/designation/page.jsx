'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Pencil, Trash2, Plus, Search, Briefcase, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { backendApi } from '@/services/api';
import { getCurrentUserName, getCurrentUserRole } from '@/utils/userUtils';

export default function DesignationPage() {
  const router = useRouter();
  
  // ✅ FIXED: Get dynamic user data
  const userName = getCurrentUserName();
  const userRole = getCurrentUserRole();
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDesignations() {
      try {
        setLoading(true);
        const data = await backendApi.get('/designations');
        if (!isMounted) return;
        setDesignations(data || []);
      } catch (err) {
        console.error('Failed to load designations', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDesignations();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDesignations = designations.filter(designation =>
    designation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designation.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await backendApi.delete(`/designations/${id}`);
      setDesignations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete designation', err);
    }
  };

  const handleCreate = () => {
    router.push('/designation/add');
  };

  return (
    <DashboardLayout
      header={{
        project: "Organization Management",
        user: {
          name: userName,
          role: userRole
        },
        notifications: [],
        tabs: [
          { key: "employees", label: "Employees", href: "/organization" },
          { key: "admins", label: "Admins", href: "/admins" },
          { key: "roles", label: "Roles", href: "/roles" },
          { key: "designation", label: "Designation", href: "/designation" },
          { key: "teams", label: "Teams", href: "/teams" },
        ],
        activeTabKey: "designation"
      }}
    >
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <h2 className="font-semibold text-gray-800">Designations ({designations.length})</h2>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search designations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none w-64"
                />
              </div>

              {/* Add Button */}
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Designation
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr className="text-left text-gray-600">
                  <th className="p-3 w-10">
                    <input type="checkbox" />
                  </th>
                  <th className="p-3">Designation Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Employees Count</th>
                  <th className="p-3 text-right pr-8">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Loading designations...
                    </td>
                  </tr>
                )}
                {!loading && filteredDesignations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      {searchTerm ? 'No designations found matching your search.' : 'No designations found.'}
                    </td>
                  </tr>
                )}
                {!loading && filteredDesignations.map((designation) => (
                  <tr
                    key={designation.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3 text-gray-800 font-medium">{designation.name}</td>
                    <td className="p-3 text-gray-600">{designation.description || 'No description'}</td>
                    <td className="p-3 text-gray-600">{designation.department?.name || 'N/A'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {designation.employeeCount || 0} employees
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/designation/${designation.id}`)}
                          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                          title="View Details"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <button 
                          onClick={() => router.push(`/designation/${designation.id}/edit`)}
                          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(designation.id)}
                          className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex justify-end items-center gap-6 p-4 text-sm text-gray-600 border-t">
            <div>
              Rows per page:
              <select className="ml-2 border rounded px-2 py-1">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
            <div>
              {filteredDesignations.length > 0 ? `1–${filteredDesignations.length} of ${filteredDesignations.length}` : '0 of 0'}
            </div>

            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                ‹
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
