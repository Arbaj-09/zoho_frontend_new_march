import React from 'react';
import useTaskLocationValidation from '../../hooks/useTaskLocationValidation';
import { MapPin, CheckCircle, XCircle, AlertCircle, Loader, Clock, Navigation } from 'lucide-react';

const TaskLocationValidator = ({ taskId, employeeId, onValidationChange, decision }) => {
    const {
        location,
        distance,
        canOperate,
        isValidating,
        validationMessage,
        punchInStatus,
        isTracking
    } = useTaskLocationValidation(taskId, employeeId);

    // Notify parent of validation changes
    React.useEffect(() => {
        if (onValidationChange) {
            onValidationChange({
                canOperate,
                punchInStatus,
                location,
                distance: decision?.distanceToCustomer
            });
        }
    }, [canOperate, punchInStatus, location, decision?.distanceToCustomer, onValidationChange]);

    // Get user-friendly message based on backend decision
    const getUserMessage = () => {
        // Use ONLY decision.message - NO frontend calculations
        return decision?.message || validationMessage;
    };

    const getStatusIcon = () => {
        if (isValidating) {
            return <Loader className="animate-spin" size={16} />;
        }

        if (decision) {
            switch (decision.workStatus) {
                case 'WORKING':
                    return <CheckCircle className="text-green-500" size={16} />;
                case 'NOT_AT_CUSTOMER':
                    return <XCircle className="text-red-500" size={16} />;
                case 'IDLE':
                    return <Clock className="text-orange-500" size={16} />;
                default:
                    return <Navigation className="text-gray-500" size={16} />;
            }
        }

        switch (punchInStatus) {
            case 'PUNCHED_IN':
                return <CheckCircle className="text-green-500" size={16} />;
            case 'NOT_PUNCHED_IN':
                return <XCircle className="text-red-500" size={16} />;
            case 'OUTSIDE_LOCATION':
                return <AlertCircle className="text-orange-500" size={16} />;
            default:
                return <MapPin className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = () => {
        if (isValidating) return 'text-gray-600';
        
        if (decision) {
            switch (decision.workStatus) {
                case 'WORKING':
                    return 'text-green-600';
                case 'NOT_AT_CUSTOMER':
                    return 'text-red-600';
                case 'IDLE':
                    return 'text-orange-600';
                default:
                    return 'text-gray-600';
            }
        }
        
        switch (punchInStatus) {
            case 'PUNCHED_IN':
                return 'text-green-600';
            case 'NOT_PUNCHED_IN':
                return 'text-red-600';
            case 'OUTSIDE_LOCATION':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg border p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <h3 className="font-semibold text-gray-800">Location Status</h3>
                </div>
                <div className={`text-sm ${getStatusColor()}`}>
                    {decision ? decision.workStatus?.replace('_', ' ') : (isTracking ? 'Tracking' : 'Not Tracking')}
                </div>
            </div>

            {/* Location Info */}
            {location && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>
                            Current: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Accuracy: ±{location.accuracy?.toFixed(0)}m</span>
                    </div>
                </div>
            )}

            {/* Distance to Customer - Use ONLY decision.distanceToCustomer */}
            {decision?.distanceToCustomer && (
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Distance to Customer:</span>
                        <span className={`text-sm font-medium ${decision.withinGeofence ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.round(decision.distanceToCustomer)}m
                        </span>
                    </div>
                    {!decision.withinGeofence && (
                        <div className="mt-2 text-xs text-orange-600">
                            You need to be within 200m of customer location
                        </div>
                    )}
                </div>
            )}

            {/* User-Friendly Message from Backend Decision */}
            <div className={`text-sm p-3 rounded ${
                decision?.canOperateTask ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
                {getUserMessage()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
                {!isTracking && (
                    <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                        Enable Location
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskLocationValidator;
