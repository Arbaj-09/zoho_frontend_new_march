'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Clock, Calendar, User, LogOut, Coffee, Target, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem("user_data");
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (_e) {
      return null;
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");
    }
    router.push("/login");
  };

  const handleCheckIn = () => {
    // In real app, this would call attendance API
    alert('Check-in functionality would be implemented here');
  };

  const handleCheckOut = () => {
    // In real app, this would call attendance API
    alert('Check-out functionality would be implemented here');
  };

  const menuItems = [
    {
      title: "My Profile",
      icon: User,
      description: "View and update your profile information",
      href: "/profile",
      color: "bg-blue-500"
    },
    {
      title: "Attendance",
      icon: Calendar,
      description: "View your attendance history and records",
      href: "/attendance/my",
      color: "bg-green-500"
    },
    {
      title: "My Tasks",
      icon: Target,
      description: "View assigned tasks and deadlines",
      href: "/tasks/my",
      color: "bg-purple-500"
    },
    {
      title: "Leave Requests",
      icon: Coffee,
      description: "Apply for leave and view status",
      href: "/leave",
      color: "bg-orange-500"
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <DashboardLayout
      header={{
        project: "Employee Dashboard",
        user: user ? { name: `${user.firstName} ${user.lastName}`, role: user.roleName } : { name: "Employee User", role: "Employee" },
        notifications: [],
        tabs: [],
        activeTabKey: "dashboard"
      }}
    >
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.firstName || 'Employee'}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Here&apos;s your dashboard for today
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(currentTime)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check In</p>
                <p className="text-lg font-bold text-gray-900">9:00 AM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-green-600">Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Today</p>
                <p className="text-lg font-bold text-gray-900">6.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Due</p>
                <p className="text-lg font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Attendance Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              className="flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Clock size={20} />
              Check Out
            </button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Employee ID:</span>
                <span className="text-sm font-medium text-gray-900">{user?.employeeId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="text-sm font-medium text-gray-900">{user?.departmentName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Team:</span>
                <span className="text-sm font-medium text-gray-900">{user?.teamName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Manager:</span>
                <span className="text-sm font-medium text-gray-900">{user?.reportingManagerName || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Checked in today</span>
                </div>
                <span className="text-xs text-gray-500">9:00 AM</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Task completed</span>
                </div>
                <span className="text-xs text-gray-500">Yesterday</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Leave request submitted</span>
                </div>
                <span className="text-xs text-gray-500">3 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 ${item.color} rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
