'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function DateField({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(date);
      setIsOpen(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={formatDate(value)}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer bg-white"
          placeholder="Select date"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Calendar className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <input
              type="date"
              value={value.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
