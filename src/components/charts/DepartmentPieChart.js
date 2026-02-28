"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const DepartmentPieChart = ({ data, title, department }) => {
  // Professional color palette (monochrome with accent)
  const COLORS = {
    department: '#1f2937',      // Slate-800
    others: '#9ca3af',         // Slate-400
    accent: '#3b82f6'          // Blue-500
  };

  const chartData = [
    { 
      name: `${department} Department`, 
      value: data.department, 
      percentage: data.percentage 
    },
    { 
      name: 'Other Departments', 
      value: data.total - data.department, 
      percentage: 100 - data.percentage 
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600">
            Count: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label if too small

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill={COLORS.department} />
            <Cell fill={COLORS.others} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span className="text-xs text-gray-600">
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentPieChart;
