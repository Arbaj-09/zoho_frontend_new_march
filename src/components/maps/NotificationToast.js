import React from "react";

export default function NotificationToast({ alert }) {
  if (!alert) return null;
  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800 z-50 shadow-lg">
      <div className="font-semibold">Idle Alert</div>
      <div>{alert.employeeName} is idle</div>
      <div className="text-xs text-yellow-700">{new Date(alert.timestamp).toLocaleString()}</div>
      {alert.address && <div className="text-xs text-yellow-700">{alert.address}</div>}
    </div>
  );
}
