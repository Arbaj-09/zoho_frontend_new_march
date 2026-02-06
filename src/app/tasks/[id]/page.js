'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { backendApi } from '@/services/api';
import TaskLocationValidator from '@/components/tasks/TaskLocationValidator';
import { ArrowLeft, MapPin, Clock, User, CheckCircle, Camera, AlertCircle } from 'lucide-react';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.id;
    
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validationState, setValidationState] = useState(null);
    const [customerLocation, setCustomerLocation] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user data
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const response = await backendApi.get(`/tasks/${taskId}`);
            const taskData = response.data;
            
            setTask(taskData);
            
            // Extract customer location if available
            if (taskData.client && (taskData.client.latitude && taskData.client.longitude)) {
                setCustomerLocation({
                    lat: taskData.client.latitude,
                    lng: taskData.client.longitude,
                    address: taskData.client.address
                });
            }
            
        } catch (error) {
            console.error('Failed to fetch task details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidationChange = (validation) => {
        setValidationState(validation);
    };

    const handleStartTask = async () => {
        if (!validationState?.canOperate) {
            alert('Please reach customer location to start the task');
            return;
        }

        try {
            await backendApi.put(`/tasks/${taskId}/status`, {
                status: 'IN_PROGRESS'
            });
            
            // Refresh task details
            fetchTaskDetails();
            alert('Task started successfully!');
            
        } catch (error) {
            console.error('Failed to start task:', error);
            alert('Failed to start task. Please try again.');
        }
    };

    const handleCompleteTask = async () => {
        if (!validationState?.canOperate) {
            alert('Please reach customer location to complete the task');
            return;
        }

        // For now, just update status. In real implementation, this would include photo capture
        try {
            await backendApi.put(`/tasks/${taskId}/status`, {
                status: 'COMPLETED',
                completionNotes: 'Task completed via web interface',
                workLat: validationState.location.latitude,
                workLng: validationState.location.longitude
            });
            
            // Refresh task details
            fetchTaskDetails();
            alert('Task completed successfully!');
            
        } catch (error) {
            console.error('Failed to complete task:', error);
            alert('Failed to complete task. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'DELAYED': return 'bg-orange-100 text-orange-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
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

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Task Not Found</h2>
                    <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">Task Details</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Task Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{task.task_name}</h2>
                            <p className="text-gray-600">{task.task_description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <User size={16} />
                            <span>Assigned to: {task.assignedToEmployee?.firstName} {task.assignedToEmployee?.lastName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin size={16} />
                            <span>Priority: {task.priority || 'Normal'}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                {task.client && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600">Name:</span>
                                <p className="font-medium">{task.client.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Address:</span>
                                <p className="font-medium">{task.client.address || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Contact:</span>
                                <p className="font-medium">{task.client.contact_email || task.client.contact_phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Validation */}
                {user && task.assignedToEmployee?.id === user.id && (
                    <TaskLocationValidator
                        taskId={taskId}
                        employeeId={user.id}
                        customerLocation={customerLocation}
                        onValidationChange={handleValidationChange}
                    />
                )}

                {/* Action Buttons */}
                {user && task.assignedToEmployee?.id === user.id && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Actions</h3>
                        
                        <div className="space-y-3">
                            {task.status === 'INQUIRY' && (
                                <button
                                    onClick={handleStartTask}
                                    disabled={!validationState?.canOperate}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                        validationState?.canOperate
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {validationState?.punchInStatus === 'NOT_PUNCHED_IN' && (
                                        <span className="flex items-center justify-center gap-2">
                                            <AlertCircle size={16} />
                                            Reach Customer Location First
                                        </span>
                                    )}
                                    {validationState?.punchInStatus === 'OUTSIDE_LOCATION' && (
                                        <span className="flex items-center justify-center gap-2">
                                            <MapPin size={16} />
                                            Move Within 200m of Customer
                                        </span>
                                    )}
                                    {validationState?.canOperate && (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle size={16} />
                                            Start Task
                                        </span>
                                    )}
                                </button>
                            )}

                            {task.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={handleCompleteTask}
                                    disabled={!validationState?.canOperate}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                        validationState?.canOperate
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Camera size={16} />
                                        Complete Task
                                    </span>
                                </button>
                            )}

                            {validationState && !validationState.canOperate && (
                                <div className="text-sm text-orange-600 text-center">
                                    {validationState.validationMessage}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
