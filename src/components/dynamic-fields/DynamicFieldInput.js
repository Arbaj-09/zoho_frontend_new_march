"use client";

import { cn } from "@/utils/helpers";

export default function DynamicFieldInput({ def, value, onChange }) {
  const type = String(def?.fieldType || "TEXT").toUpperCase();
  const id = `df_${def?.fieldKey}`;

  const base =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  if (type === "BOOLEAN") {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          id={id}
          type="checkbox"
          checked={String(value).toLowerCase() === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span>{def?.fieldName || def?.fieldKey}</span>
      </label>
    );
  }

  if (type === "DROPDOWN") {
    const opts = Array.isArray(def?.optionsJson) ? def.optionsJson : [];
    return (
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        <option value="">Select...</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  if (type === "DATE") {
    // backend expects YYYY-MM-DD
    return (
      <input
        id={id}
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }

  if (type === "NUMBER") {
    return (
      <input
        id={id}
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }

  // TEXT default
  return (
    <input
      id={id}
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(base)}
      placeholder={`Enter ${def?.fieldName || def?.fieldKey}`}
    />
  );
}
