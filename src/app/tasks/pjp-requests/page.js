"use client";

import { useState, useEffect } from "react";
import { 
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    User,
    Edit2,
    Trash2,
    X
} from "lucide-react";

export default function PjpRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data for demonstration
    const mockRequests = [
        {
            id: 1,
            employeeName: "John Doe",
            requestedDate: "2024-01-20",
            reason: "Client reschedule request - Meeting moved to next week",
            status: "PENDING",
            requestedAt: "2024-01-18T09:00:00"
        },
        {
            id: 2,
            employeeName: "Jane Smith", 
            requestedDate: "2024-01-19",
            reason: "Emergency leave - Family emergency",
            status: "APPROVED",
            approvedBy: "Manager Name",
            approvedAt: "2024-01-18T14:30:00"
        },
        {
            id: 3,
            employeeName: "Mike Johnson",
            requestedDate: "2024-01-21",
            reason: "Vehicle maintenance - Delivery truck needs service",
            status: "REJECTED",
            rejectedBy: "Manager Name",
            rejectedAt: "2024-01-17T16:00:00",
            rejectionReason: "Please schedule for weekend"
        }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            APPROVED: "bg-emerald-100 text-emerald-800",
            PENDING: "bg-amber-100 text-amber-800", 
            REJECTED: "bg-rose-100 text-rose-800"
        };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status}
            </span>
        );
    };

    const handleApprove = (requestId) => {
        // Handle approve action
        console.log("Approve request:", requestId);
    };

    const handleReject = (requestId) => {
        // Handle reject action
        console.log("Reject request:", requestId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">PJP Requests</h1>
                    <p className="text-sm text-slate-500">Manage employee day-off and schedule change requests</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <Calendar className="h-4 w-4" />
                    New Request
                </button>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Requested Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {mockRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{request.employeeName}</div>
                                                <div className="text-xs text-slate-500">ID: EMP{request.id.toString().padStart(4, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{request.requestedDate}</div>
                                        <div className="text-xs text-slate-500">
                                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <p className="text-sm text-slate-900 truncate">{request.reason}</p>
                                            {request.status === "REJECTED" && request.rejectionReason && (
                                                <p className="text-xs text-rose-600 mt-1">
                                                    Note: {request.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            {getStatusBadge(request.status)}
                                            {request.status === "APPROVED" && (
                                                <p className="text-xs text-emerald-600">
                                                    Approved by {request.approvedBy}
                                                </p>
                                            )}
                                            {request.status === "REJECTED" && (
                                                <p className="text-xs text-rose-600">
                                                    Rejected by {request.rejectedBy}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {request.status === "PENDING" && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(request.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <CheckCircle className="h-3 w-3" />
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(request.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {request.status !== "PENDING" && (
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                                    <Edit2 className="h-3 w-3" />
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-500">Pending Requests</h3>
                        <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {mockRequests.filter(r => r.status === "PENDING").length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-500">Approved Today</h3>
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {mockRequests.filter(r => r.status === "APPROVED").length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-500">Rejected This Week</h3>
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {mockRequests.filter(r => r.status === "REJECTED").length}
                    </div>
                </div>
            </div>
        </div>
    );
}
