"use client";

import { useState, useEffect } from "react";
import { Settings, Plus, Edit2, Trash2, Eye, X, ChevronDown } from "lucide-react";
import { backendApi } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getCurrentUserName, getCurrentUserRole } from "@/utils/userUtils";
import { toast } from "react-toastify";

const ENTITY_TYPES = [
  { value: "product", label: "Products" },
  { value: "bank", label: "Banks" },
  { value: "client", label: "Clients" },
  { value: "deal", label: "Deals" },
];

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "BOOLEAN", label: "Boolean (Yes/No)" },
  { value: "DROPDOWN", label: "Dropdown" },
];

export default function FieldDefinitionsAdminPage() {
  // ✅ FIXED: Get dynamic user data
  const userName = getCurrentUserName();
  const userRole = getCurrentUserRole();
  
  const [selectedEntity, setSelectedEntity] = useState("product");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({
    fieldKey: "",
    fieldName: "",
    fieldType: "TEXT",
    required: false,
    active: true,
    orderIndex: 0,
    optionsJson: "",
  });

  const fetchFields = async () => {
    try {
      setLoading(true);
      const endpoint = `/${selectedEntity}-fields`;
      const res = await backendApi.get(endpoint);
      setFields(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch fields:", err);
      toast.error("Failed to load field definitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [selectedEntity]);

  const resetForm = () => {
    setForm({
      fieldKey: "",
      fieldName: "",
      fieldType: "TEXT",
      required: false,
      active: true,
      orderIndex: fields.length,
      optionsJson: "",
    });
    setEditingField(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (field) => {
    setForm({
      fieldKey: field.fieldKey,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      required: field.required || false,
      active: field.active !== false,
      orderIndex: field.orderIndex || 0,
      optionsJson: field.optionsJson || "",
    });
    setEditingField(field);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.fieldKey?.trim() || !form.fieldName?.trim()) {
        toast.error("Field Key and Field Name are required");
        return;
      }

      const payload = {
        ...form,
        fieldKey: form.fieldKey.toLowerCase().replace(/\s+/g, "_"),
        orderIndex: parseInt(form.orderIndex) || 0,
      };

      if (editingField) {
        await backendApi.put(`/${selectedEntity}-fields/${editingField.id}`, payload);
        toast.success("Field updated successfully");
      } else {
        await backendApi.post(`/${selectedEntity}-fields`, payload);
        toast.success("Field created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchFields();
    } catch (err) {
      console.error("Save failed:", err);
      const errorMsg = err?.data?.message || err?.message || "Unknown error";
      toast.error(`Failed to save field: ${errorMsg}`);
    }
  };

  const handleDelete = async (field) => {
    if (!confirm(`Delete field "${field.fieldName}"? This will deactivate it.`)) return;

    try {
      await backendApi.delete(`/${selectedEntity}-fields/${field.id}`);
      toast.success("Field deleted successfully");
      fetchFields();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete field");
    }
  };

  const moveField = async (field, direction) => {
    const currentIndex = fields.findIndex(f => f.id === field.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= fields.length) return;

    const reorderedFields = [...fields];
    [reorderedFields[currentIndex], reorderedFields[newIndex]] = 
      [reorderedFields[newIndex], reorderedFields[currentIndex]];

    // Update orderIndex for both fields
    reorderedFields[currentIndex].orderIndex = currentIndex;
    reorderedFields[newIndex].orderIndex = newIndex;

    try {
      await Promise.all([
        backendApi.put(`/${selectedEntity}-fields/${reorderedFields[currentIndex].id}`, {
          ...reorderedFields[currentIndex],
          orderIndex: currentIndex,
        }),
        backendApi.put(`/${selectedEntity}-fields/${reorderedFields[newIndex].id}`, {
          ...reorderedFields[newIndex],
          orderIndex: newIndex,
        }),
      ]);
      fetchFields();
    } catch (err) {
      console.error("Failed to reorder fields:", err);
      toast.error("Failed to reorder fields");
    }
  };

  return (
    <DashboardLayout
      header={{
        project: 'Field Definitions',
        user: { name: userName, role: userRole },
        notifications: [],
      }}
    >
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic Field Definitions</h1>
            <p className="text-slate-600">Manage custom fields for all entities</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {ENTITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>
        </div>

        {/* Fields Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : fields.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No custom fields defined for {selectedEntity}. Click "Add Field" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Field Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveField(field, "up")}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4 rotate-180" />
                          </button>
                          <button
                            onClick={() => moveField(field, "down")}
                            disabled={index === fields.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <span>{field.orderIndex + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">
                        {field.fieldKey}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {field.fieldName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {field.fieldType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {field.required ? (
                          <span className="text-rose-600">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          field.active !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {field.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(field)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(field)}
                            className="text-rose-600 hover:text-rose-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
              <div className="w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/50">
                <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {editingField ? "Edit Field" : "Create Field"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {editingField ? "Update field definition" : "Add new custom field"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Field Key <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.fieldKey}
                        onChange={(e) => setForm({ ...form, fieldKey: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g., warranty_period"
                        disabled={!!editingField}
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Unique identifier. Cannot be changed after creation.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Field Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.fieldName}
                        onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g., Warranty Period"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Field Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.fieldType}
                        onChange={(e) => setForm({ ...form, fieldType: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {FIELD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.fieldType === "DROPDOWN" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Options (JSON)
                        </label>
                        <textarea
                          value={form.optionsJson}
                          onChange={(e) => setForm({ ...form, optionsJson: e.target.value })}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          placeholder='["Option 1", "Option 2", "Option 3"]'
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          JSON array of options. Example: ["Active", "Inactive", "Pending"]
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.required}
                            onChange={(e) => setForm({ ...form, required: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Required Field
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="text-rose-500">*</span> Required fields
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSave}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        {editingField ? "Update" : "Create"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
