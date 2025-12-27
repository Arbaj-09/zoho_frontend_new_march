'use client';

import { useState } from "react";

export default function AddEmployeeForm({ onClose }) {
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex bg-black/30">
            {/* Form Container */}
            <div className="ml-auto h-full w-full max-w-5xl bg-white shadow-xl overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                    >
                        ← BACK
                    </button>

                    <button className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Save
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Upload */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center">
                            <div className="h-16 w-16 rounded-full border-2 border-dashed border-indigo-500 flex items-center justify-center text-indigo-600">
                                ⬆
                            </div>
                            <p className="mt-3 text-sm text-slate-600">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-400">
                                SVG, PNG, JPG (Max 250×250px)
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name *" />
                            <Input label="Last Name *" />
                            <Input label="Phone Number" prefix="+91" />
                            <Input label="Email address *" />
                            <Select label="Select Reporting Manager" />
                            <Input label="Internal Employee ID" />
                            <Input label="User ID" />
                            <Input label="Joining Date *" type="date" />
                            <Select label="Select Leave Policy" />
                            <Select label="Select Holiday Plan" />
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 rounded-lg bg-slate-50 p-4 text-center">
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                                className="flex items-center gap-2 text-sm font-semibold text-indigo-600"
                            >
                                ADDITIONAL INFORMATION
                                <span className="text-lg">
                                    {showAdditionalInfo ? '−' : '+'}
                                </span>
                            </button>
                        </div>

                    </div>
                    {showAdditionalInfo && (
  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

    {/* LEFT COLUMN */}
    <div className="space-y-4">
      <InfoSelect label="Default" />
      <InfoSelect label="Select Designation" />
      <InfoInput label="Enter City Name" />
      <InfoSelect label="Work Location" />
      <InfoSelect label="Shift Timing" />
      <InfoSelect label="Attendance Restriction (In/Out Time)" />
    </div>

    {/* RIGHT COLUMN */}
    <div className="space-y-4">
      <InfoBlock
        title="Attendance Restriction (In Site / GPS)"
        left="None"
        right="None"
      />

      <InfoBlock
        title="Attendance Restriction (Out Site / GPS)"
        left="None"
        right="None"
      />

      <InfoBlock
        title="In/Out Restriction (Geofence or Distance Pool)"
        left="None"
        right="None"
      />

      <InfoBlock
        title="Work Restriction (Geofence or Distance Pool)"
        left="None"
        right="None"
      />
    </div>

    {/* CUSTOM FIELDS */}
    <div className="lg:col-span-2 bg-slate-100 rounded-md px-4 py-3 flex justify-between items-center">
      <span className="text-sm font-medium text-slate-700">
        Custom Fields
      </span>
      <div className="flex gap-2">
        <IconBtn />
        <IconBtn />
      </div>
    </div>

  </div>
)}

                </div>
            </div>
        </div>
    );
}

/* Reusable Components */
function Input({ label, type = 'text', prefix }) {
    return (
        <div>
            <label className="block text-xs text-slate-500 mb-1">{label}</label>
            <div className="flex items-center border rounded-md px-3 py-2">
                {prefix && <span className="mr-2 text-sm">{prefix}</span>}
                <input type={type} className="w-full outline-none text-sm" />
            </div>
        </div>
    );
}

function Select({ label }) {
    return (
        <div>
            <label className="block text-xs text-slate-500 mb-1">{label}</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>Select</option>
            </select>
        </div>
    );
}

function InfoInput({ label }) {
  return (
    <div>
      <label className="text-xs text-slate-600">{label}</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 text-sm"
        placeholder={label}
      />
    </div>
  );
}

function InfoSelect({ label }) {
  return (
    <div>
      <label className="text-xs text-slate-600">{label}</label>
      <div className="flex gap-2 mt-1">
        <select className="w-full rounded border px-3 py-2 text-sm">
          <option>None</option>
        </select>
        <IconBtn />
        <IconBtn />
      </div>
    </div>
  );
}

function InfoBlock({ title, left, right }) {
  return (
    <div className="rounded bg-slate-100 p-3">
      <p className="text-xs font-semibold text-slate-700 mb-2">
        {title}
      </p>

      <div className="flex items-center gap-2">
        <select className="w-full rounded border px-3 py-2 text-sm">
          <option>{left}</option>
        </select>

        <span className="text-xs font-medium text-slate-500">OR</span>

        <select className="w-full rounded border px-3 py-2 text-sm">
          <option>{right}</option>
        </select>

        <IconBtn />
        <IconBtn />
      </div>
    </div>
  );
}

function IconBtn() {
  return (
    <button className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
      +
    </button>
  );
}

