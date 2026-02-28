'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { backendApi } from '@/services/api';
import { ArrowLeft, Save } from 'lucide-react';
import { getCurrentUserName, getCurrentUserRole } from '@/utils/userUtils';

export default function AddDesignation() {
  const router = useRouter();
  
  // ✅ FIXED: Get dynamic user data
  const userName = getCurrentUserName();
  const userRole = getCurrentUserRole();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 1,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await backendApi.post('/designations', formData);
      router.push('/designation');
    } catch (err) {
      setError('Failed to create designation. Please try again.');
      console.error('Error creating designation:', err);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/designation')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Add Designation</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. SE001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-10"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => router.push('/designation')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Designation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
