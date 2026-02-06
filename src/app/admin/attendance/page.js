'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Calendar, Filter, Search, CheckCircle, XCircle, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react';
import EnhancedToast from '@/components/EnhancedToast';

export default function AttendanceManagement() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Mock data for demonstration
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Engineering',
      status: 'Present',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM',
      totalHours: '9h 15m',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      department: 'Marketing',
      status: 'Absent',
      checkIn: '-',
      checkOut: '-',
      totalHours: '0h',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      department: 'Sales',
      status: 'Leave',
      checkIn: '-',
      checkOut: '-',
      totalHours: '0h',
      avatar: 'MJ'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      department: 'HR',
      status: 'Half-day',
      checkIn: '02:30 PM',
      checkOut: '06:00 PM',
      totalHours: '3h 30m',
      avatar: 'SW'
    },
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = attendanceData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || employee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBulkAction = (action) => {
    if (selectedEmployees.length === 0) {
      setToastMessage('Please select employees first');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    setToastMessage(`${action} action applied to ${selectedEmployees.length} employees`);
    setToastType('success');
    setShowToast(true);
    setSelectedEmployees([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 border-green-200';
      case 'Absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'Leave': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Half-day': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircle size={16} />;
      case 'Absent': return <XCircle size={16} />;
      case 'Leave': return <AlertCircle size={16} />;
      case 'Half-day': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        header={{
          project: "Attendance Management",
          user: { name: "Admin User", role: "Administrator" },
          tabs: [],
          activeTabKey: "attendance"
        }}
      >
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={{
        project: "Attendance Management",
        user: { name: "Admin User", role: "Administrator" },
        tabs: [],
        activeTabKey: "attendance"
      }}
    >
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">124</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">98</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">18</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half-day">Half-day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="flex items-center gap-2">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setToastMessage('Attendance data exported successfully');
                  setToastType('success');
                  setShowToast(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEmployees.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('Approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('Reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedEmployees([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(filteredData.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                  <th className="text-left p-4 font-medium text-gray-700">Department</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Check In</th>
                  <th className="text-left p-4 font-medium text-gray-700">Check Out</th>
                  <th className="text-left p-4 font-medium text-gray-700">Total Hours</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((employee, index) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">{employee.avatar}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{employee.department}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(employee.status)}`}>
                        {getStatusIcon(employee.status)}
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{employee.checkIn}</td>
                    <td className="p-4 text-gray-700">{employee.checkOut}</td>
                    <td className="p-4 text-gray-700 font-medium">{employee.totalHours}</td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Animated Toast */}
        <EnhancedToast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      </div>
    </DashboardLayout>
  );
}
