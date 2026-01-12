"use client";

import { useState, useEffect } from "react";
import { Search, Edit2, Trash2, Eye, Settings, X, Plus, Building2, DollarSign, Calendar } from "lucide-react";
import { backendApi } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DynamicFieldsSection from "@/components/dynamic-fields/DynamicFieldsSection";
import { getLoggedInUser } from "@/hooks/useLoggedInUser";
import {
  fetchFieldDefinitions,
  fetchFieldValues,
  normalizeDefinitions,
  normalizeValues,
  upsertFieldValue,
} from "@/services/crmFields";
import { toast } from "react-toastify";

export default function DealsPage() {
  const userData = getLoggedInUser();
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [fieldDefs, setFieldDefs] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [dealFieldValuesById, setDealFieldValuesById] = useState({});
  const [currentFieldValues, setCurrentFieldValues] = useState({});

  const [form, setForm] = useState({
    name: "",
    clientId: "",
    bankId: "",
    branchName: "",
    description: "",
    valueAmount: "",
    requiredAmount: "",
    outstandingAmount: "",
    closingDate: "",
    stage: "LEAD",
    customFields: {},
  });

  // ✅ Normalize backend response
  const normalizeList = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.content && Array.isArray(res.content)) return res.content;
    return [];
  };

  // ✅ Extract status from various error shapes
  const getStatusFromError = (err) => {
    if (!err) return null;
    if (err?.response?.status) return err.response.status;
    if (err?.status) return err.status;
    if (err?.data?.status) return err.data.status;
    const msg = (err?.message || "").toString();
    if (msg.includes("404")) return 404;
    if (msg.includes("409")) return 409;
    if (msg.includes("400")) return 400;
    if (msg.includes("500")) return 500;
    return null;
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const fetchDeals = async () => {
    try {
      const res = await backendApi.get("/deals");
      const deals = normalizeList(res);
      setDeals(deals);
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await backendApi.get("/clients");
      const clients = normalizeList(res);
      setClients(clients);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await backendApi.get("/banks");
      const banks = normalizeList(res);
      setBanks(banks);
    } catch (err) {
      console.error("Failed to fetch banks:", err);
    }
  };

  const fetchDealFieldDefinitions = async () => {
    try {
      const res = await backendApi.get("/deal-fields");
      const definitions = normalizeDefinitions(res);
      setFieldDefs(definitions);
      setDynamicColumns(definitions.filter(d => d.active !== false).map(d => d.fieldKey));
    } catch (err) {
      console.error("Failed to fetch deal field definitions:", err);
    }
  };

  const fetchFieldValuesForDeal = async (dealId) => {
    try {
      const valsRes = await fetchFieldValues("deal", dealId);
      const valuesMap = normalizeValues(valsRes);
      setDealFieldValuesById(prev => ({ ...prev, [dealId]: valuesMap }));
      return valuesMap;
    } catch (_e) {
      return {};
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchClients();
    fetchBanks();
    fetchDealFieldDefinitions();

    // Filter deals by selected customer from localStorage
    const selectedCustomerData = localStorage.getItem('selectedCustomer');
    if (selectedCustomerData) {
      try {
        const selectedCustomer = JSON.parse(selectedCustomerData);
        setDeals(prev => prev.filter(deal => deal.clientId === selectedCustomer.id));
      } catch (error) {
        console.error('Error parsing selectedCustomer from localStorage:', error);
      }
    }
  }, []);

  const filtered = deals.filter((deal) => {
    const name = (deal.name || "").toLowerCase();
    const client = clients.find(c => c.id === deal.clientId)?.name || "";
    const bank = banks.find(b => b.id === deal.bankId)?.name || "";
    const q = search.toLowerCase();
    return name.includes(q) || client.toLowerCase().includes(q) || bank.toLowerCase().includes(q);
  });

  // ✅ Reset modal and open create
  const openCreate = () => {
    setSelectedDeal(null);
    setForm({
      name: "",
      clientId: "",
      bankId: "",
      branchName: "",
      description: "",
      valueAmount: "",
      requiredAmount: "",
      outstandingAmount: "",
      closingDate: "",
      stage: "LEAD",
      customFields: {},
    });
    setCurrentFieldValues({});
    setShowCreateModal(true);
  };

  // ✅ Edit: always fetch fresh data
  const openEdit = async (deal) => {
    try {
      if (!deal?.id) {
        toast.error("Invalid deal selected");
        return;
      }

      const freshDeal = await backendApi.get(`/deals/${deal.id}`);
      let valuesMap = {};
      try {
        const valsRes = await fetchFieldValuesForDeal(deal.id);
        valuesMap = normalizeValues(valsRes);
      } catch (_e) {
        valuesMap = {};
      }

      setSelectedDeal(freshDeal);
      setForm({
        name: freshDeal.name || "",
        clientId: freshDeal.clientId || "",
        bankId: freshDeal.bankId || "",
        branchName: freshDeal.branchName || "",
        description: freshDeal.description || "",
        valueAmount: freshDeal.valueAmount || "",
        requiredAmount: freshDeal.requiredAmount || "",
        outstandingAmount: freshDeal.outstandingAmount || "",
        closingDate: freshDeal.closingDate || "",
        stage: freshDeal.stage || "LEAD",
      });

      setCurrentFieldValues(valuesMap);
      setShowCreateModal(true);
    } catch (err) {
      console.error("Failed to open edit:", err);
      const status = getStatusFromError(err);
      if (status === 404) {
        toast.error("Deal not found. Reloading list...");
        await fetchDeals();
        return;
      }
      toast.error("Failed to load deal details");
    }
  };

  const openDetails = (deal) => {
    setSelectedDeal(deal);
    setShowDetailsDrawer(true);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!form.name?.trim()) {
        toast.error("Deal Name is required");
        return;
      }

      const payload = {
        name: form.name?.trim(),
        clientId: form.clientId || null,
        bankId: form.bankId || null,
        branchName: form.branchName?.trim() || null,
        description: form.description || "",
        valueAmount: Number(form.valueAmount) || 0,
        requiredAmount: Number(form.requiredAmount) || 0,
        outstandingAmount: Number(form.outstandingAmount) || 0,
        closingDate: form.closingDate || null,
        stage: form.stage,
        customFields: form.customFields || {},
      };

      let savedId = selectedDeal?.id;
      if (selectedDeal?.id) {
        await backendApi.put(`/deals/${selectedDeal.id}`, payload);
        toast.success("Deal updated successfully");
      } else {
        const created = await backendApi.post("/deals", payload);
        savedId = created?.id;
        toast.success("Deal created successfully");
      }

      if (savedId) {
        const activeDefs = (fieldDefs || []).filter((d) => d.active !== false);
        await Promise.all(
          activeDefs.map((d) =>
            upsertFieldValue("deal", savedId, d.fieldKey, currentFieldValues?.[d.fieldKey] ?? "")
          )
        );
      }

      await fetchDeals();
      setShowCreateModal(false);
      setSelectedDeal(null);
      setCurrentFieldValues({});
      setForm({
        name: "",
        clientId: "",
        bankId: "",
        branchName: "",
        description: "",
        valueAmount: "",
        requiredAmount: "",
        outstandingAmount: "",
        closingDate: "",
        stage: "LEAD",
      });
    } catch (err) {
      console.error("Save failed:", err);
      const status = getStatusFromError(err);

      if (status === 404) {
        toast.error("Deal not found. Reloading list...");
        await fetchDeals();
        setShowCreateModal(false);
        setSelectedDeal(null);
        return;
      }

      const errorMsg = err?.data?.message || err?.message || "Unknown error";
      toast.error(`Failed to save deal: ${errorMsg}`);
      await fetchDeals();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this deal?")) return;

    try {
      await backendApi.delete(`/deals/${id}`);

      // optimistic remove
      setDeals((prev) => prev.filter((d) => d.id !== id));

      // if editing same deal, close
      if (selectedDeal?.id === id) {
        setSelectedDeal(null);
        setShowCreateModal(false);
      }

      toast.success("Deal deleted successfully");
      await fetchDeals();
    } catch (err) {
      console.error("Delete failed:", err);
      const status = getStatusFromError(err);

      if (status === 404) {
        toast.info("Deal already deleted. Refreshing list...");
        setDeals((prev) => prev.filter((d) => d.id !== id));
        if (selectedDeal?.id === id) {
          setSelectedDeal(null);
          setShowCreateModal(false);
        }
        await fetchDeals();
        return;
      }

      toast.error("Failed to delete deal");
      await fetchDeals();
    }
  };

  return (
    <DashboardLayout
      header={{
        project: 'Deals',
        user: userData,
        notifications: [],
      }}
    >
      <div className="flex flex-col space-y-4">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Deals</div>
            <p className="text-sm text-slate-500">Manage your deals pipeline</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-4 flex items-center gap-2 border rounded px-3 py-2 w-96">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Deal Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Value Amount
                    </th>

                    {dynamicColumns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                      >
                        {formatLabel(col)}
                      </th>
                    ))}

                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {deal.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {clients.find(c => c.id === deal.clientId)?.name || "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {banks.find(b => b.id === deal.bankId)?.name || "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          deal.stage === 'LEAD' ? 'bg-blue-100 text-blue-800' :
                          deal.stage === 'DM_APPLICATION' ? 'bg-yellow-100 text-yellow-800' :
                          deal.stage === 'POSSESSION_ORDER' ? 'bg-orange-100 text-orange-800' :
                          deal.stage === 'STAGE_13_4' ? 'bg-purple-100 text-purple-800' :
                          deal.stage === 'STAGE_13_2' ? 'bg-pink-100 text-pink-800' :
                          deal.stage === 'LEAD_TO_PHYSICAL_POSSESSION' ? 'bg-indigo-100 text-indigo-800' :
                          deal.stage === 'PHYSICAL_POSSESSION' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {deal.stage || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        ₹{deal.valueAmount?.toLocaleString() || "0"}
                      </td>

                      {dynamicColumns.map((col) => (
                        <td
                          key={col}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                        >
                          {dealFieldValuesById?.[deal.id]?.[col] || "-"}
                        </td>
                      ))}

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetails(deal)}
                            className="text-green-600 hover:text-green-800"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openEdit(deal)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(deal.id)}
                            className="text-red-600 hover:text-red-800"
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
          </div>
        )}

        {/* ✅ CREATE/EDIT MODAL */}
        {showCreateModal && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
              <div
                className="relative w-full max-w-4xl h-[80vh] transform overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/50 animate-slideInRight flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedDeal ? "Edit Deal" : "Create Deal"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedDeal
                        ? "Update deal information"
                        : "Add a new deal to your pipeline"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Deal Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          placeholder="Enter deal name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Client
                        </label>
                        <select
                          value={form.clientId}
                          onChange={(e) =>
                            setForm({ ...form, clientId: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                          <option value="">Select client</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Bank
                        </label>
                        <select
                          value={form.bankId}
                          onChange={(e) =>
                            setForm({ ...form, bankId: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                          <option value="">Select bank</option>
                          {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Stage
                        </label>
                        <select
                          value={form.stage}
                          onChange={(e) =>
                            setForm({ ...form, stage: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                          <option value="LEAD">Lead</option>
                          <option value="DM_APPLICATION">DM Application</option>
                          <option value="POSSESSION_ORDER">Possession Order</option>
                          <option value="STAGE_13_4">Stage 13(4)</option>
                          <option value="STAGE_13_2">Stage 13(2)</option>
                          <option value="LEAD_TO_PHYSICAL_POSSESSION">Lead to Physical Possession</option>
                          <option value="PHYSICAL_POSSESSION">Physical Possession</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Closing Date
                        </label>
                        <input
                          type="date"
                          value={form.closingDate}
                          onChange={(e) =>
                            setForm({ ...form, closingDate: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Value Amount (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.valueAmount}
                          onChange={(e) =>
                            setForm({ ...form, valueAmount: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Required Amount (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.requiredAmount}
                          onChange={(e) =>
                            setForm({ ...form, requiredAmount: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Outstanding Amount (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.outstandingAmount}
                          onChange={(e) =>
                            setForm({ ...form, outstandingAmount: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={form.branchName}
                        onChange={(e) =>
                          setForm({ ...form, branchName: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Enter branch name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                        placeholder="Enter deal description"
                      />
                    </div>
                  </div>

                  <DynamicFieldsSection
                    title="Custom Fields"
                    definitions={fieldDefs}
                    values={currentFieldValues}
                    onChange={(k, v) => setCurrentFieldValues((prev) => ({ ...prev, [k]: v }))}
                  />

                  {/* Audit Information */}
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-base font-semibold text-slate-900 mb-4">Audit Information</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Owner
                        </label>
                        <input
                          type="text"
                          value={userData?.name || "Admin User"}
                          readOnly
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Created Date
                        </label>
                        <input
                          type="text"
                          value={selectedDeal?.createdAt 
                            ? new Date(selectedDeal.createdAt).toLocaleString() 
                            : new Date().toLocaleString()}
                          readOnly
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Created By
                        </label>
                        <input
                          type="text"
                          value={selectedDeal?.createdByName || userData?.name || "Admin User"}
                          readOnly
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Last Updated
                        </label>
                        <input
                          type="text"
                          value={selectedDeal?.updatedAt 
                            ? new Date(selectedDeal.updatedAt).toLocaleString() 
                            : "-"}
                          readOnly
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-200/80 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="text-rose-500">*</span> Required fields
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateOrUpdate}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        {selectedDeal ? "Update" : "Create"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ DETAILS DRAWER */}
        {showDetailsDrawer && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowDetailsDrawer(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold text-slate-900">Deal Details</h3>
                  <button
                    onClick={() => setShowDetailsDrawer(false)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <strong>Name:</strong> {selectedDeal?.name}
                    </div>
                    <div>
                      <strong>Client:</strong> {clients.find(c => c.id === selectedDeal?.clientId)?.name || "-"}
                    </div>
                    <div>
                      <strong>Bank:</strong> {banks.find(b => b.id === selectedDeal?.bankId)?.name || "-"}
                    </div>
                    <div>
                      <strong>Stage:</strong>{" "}
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        selectedDeal?.stage === 'LEAD' ? 'bg-blue-100 text-blue-800' :
                        selectedDeal?.stage === 'DM_APPLICATION' ? 'bg-yellow-100 text-yellow-800' :
                        selectedDeal?.stage === 'POSSESSION_ORDER' ? 'bg-orange-100 text-orange-800' :
                        selectedDeal?.stage === 'STAGE_13_4' ? 'bg-purple-100 text-purple-800' :
                        selectedDeal?.stage === 'STAGE_13_2' ? 'bg-pink-100 text-pink-800' :
                        selectedDeal?.stage === 'LEAD_TO_PHYSICAL_POSSESSION' ? 'bg-indigo-100 text-indigo-800' :
                        selectedDeal?.stage === 'PHYSICAL_POSSESSION' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedDeal?.stage || "-"}
                      </span>
                    </div>
                    <div>
                      <strong>Value Amount:</strong> ₹{selectedDeal?.valueAmount?.toLocaleString() || "0"}
                    </div>
                    <div>
                      <strong>Required Amount:</strong> ₹{selectedDeal?.requiredAmount?.toLocaleString() || "0"}
                    </div>
                    <div>
                      <strong>Outstanding Amount:</strong> ₹{selectedDeal?.outstandingAmount?.toLocaleString() || "0"}
                    </div>
                    <div>
                      <strong>Closing Date:</strong> {selectedDeal?.closingDate || "-"}
                    </div>
                    <div>
                      <strong>Description:</strong> {selectedDeal?.description || "-"}
                    </div>
                    <div>
                      <strong>Branch Name:</strong> {selectedDeal?.branchName || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
