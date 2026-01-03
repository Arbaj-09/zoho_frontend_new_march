'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { backendApi } from '@/services/api';
import { ArrowLeft, Save, Users, UserPlus, Building2 } from 'lucide-react';

export default function AddTeam() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    teamLeadId: '',
    memberIds: [],
    parentTeamId: ''
  });
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await backendApi.get('/employees');
      console.log('Employees loaded:', data);
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await backendApi.get('/teams');
      console.log('Teams loaded:', data);
      setTeams(data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberChange = (employeeId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      memberIds: isChecked 
        ? [...prev.memberIds, employeeId]
        : prev.memberIds.filter(id => id !== employeeId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting team data:', formData);

    try {
      const response = await backendApi.post('/teams', formData);
      console.log('Team created successfully:', response);
      router.push('/teams');
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          { key: "teams", label: "Teams", href: "/teams" },
        ],
        activeTabKey: "teams"
      }}
    >
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/teams')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Add Team</h1>
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
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Backend Team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
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
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team description..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Parent Team (Sub-Team Hierarchy)
                </label>
                {teamsLoading ? (
                  <div className="text-gray-500">Loading teams...</div>
                ) : (
                  <select
                    name="parentTeamId"
                    value={formData.parentTeamId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Parent Team (Root Team)</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.teamLeadName && `(${team.teamLeadName})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Lead *
                </label>
                {employeesLoading ? (
                  <div className="text-gray-500">Loading employees...</div>
                ) : (
                  <select
                    name="teamLeadId"
                    value={formData.teamLeadId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Team Lead</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId || emp.userId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Team Members
                </label>
                {employeesLoading ? (
                  <div className="text-gray-500">Loading employees...</div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {employees.map(emp => (
                        <label key={emp.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.memberIds.includes(emp.id)}
                            onChange={(e) => handleMemberChange(emp.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {emp.firstName} {emp.lastName} ({emp.employeeId || emp.userId})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {formData.memberIds.length} members
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => router.push('/teams')}
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
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
