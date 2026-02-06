import React from "react";
import { CheckCircle, Clock, MapPin, User, Calendar } from "lucide-react";

export default function TaskList({ tasks }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'INQUIRY': return 'text-orange-600 bg-orange-50';
      case 'PENDING': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Calendar size={18} />
        Assigned Tasks
      </h3>
      
      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <Clock size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No tasks assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">{task.name}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              {/* Client Information */}
              {task.client && (
                <div className="space-y-1 text-xs mb-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={12} />
                    <span>{task.client.name}</span>
                  </div>
                  {task.client.address && (
                    <div className="flex items-start gap-2 text-gray-500">
                      <MapPin size={12} className="mt-0.5" />
                      <span className="truncate">{task.client.address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Task Address (if different from client) */}
              {task.address && (!task.client || task.client.address !== task.address) && (
                <div className="flex items-start gap-2 text-xs text-gray-500 mb-2">
                  <MapPin size={12} className="mt-0.5" />
                  <span className="truncate">{task.address}</span>
                </div>
              )}

              {/* Schedule Information */}
              <div className="text-xs text-gray-400 space-y-1">
                {task.startDate && (
                  <div>Start: {formatDate(task.startDate)}</div>
                )}
                {task.endDate && (
                  <div>End: {formatDate(task.endDate)}</div>
                )}
                {task.scheduledStartTime && (
                  <div>Time: {formatTime(task.scheduledStartTime)} - {formatTime(task.scheduledEndTime)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
