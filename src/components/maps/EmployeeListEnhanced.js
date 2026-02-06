import React from "react";
import { MapPin, Clock, CheckCircle, AlertCircle, User, Navigation } from "lucide-react";

export default function EmployeeList({ 
  employees, 
  searchText, 
  selectedId, 
  onSelectEmployee 
}) {
  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get admin display text based on backend decision
  const getAdminStatusText = (emp) => {
    const decision = emp.decision;
    
    if (!decision) {
      return emp.status?.replace('_', ' ') || 'UNKNOWN';
    }

    // Use ONLY decision.message - NO frontend calculations
    return decision.message || decision.workStatus?.replace('_', ' ') || 'UNKNOWN';
  };

  const getAdminStatusColor = (emp) => {
    const decision = emp.decision;
    
    if (!decision) {
      switch (emp.status) {
        case 'PUNCHED_IN': return 'text-green-600 bg-green-50';
        case 'OFFLINE': return 'text-gray-600 bg-gray-50';
        case 'IDLE': return 'text-orange-600 bg-orange-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    }

    switch (decision.workStatus) {
      case 'WORKING': return 'text-green-600 bg-green-50';
      case 'NOT_AT_CUSTOMER': return 'text-orange-600 bg-orange-50';
      case 'IDLE': return 'text-orange-600 bg-orange-50';
      case 'NOT_WORKING': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAdminStatusIcon = (emp) => {
    const decision = emp.decision;
    
    if (!decision) {
      switch (emp.status) {
        case 'PUNCHED_IN': return <CheckCircle size={14} className="text-green-600" />;
        case 'IDLE': return <AlertCircle size={14} className="text-orange-600" />;
        default: return <Clock size={14} className="text-gray-600" />;
      }
    }

    switch (decision.workStatus) {
      case 'WORKING': return <CheckCircle size={14} className="text-green-600" />;
      case 'NOT_AT_CUSTOMER': return <MapPin size={14} className="text-orange-600" />;
      case 'IDLE': return <AlertCircle size={14} className="text-orange-600" />;
      default: return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatDistance = (meters) => {
    if (!meters) return null;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  // Get admin details based on backend decision
  const getAdminDetails = (emp) => {
    const decision = emp.decision;
    const details = [];

    if (!decision) {
      // Fallback to old format
      if (emp.isPunchedIn) {
        details.push(
          <div key="punch" className="flex items-center gap-2 text-green-600">
            <CheckCircle size={12} />
            <span>Punched In</span>
            {emp.activeTask && (
              <span className="text-gray-500">• {emp.activeTask.name || `Task #${emp.activeTask.id}`}</span>
            )}
          </div>
        );
      }

      if (emp.distanceToCustomer !== null) {
        details.push(
          <div key="distance" className="flex items-center gap-2">
            <MapPin size={12} className="text-blue-500" />
            <span className={emp.distanceToCustomer <= 200 ? 'text-green-600' : 'text-red-600'}>
              {formatDistance(emp.distanceToCustomer)} from customer
            </span>
            {emp.distanceToCustomer <= 200 && (
              <span className="text-green-500">• In Range</span>
            )}
          </div>
        );
      }

      return details;
    }

    // Use ONLY decision object - NO frontend logic
    if (decision.distanceToCustomer !== undefined) {
      details.push(
        <div key="distance" className="flex items-center gap-2">
          <MapPin size={12} className="text-blue-500" />
          <span className={decision.withinGeofence ? 'text-green-600' : 'text-red-600'}>
            {formatDistance(decision.distanceToCustomer)} from customer
          </span>
          {decision.withinGeofence && (
            <span className="text-green-500">• In Range</span>
          )}
        </div>
      );
    }

    // blockedReason as small technical tag (optional)
    if (decision.blockedReason) {
      details.push(
        <div key="blocked-reason" className="text-xs text-gray-400">
          [{decision.blockedReason}]
        </div>
      );
    }

    return details;
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <User size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No employees found</p>
        </div>
      ) : (
        filtered.map(emp => (
          <div
            key={emp.id}
            onClick={() => onSelectEmployee(emp)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              selectedId === emp.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-900">{emp.name}</h3>
                <p className="text-xs text-gray-500">{emp.role}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAdminStatusColor(emp)}`}>
                {getAdminStatusIcon(emp)}
                {getAdminStatusText(emp)}
              </div>
            </div>

            {/* Admin Panel Details - Display backend decision exactly */}
            <div className="space-y-1 text-xs">
              {getAdminDetails(emp)}

              {emp.currentAddress && (
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin size={12} className="mt-0.5" />
                  <span className="truncate">{emp.currentAddress}</span>
                </div>
              )}

              {emp.lastUpdate && (
                <div className="text-gray-400">
                  Last seen: {emp.lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {emp.currentAddress && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {emp.currentAddress}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
