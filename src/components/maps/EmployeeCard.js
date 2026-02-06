import React from "react";

export default function EmployeeCard({ employee, onClick, isSelected }) {
  const hasLocation = isFinite(employee.lat) && isFinite(employee.lng);
  const statusColor = {
    ONLINE: "bg-green-100 text-green-800",
    IDLE: "bg-yellow-100 text-yellow-800",
    OFFLINE: "bg-gray-100 text-gray-800",
  }[employee.status] || "bg-gray-100 text-gray-800";

  return (
    <div
      onClick={() => onClick(employee)}
      className={`p-3 rounded-lg border mb-2 cursor-pointer transition-all ${
        isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"
      } ${!hasLocation ? "opacity-70" : ""}`}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold text-sm">{employee.name || "(no name)"}</div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
          {employee.status}
        </span>
      </div>
      {employee.role && <div className="text-xs text-gray-600">{employee.role}</div>}
      {employee.address && <div className="text-xs text-gray-500 mt-1">📍 {employee.address}</div>}
      {employee.lastUpdate && (
        <div className="text-xs text-gray-400 mt-1">
          Last: {employee.lastUpdate.toLocaleString()}
        </div>
      )}
      {!hasLocation && (
        <div className="text-xs text-gray-400 mt-1">No recent GPS location from this employee.</div>
      )}
    </div>
  );
}
