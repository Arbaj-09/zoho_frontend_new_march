'use client';
import { useState, useRef } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Clock,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    Circle,
    ChevronRight,
    ClipboardList,
    MoreVertical,
    ArrowUpDown,
    Plus,
    ChevronLeft,
    Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DashboardLayout from '@/components/layout/DashboardLayout';


// Card Component
function Card({ className, children }) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ className, children }) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

function CardTitle({ className, children }) {
    return (
        <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
}

function CardContent({ className, children }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

// Button Component
function Button({
    variant = "primary",
    size = "default",
    className = "",
    children,
    ...props
}) {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        link: "text-indigo-600 hover:text-indigo-700 bg-transparent",
    };

    const sizes = {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={`
        inline-flex items-center justify-center rounded-md font-medium 
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 focus-visible:ring-indigo-500 
        disabled:opacity-50
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.default}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}

export default function TasksPage() {

    const [date, setDate] = useState(new Date());
    const dateRef = useRef(null);    // Sample data
    const summaryData = [
        { title: 'Total Tasks', value: '1,234', change: '+12%', icon: <ClipboardList className="h-5 w-5" /> },
        { title: 'Not Started', value: '234', change: '+5%', icon: <Circle className="h-5 w-5 text-gray-400" /> },
        { title: 'Delayed', value: '12', change: '-2%', icon: <AlertCircle className="h-5 w-5 text-red-500" /> },
        { title: 'In Progress', value: '45', change: '+8%', icon: <PlayCircle className="h-5 w-5 text-blue-500" /> },
        { title: 'Completed', value: '943', change: '+15%', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    ];

    const taskOverviewData = [
        { name: 'Jan', value: 65 },
        { name: 'Feb', value: 59 },
        { name: 'Mar', value: 80 },
        { name: 'Apr', value: 81 },
        { name: 'May', value: 56 },
        { name: 'Jun', value: 55 },
        { name: 'Jul', value: 40 },
    ];

    const taskDistributionData = [
        { name: 'Completed', value: 60, color: '#10B981' },
        { name: 'In Progress', value: 30, color: '#3B82F6' },
        { name: 'Not Started', value: 10, color: '#9CA3AF' },
    ];

    const employeeProgress = [
        { name: 'John Doe', role: 'Developer', progress: 75, tasks: 12 },
        { name: 'Jane Smith', role: 'Designer', progress: 60, tasks: 8 },
        { name: 'Mike Johnson', role: 'Manager', progress: 45, tasks: 5 },
        { name: 'Sarah Williams', role: 'Developer', progress: 30, tasks: 3 },
        { name: 'David Brown', role: 'Tester', progress: 20, tasks: 2 },
    ];

    return (
         <DashboardLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500">Manage your team's tasks and progress</p>
                </div>

            </div>

            {/* Search and Filter Section */}


            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
                {summaryData.map((item, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {item.title}
                            </CardTitle>
                            <div className={`p-1.5 rounded-md ${index === 2 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                {item.icon}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                            <p className={`text-xs mt-1 ${item.change.startsWith('+') ? 'text-green-600' : item.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                                {item.change} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                {/* Tasks Overview Chart */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Tasks Overview</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">Total tasks completed over time</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></div>
                                <span className="text-xs text-gray-500">This year</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-gray-500"
                            >
                                This Month
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={taskOverviewData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barCategoryGap="20%"
                            >
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#F3F4F6"
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickMargin={10}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px',
                                    }}
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="url(#colorBar)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={12}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Right Side Cards */}
                <div className="space-y-6">
                    {/* Average Time Spent */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Average Time Spent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-3xl font-bold">4h 23m</div>
                            <p className="text-sm text-gray-500">
                                +12% from last week
                            </p>
                            <div className="h-2 w-full rounded-full bg-gray-200 mt-4">
                                <div
                                    className="h-2 rounded-full"
                                    style={{
                                        width: '65%',
                                        background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)'
                                    }}
                                ></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* OTP Unverified Task */}
                    <Card className="border-l-4 border-red-500">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-red-700">
                                    OTP Unverified Task
                                </CardTitle>
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold text-red-700">12</div>
                            <p className="text-sm text-red-600 mb-2">Needs attention</p>
                            <Button
                                variant="link"
                                className="h-auto p-0 text-red-600 hover:text-red-800 text-sm"
                            >
                                View Details <ChevronRight className="h-4 w-4 inline" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Task Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center">
                            <div className="relative h-48 w-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {taskDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                    <div className="text-2xl font-bold">1,234</div>
                                    <div className="text-sm text-gray-500">Total Tasks</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {taskDistributionData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="mr-2 h-3 w-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Task Status */}


                {/* Employee Task Progress */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle>Employee Task Progress</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">Track individual employee performance</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Search employees..."
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full sm:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option>This Month</option>
                                            <option>Last Month</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full sm:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option>Top Performing Employee</option>
                                            <option>Top Performing Clients</option>
                                            <option>Top Performing Teams</option>
                                            <option>Top Employees According to task not started</option>
                                            <option>Low Performing Employee</option>
                                            <option>Low Performing Clients</option>
                                            <option>Low Performing Teams</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {employeeProgress.map((employee, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 max-w-[50%]">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{employee.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 max-w-[50%] pl-4">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span className="font-medium">{employee.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full"
                                                style={{
                                                    width: `${employee.progress}%`,
                                                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{employee.tasks} tasks</span>
                                            <span>Due: {employee.tasks * 2} days</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Task Summary */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <div className="flex flex-col gap-4">

                            {/* Top Row */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                {/* Left Side */}
                                <div>
                                    <CardTitle>Task Summary</CardTitle>

                                    {/* Checkboxes */}
                                    <div className="flex items-center gap-6 mt-2">
                                        {['Employee', 'Team', 'Client'].map((label, index) => (
                                            <label
                                                key={label}
                                                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={index === 0}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side Controls */}
                                <div className="flex flex-wrap items-center gap-3">

                                    {/* Search */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search Here..."
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Task Type */}
                                    <div className="relative">
                                        <select className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500">
                                            <option>Document</option>
                                            <option>Check-In Task</option>
                                            <option>Add Client</option>
                                            <option>Default Task</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Status */}
                                    <div className="relative">
                                        <select className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500">
                                            <option>Completed</option>
                                            <option>Pending</option>
                                            <option>In Progress</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Date & Time */}
                                    <div className="relative w-[220px]">
                                        <DatePicker
                                            ref={dateRef}
                                            selected={date}
                                            onChange={(d) => setDate(d)}
                                            showTimeSelect
                                            timeIntervals={15}
                                            dateFormat="dd-MM-yyyy h:mm aa"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
                                            placeholderText="Select date & time"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => dateRef.current?.setFocus()}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>          </div>

                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

            </div>
        </div>
        </DashboardLayout>
    );
}