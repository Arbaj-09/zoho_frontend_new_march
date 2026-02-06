import React from "react";

export default function TimelineSlider({ value, onChange, min = 9, max = 18 }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500">{min}:00</span>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-xs text-gray-500">{max}:00</span>
      <span className="text-xs font-medium text-gray-700 ml-2">{value}:00</span>
    </div>
  );
}
