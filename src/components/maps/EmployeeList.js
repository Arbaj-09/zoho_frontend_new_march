import React, { useMemo } from "react";
import EmployeeCard from "./EmployeeCard";

export default function EmployeeList({ employees, searchText, selectedId, onSelectEmployee }) {
  const filtered = useMemo(() => {
    const trimmed = searchText.trim().toLowerCase();
    if (!trimmed) return employees;
    return employees.filter((e) =>
      e.name?.toLowerCase().includes(trimmed) ||
      e.role?.toLowerCase().includes(trimmed)
    );
  }, [searchText, employees]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2">
        Showing {filtered.length} of {employees.length} employees
      </div>
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto space-y-2">
        {filtered.length === 0 ? (
          <div className="text-xs text-gray-400 p-2">No employees match this search.</div>
        ) : (
          filtered.map((e) => (
            <EmployeeCard
              key={e.id}
              employee={e}
              onClick={onSelectEmployee}
              isSelected={selectedId === e.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
