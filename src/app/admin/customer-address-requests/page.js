'use client';

import { useState, useEffect } from 'react';
import { backendApi } from '@/services/api';
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar } from 'lucide-react';

/**
 * 🧑‍💼 Admin Panel (Next.js)
 * Address Edit Request Screen
 * /admin/customer-address-requests
 */
export default function CustomerAddressRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [showAddressTypeDropdown, setShowAddressTypeDropdown] = useState(null);

    useEffect(() => {
        fetchAddressEditRequests();
    }, [filter]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAddressTypeDropdown && !event.target.closest('.address-type-dropdown')) {
                setShowAddressTypeDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAddressTypeDropdown]);

    const handleAddressTypeSelect = async (requestId, addressType) => {
        try {
            await backendApi.put(`/api/customer-address-edit-requests/${requestId}/update-address-type`, { addressType });
            
            // Update local state
            setRequests(requests.map(req => 
                req.id === requestId 
                    ? { ...req, addressType }
                    : req
            ));
            
            setShowAddressTypeDropdown(null);
            
            // Send notification to admin panel
            alert(`Address type updated to ${addressType} for request #${requestId}`);
            
        } catch (error) {
            console.error('Failed to update address type:', error);
            alert('Failed to update address type');
        }
    };

    const fetchAddressEditRequests = async () => {
        try {
            setLoading(true);
            const response = await backendApi.get(`/api/customer-address-edit-requests?status=${filter}`);
            setRequests(response.data || []);
        } catch (error) {
            console.error('Failed to fetch address edit requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await backendApi.put(`/api/customer-address-edit-requests/${requestId}/approve`);
            
            // Update local state
            setRequests(requests.map(req => 
                req.id === requestId 
                    ? { ...req, status: 'APPROVED', approvedAt: new Date().toISOString() }
                    : req
            ));
            
            alert('Address edit request approved successfully!');
            
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await backendApi.put(`/api/customer-address-edit-requests/${requestId}/reject`);
            
            // Update local state
            setRequests(requests.map(req => 
                req.id === requestId 
                    ? { ...req, status: 'REJECTED', approvedAt: new Date().toISOString() }
                    : req
            ));
            
            alert('Address edit request rejected!');
            
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Failed to reject request');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="text-green-500" size={20} />;
            case 'REJECTED': return <XCircle className="text-red-500" size={20} />;
            case 'PENDING': return <Clock className="text-orange-500" size={20} />;
            default: return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">Customer Address Edit Requests</h1>
                    <p className="text-gray-600 mt-1">Review and approve employee address edit requests</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    filter === status
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status} ({requests.filter(r => r.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {filter.toLowerCase()} requests</h3>
                        <p className="text-gray-600">
                            {filter === 'PENDING' 
                                ? 'No address edit requests waiting for approval' 
                                : `No ${filter.toLowerCase()} address edit requests found`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Request Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Address Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(request.status)}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Request #{request.id}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.customerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {request.customerId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative address-type-dropdown">
                                                    <button
                                                        onClick={() => setShowAddressTypeDropdown(request.id)}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                                    >
                                                        {request.addressType || 'Select Type'}
                                                        <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {/* Address Type Dropdown */}
                                                    {showAddressTypeDropdown === request.id && (
                                                        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                                            <div className="py-1">
                                                                {['PRIMARY', 'POLICE', 'POST', 'TAHSIL'].map((type) => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => handleAddressTypeSelect(request.id, type)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                                                type === 'PRIMARY' ? 'bg-green-500' :
                                                                                type === 'POLICE' ? 'bg-blue-500' :
                                                                                type === 'POST' ? 'bg-yellow-500' :
                                                                                'bg-purple-500'
                                                                            }`}></div>
                                                                            {type}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.employeeName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.employeeEmail}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                                {request.approvedAt && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {new Date(request.approvedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {request.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                        >
                                                            <CheckCircle size={14} className="mr-1" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            <XCircle size={14} className="mr-1" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {request.status !== 'PENDING' && (
                                                    <span className="text-sm text-gray-500">
                                                        {request.status.toLowerCase()}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
