"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, Edit2, Settings } from "lucide-react";
import { toast } from "react-toastify";
import {
  createFieldDefinition,
  deleteFieldDefinition,
  fetchFieldDefinitions,
  normalizeDefinitions,
  updateFieldDefinition,
} from "@/services/crmFields";

function getLoggedInUser() {
  if (typeof window === "undefined") return { name: "Admin", role: "Administrator" };
  try {
    const raw = localStorage.getItem("user_data");
    const obj = raw ? JSON.parse(raw) : null;
    const name = obj?.name || obj?.fullName || obj?.username || obj?.email || "Admin";
    const role = obj?.role || obj?.designation || "Administrator";
    return { name, role };
  } catch {
    return { name: "Admin", role: "Administrator" };
  }
}

export default function FieldDefinitionsPage({ entityType, title, subtitle }) {
  const [defs, setDefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fieldName: "",
    fieldKey: "",
    fieldType: "TEXT",
    required: false,
    active: true,
    optionsText: "",
  });

  const user = useMemo(() => getLoggedInUser(), []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFieldDefinitions(entityType);
      setDefs(normalizeDefinitions(res));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load field definitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType]);

  const startCreate = () => {
    setEditing(null);
    setForm({
      fieldName: "",
      fieldKey: "",
      fieldType: "TEXT",
      required: false,
      active: true,
      optionsText: "",
    });
  };

  const startEdit = (d) => {
    setEditing(d);
    setForm({
      fieldName: d.fieldName || "",
      fieldKey: d.fieldKey || "",
      fieldType: d.fieldType || "TEXT",
      required: Boolean(d.required),
      active: d.active !== false,
      optionsText: Array.isArray(d.optionsJson) ? d.optionsJson.join("\n") : "",
    });
  };

  const parsedOptions = useMemo(() => {
    return (form.optionsText || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [form.optionsText]);

  const save = async () => {
    try {
      if (!form.fieldName.trim()) return toast.error("Field Name is required");
      if (!form.fieldKey.trim()) return toast.error("Field Key is required");

      const payload = {
        fieldName: form.fieldName.trim(),
        fieldKey: form.fieldKey.trim(),
        fieldType: form.fieldType,
        required: Boolean(form.required),
        active: Boolean(form.active),
        optionsJson: form.fieldType === "DROPDOWN" ? parsedOptions : null,
      };

      if (editing?.id) {
        await updateFieldDefinition(entityType, editing.id, payload);
        toast.success("Field updated");
      } else {
        await createFieldDefinition(entityType, payload);
        toast.success("Field created");
      }

      await load();
      startCreate();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to save field");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this field definition?")) return;
    try {
      await deleteFieldDefinition(entityType, id);
      toast.success("Field deleted");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete field");
    }
  };

  return (
    <DashboardLayout
      header={{
        project: title,
        user,
        notifications: [],
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Settings className="h-4 w-4" />
            {editing ? "Edit Field" : "Create Field"}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Field Name</label>
              <input
                value={form.fieldName}
                onChange={(e) => setForm((p) => ({ ...p, fieldName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Field Key</label>
              <input
                value={form.fieldKey}
                onChange={(e) => setForm((p) => ({ ...p, fieldKey: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. loanAmount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Field Type</label>
              <select
                value={form.fieldType}
                onChange={(e) => setForm((p) => ({ ...p, fieldType: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="DATE">DATE</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="DROPDOWN">DROPDOWN</option>
              </select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Required
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
            </div>

            {form.fieldType === "DROPDOWN" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dropdown Options (one per line)</label>
                <textarea
                  value={form.optionsText}
                  onChange={(e) => setForm((p) => ({ ...p, optionsText: e.target.value }))}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editing ? (
              <button
                onClick={startCreate}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            ) : null}
            <button
              onClick={save}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-900">Definitions</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Key</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Required</th>
                  <th className="text-left px-6 py-3">Active</th>
                  <th className="text-right px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : defs.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={6}>
                      No field definitions
                    </td>
                  </tr>
                ) : (
                  defs.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">{d.fieldName}</td>
                      <td className="px-6 py-3 text-slate-700">{d.fieldKey}</td>
                      <td className="px-6 py-3 text-slate-700">{d.fieldType}</td>
                      <td className="px-6 py-3 text-slate-700">{d.required ? "Yes" : "No"}</td>
                      <td className="px-6 py-3 text-slate-700">{d.active ? "Yes" : "No"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(d)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => remove(d.id)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
