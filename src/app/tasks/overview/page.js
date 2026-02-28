"use client";

import { useState, useEffect } from "react";
import { departmentApiService } from "@/services/departmentApi.service";
import { 
    Calendar,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    Users,
    TrendingUp,
    Plus
} from "lucide-react";
import { useDepartmentRequiredGuard } from "@/hooks/useDepartmentGuard";

// Safe date formatting function to prevent hydration issues
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export default function TasksOverviewPage() {
    // 🔥 PAGE GUARD: Department required for task access
    useDepartmentRequiredGuard();
    
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        delayed: 0,
    });

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            console.log('Loading tasks for department...');
            
            // 🔥 Use department-aware API
            const tasksData = await departmentApiService.getTasks();
            console.log('Tasks loaded:', tasksData.length, 'tasks');
            
            setTasks(tasksData);

            // Calculate stats
            const total = tasksData.length;
            const completed = tasksData.filter(t => t.status === 'COMPLETED').length;
            const inProgress = tasksData.filter(t => t.status === 'IN_PROGRESS').length;
            const delayed = tasksData.filter(t => t.status === 'DELAYED').length;

            setStats({ total, completed, inProgress, delayed });
        } catch (error) {
            console.error("Failed to load tasks:", error);
            // Show user-friendly error message
            if (error.message.includes('Department information required')) {
                console.error('User department not found. Please check your profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    const summaryData = [
        { title: 'Total Tasks', value: stats.total.toString(), change: '+12%', icon: <Calendar className="h-5 w-5 text-indigo-600" /> },
        { title: 'In Progress', value: stats.inProgress.toString(), change: '+5%', icon: <PlayCircle className="h-5 w-5 text-blue-500" /> },
        { title: 'Completed', value: stats.completed.toString(), change: '+15%', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
        { title: 'Delayed', value: stats.delayed.toString(), change: '-2%', icon: <AlertCircle className="h-5 w-5 text-red-500" /> },
    ];

    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: "bg-emerald-100 text-emerald-800",
            IN_PROGRESS: "bg-blue-100 text-blue-800", 
            DELAYED: "bg-rose-100 text-rose-800",
            PENDING: "bg-amber-100 text-amber-800",
            APPROVED: "bg-emerald-100 text-emerald-800"
        };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status?.replace('_', ' ') || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Tasks Overview</h1>
                    <p className="text-sm text-slate-500">Track your team's task performance and metrics</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    New Task
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryData.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-500">{item.title}</h3>
                            <div className="p-2 bg-slate-50 rounded-lg">
                                {item.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                        <p className={`text-sm mt-2 ${item.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.change} from last month
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Tasks</h3>
                    <div className="space-y-3">
                        {tasks.slice(0, 3).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">{task.taskName}</p>
                                    <p className="text-sm text-slate-600">{task.clientName}</p>
                                </div>
                                {getStatusBadge(task.status)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Performance</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-slate-600" />
                                <span className="font-medium text-slate-900">Active Employees</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">12</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                <span className="font-medium text-slate-900">Completion Rate</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">87%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
