"use client";

import { 
  UsersIcon, 
  CubeIcon, 
  CheckCircleIcon, 
  BanknotesIcon 
} from '@heroicons/react/24/outline';

const DepartmentStatsCard = ({ title, value, total, percentage, icon: Icon, trend }) => {
  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    return trend > 0 ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">
              of {total} total ({percentage}%)
            </p>
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentStatsCard;
