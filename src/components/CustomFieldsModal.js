"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2 } from "lucide-react";

export default function CustomFieldsModal({ isOpen, onClose, entityType, onSave, initialFields = {} }) {
  const [newField, setNewField] = useState({ name: "", type: "text", required: false });
  const [fieldValues, setFieldValues] = useState(initialFields);

  // Update field values when initialFields changes
  useEffect(() => {
    setFieldValues(initialFields);
  }, [initialFields]);

  const updateFieldValue = (fieldName, value) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const addField = () => {
    if (newField.name.trim()) {
      setFieldValues(prev => ({ ...prev, [newField.name]: "" }));
      setNewField({ name: "", type: "text", required: false });
    }
  };

  const handleSave = () => {
    onSave(fieldValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
        <div
          className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/50 animate-slideInRight"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Custom Fields Configuration
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage custom fields for {entityType}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Add New Field */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Add New Field</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                    <option value="textarea">Textarea</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Required
                  </label>
                  <button
                    onClick={addField}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add
                  </button>
                </div>
              </div>

              {/* Existing Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-900">Custom Field Values</h3>
                {Object.keys(fieldValues).length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                    No custom field values yet. Add fields above.
                  </div>
                ) : (
                  Object.entries(fieldValues).map(([fieldName, value]) => (
                    <div
                      key={fieldName}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{fieldName}</div>
                          <input
                            type="text"
                            value={value || ""}
                            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder={`Enter ${fieldName}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newValues = { ...fieldValues };
                            delete newValues[fieldName];
                            setFieldValues(newValues);
                          }}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Save Fields
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
