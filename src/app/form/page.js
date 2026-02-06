'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formApi } from "@/services/formApi";
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5; // Fixed to 5 records per page

  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState("bulk");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSchema, setEditSchema] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [loggedName, setLoggedName] = useState("-");

  const headerCheckboxRef = useRef(null);

  // Load user data after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user_data") || "{}";
        const user = JSON.parse(userStr);
        setLoggedName(user?.fullName || "-");
      } catch (e) {
        setLoggedName("-");
      }
    }
  }, []);

  /* -------------------- FILTERING & SORTING -------------------- */

  const filteredForms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter(f =>
      [f.name, f.description, f.clientName].some(v =>
        (v || "").toLowerCase().includes(term)
      )
    );
  }, [forms, search]);

  // Sort forms by createdAt descending (latest first)
  const sortedForms = useMemo(() => {
    return [...filteredForms].sort((a, b) => {
      const d1 = new Date(a.createdAt || 0).getTime();
      const d2 = new Date(b.createdAt || 0).getTime();
      return d2 - d1; // latest first
    });
  }, [filteredForms]);

  const totalPages = Math.max(1, Math.ceil(sortedForms.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedForms.slice(start, start + pageSize);
  }, [sortedForms, currentPage, pageSize]);

  const allSelectedVisible =
    pageItems.length > 0 &&
    pageItems.every(f => selectedIds.includes(f.id));

  const someSelected =
    selectedIds.length > 0 &&
    pageItems.some(f => selectedIds.includes(f.id)) &&
    !allSelectedVisible;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* -------------------- SELECTION -------------------- */

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const ids = pageItems.map(f => f.id);
    if (allSelectedVisible) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  /* -------------------- CRUD -------------------- */

  const openDeleteModal = (mode, id = null) => {
    setDeleteMode(mode);
    setPendingDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (deleteMode === "single" && pendingDeleteId) {
        await formApi.delete(pendingDeleteId);
        setForms(prev => prev.filter(f => f.id !== pendingDeleteId));
      } else {
        // Bulk delete
        await Promise.all(selectedIds.map(id => formApi.delete(id)));
        setForms(prev => prev.filter(f => !selectedIds.includes(f.id)));
        setSelectedIds([]);
      }
      closeDeleteModal();
    } catch {
      alert("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = async (id) => {
    // Navigate to edit form page instead of inline modal
    window.location.href = `/form/${id}`;
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return setEditError("Name required");
    setIsSavingEdit(true);
    try {
      const updated = await formApi.update(editingForm.id, {
        ...editingForm,
        name: editName,
        description: editDescription,
        schema: editSchema,
      });
      setForms(prev =>
        prev.map(f => f.id === updated.id ? updated : f)
      );
      setIsEditModalOpen(false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddForm = async () => {
    // Navigate to create form page instead of creating inline
    window.location.href = '/form/create';
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await formApi.list();
        console.log("Loaded Forms:", res);
        setForms(Array.isArray(res) ? res : (res?.data || []));
      } catch (e) {
        console.error("Forms load failed", e);
        setForms([]);
      }
    })();
  }, []);

  // Refresh forms when page becomes visible (after navigation)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        (async () => {
          try {
            const res = await formApi.list();
            console.log("Refreshed Forms:", res);
            setForms(Array.isArray(res) ? res : (res?.data || []));
          } catch (e) {
            console.error("Forms refresh failed", e);
          }
        })();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  /* -------------------- UI -------------------- */

  // Format date function (safe for SSR)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    if (typeof window === "undefined") return dateString; // Server-side fallback
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-slate-50 min-h-screen">

        {/* MAIN CARD */}
        <motion.div
          className="bg-white rounded-xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* CONTROLS */}
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms..."
                className="h-9 w-56 rounded-md border px-3 text-sm
                           focus:ring-1 focus:ring-blue-500"
              />
              <button className="h-9 w-9 rounded-md border flex items-center justify-center hover:bg-slate-100">
                <Search className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-md border flex items-center justify-center hover:bg-slate-100">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddForm}
              className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allSelectedVisible}
                      onChange={handleToggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Form Title</th>
                  <th className="px-4 py-3 text-left">Form Description</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Last Modified At</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map(form => (
                  <tr
                    key={form.id}
                    className={`border-t ${
                      selectedIds.includes(form.id)
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(form.id)}
                        onChange={() => handleToggleRow(form.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{form.name}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{form.description || '-'}</td>
                    <td className="px-4 py-3">{form.clientName || '-'}</td>
                    <td className="px-4 py-3">{formatDate(form.updatedAt)}</td>
                    <td className="px-4 py-3">{formatDate(form.createdAt)}</td>
                    <td className="px-4 py-3">{form.createdByName ?? "-"}</td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(form.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal("single", form.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center px-4 py-3 border-t text-sm">
            <div>
              Showing {pageItems.length} of {sortedForms.length} forms
            </div>

            <div className="flex gap-2 items-center">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* BULK DELETE FLOAT */}
        {selectedIds.length > 0 && (
          <button
            onClick={() => openDeleteModal("bulk")}
            className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedIds.length})
          </button>
        )}

        {/* DELETE MODAL */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white rounded-xl p-5 w-80">
                <p className="mb-4 text-sm">
                  Are you sure you want to delete {deleteMode === "single" ? "this form" : `${selectedIds.length} forms`}?
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeDeleteModal}>Cancel</button>
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
