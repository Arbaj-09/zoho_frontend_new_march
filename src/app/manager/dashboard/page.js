'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Calendar, TrendingUp, Clock, Target, Award, LogOut, BarChart3 } from 'lucide-react';

export default function ManagerDashboard() {
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");
    }
    router.push("/login");
  };

  const menuItems = [
    {
      title: "My Team",
      icon: Users,
      description: "View and manage team members",
      href: "/employees",
      color: "bg-blue-500"
    },
    {
      title: "Team Performance",
      icon: BarChart3,
      description: "Track team metrics and KPIs",
      href: "/reports/team",
      color: "bg-green-500"
    },
    {
      title: "Attendance",
      icon: Calendar,
      description: "Manage team attendance and schedules",
      href: "/attendance/team",
      color: "bg-purple-500"
    },
    {
      title: "Tasks & Projects",
      icon: Target,
      description: "Assign and track team tasks",
      href: "/tasks",
      color: "bg-orange-500"
    }
  ];

  return (
    <DashboardLayout
      header={{
        project: "Manager Dashboard",
        user: user ? { name: `${user.firstName} ${user.lastName}`, role: user.roleName } : { name: "Manager User", role: "Manager" },
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
                  Welcome back, {user?.firstName || 'Manager'}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your team and track performance
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last login</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Management</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/employees/add')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users size={20} />
                Add Team Member
              </button>
              <button
                onClick={() => router.push('/attendance/mark')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calendar size={20} />
                Mark Attendance
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/reports/team')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 size={20} />
                View Reports
              </button>
              <button
                onClick={() => router.push('/tasks/assign')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Target size={20} />
                Assign Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Team Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Attendance Rate</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-lg font-bold text-green-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-bold text-green-600">88%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Task Completion</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-blue-600">142/165</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-lg font-bold text-blue-600">86%</span>
                </div>
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
